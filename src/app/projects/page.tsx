"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default function ProjectsPage() {
  return (
    <PageTransitionTarget layoutId="card-/projects">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          layoutId="nav-/projects"
          title="Projects"
          subtitle="Projeler yakında."
        />
      </div>
    </PageTransitionTarget>
  );
}
