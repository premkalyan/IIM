import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export default function AppLayout() {
  const location = useLocation();
  const [q, setQ] = useState("");
  const isHome = location.pathname === "/";

  const nav = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/incidents", label: "Incidents" },
      { to: "/knowledge", label: "Knowledge" },
      { to: "/playbooks", label: "Playbooks" },
      { to: "/analytics", label: "Analytics" },
      { to: "/architecture", label: "Architecture" },
      { to: "/settings", label: "Settings" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="static z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center overflow-hidden">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F5b3d188902484b47b43387f7b5229340%2F6b3f01c81eed4a4894a5565301c90ba2?format=webp&width=800" alt="Blutic" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Blutic IIM</div>
              <div className="text-xs text-muted-foreground">Intelligent Incident Management</div>
            </div>
          </Link>
          <nav className="ml-6 hidden items-center gap-3 md:flex md:flex-nowrap md:overflow-x-auto md:whitespace-nowrap">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {!isHome && (
              <form action="/incidents" onSubmit={(e) => e.preventDefault()} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search incidents..."
                    className="w-64 pl-8"
                  />
                </div>
              </form>
            )}
            <Button asChild size="sm" className="hidden sm:flex">
              <Link to="/incidents?new=1">
                <PlusCircle className="mr-1 h-4 w-4" /> New Incident
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">3</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-background/50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Blutic IIM POC · Built for enterprise workflows
        </div>
      </footer>
    </div>
  );
}
