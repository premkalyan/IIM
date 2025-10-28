import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Architecture() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Architecture & Data Flow</h1>
        <p className="text-muted-foreground">Overview of integration points, data ingestion, AI models, knowledge base, playbooks, and analytics.</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="overflow-auto">
          <svg viewBox="0 0 1200 360" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--primary-foreground)" />
              </marker>
            </defs>

            {/* External systems */}
            <rect x="20" y="40" rx="8" ry="8" width="180" height="80" fill="rgba(217,234,255,0.9)" stroke="hsl(var(--primary))" />
            <text x="110" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">External Systems</text>
            <text x="110" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">ServiceNow, Confluence, Jira, Logs</text>

            {/* Ingest */}
            <rect x="240" y="40" rx="8" ry="8" width="170" height="80" fill="rgba(237,247,237,0.95)" stroke="hsl(var(--accent))" />
            <text x="325" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">Ingestion & ETL</text>
            <text x="325" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">Normalization, attachments, metadata</text>

            {/* Models */}
            <rect x="460" y="40" rx="8" ry="8" width="200" height="80" fill="rgba(255,245,235,0.95)" stroke="hsl(var(--primary))" />
            <text x="560" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">AI Models</text>
            <text x="560" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">Categorization, Embeddings, Escalation Prediction</text>

            {/* Knowledge base */}
            <rect x="700" y="30" rx="8" ry="8" width="200" height="100" fill="rgba(245,251,255,0.95)" stroke="hsl(var(--secondary))" />
            <text x="800" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">Knowledge Base</text>
            <text x="800" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">Articles, Runbooks, Indexed Embeddings</text>

            {/* Playbooks */}
            <rect x="960" y="40" rx="8" ry="8" width="180" height="80" fill="rgba(255,247,237,0.95)" stroke="hsl(var(--accent))" />
            <text x="1050" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">Playbooks</text>
            <text x="1050" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">Generated + Manual</text>

            {/* arrows */}
            <line x1="200" y1="80" x2="240" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="410" y1="80" x2="460" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="660" y1="80" x2="700" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="900" y1="80" x2="960" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* feedback arrows */}
            <path d="M820 130 C700 160 560 160 460 120" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* analytics */}
            <rect x="460" y="160" rx="8" ry="8" width="300" height="80" fill="rgba(245,255,250,0.95)" stroke="hsl(var(--primary))" />
            <text x="610" y="185" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">Analytics & Observability</text>
            <text x="610" y="205" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">Dashboards, KPIs, Model Metrics</text>

            <line x1="800" y1="130" x2="800" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrow)" />

          </svg>
        </div>

        <div className="mt-6">
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
