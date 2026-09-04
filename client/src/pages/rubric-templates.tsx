import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Copy, Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function RubricTemplates() {
  const [search, setSearch] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: rubrics = [], isLoading } = useQuery({ queryKey: ["/api/rubric-templates"], queryFn: async () => { const r = await fetch("/api/rubric-templates", { headers: headers() }); if (!r.ok) throw new Error("Unable to load templates"); return (await r.json()).templates; } });
  const remove = useMutation({ mutationFn: async (id: string) => { const r = await fetch(`/api/rubric-templates/${id}`, { method: "DELETE", headers: headers() }); if (!r.ok) throw new Error((await r.json()).error || "Unable to delete template"); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/rubric-templates"] }); toast({ title: "Template deleted" }); }, onError: (e: Error) => toast({ title: "Could not delete template", description: e.message, variant: "destructive" }) });
  const duplicate = useMutation({ mutationFn: async (rubric: any) => { const r = await fetch("/api/rubric-templates", { method: "POST", headers: { ...headers(), "Content-Type": "application/json" }, body: JSON.stringify({ name: `${rubric.name} (Copy)`, description: rubric.description, rubric_type: rubric.rubric_type, academic_level: rubric.academic_level, total_points: rubric.total_points, criteria: rubric.rubric_criteria || [] }) }); if (!r.ok) throw new Error((await r.json()).error || "Unable to duplicate template"); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/rubric-templates"] }); toast({ title: "Template duplicated" }); }, onError: (e: Error) => toast({ title: "Could not duplicate template", description: e.message, variant: "destructive" }) });
  const exportTemplate = async (rubric: any) => {
    const response = await fetch(`/api/rubric-templates/${rubric.id}/export`, { headers: headers() });
    if (!response.ok) {
      toast({ title: "Could not export template", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${rubric.name.replace(/\W+/g, "-").toLowerCase()}-rubric.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const shown = rubrics.filter((r: any) => `${r.name} ${r.description || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="max-w-6xl mx-auto space-y-6"><div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end"><div><h1 className="text-3xl font-bold">Rubric Templates</h1><p className="text-muted-foreground">Create and manage reusable grading templates for the desktop grader.</p></div><Link href="/rubric-templates/new"><Button><Plus className="w-4 h-4 mr-2" />Create New Template</Button></Link></div><div className="relative max-w-md"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." /></div><Card><CardHeader><CardTitle>Your Templates</CardTitle><CardDescription>Templates are exported to and used by your local desktop app.</CardDescription></CardHeader><CardContent>{isLoading ? <div className="grid md:grid-cols-2 gap-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div> : shown.length ? <div className="grid md:grid-cols-2 gap-4">{shown.map((r: any) => <Card key={r.id}><CardHeader><CardTitle className="text-lg">{r.name}</CardTitle><CardDescription>{r.description || "No description provided"}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2"><Badge variant="secondary" className="capitalize">{r.rubric_type?.replace("_", " ")}</Badge><Badge variant="secondary" className="capitalize">{r.academic_level?.replace("_", " ")}</Badge><Badge variant="outline">{r.rubric_criteria?.length || 0} criteria · {r.total_points} pts</Badge></div><div className="flex flex-wrap gap-2"><Link href={`/rubric-templates/${r.id}`}><Button size="sm" variant="outline"><Pencil className="w-4 h-4 mr-1" />Edit</Button></Link><Button size="sm" variant="outline" onClick={() => exportTemplate(r)}><Download className="w-4 h-4 mr-1" />Export</Button><Button size="icon" variant="ghost" aria-label="Duplicate template" onClick={() => duplicate.mutate(r)}><Copy className="w-4 h-4" /></Button><Button size="icon" variant="ghost" aria-label="Delete template" onClick={() => { if (confirm(`Delete "${r.name}"?`)) remove.mutate(r.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></CardContent></Card>)}</div> : <div className="py-12 text-center"><ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="font-medium">No templates yet.</p><p className="text-sm text-muted-foreground mb-4">Create your first rubric template to use with the desktop grader.</p><Link href="/rubric-templates/new"><Button>Create Template</Button></Link></div>}</CardContent></Card></div>;
}