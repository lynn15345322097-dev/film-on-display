import { ArchiveAccountPage } from "@/components/archive/account-page";
import { Suspense } from "react";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="archive-route-loading">Loading user center...</div>}>
      <ArchiveAccountPage />
    </Suspense>
  );
}
