import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, ShieldCheck, ShieldAlert, MoreVertical, Ban, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
      ]);

      if (usersRes.data) setUsers(usersRes.data);

      const roleMap: Record<string, string[]> = {};
      (rolesRes.data || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      setRoles(roleMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleAdmin = async (userId: string) => {
    const hasAdmin = roles[userId]?.includes('admin');
    if (hasAdmin) {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      if (!error) {
        setRoles(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(r => r !== 'admin') }));
        toast.success('Admin role removed');
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' } as any);
      if (!error) {
        setRoles(prev => ({ ...prev, [userId]: [...(prev[userId] || []), 'admin'] }));
        toast.success('Admin role granted');
      }
    }
  };

  const filtered = users.filter(u =>
    (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground tracking-wider">USER MANAGEMENT</h1>
        <p className="text-muted-foreground">{users.length} total users</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((user, i) => {
          const userRoles = roles[user.id] || [];
          const isAdmin = userRoles.includes('admin');

          return (
            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-foreground font-bold">
                      {(user.display_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.display_name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {isAdmin && <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>}
                      {userRoles.includes('moderator') && <Badge className="bg-accent/20 text-accent border-accent/30">Mod</Badge>}
                      {userRoles.length === 0 && <Badge variant="outline" className="text-muted-foreground">User</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant={isAdmin ? 'destructive' : 'outline'} onClick={() => toggleAdmin(user.id)}>
                      {isAdmin ? <ShieldAlert className="w-4 h-4 mr-1" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
                      {isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
