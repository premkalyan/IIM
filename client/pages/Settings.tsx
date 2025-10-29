import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";

const keys = {
  incidents: "hanover_incidents_v1",
  knowledge: "hanover_knowledge_v1",
  playbooks: "hanover_playbooks_v1",
};

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const [theme, setTheme] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  const exportAll = () => {
    const payload = {
      incidents: localStorage.getItem(keys.incidents) || "[]",
      knowledge: localStorage.getItem(keys.knowledge) || "[]",
      playbooks: localStorage.getItem(keys.playbooks) || "[]",
      exportedAt: new Date().toISOString(),
    };
    downloadJSON("hanover_export.json", payload);
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      if (parsed.incidents) localStorage.setItem(keys.incidents, typeof parsed.incidents === "string" ? parsed.incidents : JSON.stringify(parsed.incidents));
      if (parsed.knowledge) localStorage.setItem(keys.knowledge, typeof parsed.knowledge === "string" ? parsed.knowledge : JSON.stringify(parsed.knowledge));
      if (parsed.playbooks) localStorage.setItem(keys.playbooks, typeof parsed.playbooks === "string" ? parsed.playbooks : JSON.stringify(parsed.playbooks));
      window.location.reload();
    } catch (err) {
      alert("Failed to import file: " + String(err));
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <PageHeader title="Settings" subtitle="Application preferences and data management." />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Choose Light or Dark mode</div>
              </div>
              <Button onClick={toggleTheme}>{theme === "dark" ? "Switch to Light" : "Switch to Dark"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button onClick={exportAll}>Export data</Button>
              <div className="flex items-center gap-2">
                <input id="import" type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} />
              </div>
              <Button variant="destructive" onClick={() => { if (confirm("Clear all incidents, knowledge and playbooks? This cannot be undone.")) { localStorage.removeItem(keys.incidents); localStorage.removeItem(keys.knowledge); localStorage.removeItem(keys.playbooks); window.location.reload(); } }}>Clear all data</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Hanover IIM POC · Built with privacy-first in-browser data stores. No backend required.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
