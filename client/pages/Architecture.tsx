import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MermaidRenderer from "@/components/MermaidRenderer";

const mermaidDiagram = `flowchart LR
  subgraph EXTERNAL[External Systems]
    SN[ServiceNow]
    CF[Confluence / Jira]
    LOGS[Logs / APM]
  end

  subgraph INGEST[Ingestion & ETL]
    NORM[Normalize \nAttachments & Metadata]
    ATT[Attachments/Files]
  end

  subgraph MODELS[AI Models]
    CAT[Categorization]
    EMB[Embeddings / Similarity]
    ESC[Escalation Prediction]
  end

  subgraph KB[Knowledge Base]
    ART[Articles / Runbooks]
    INDEX[Indexed Embeddings]
  end

  subgraph PB[Playbooks]
    AUTO[Generated Playbooks]
    MAN[Manual Playbooks]
  end

  subgraph AN[Analytics]
    DASH[Dashboards / KPIs]
    METRICS[Model Metrics]
  end

  SN -->|tickets| NORM
  CF -->|documents| NORM
  LOGS -->|telemetry| NORM
  NORM --> CAT
  NORM --> EMB
  CAT --> KB
  EMB --> KB
  KB --> PB
  CAT --> PB
  ESC --> PB
  PB -->|actions| NORM
  KB --> AN
  MODELS --> AN
  NORM --> AN
`;

export default function Architecture() {
  const STORAGE_KEY = "architecture_mermaid_v1";
  const defaultDiagram = mermaidDiagram;
  const [diagram, setDiagram] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || defaultDiagram;
    } catch {
      return defaultDiagram;
    }
  });
  const [draft, setDraft] = useState(diagram);
  const [liveUpdate, setLiveUpdate] = useState(true);

  useEffect(() => {
    setDraft(diagram);
  }, [diagram]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, diagram);
    } catch {}
  }, [diagram]);

  return (
    <div className="grid gap-6">
      <div>
        <PageHeader title="Architecture & Data Flow" subtitle="Overview of integration points, data ingestion, AI models, knowledge base, playbooks, and analytics." />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="overflow-auto">
          {/* Mermaid diagram renderer */}
          <MermaidRenderer chart={liveUpdate ? draft : diagram} theme={document.documentElement.classList.contains("dark") ? "dark" : "default"} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Diagram controls</label>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md bg-muted px-3 py-1 text-sm" onClick={() => { setLiveUpdate((v) => !v); }}>{liveUpdate ? "Live" : "Manual"}</button>
              <button className="rounded-md bg-muted px-3 py-1 text-sm" onClick={() => { setDraft(defaultDiagram); setLiveUpdate(true); }}>Reset to default</button>
            </div>
          </div>

          <details className="rounded-md border bg-muted/50 p-3" id="mermaid-editor-details">
            <summary className="cursor-pointer py-1 font-medium">Mermaid source (click to expand)</summary>
            <div className="mt-3 grid gap-2">
              <label className="text-xs text-muted-foreground">Edit diagram (business users: collapsed by default)</label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={14}
                className="w-full rounded-md border bg-background p-3 text-sm font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
                  onClick={() => { setDiagram(draft); }}
                >
                  Apply & Save
                </button>
                <button
                  className="rounded-md bg-muted px-3 py-1 text-sm"
                  onClick={() => { setDraft(diagram); }}
                >
                  Revert
                </button>
                <button
                  className="rounded-md bg-muted px-3 py-1 text-sm"
                  onClick={() => { navigator.clipboard.writeText(draft); }}
                >
                  Copy
                </button>
              </div>
            </div>
          </details>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="external">External Systems</TabsTrigger>
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="kb">Knowledge Bank</TabsTrigger>
              <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">The system ingests incidents and related content from external sources (ServiceNow, Confluence, logs). Data is normalized and passed to lightweight AI models (categorization, embeddings, escalation prediction). Results populate the Knowledge Base and create Playbooks. Playbooks are suggested back in the incident workspace. Analytics track performance and feedback loops update models and knowledge over time.</p>
            </TabsContent>

            <TabsContent value="external">
              <h3 className="font-semibold">External Integrations</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>ServiceNow / ITSM: incidents, attachments, metadata</li>
                <li>Confluence / Jira: runbooks and KB articles</li>
                <li>Application logs & APM: telemetry and error traces</li>
                <li>Identity Providers: SAML/SSO for access issues</li>
              </ul>
            </TabsContent>

            <TabsContent value="models">
              <h3 className="font-semibold">AI Models & Processing</h3>
              <p className="text-sm text-muted-foreground">Categorization model assigns incident categories and confidence. Embedding model enables semantic search across historical incidents and KB. Escalation model predicts probability of needing higher-tier support. All models run client-side heuristics in this POC; in production they'd be served via inference endpoints.</p>
            </TabsContent>

            <TabsContent value="kb">
              <h3 className="font-semibold">Knowledge Bank</h3>
              <p className="text-sm text-muted-foreground">Resolved incidents, runbooks, and curated articles are indexed (with embeddings) to support semantic retrieval. The knowledge bank is updated by successful resolutions and manual curation to improve suggestions over time.</p>
            </TabsContent>

            <TabsContent value="playbooks">
              <h3 className="font-semibold">Playbooks</h3>
              <p className="text-sm text-muted-foreground">Playbooks are generated from patterns in past incidents and expert-authored steps. They're attached to incidents and can be executed manually; their success updates the knowledge bank and model training signals.</p>
            </TabsContent>

            <TabsContent value="analytics">
              <h3 className="font-semibold">Analytics & Feedback</h3>
              <p className="text-sm text-muted-foreground">Analytics surface KPIs: triage time, resolution time, model accuracy, and escalation rates. Feedback loops from incident outcomes feed model retraining and knowledge updates.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
