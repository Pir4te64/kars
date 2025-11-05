import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { LoginForm } from "@/components/login-form";
import { readSessionCookies } from "@/lib/auth/cookies";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = {
  searchParams?: {
    redirect_to?: string;
  };
};

export default async function LoginPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const { accessToken } = readSessionCookies({ cookies: cookieStore });

  if (accessToken) {
    try {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase.auth.getUser(accessToken);
      if (data.user) {
        const redirectTo =
          searchParams?.redirect_to && searchParams.redirect_to.startsWith("/")
            ? searchParams.redirect_to
            : "/admin/posts";

        redirect(redirectTo);
      }
    } catch (error) {
      console.error("Failed to validate session", error);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Login Form */}
      <div className="flex flex-col relative bg-gradient-to-br from-background via-background to-muted/20">
        {/* Logo */}
        <div className="p-6 md:p-8">
          <a href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/logo_kars_negro.png"
              alt="Kars Logo"
              width={160}
              height={120}
              className="h-auto w-40"
              priority
            />
          </a>
        </div>

        {/* Login Form Container */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-8">
          <div className="w-full max-w-[420px]">
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © 2025 Kars. Todos los derechos reservados.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Right Panel - Hero Image */}
      <div className="relative hidden lg:block overflow-hidden bg-muted">
        <Image
          src="/about.png"
          alt="Luxury cars showcase"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content on image */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <div className="max-w-lg space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Gestiona tu inventario de vehículos
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Panel administrativo potente y fácil de usar para gestionar tu catálogo de vehículos de manera eficiente.
            </p>
            <div className="flex gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-white/80">Vehículos</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-white/80">Seguro</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/80">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
