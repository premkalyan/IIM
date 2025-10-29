import { useEffect, useMemo, useState } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listArticles, createArticle, updateArticle, removeArticle, subscribe, type KnowledgeArticle } from "@/store/knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function ArticleForm({ initial, onSubmit, onCancel }: { initial?: Partial<KnowledgeArticle>; onSubmit: (vals: { title: string; content: string; tags: string[] }) => void; onCancel?: () => void; }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, content, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
      }}
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Content</label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Tags (comma separated)</label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

export default function Knowledge() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(listArticles());
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeArticle | null>(null);

  useEffect(() => {
    const unsub = subscribe(() => setArticles(listArticles()));
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    if (!q) return articles;
    return articles.filter((a) => (a.title + " " + a.content + " " + a.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  }, [articles, q]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <p className="text-muted-foreground">Search and maintain resolution articles and runbooks.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input placeholder="Search articles..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">New Article</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Article</DialogTitle>
                  </DialogHeader>
                  <ArticleForm
                    onSubmit={(vals) => {
                      createArticle(vals);
                      setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {filtered.map((a) => (
                <div key={a.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{a.title}</div>
                        {a.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.content}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setOpen(true); }}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeArticle(a.id)}>
                        Delete
                      </Button>
                      <Button variant="secondary" onClick={() => setSelected(a)}>Open</Button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-muted-foreground p-6">No articles found.</div>}
            </div>
          </CardContent>
        </Card>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Viewer</CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div>
                  <h3 className="font-semibold">{selected.title}</h3>
                  <div className="text-sm text-muted-foreground mb-3">Tags: {selected.tags.join(", ")}</div>
                  <div className="prose max-w-none">{selected.content}</div>
                </div>
              ) : (
                <div className="text-muted-foreground">Select an article to view details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit dialog */}
      <Dialog open={!!editing && open} onOpenChange={() => { setEditing(null); setOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editing && (
            <ArticleForm
              initial={editing}
              onSubmit={(vals) => {
                updateArticle(editing.id, vals as any);
                setEditing(null);
                setOpen(false);
              }}
              onCancel={() => { setEditing(null); setOpen(false); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
