import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Shield, ArrowLeft } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import { AdminActions } from "@/components/admin/admin-actions";
import Link from "next/link";

export default async function TeamPage() {
  const session = await auth();
  
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin accounts and permissions
          </p>
        </div>
        <CreateAdminDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </CreateAdminDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins.length}</p>
                <p className="text-sm text-muted-foreground">Total Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {admins.filter((a) => a.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {admins.filter((a) => a.status === "SUSPENDED").length}
                </p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins List */}
      <Card>
        <CardHeader>
          <CardTitle>All Admins</CardTitle>
          <CardDescription>
            Team members with full administrative access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => {
              const isCurrentUser = admin.id === session?.user.id;
              
              return (
                <div
                  key={admin.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                    isCurrentUser 
                      ? "bg-primary/5 border border-primary/20" 
                      : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.name}</p>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Join Date */}
                    <div className="hidden md:block text-sm text-muted-foreground">
                      Joined {formatDate(admin.createdAt)}
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        admin.status === "ACTIVE"
                          ? "success"
                          : admin.status === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {admin.status}
                    </Badge>

                    {/* Actions - Don't show for current user */}
                    {!isCurrentUser && (
                      <AdminActions admin={admin} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-primary/10 h-fit">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Admin Permissions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All admins have full access to manage models, content, announcements, and other admins. 
                Be careful when adding new team members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
