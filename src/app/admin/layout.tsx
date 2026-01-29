import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminNotifications } from "@/lib/cache";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { MobileSidebarProvider } from "@/components/mobile-sidebar-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const notifications = await getAdminNotifications();

  return (
    <MobileSidebarProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminHeader user={session.user} notifications={notifications} />
          <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="page-transition">{children}</div>
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
