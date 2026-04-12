import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, UserCog, Key, Trash2, ShieldPlus, ShieldMinus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: { full_name?: string; role?: string; department?: string };
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: { action: 'list_users' },
      });
      if (error) throw error;
      setUsers(data.users || []);

      // Fetch admin roles
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      setAdminIds(new Set((roles || []).map((r: any) => r.user_id)));
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: { action: 'reset_user_password', userId: resetPasswordUserId, newPassword },
      });
      if (error) throw error;
      toast.success('Password reset successfully');
      setResetPasswordUserId(null);
      setNewPassword('');
    } catch (error: any) {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: { action: isCurrentlyAdmin ? 'remove_admin' : 'add_admin', userId },
      });
      if (error) throw error;
      toast.success(isCurrentlyAdmin ? 'Admin role removed' : 'Admin role granted');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: { action: 'delete_user', userId },
      });
      if (error) throw error;
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.user_metadata?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="glass-card border-0 rounded-2xl">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 rounded-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary to-accent" />
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-gradient-primary flex items-center gap-2">
          <UserCog className="h-5 w-5" /> User Management ({users.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-2 w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {user.user_metadata?.full_name || 'No name'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {adminIds.has(user.id) && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs">Admin</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {user.user_metadata?.role || 'user'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm" variant="outline"
                            className="rounded-lg h-8 gap-1"
                            onClick={() => { setResetPasswordUserId(user.id); setNewPassword(''); }}
                          >
                            <Key className="h-3 w-3" /> Reset
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password for {user.email}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              type="password"
                              placeholder="New password (min 6 chars)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleResetPassword} disabled={resetting} className="bg-gradient-primary rounded-xl">
                              {resetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                              Reset Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm" variant="outline"
                        className={`rounded-lg h-8 gap-1 ${adminIds.has(user.id) ? 'text-destructive' : 'text-primary'}`}
                        onClick={() => handleToggleAdmin(user.id, adminIds.has(user.id))}
                      >
                        {adminIds.has(user.id) ? <ShieldMinus className="h-3 w-3" /> : <ShieldPlus className="h-3 w-3" />}
                        {adminIds.has(user.id) ? 'Demote' : 'Promote'}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg h-8 gap-1">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user {user.email}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
