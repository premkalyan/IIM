import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">This section is ready to be filled. Tell Fusion what to include here and we'll build it next.</p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground">
        <p className="mb-4">Looking for incidents? Head to the Incidents workspace.</p>
        <Button asChild>
          <Link to="/incidents">Open Incidents</Link>
        </Button>
      </div>
    </div>
  );
}
