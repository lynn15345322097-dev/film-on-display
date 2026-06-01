import { redirect } from "next/navigation";
import {
  Building2,
  CalendarClock,
  Database,
  Images,
  KeyRound,
  Route,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { fmStats } from "./fm-content";
import { ArchiveLogoutAction } from "./logout-action";
import { ArchiveShell } from "./shell";

export async function ArchiveAccountPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims;
  const email = typeof claims.email === "string" ? claims.email : "Authenticated user";
  const role = typeof claims.role === "string" ? claims.role : "authenticated";
  const issuedAt =
    typeof claims.iat === "number" ? new Date(claims.iat * 1000).toLocaleString() : "Active";

  return (
    <ArchiveShell asideMode="profile" isSignedIn>
      <section className="archive-account-hero">
        <span>DOSSIER ID: USER-CENTER</span>
        <h1>User Center 用户中心</h1>
        <p>
          Supabase Auth is active. This dashboard keeps account identity separate from the
          local-only chat transcript and future archive database records.
        </p>
      </section>

      <section className="archive-account-grid">
        <article className="archive-profile-card primary">
          <div className="archive-avatar">
            <UserRound size={36} />
          </div>
          <div>
            <span>Research Access</span>
            <h2>{email}</h2>
            <p>Authenticated with Supabase. Internal user identifiers are not displayed.</p>
          </div>
          <ArchiveLogoutAction />
        </article>

        <article className="archive-profile-card">
          <ShieldCheck size={24} />
          <span>Auth Status</span>
          <h3>Verified Session</h3>
          <p>Protected routes are unlocked by the current Supabase session cookie.</p>
        </article>

        <article className="archive-profile-card">
          <KeyRound size={24} />
          <span>Role</span>
          <h3>{role}</h3>
          <p>Default Supabase role. Application roles can be layered in later.</p>
        </article>

        <article className="archive-profile-card">
          <CalendarClock size={24} />
          <span>Issued</span>
          <h3>{issuedAt}</h3>
          <p>Session claim issue time from Supabase Auth.</p>
        </article>

        <article className="archive-profile-card">
          <Database size={24} />
          <span>Storage</span>
          <h3>Local Chat Only</h3>
          <p>Chat messages remain in browser localStorage until database tables are added.</p>
        </article>

        <article className="archive-profile-card">
          <Building2 size={24} />
          <span>Research Dataset</span>
          <h3>{fmStats.museums} Spaces</h3>
          <p>Imported from the local fm-website dataset for the current public archive pages.</p>
        </article>

        <article className="archive-profile-card">
          <Images size={24} />
          <span>Photo Metadata</span>
          <h3>{fmStats.photos} Records</h3>
          <p>Rights-aware image metadata is visible as research context, without database writes.</p>
        </article>

        <article className="archive-profile-card">
          <Route size={24} />
          <span>Curated Routes</span>
          <h3>{fmStats.exhibitions} Routes</h3>
          <p>Research routes are available to the workbench assistant as local context.</p>
        </article>
      </section>
    </ArchiveShell>
  );
}
