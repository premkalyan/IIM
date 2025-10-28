export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "hanover_knowledge_v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function read(): KnowledgeArticle[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as KnowledgeArticle[];
  } catch {
    return [];
  }
}

function write(items: KnowledgeArticle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

function seedIfEmpty() {
  const items = read();
  if (items.length) return;
  const now = Date.now();
  const seed: Omit<KnowledgeArticle, "id">[] = [
    {
      title: "Troubleshooting DB Deadlocks",
      content:
        "When deadlocks occur, first identify long-running transactions and check for missing indexes. Consider increasing lock timeout and reviewing recent schema changes.",
      tags: ["database", "deadlock", "troubleshooting"],
      createdAt: new Date(now - 36e5 * 72).toISOString(),
      updatedAt: new Date(now - 36e5 * 48).toISOString(),
    },
    {
      title: "SAML SSO Failure Checklist",
      content:
        "Verify IdP availability, check SAML response timestamps, and ensure certificate validity. If using a proxy, confirm headers are forwarded correctly.",
      tags: ["access", "sso", "saml"],
      createdAt: new Date(now - 36e5 * 48).toISOString(),
      updatedAt: new Date(now - 36e5 * 24).toISOString(),
    },
    {
      title: "Network Latency Investigation",
      content:
        "Use traceroute and regional synthetic checks. Correlate spikes with deployments and check BGP or CDN configs.",
      tags: ["network", "latency"],
      createdAt: new Date(now - 36e5 * 200).toISOString(),
      updatedAt: new Date(now - 36e5 * 180).toISOString(),
    },
  ];
  const seeded = seed.map((s) => ({ ...s, id: crypto.randomUUID() }));
  write(seeded);
}

seedIfEmpty();

export function listArticles() {
  return read().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getArticle(id: string) {
  return read().find((a) => a.id === id);
}

export function createArticle(partial: Omit<KnowledgeArticle, "id" | "createdAt" | "updatedAt">) {
  const items = read();
  const ts = new Date().toISOString();
  const a: KnowledgeArticle = { ...partial, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
  write([a, ...items]);
  return a;
}

export function updateArticle(id: string, updates: Partial<Omit<KnowledgeArticle, "id" | "createdAt">>) {
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const merged = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  items[idx] = merged;
  write(items);
  return merged;
}

export function removeArticle(id: string) {
  const items = read().filter((i) => i.id !== id);
  write(items);
}

export function replaceAllArticles(payload: KnowledgeArticle[]) {
  write(payload);
}
