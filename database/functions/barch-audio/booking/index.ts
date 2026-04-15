import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  action: 'create' | 'confirm' | 'cancel' | 'get-availability';
  sessionType?: 'quick' | 'standard' | 'premium';
  scheduledAt?: string;
  notes?: string;
  calEventId?: string;
  bookingId?: string;
}

interface CalcomEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: { email: string; name: string }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const calcomApiKey = Deno.env.get('CALCOM_API_KEY');
    const calcomEventTypeId = Deno.env.get('CALCOM_EVENT_TYPE_ID');
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, sessionType, scheduledAt, notes, calEventId, bookingId }: BookingRequest = await req.json();

    console.log(`Booking action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'get-availability': {
        // Get available time slots from Cal.com
        if (!calcomApiKey) {
          return new Response(
            JSON.stringify({ 
              error: 'Cal.com integration not configured',
              useEmbed: true // Fallback to embed
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const response = await fetch(
            `https://api.cal.com/v1/availability?apiKey=${calcomApiKey}&eventTypeId=${calcomEventTypeId}`,
            { method: 'GET' }
          );
          
          if (response.ok) {
            const availability = await response.json();
            return new Response(
              JSON.stringify({ success: true, availability }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          console.error('Cal.com API error:', error);
        }

        return new Response(
          JSON.stringify({ error: 'Could not fetch availability', useEmbed: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!sessionType) {
          return new Response(
            JSON.stringify({ error: 'Session type is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create booking in our database
        const { data: booking, error: dbError } = await supabase
          .from('booking_sessions')
          .insert({
            user_id: user.id,
            session_type: sessionType,
            scheduled_at: scheduledAt,
            notes,
            status: 'pending',
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          return new Response(
            JSON.stringify({ error: 'Failed to create booking' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If Cal.com is configured, create event there too
        if (calcomApiKey && scheduledAt) {
          try {
            const calResponse = await fetch(
              `https://api.cal.com/v1/bookings?apiKey=${calcomApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventTypeId: calcomEventTypeId,
                  start: scheduledAt,
                  responses: {
                    email: user.email,
                    name: user.user_metadata?.display_name || user.email,
                  },
                  metadata: {
                    bookingId: booking.id,
                    sessionType,
                  },
                }),
              }
            );

            if (calResponse.ok) {
              const calEvent: CalcomEvent = await calResponse.json();
              
              // Update our booking with Cal.com event ID
              await supabase
                .from('booking_sessions')
                .update({ cal_event_id: calEvent.id, status: 'confirmed' })
                .eq('id', booking.id);

              booking.cal_event_id = calEvent.id;
              booking.status = 'confirmed';
            }
          } catch (error) {
            console.error('Cal.com booking error:', error);
            // Continue without Cal.com integration
          }
        }

        // Send email confirmation if enabled
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('email_confirmations')
          .eq('user_id', user.id)
          .single();

        if (prefs?.email_confirmations && user.email) {
          // Could integrate with Resend here for email confirmations
          console.log(`Would send confirmation email to ${user.email}`);
        }

        return new Response(
          JSON.stringify({ success: true, booking }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'confirm': {
        if (!bookingId) {
          return new Response(
            JSON.stringify({ error: 'Booking ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('booking_sessions')
          .update({ status: 'confirmed', cal_event_id: calEventId })
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to confirm booking' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, booking: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel': {
        if (!bookingId) {
          return new Response(
            JSON.stringify({ error: 'Booking ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the booking first to check for Cal.com event
        const { data: booking } = await supabase
          .from('booking_sessions')
          .select('cal_event_id')
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .single();

        // Cancel in Cal.com if applicable
        if (booking?.cal_event_id && calcomApiKey) {
          try {
            await fetch(
              `https://api.cal.com/v1/bookings/${booking.cal_event_id}/cancel?apiKey=${calcomApiKey}`,
              { method: 'DELETE' }
            );
          } catch (error) {
            console.error('Cal.com cancel error:', error);
          }
        }

        const { data, error } = await supabase
          .from('booking_sessions')
          .update({ status: 'cancelled' })
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to cancel booking' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, booking: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Booking error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
