import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listPlaybooks, createFromIncident, createPlaybook, removePlaybook, subscribe, type Playbook } from "@/store/playbooks";
import { listIncidents, type Incident } from "@/store/incidents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(listPlaybooks());
  const [incidents] = useState<Incident[]>(listIncidents());
  const [open, setOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(incidents[0]?.id || null);

  useEffect(() => subscribe(() => setPlaybooks(listPlaybooks())), []);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Playbooks</h1>
        <p className="text-muted-foreground">Manage automated resolution playbooks generated from incidents and best practices.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Playbooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playbooks.map((p) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.steps.length} steps</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => navigator.clipboard.writeText(p.steps.join("\n"))}>Copy</Button>
                      <Button variant="ghost" onClick={() => removePlaybook(p.id)}>Delete</Button>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-muted-foreground">View steps</summary>
                    <ol className="mt-2 list-decimal pl-6">
                      {p.steps.map((s, idx) => (
                        <li key={idx} className="mb-1">{s}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              ))}
              {playbooks.length === 0 && <div className="text-muted-foreground p-6">No playbooks yet.</div>}
            </div>
          </CardContent>
        </Card>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <label className="text-sm font-medium">From Incident</label>
                <Select value={selectedIncident || ""} onValueChange={(v) => setSelectedIncident(v)}>
                  <SelectTrigger><SelectValue placeholder="Select incident" /></SelectTrigger>
                  <SelectContent>
                    {incidents.map((it) => (
                      <SelectItem key={it.id} value={it.id}>{it.number} — {it.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!selectedIncident}>Generate Playbook</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Playbook</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <p className="text-sm text-muted-foreground">This will create a playbook based on the selected incident using AI heuristics.</p>
                      <div className="flex justify-end">
                        <Button onClick={() => { if (selectedIncident) { const it = incidents.find((x) => x.id === selectedIncident); if (it) { createFromIncident(it); setOpen(false); } } }}>Confirm</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => createPlaybook({ title: "Manual Playbook", incidentId: null, steps: ["Step 1", "Step 2"] })}>Create Manual Playbook</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
