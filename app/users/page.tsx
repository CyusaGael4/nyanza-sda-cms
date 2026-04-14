import { UserManager } from "@/components/forms/UserManager";
import { PageShell } from "@/components/layout/PageShell";
import { getUsersData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "users") || sessionUser.role !== "super_admin") {
    return (
      <PageShell title="Abakoresha" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Iyi paji ikoreshwa n&apos;umuyobozi mukuru gusa.</p>
        </section>
      </PageShell>
    );
  }

  const users = await getUsersData(sessionUser.accountOwnerId);

  return (
    <PageShell
      title="Abakoresha"
      description="Aha ni ho umuyobozi mukuru yongerera abandi bakoresha kandi akabaha uburenganzira."
      sessionUser={sessionUser}
    >
      <UserManager initialUsers={users} />
    </PageShell>
  );
}
