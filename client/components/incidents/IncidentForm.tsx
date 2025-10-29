import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Incident, Severity, State } from "@/store/incidents";
import type { Category } from "@/lib/ai";

interface Props {
  initial?: Partial<Incident>;
  onSubmit: (values: Omit<Incident, "id" | "number" | "confidenceScore" | "escalationProbability" | "createdAt" | "updatedAt"> & { number?: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const severities: Severity[] = ["Low", "Medium", "High", "Critical"];
const states: State[] = ["New", "In Progress", "Resolved", "Closed"];
const categories: Category[] = [
  "Application",
  "Network",
  "Database",
  "Security",
  "Access",
  "Infrastructure",
  "Other",
];

const systems = [
  "Oracle EPM",
  "SAS",
  "Informatica",
  "OBIEE/OAC",
  "Hadoop",
  "Power BI Gateway",
  "Other",
];

export default function IncidentForm({ initial, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState(initial?.priority || 3);
  const [severity, setSeverity] = useState<Severity>(initial?.severity || "Medium");
  const [state, setState] = useState<State>(initial?.state || "New");
  const [category, setCategory] = useState<Category>(initial?.category || "Application");
  const [system, setSystem] = useState(initial?.system || "");
  const [assigned_to, setAssignedTo] = useState(initial?.assigned_to || "");
  const [number, setNumber] = useState(initial?.number || "");

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setPriority(initial?.priority || 3);
    setSeverity(initial?.severity || "Medium");
    setState(initial?.state || "New");
    setCategory(initial?.category || "Application");
    setSystem(initial?.system || "");
    setAssignedTo(initial?.assigned_to || "");
    setNumber(initial?.number || "");
  }, [initial]);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, description, priority, severity, state, category, system, assigned_to, resolutionNotes: initial?.resolutionNotes || "", number });
      }}
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Short incident summary" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="What happened? Include impact, scope, and error messages." />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Priority (1-5)</label>
          <Input type="number" min={1} max={5} value={priority} onChange={(e) => setPriority(parseInt(e.target.value || "3", 10))} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Severity</label>
          <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
            <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
            <SelectContent>
              {severities.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">State</label>
          <Select value={state} onValueChange={(v) => setState(v as State)}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Assigned To</label>
          <Input value={assigned_to} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Owner name" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">System / Platform</label>
          <Select value={system} onValueChange={(v) => setSystem(v)}>
            <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
            <SelectContent>
              {systems.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Ticket Number (optional)</label>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="INC-1234" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
