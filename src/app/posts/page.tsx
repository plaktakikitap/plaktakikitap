"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default function PostsPage() {
  return (
    <PageTransitionTarget layoutId="card-/posts">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          layoutId="nav-/posts"
          title="Posts"
          subtitle="Yazılar yakında."
        />
      </div>
    </PageTransitionTarget>
  );
}
