import { ArchiveHomePage } from "@/components/archive/home-page";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div className="archive-route-loading">Loading archive...</div>}>
      <ArchiveHomePage />
    </Suspense>
  );
}
