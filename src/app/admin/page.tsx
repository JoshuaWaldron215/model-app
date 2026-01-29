import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Film, MessageSquare, Megaphone, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { getAdminStats, getRecentModels } from "@/lib/cache";

export default async function AdminDashboard() {
  const [stats, recentModels] = await Promise.all([
    getAdminStats(),
    getRecentModels(),
  ]);

  const statCards = [
    {
      title: "Total Models",
      value: stats.modelCount,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Reel Inspirations",
      value: stats.reelCount,
      icon: Film,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Script Templates",
      value: stats.scriptCount,
      icon: MessageSquare,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Announcements",
      value: stats.announcementCount,
      icon: Megaphone,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your content management platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">Active</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentModels.length > 0 ? (
              <div className="space-y-4">
                {recentModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.email}</p>
                    </div>
                    <div
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        model.status === "ACTIVE"
                          ? "bg-success/10 text-success"
                          : model.status === "SUSPENDED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {model.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No models yet. Add your first model to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link
                href="/admin/models"
                prefetch={true}
                className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors active:scale-[0.98]"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Models</p>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove models
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/content/reels"
                prefetch={true}
                className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors active:scale-[0.98]"
              >
                <div className="p-2 rounded-lg bg-accent/10">
                  <Film className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Add Reel Inspiration</p>
                  <p className="text-sm text-muted-foreground">
                    Upload new content ideas
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/announcements"
                prefetch={true}
                className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors active:scale-[0.98]"
              >
                <div className="p-2 rounded-lg bg-warning/10">
                  <Megaphone className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Post Announcement</p>
                  <p className="text-sm text-muted-foreground">
                    Notify all or selected models
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
