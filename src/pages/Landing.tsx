import { ArrowRight, BriefcaseBusiness, FolderKanban, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const capabilities = [
  {
    icon: BriefcaseBusiness,
    title: "Client context in one place",
    description: "Keep the people, billing contact, and commercial context for each engagement easy to find.",
  },
  {
    icon: FolderKanban,
    title: "Projects connected to the work",
    description: "Bring repositories and project operations together, so client delivery has a clear home.",
  },
  {
    icon: LockKeyhole,
    title: "Private by default",
    description: "Use role-aware workspaces to share the right project view without exposing every detail.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-dashboard text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Blueberry VibeOps home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-panel">
            B
          </span>
          <span className="font-semibold tracking-tight">Blueberry VibeOps</span>
        </Link>
        <Button asChild variant="ghost">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-20">
        <div className="space-y-7">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Client operations for independent developers
          </p>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Keep client work clear, calm, and ready for the next move.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Blueberry VibeOps gives independent developers one private workspace for clients, projects, repositories, and the operational context behind their work.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">
                Create your workspace
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Explore your dashboard</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Start with the client and project information you already know. Add tools and integrations only when they earn their place in your workflow.
          </p>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-card/85 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="text-sm font-medium text-primary">A useful starting point</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">From client request to visible delivery context.</h2>
          <div className="mt-7 space-y-3">
            <div className="rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Client</p>
              <p className="mt-1 text-sm text-muted-foreground">Contact and billing details stay beside the work they relate to.</p>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Project</p>
              <p className="mt-1 text-sm text-muted-foreground">Repositories and project health have one shared operational view.</p>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Next action</p>
              <p className="mt-1 text-sm text-muted-foreground">A role-aware workspace makes the important follow-up easier to see.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3 lg:px-8">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border bg-background/40 p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">A better home for the work between the work.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
          Use Blueberry VibeOps to make client delivery easier to operate today. Future billing and automation features will be added only when they support a proven workflow.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/signup">
            Start your workspace
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
