import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, default_market")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-full">
      <SidebarWrapper
        userName={profile?.full_name ?? user.email ?? ""}
        userAvatar={profile?.avatar_url ?? null}
        market={profile?.default_market ?? "france"}
      />
      <main
        className="flex-1 flex flex-col min-h-full overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
    </div>
  );
}
