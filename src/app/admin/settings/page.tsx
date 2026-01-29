import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Bell, Palette, LogOut, Users, ChevronRight } from "lucide-react";
import { ProfileForm } from "@/components/admin/profile-form";
import { SignOutButton } from "@/components/admin/sign-out-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  // Fetch user with avatar from database
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const profileUser = {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    image: user!.avatarUrl,
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={profileUser} />
          </CardContent>
        </Card>

        {/* Team Management */}
        <Link href="/admin/settings/team">
          <Card className="hover:bg-secondary/30 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Team Management</p>
                    <p className="text-sm text-muted-foreground">
                      Add and manage admin accounts
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account
            </CardTitle>
            <CardDescription>
              Your account information and role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl bg-secondary/30">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium mt-1">{session?.user.email}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium mt-1 capitalize">
                  {session?.user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Models receive push notifications when you post new content or announcements
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                  Active
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div>
                  <p className="font-medium">Real-time Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Dashboards update instantly when content changes
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                  Active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Currently using dark mode
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm font-medium">
                Dark
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Session
            </CardTitle>
            <CardDescription>
              Sign out of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
