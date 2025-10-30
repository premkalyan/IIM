import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import IncidentForm from "@/components/incidents/IncidentForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Edit3, Plus, Trash2 } from "lucide-react";
import {
  listIncidents,
  createIncident,
  updateIncident,
  removeIncident,
  subscribe,
  type Incident,
} from "@/store/incidents";
import PageHeader from "@/components/PageHeader";

export default function Incidents() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Incident[]>(listIncidents());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [q, setQ] = useState(params.get("q") || "");
  const [sev, setSev] = useState(params.get("severity") || "All");
  const [cat, setCat] = useState(params.get("category") || "All");
  const [systemFilter, setSystemFilter] = useState(
    params.get("system") || "All",
  );
  const [state, setState] = useState(params.get("state") || "All");
  const [sort, setSort] = useState<"updated" | "priority">("updated");

  useEffect(() => {
    const unsub = subscribe(() => setItems(listIncidents()));
    setItems(listIncidents());
    return unsub;
  }, []);

  useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  const filtered = useMemo(() => {
    return items
      .filter((i) =>
        q
          ? `${i.number} ${i.title} ${i.description}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true,
      )
      .filter((i) => (sev === "All" ? true : i.severity === sev))
      .filter((i) => (cat === "All" ? true : i.category === cat))
      .filter((i) =>
        systemFilter === "All" ? true : (i.system || "Other") === systemFilter,
      )
      .filter((i) => (state === "All" ? true : i.state === state))
      .sort((a, b) => {
        if (sort === "updated")
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        return a.priority - b.priority;
      });
  }, [items, q, sev, cat, state, sort]);

  return (
    <div className="grid gap-6">
      <div>
        <PageHeader
          title="Incidents"
          subtitle="Manage incidents entirely in-browser. No backend required."
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)}>
                  <Plus className="mr-2 h-4 w-4" /> New Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit Incident" : "New Incident"}
                  </DialogTitle>
                </DialogHeader>
                <IncidentForm
                  initial={editing || undefined}
                  onSubmit={(values) => {
                    if (editing) {
                      updateIncident(editing.id, values);
                    } else {
                      createIncident(values);
                    }
                    setOpen(false);
                  }}
                  onCancel={() => setOpen(false)}
                  submitLabel={editing ? "Update" : "Create"}
                />
              </DialogContent>
            </Dialog>
          }
        />
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        Filters: Use the dropdowns to narrow results by Severity, Category,
        System, and State.
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Search</label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search incidents, numbers, titles..."
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Severity</label>
          <Select value={sev} onValueChange={(v) => setSev(v)}>
            <SelectTrigger>
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Severity</SelectLabel>
                {["All", "Low", "Medium", "High", "Critical"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select value={cat} onValueChange={(v) => setCat(v)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                {[
                  "All",
                  "Application",
                  "Network",
                  "Database",
                  "Security",
                  "Access",
                  "Infrastructure",
                  "Other",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">System</label>
          <Select
            value={systemFilter}
            onValueChange={(v) => setSystemFilter(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All systems" />
            </SelectTrigger>
            <SelectContent>
              <SelectLabel>System</SelectLabel>
              {[
                "All",
                "Oracle EPM",
                "SAS",
                "Informatica",
                "OBIEE/OAC",
                "Hadoop",
                "Power BI Gateway",
                "Other",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">State</label>
          <Select value={state} onValueChange={(v) => setState(v)}>
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectLabel>State</SelectLabel>
              {["All", "New", "In Progress", "Resolved", "Closed"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Sort</label>
          <Button
            variant="outline"
            onClick={() => setSort(sort === "updated" ? "priority" : "updated")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />{" "}
            {sort === "updated" ? "Updated" : "Priority"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">System</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="hidden lg:table-cell">State</TableHead>
              <TableHead className="hidden xl:table-cell">Owner</TableHead>
              <TableHead className="hidden xl:table-cell">Confidence</TableHead>
              <TableHead>Escalation</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.number}</TableCell>
                <TableCell className="max-w-[24rem]">
                  <div className="line-clamp-2 font-medium">{i.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {i.description}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {i.system || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">{i.category}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  P{i.priority}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      i.severity === "Critical"
                        ? "bg-destructive text-destructive-foreground"
                        : i.severity === "High"
                          ? "bg-orange-500 text-white"
                          : i.severity === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                    }
                  >
                    {i.severity}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {i.state}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {i.assigned_to || "—"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {Math.round(i.confidenceScore * 100)}%
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${i.escalationProbability > 0.7 ? "bg-destructive" : i.escalationProbability > 0.45 ? "bg-orange-500" : "bg-emerald-500"}`}
                    ></span>
                    {Math.round(i.escalationProbability * 100)}%
                  </div>
                </TableCell>
                <TableCell className="w-0 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(i);
                        setOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIncident(i.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-10 text-center text-muted-foreground"
                >
                  No incidents match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
