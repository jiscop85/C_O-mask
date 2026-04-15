import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BatchJob {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  settings: {
    pitch: number;
    speed: number;
    reverb: number;
    voiceModel: string;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, files, settings, jobId } = await req.json();

    if (action === "start") {
      // Initialize batch processing job
      const jobs: BatchJob[] = files.map((file: { name: string; id: string }) => ({
        id: file.id,
        fileName: file.name,
        status: "pending",
        progress: 0,
        settings: settings || {
          pitch: 50,
          speed: 50,
          reverb: 20,
          voiceModel: "default",
        },
      }));

      return new Response(
        JSON.stringify({
          success: true,
          message: "Batch job started",
          batchId: crypto.randomUUID(),
          totalFiles: jobs.length,
          jobs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "status") {
      // Return mock status for demo purposes
      // In production, this would check actual job status from a database
      return new Response(
        JSON.stringify({
          success: true,
          jobId,
          status: "processing",
          progress: Math.random() * 100,
          message: "Processing audio files...",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "process") {
      // Simulate processing a single file from the batch
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      // Use AI to generate processing metadata/suggestions
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: "You are an audio processing assistant. Analyze the audio processing settings and provide optimization suggestions.",
            },
            {
              role: "user",
              content: `Audio processing settings: Pitch: ${settings?.pitch}%, Speed: ${settings?.speed}%, Reverb: ${settings?.reverb}%, Model: ${settings?.voiceModel}. Provide brief optimization tips.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const data = await response.json();
      const suggestions = data.choices?.[0]?.message?.content || "Processing complete";

      return new Response(
        JSON.stringify({
          success: true,
          jobId,
          status: "completed",
          progress: 100,
          suggestions,
          processedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch audio error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});