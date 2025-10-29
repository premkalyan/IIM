import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listIncidents } from "@/store/incidents";

function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1"><div>{label}</div><div className="font-semibold">{value}</div></div>
      <div className="h-3 w-full bg-muted rounded-md overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const incidents = listIncidents();
  const total = incidents.length;
  const bySeverity = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of incidents) map[i.severity] = (map[i.severity] || 0) + 1;
    return map;
  }, [incidents]);
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of incidents) map[i.category] = (map[i.category] || 0) + 1;
    return map;
  }, [incidents]);
  const topEscalations = useMemo(() => incidents.sort((a,b) => b.escalationProbability - a.escalationProbability).slice(0,5), [incidents]);

  return (
    <div className="grid gap-6">
      <div>
        <PageHeader title="Analytics" subtitle="Quick operational metrics derived from your incidents." />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="text-sm text-muted-foreground">Total incidents</div>
              <div className="text-3xl font-bold">{total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Severity distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(bySeverity).map(([k,v]) => (<Bar key={k} label={k} value={v} max={total} />))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(byCategory).map(([k,v]) => (<Bar key={k} label={k} value={v} max={total} />))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top predicted escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6">
              {topEscalations.map((t) => (
                <li key={t.id} className="mb-2">
                  <div className="font-medium">{t.number} — {t.title}</div>
                  <div className="text-sm text-muted-foreground">Escalation: {Math.round(t.escalationProbability*100)}% • Severity: {t.severity}</div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6">
              {incidents.slice(0,8).map((i) => (
                <li key={i.id} className="mb-2 text-sm text-muted-foreground">{i.number} — {i.title} • {new Date(i.updatedAt).toLocaleString()}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
