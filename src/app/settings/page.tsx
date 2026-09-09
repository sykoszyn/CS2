import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false },
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings");

  return (
    <div className="mx-auto max-w-xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Configuración</h1>

      <div className="mt-6 rounded-lg border border-border bg-background-card p-4">
        <p className="text-sm font-semibold">Cuenta</p>
        <p className="mt-1 text-sm text-foreground-muted">@{profile.username}</p>
      </div>

      <div className="mt-6 rounded-lg border border-danger/30 bg-danger/5 p-4">
        <p className="text-sm font-semibold text-danger">Eliminar cuenta</p>
        <p className="mt-1 text-sm text-foreground-muted">
          Esto elimina tu cuenta y tus datos personales (likes, favoritos, comentarios, calificaciones)
          de forma permanente. Los lineups, boosts y jugadas que publicaste quedan en la plataforma sin
          tu nombre, igual que el resto del contenido de la comunidad. Esta acción no se puede deshacer.
        </p>
        <div className="mt-3">
          <DeleteAccountForm username={profile.username} />
        </div>
      </div>
    </div>
  );
}
