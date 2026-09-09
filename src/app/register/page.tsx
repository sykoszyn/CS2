import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Gratis. Guardá lineups, subí contenido y seguí a otros creadores.
        </p>

        <AuthForm mode="register" />

        <p className="mt-6 text-center text-sm text-foreground-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
