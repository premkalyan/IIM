import { categorizeIncident, predictEscalation, type Category } from "@/lib/ai";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type State = "New" | "In Progress" | "Resolved" | "Closed";

export interface Incident {
  id: string;
  number: string;
  title: string;
  description: string;
  priority: number; // 1-5
  severity: Severity;
  category: Category;
  state: State;
  system?: string; // e.g., Oracle EPM, SAS, Informatica
  assigned_to?: string;
  resolutionNotes?: string;
  confidenceScore: number; // 0-1
  escalationProbability: number; // 0-1
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "blutic_incidents_v1";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function read(): Incident[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Incident[];
  } catch {
    return [];
  }
}

function write(items: Incident[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

function seedIfEmpty() {
  const items = read();
  if (items.length) return;
  const now = Date.now();
  const seedData: Omit<Incident, "id">[] = [
    {
      number: "INC-1001",
      title: "API latency spike in Claims service",
      description:
        "Users report slow responses on claims submission. Error rate increasing after deploy.",
      priority: 2,
      severity: "High",
      category: "Application",
      state: "In Progress",
      system: "Power BI Gateway",
      assigned_to: "A. Patel",
      resolutionNotes: "",
      confidenceScore: 0.78,
      escalationProbability: 0, // filled below
      createdAt: new Date(now - 36e5 * 5).toISOString(),
      updatedAt: new Date(now - 36e5 * 1).toISOString(),
    },
    {
      number: "INC-1002",
      title: "Intermittent DB deadlocks in Policy service",
      description:
        "Deadlocks observed during peak hours, customer impact reported.",
      priority: 1,
      severity: "Critical",
      category: "Database",
      state: "New",
      system: "Oracle EPM",
      assigned_to: "J. Chen",
      resolutionNotes: "",
      confidenceScore: 0.82,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 2).toISOString(),
      updatedAt: new Date(now - 36e5 * 1.5).toISOString(),
    },
    {
      number: "INC-1003",
      title: "VPN connectivity failures for remote adjusters",
      description: "Packet loss and DNS failures reported from East region",
      priority: 3,
      severity: "Medium",
      category: "Network",
      state: "New",
      system: "Infrastructure",
      assigned_to: "M. Smith",
      resolutionNotes: "",
      confidenceScore: 0.7,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 30).toISOString(),
      updatedAt: new Date(now - 36e5 * 28).toISOString(),
    },
    {
      number: "INC-1004",
      title: "SAML SSO login failures for underwriting portal",
      description:
        "Multiple users unable to login; IdP status shows partial outage",
      priority: 2,
      severity: "High",
      category: "Access",
      state: "In Progress",
      system: "SAML IdP",
      assigned_to: "R. Davis",
      resolutionNotes: "",
      confidenceScore: 0.76,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 8).toISOString(),
      updatedAt: new Date(now - 36e5 * 3).toISOString(),
    },

    // Platform specific seeds
    {
      number: "INC-2001",
      title: "Oracle EPM: Data load failures in consolidation job",
      description:
        "Scheduled consolidation failing with ORA-XXXXX and job aborts.",
      priority: 1,
      severity: "High",
      category: "Database",
      state: "New",
      system: "Oracle EPM",
      assigned_to: "DB Team",
      resolutionNotes: "",
      confidenceScore: 0.65,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 60).toISOString(),
      updatedAt: new Date(now - 36e5 * 59).toISOString(),
    },
    {
      number: "INC-2002",
      title: "Oracle EPM: Calculation manager errors on rule execution",
      description:
        "Calculation job fails with memory errors during peak processing.",
      priority: 2,
      severity: "Medium",
      category: "Application",
      state: "New",
      system: "Oracle EPM",
      assigned_to: "EPM Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 50).toISOString(),
      updatedAt: new Date(now - 36e5 * 48).toISOString(),
    },
    {
      number: "INC-3001",
      title: "SAS: Job scheduling failures due to license exhaustion",
      description:
        "SAS jobs failing; license pool exhausted during batch window.",
      priority: 2,
      severity: "High",
      category: "Application",
      state: "In Progress",
      system: "SAS",
      assigned_to: "Analytics Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 20).toISOString(),
      updatedAt: new Date(now - 36e5 * 10).toISOString(),
    },
    {
      number: "INC-3002",
      title: "SAS: Corrupt data sets after ETL",
      description:
        "Post-ETL datasets have inconsistent row counts and schema mismatches.",
      priority: 3,
      severity: "Medium",
      category: "Database",
      state: "New",
      system: "SAS",
      assigned_to: "Data Team",
      resolutionNotes: "",
      confidenceScore: 0.5,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 72).toISOString(),
      updatedAt: new Date(now - 36e5 * 70).toISOString(),
    },
    {
      number: "INC-4001",
      title: "Informatica PowerCenter: Repository connection errors",
      description:
        "Integration services unable to connect to repository; users impacted.",
      priority: 2,
      severity: "High",
      category: "Infrastructure",
      state: "New",
      system: "Informatica",
      assigned_to: "ETL Team",
      resolutionNotes: "",
      confidenceScore: 0.65,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 40).toISOString(),
      updatedAt: new Date(now - 36e5 * 38).toISOString(),
    },
    {
      number: "INC-4002",
      title: "Informatica: Slow session performance during peak loads",
      description:
        "ETL sessions experiencing high memory and CPU, causing delays.",
      priority: 3,
      severity: "Medium",
      category: "Infrastructure",
      state: "In Progress",
      system: "Informatica",
      assigned_to: "ETL Team",
      resolutionNotes: "",
      confidenceScore: 0.55,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 30).toISOString(),
      updatedAt: new Date(now - 36e5 * 28).toISOString(),
    },
    {
      number: "INC-5001",
      title: "OBIEE: Dashboards failing to render (OBIEE/OAC)",
      description:
        "Dashboard queries return errors; ODBC connections timing out.",
      priority: 2,
      severity: "High",
      category: "Application",
      state: "New",
      system: "OBIEE/OAC",
      assigned_to: "BI Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 12).toISOString(),
      updatedAt: new Date(now - 36e5 * 10).toISOString(),
    },
    {
      number: "INC-6001",
      title: "Hadoop: HDFS under-replicated blocks and NameNode warnings",
      description: "Replication issues reported and potential data loss risk.",
      priority: 1,
      severity: "Critical",
      category: "Infrastructure",
      state: "New",
      system: "Hadoop",
      assigned_to: "Big Data Team",
      resolutionNotes: "",
      confidenceScore: 0.7,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 200).toISOString(),
      updatedAt: new Date(now - 36e5 * 198).toISOString(),
    },
    {
      number: "INC-7001",
      title: "Power BI Gateway: Scheduled refresh failures",
      description:
        "Gateway unable to refresh datasets; OAuth token errors in logs.",
      priority: 2,
      severity: "High",
      category: "Infrastructure",
      state: "In Progress",
      system: "Power BI Gateway",
      assigned_to: "BI Team",
      resolutionNotes: "",
      confidenceScore: 0.68,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 18).toISOString(),
      updatedAt: new Date(now - 36e5 * 15).toISOString(),
    },
  ];

  const seeded = seedData.map((d, i) => {
    const id = crypto.randomUUID();
    const prob = predictEscalation({
      id,
      title: d.title,
      description: d.description,
      category: d.category,
      priority: d.priority,
      severity: d.severity,
      state: d.state,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
    return { ...d, id, escalationProbability: prob } as Incident;
  });
  write(seeded);
}

seedIfEmpty();

export function listIncidents(): Incident[] {
  return read().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getIncident(id: string): Incident | undefined {
  return read().find((i) => i.id === id);
}

export function createIncident(
  partial: Omit<
    Incident,
    | "id"
    | "number"
    | "confidenceScore"
    | "escalationProbability"
    | "createdAt"
    | "updatedAt"
  > & { number?: string },
): Incident {
  const items = read();
  const number =
    partial.number || `INC-${1000 + Math.floor(Math.random() * 9000)}`;
  const ts = new Date().toISOString();
  const id = crypto.randomUUID();
  const inferred = categorizeIncident(
    `${partial.title} ${partial.description}`,
  );
  const base = {
    id,
    number,
    confidenceScore: inferred.confidence,
    category: partial.category || inferred.category,
    createdAt: ts,
    updatedAt: ts,
  } as const;
  const prob = predictEscalation({
    id,
    title: partial.title,
    description: partial.description,
    category: base.category,
    priority: partial.priority,
    severity: partial.severity,
    state: partial.state,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  });
  const item: Incident = { ...partial, ...base, escalationProbability: prob };
  write([item, ...items]);
  return item;
}

export function updateIncident(
  id: string,
  updates: Partial<Omit<Incident, "id" | "number" | "createdAt">>,
): Incident | undefined {
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const prev = items[idx];
  const merged: Incident = {
    ...prev,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  // Recompute intelligence fields if relevant fields changed
  if (
    updates.title ||
    updates.description ||
    updates.category ||
    updates.severity ||
    updates.priority ||
    updates.state
  ) {
    const inferred = categorizeIncident(
      `${merged.title} ${merged.description}`,
    );
    merged.category = updates.category || merged.category || inferred.category;
    merged.confidenceScore = inferred.confidence;
    merged.escalationProbability = predictEscalation(merged);
  }
  items[idx] = merged;
  write(items);
  return merged;
}

export function removeIncident(id: string) {
  const items = read().filter((i) => i.id !== id);
  write(items);
}

export function clearAllIncidents() {
  write([]);
}

export function addSampleIncidents() {
  const now = Date.now();
  const seedData: Omit<Incident, "id">[] = [
    // Oracle EPM samples
    {
      number: `INC-${2000 + Math.floor(Math.random() * 9000)}`,
      title: "Oracle EPM: Data load failures in consolidation job",
      description:
        "Scheduled consolidation failing with ORA-XXXXX and job aborts.",
      priority: 1,
      severity: "High",
      category: "Database",
      state: "New",
      system: "Oracle EPM",
      assigned_to: "DB Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 24).toISOString(),
      updatedAt: new Date(now - 36e5 * 23).toISOString(),
    },
    {
      number: `INC-${2000 + Math.floor(Math.random() * 9000)}`,
      title: "Oracle EPM: Calculation manager errors on rule execution",
      description:
        "Calculation job fails with memory errors during peak processing.",
      priority: 2,
      severity: "Medium",
      category: "Application",
      state: "New",
      system: "Oracle EPM",
      assigned_to: "EPM Team",
      resolutionNotes: "",
      confidenceScore: 0.55,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 22).toISOString(),
      updatedAt: new Date(now - 36e5 * 21).toISOString(),
    },
    // SAS samples
    {
      number: `INC-${3000 + Math.floor(Math.random() * 9000)}`,
      title: "SAS: Job scheduling failures due to license exhaustion",
      description:
        "SAS jobs failing; license pool exhausted during batch window.",
      priority: 2,
      severity: "High",
      category: "Application",
      state: "In Progress",
      system: "SAS",
      assigned_to: "Analytics Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 20).toISOString(),
      updatedAt: new Date(now - 36e5 * 19).toISOString(),
    },
    {
      number: `INC-${3000 + Math.floor(Math.random() * 9000)}`,
      title: "SAS: Corrupt data sets after ETL",
      description:
        "Post-ETL datasets have inconsistent row counts and schema mismatches.",
      priority: 3,
      severity: "Medium",
      category: "Database",
      state: "New",
      system: "SAS",
      assigned_to: "Data Team",
      resolutionNotes: "",
      confidenceScore: 0.5,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 26).toISOString(),
      updatedAt: new Date(now - 36e5 * 25).toISOString(),
    },
    // Informatica samples
    {
      number: `INC-${4000 + Math.floor(Math.random() * 9000)}`,
      title: "Informatica: Repository connection errors",
      description:
        "Integration services unable to connect to repository; users impacted.",
      priority: 2,
      severity: "High",
      category: "Infrastructure",
      state: "New",
      system: "Informatica",
      assigned_to: "ETL Team",
      resolutionNotes: "",
      confidenceScore: 0.65,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 18).toISOString(),
      updatedAt: new Date(now - 36e5 * 17).toISOString(),
    },
    {
      number: `INC-${4000 + Math.floor(Math.random() * 9000)}`,
      title: "Informatica: Slow session performance during peak loads",
      description:
        "ETL sessions experiencing high memory and CPU, causing delays.",
      priority: 3,
      severity: "Medium",
      category: "Infrastructure",
      state: "In Progress",
      system: "Informatica",
      assigned_to: "ETL Team",
      resolutionNotes: "",
      confidenceScore: 0.55,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 16).toISOString(),
      updatedAt: new Date(now - 36e5 * 15).toISOString(),
    },
    // OBIEE/OAC samples
    {
      number: `INC-${5000 + Math.floor(Math.random() * 9000)}`,
      title: "OBIEE: Dashboards failing to render (OBIEE/OAC)",
      description:
        "Dashboard queries return errors; ODBC connections timing out.",
      priority: 2,
      severity: "High",
      category: "Application",
      state: "New",
      system: "OBIEE/OAC",
      assigned_to: "BI Team",
      resolutionNotes: "",
      confidenceScore: 0.6,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 14).toISOString(),
      updatedAt: new Date(now - 36e5 * 13).toISOString(),
    },
    // Hadoop samples
    {
      number: `INC-${6000 + Math.floor(Math.random() * 9000)}`,
      title: "Hadoop: HDFS under-replicated blocks and NameNode warnings",
      description: "Replication issues reported and potential data loss risk.",
      priority: 1,
      severity: "Critical",
      category: "Infrastructure",
      state: "New",
      system: "Hadoop",
      assigned_to: "Big Data Team",
      resolutionNotes: "",
      confidenceScore: 0.7,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 22).toISOString(),
      updatedAt: new Date(now - 36e5 * 21).toISOString(),
    },
    // Power BI Gateway samples
    {
      number: `INC-${7000 + Math.floor(Math.random() * 9000)}`,
      title: "Power BI Gateway: Scheduled refresh failures",
      description:
        "Gateway unable to refresh datasets; OAuth token errors in logs.",
      priority: 2,
      severity: "High",
      category: "Infrastructure",
      state: "In Progress",
      system: "Power BI Gateway",
      assigned_to: "BI Team",
      resolutionNotes: "",
      confidenceScore: 0.68,
      escalationProbability: 0,
      createdAt: new Date(now - 36e5 * 19).toISOString(),
      updatedAt: new Date(now - 36e5 * 18).toISOString(),
    },
  ];

  const items = read();
  const seeded = seedData.map((d) => {
    const id = crypto.randomUUID();
    const prob = predictEscalation({
      id,
      title: d.title,
      description: d.description,
      category: d.category,
      priority: d.priority,
      severity: d.severity,
      state: d.state,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
    return { ...d, id, escalationProbability: prob } as Incident;
  });

  write([...seeded, ...items]);
}
