import { generatePlaybook } from "@/lib/ai";

export interface Playbook {
  id: string;
  title: string;
  incidentId?: string | null;
  steps: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "blutic_playbooks_v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function read(): Playbook[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Playbook[];
  } catch {
    return [];
  }
}

function write(items: Playbook[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

function seedIfEmpty() {
  const items = read();
  if (items.length) return;
  const now = Date.now();
  const seed: Omit<Playbook, "id">[] = [
    {
      title: "DB Recovery Playbook",
      incidentId: null,
      steps: [
        "Assess replication lag and health",
        "Attempt controlled restart of the primary DB service",
        "Failover to replica if primary doesn't recover",
        "Notify stakeholders and schedule RCA",
      ],
      createdAt: new Date(now - 36e5 * 100).toISOString(),
      updatedAt: new Date(now - 36e5 * 80).toISOString(),
    },
  ];
  const seeded = seed.map((s) => ({ ...s, id: crypto.randomUUID() }));
  write(seeded);
}

seedIfEmpty();

export function listPlaybooks() {
  return read().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getPlaybook(id: string) {
  return read().find((p) => p.id === id);
}

export function createPlaybook(partial: Omit<Playbook, "id" | "createdAt" | "updatedAt">) {
  const items = read();
  const ts = new Date().toISOString();
  const pb: Playbook = { ...partial, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
  write([pb, ...items]);
  return pb;
}

export function createFromIncident(incident: { title: string; description: string; category?: string; severity?: string }) {
  const steps = generatePlaybook({
    id: crypto.randomUUID(),
    title: incident.title,
    description: incident.description,
    category: (incident.category as any) || undefined,
    priority: 3,
    severity: (incident.severity as any) || "Medium",
    state: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any);
  return createPlaybook({ title: `Playbook for: ${incident.title}`, incidentId: null, steps });
}

export function updatePlaybook(id: string, updates: Partial<Omit<Playbook, "id" | "createdAt">>) {
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const merged = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  items[idx] = merged;
  write(items);
  return merged;
}

export function removePlaybook(id: string) {
  const items = read().filter((i) => i.id !== id);
  write(items);
}

export function replaceAllPlaybooks(payload: Playbook[]) {
  write(payload);
}
