import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";
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
