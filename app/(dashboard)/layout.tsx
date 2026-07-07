import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getWorkspaceProfile(supabase, user.id);

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <SidebarWrapper
          userName={profile?.full_name ?? user.email ?? ""}
          userAvatar={profile?.avatar_url ?? null}
          market={profile?.default_market ?? "france"}
        />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
