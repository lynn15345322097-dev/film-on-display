"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArchiveLogoutAction() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button className="archive-user-link" onClick={handleLogout} type="button">
      <LogOut size={16} />
      Sign out
    </button>
  );
}
