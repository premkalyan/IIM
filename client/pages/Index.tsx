import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IncidentForm from "@/components/incidents/IncidentForm";
import { listIncidents, createIncident, subscribe, type Incident } from "@/store/incidents";
import { similaritySearch, generatePlaybook } from "@/lib/ai";
import { Lightbulb, ListPlus, ArrowRight } from "lucide-react";

export default function Index() {
  const [incidents, setIncidents] = useState<Incident[]>(listIncidents());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ item: Incident; score: number }[]>([]);

  useEffect(() => {
    const unsub = subscribe(() => setIncidents(listIncidents()));
    return unsub;
  }, []);

  const openCount = useMemo(() => incidents.filter((i) => i.state === "New" || i.state === "In Progress").length, [incidents]);
  const highRisk = useMemo(() => incidents.filter((i) => i.escalationProbability > 0.7).length, [incidents]);
  const avgResolution = useMemo(() => {
    const resolved = incidents.filter((i) => i.state === "Resolved" || i.state === "Closed");
    if (!resolved.length) return "—";
    const hrs = resolved
      .map((i) => (new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime()) / 36e5)
      .reduce((a, b) => a + b, 0) / resolved.length;
    return `${hrs.toFixed(1)}h`;
  }, [incidents]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Hanover Intelligent Incident Management</h1>
        <p className="text-muted-foreground">AI-assisted incident triage, knowledge retrieval, and predictive escalation. All in your browser.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Open Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{openCount}</div>
            <p className="text-xs text-muted-foreground">Across applications and platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predicted Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{highRisk}</div>
            <p className="text-xs text-muted-foreground">Probability &gt; 70%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{avgResolution}</div>
            <p className="text-xs text-muted-foreground">Last {incidents.length} incidents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Intelligent Knowledge Retrieval</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const res = similaritySearch(query, incidents, 5);
                setResults(res);
              }}
            >
              <Textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe the incident. We'll surface similar past cases and solutions." />
              <div className="flex items-center gap-2">
                <Button type="submit">Search</Button>
                <Button variant="ghost" asChild>
                  <Link to="/incidents">
                    Go to Incidents <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </form>
            {results.length > 0 && (
              <div className="mt-4 grid gap-3">
                {results.map(({ item, score }) => (
                  <div key={item.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.number}</span>
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground">Match {Math.round(score * 100)}%</span>
                        </div>
                        <div className="mt-1 font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Generate Playbook</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolution Playbook</DialogTitle>
                          </DialogHeader>
                          <ul className="list-disc space-y-2 pl-5 text-sm">
                            {generatePlaybook(item).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListPlus className="h-5 w-5 text-primary" /> Quick Create</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">New Incident</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Incident</DialogTitle>
                </DialogHeader>
                <IncidentForm
                  onSubmit={(values) => {
                    createIncident(values);
                    setOpen(false);
                  }}
                  onCancel={() => setOpen(false)}
                  submitLabel="Create"
                />
              </DialogContent>
            </Dialog>
            <div className="mt-4 text-sm text-muted-foreground">
              Create incidents, triage with AI, and manage workflows entirely in-browser.
            </div>
            <Link to="/incidents"><Button variant="ghost" className="mt-3">Manage Incidents</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
