export type Category =
  | "Network"
  | "Application"
  | "Database"
  | "Security"
  | "Access"
  | "Infrastructure"
  | "Other";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Network: [
    "latency",
    "packet",
    "dns",
    "network",
    "bandwidth",
    "router",
    "switch",
    "vpn",
  ],
  Application: [
    "ui",
    "frontend",
    "backend",
    "api",
    "null",
    "exception",
    "timeout",
    "bug",
    "feature",
  ],
  Database: [
    "db",
    "database",
    "sql",
    "query",
    "index",
    "deadlock",
    "replica",
    "postgres",
    "mysql",
  ],
  Security: [
    "xss",
    "csrf",
    "vulnerability",
    "threat",
    "malware",
    "ransomware",
    "ddos",
    "threat",
    "token",
    "auth",
  ],
  Access: [
    "login",
    "permission",
    "role",
    "access",
    "sso",
    "saml",
    "mfa",
    "password",
    "reset",
  ],
  Infrastructure: [
    "server",
    "vm",
    "kubernetes",
    "k8s",
    "node",
    "pod",
    "cpu",
    "memory",
    "disk",
    "storage",
    "cloud",
  ],
  Other: [],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function vectorize(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const map = new Map<string, number>();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [, v] of a) na += v * v;
  for (const [, v] of b) nb += v * v;
  for (const [k, v] of a) {
    const vb = b.get(k) || 0;
    dot += v * vb;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return Math.min(1, Math.max(0, dot / denom));
}

export interface IncidentLike {
  id: string;
  title: string;
  description: string;
  category?: Category;
  priority: number; // 1-5
  severity: "Low" | "Medium" | "High" | "Critical";
  state: "New" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  updatedAt: string;
}

export function categorizeIncident(
  text: string,
): { category: Category; confidence: number } {
  const tokens = new Set(tokenize(text));
  let best: Category = "Other";
  let bestScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS) as [
    Category,
    string[],
  ][]) {
    const matches = kws.reduce((acc, kw) => acc + (tokens.has(kw) ? 1 : 0), 0);
    const score = kws.length ? matches / kws.length : 0.1; // small default for Other
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }
  return { category: best, confidence: Number(bestScore.toFixed(2)) };
}

export function similaritySearch<T extends IncidentLike>(
  query: string,
  items: T[],
  topK = 5,
): { item: T; score: number }[] {
  const qvec = vectorize(query);
  const scored = items
    .map((it) => {
      const txt = `${it.title} ${it.description}`;
      const score = cosineSim(qvec, vectorize(txt));
      return { item: it, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored;
}

export function predictEscalation(it: IncidentLike): number {
  // Heuristic model approximating risk
  const sevWeight = { Low: 0.1, Medium: 0.35, High: 0.65, Critical: 0.85 }[
    it.severity
  ];
  const priWeight = (6 - Math.min(5, Math.max(1, it.priority))) * 0.1; // P1 -> 0.5, P5 -> 0.1
  const stateAdj = { New: 0.15, "In Progress": 0.1, Resolved: -0.2, Closed: -0.3 }[
    it.state
  ];
  const catAdj = {
    Security: 0.2,
    Database: 0.1,
    Network: 0.08,
    Infrastructure: 0.06,
    Application: 0.04,
    Access: 0.02,
    Other: 0,
  }[it.category || "Other"];
  const hoursOpen = Math.max(
    0,
    (Date.now() - new Date(it.createdAt).getTime()) / 36e5,
  );
  const timeAdj = Math.min(0.25, hoursOpen / 72); // up to +0.25 after 3 days
  const base = sevWeight + priWeight + stateAdj + catAdj + timeAdj;
  return Number(Math.min(1, Math.max(0, base)).toFixed(2));
}

export function generatePlaybook(it: IncidentLike): string[] {
  const steps: string[] = [];
  const cat = it.category || categorizeIncident(`${it.title} ${it.description}`).category;
  const sev = it.severity;
  // Common first steps
  steps.push("Acknowledge incident and notify stakeholders");
  steps.push("Collect context: logs, metrics, recent changes");

  if (cat === "Network") {
    steps.push("Check network health dashboard and routing tables");
    steps.push("Validate DNS resolution and latency from affected regions");
    steps.push("Engage Network On-Call if packet loss > 2% for 5m");
  } else if (cat === "Application") {
    steps.push("Review recent deployments and feature flags");
    steps.push("Check error rates and p95 latency in APM");
    steps.push("Roll back or disable impacted feature if errors spike");
  } else if (cat === "Database") {
    steps.push("Inspect DB CPU, connections, and slow query log");
    steps.push("Rebuild missing indexes or kill runaway queries as needed");
    steps.push("Fail over to replica if primary is degraded");
  } else if (cat === "Security") {
    steps.push("Isolate affected systems and rotate credentials");
    steps.push("Run malware scan and review IAM audit logs");
    steps.push("Engage Security IR team and begin RCA");
  } else if (cat === "Access") {
    steps.push("Validate SSO/SAML health and IdP status");
    steps.push("Review recent permission changes and group policies");
  } else if (cat === "Infrastructure") {
    steps.push("Check cluster/node health, autoscaler events");
    steps.push("Drain & replace unhealthy nodes; verify capacity");
  }

  if (sev === "Critical" || sev === "High") {
    steps.push("Create war room; assign roles (Lead, Comms, Scribe)");
    steps.push("Provide updates every 15 minutes to stakeholders");
  }

  steps.push("Document resolution and update knowledge base");
  return steps;
}
