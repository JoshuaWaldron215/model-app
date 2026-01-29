import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            <span className="text-gradient">MAP</span>
            <span className="text-foreground"> MGT</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground text-lg md:text-xl text-center max-w-md mb-12">
          Content inspiration & management platform for elite creators
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-foreground bg-primary rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
        >
          <span className="relative z-10">Sign In</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
        </Link>

        {/* Footer */}
        <p className="absolute bottom-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} MAP MGT. All rights reserved.
        </p>
      </div>
    </div>
  );
}
