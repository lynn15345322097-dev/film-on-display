import { ChatWorkbench } from "@/components/archive/chat-workbench";
import { fmWorkbenchContext } from "@/components/archive/fm-content";
import { ArchiveShell } from "@/components/archive/shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function ProtectedChatPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <ArchiveShell asideMode="map" isSignedIn>
      <ChatWorkbench context={fmWorkbenchContext} />
    </ArchiveShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="archive-route-loading">Loading workbench...</div>}>
      <ProtectedChatPage />
    </Suspense>
  );
}
