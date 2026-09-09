import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthErrorBanner } from "@/components/auth/oauth-error-banner";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Ingresar</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          El contenido de SmokeAR es público — solo necesitás una cuenta para guardar, subir o
          comentar.
        </p>

        <div className="mt-4">
          <OAuthErrorBanner error={error} />
        </div>

        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm text-foreground-muted">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-brand hover:underline">
            Creá una gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
