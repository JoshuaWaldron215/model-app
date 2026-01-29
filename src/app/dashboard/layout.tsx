import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentAnnouncementsForModel } from "@/lib/cache";
import { ModelSidebar } from "@/components/model/sidebar";
import { ModelHeader } from "@/components/model/header";
import { RealtimeProvider } from "@/components/realtime-provider";
import { PWAInstaller } from "@/components/pwa-installer";
import { PushNotificationPrompt } from "@/components/push-notification-prompt";
import { MobileSidebarProvider } from "@/components/mobile-sidebar-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "MODEL") {
    redirect("/admin");
  }

  if (session.user.status === "SUSPENDED") {
    redirect("/suspended");
  }

  const announcements = await getRecentAnnouncementsForModel(session.user.id);

  return (
    <MobileSidebarProvider>
      <div className="min-h-screen bg-background">
        <ModelSidebar />
        <div className="lg:pl-72">
          <ModelHeader user={session.user} announcements={announcements} />
          <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <RealtimeProvider>
              <div className="page-transition">{children}</div>
            </RealtimeProvider>
          </main>
        </div>
        <PWAInstaller />
        <PushNotificationPrompt />
      </div>
    </MobileSidebarProvider>
  );
}
