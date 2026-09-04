import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, KeyRound, LogOut, ShieldAlert, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAuthToken, getAuthToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: profile } = useQuery({ queryKey: ["/api/auth/me"], queryFn: async () => { const r = await fetch("/api/auth/me", { headers: headers() }); if (!r.ok) throw new Error("Unable to load profile"); return r.json(); } });
  const { data: subscription } = useQuery({ queryKey: ["/api/user/subscription"], queryFn: async () => { const r = await fetch("/api/user/subscription", { headers: headers() }); return r.ok ? (await r.json()).subscription : null; } });
  const user = profile?.user || profile;

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setChangingPassword(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await response.json();
    setChangingPassword(false);
    if (!response.ok) return toast({ title: "Password not changed", description: result.error, variant: "destructive" });
    setCurrentPassword("");
    setNewPassword("");
    toast({ title: "Password updated" });
  };

  const deleteAccount = async () => {
    if (!deletePassword || !confirm("Permanently delete your GraderInsight account? This cannot be undone.")) return;
    setDeleting(true);
    const response = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const result = await response.json();
    setDeleting(false);
    if (!response.ok) return toast({ title: "Account not deleted", description: result.error, variant: "destructive" });
    clearAuthToken();
    setLocation("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your account, plan, and desktop app access.</p></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Profile</CardTitle><CardDescription>Your account information.</CardDescription></CardHeader><CardContent className="grid sm:grid-cols-2 gap-4"><div><Label>Name</Label><Input value={user?.name || ""} readOnly /></div><div><Label>Email</Label><Input value={user?.email || ""} readOnly /></div></CardContent></Card>
      <Card id="subscription"><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Subscription &amp; Billing</CardTitle><CardDescription>Current plan and billing access.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-3 gap-4 text-sm"><div><p className="text-muted-foreground">Current plan</p><p className="font-medium capitalize">{subscription?.tier || "No active plan"}</p></div><div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{subscription?.status || "Inactive"}</p></div><div><p className="text-muted-foreground">Renews</p><p className="font-medium">{subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—"}</p></div></div><Link href="/#pricing"><Button>View plans and billing options</Button></Link><p className="text-xs text-muted-foreground">Payment method and billing history are managed through your billing portal when available.</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" />API Key</CardTitle><CardDescription>How AI access works with GraderInsight.</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground space-y-2"><p>Your Anthropic API key is used only by the desktop app on your computer. GraderInsight does not receive student assignments or their content.</p><p>Open the desktop app&apos;s Settings panel to enter and manage your key.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Password</CardTitle><CardDescription>Choose a new password with at least eight characters.</CardDescription></CardHeader><CardContent><form className="grid sm:grid-cols-2 gap-4" onSubmit={changePassword}><div><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div><div><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div><Button className="sm:col-span-2 sm:w-fit" disabled={changingPassword}>{changingPassword ? "Updating..." : "Change password"}</Button></form></CardContent></Card>
      <Card className="border-destructive/30"><CardHeader><CardTitle>Account</CardTitle><CardDescription>Sign out or permanently delete your account.</CardDescription></CardHeader><CardContent className="space-y-4"><Link href="/login"><Button variant="outline" onClick={clearAuthToken}><LogOut className="w-4 h-4 mr-2" />Log out</Button></Link><div className="border-t pt-4 space-y-2"><Label htmlFor="delete-password">Enter your password to delete your account</Label><div className="flex flex-col sm:flex-row gap-2"><Input id="delete-password" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /><Button variant="destructive" disabled={deleting || !deletePassword} onClick={deleteAccount}><ShieldAlert className="w-4 h-4 mr-2" />{deleting ? "Deleting..." : "Delete account"}</Button></div></div></CardContent></Card>
    </div>
  );
}