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
          {/* Mermaid diagram renderer */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <div id="mermaid-root" className="prose">
            {/* Mermaid renderer will mount here via component below */}
          </div>
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
