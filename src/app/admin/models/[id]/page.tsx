export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Mail, Film, Megaphone } from "lucide-react";
import { getInitials, formatDate, userStatusLabels } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditModelForm } from "@/components/admin/edit-model-form";

interface EditModelPageProps {
  params: Promise<{ id: string }>;
}

async function getModel(id: string) {
  const model = await db.user.findUnique({
    where: { id, role: "MODEL" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      modelTier: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          contentAssignments: true,
          announcementTags: true,
        },
      },
    },
  });

  return model;
}

export default async function EditModelPage({ params }: EditModelPageProps) {
  const { id } = await params;
  const model = await getModel(id);

  if (!model) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/models">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Model</h1>
          <p className="text-muted-foreground mt-1">
            Update model information and settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Model Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Model Profile</CardTitle>
            <CardDescription>Current model information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {model.avatarUrl && (
                  <AvatarImage src={model.avatarUrl} alt={model.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(model.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{model.name}</h3>
              <Badge
                variant={
                  model.status === "ACTIVE"
                    ? "success"
                    : model.status === "SUSPENDED"
                    ? "destructive"
                    : "secondary"
                }
                className="mt-2"
              >
                {userStatusLabels[model.status]}
              </Badge>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{model.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {formatDate(model.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {model._count.contentAssignments} assigned content
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {model._count.announcementTags} announcement tags
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Information</CardTitle>
            <CardDescription>
              Update the model&apos;s account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditModelForm model={model} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
