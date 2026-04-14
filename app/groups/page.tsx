import { DepartmentForm } from "@/components/forms/DepartmentForm";
import { PageShell } from "@/components/layout/PageShell";
import { getGroupsData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "groups")) {
    return (
      <PageShell title="Amatsinda" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo gukoresha iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const groups = await getGroupsData(sessionUser.accountOwnerId);

  return (
    <PageShell
      title="Amatsinda"
      description="Andika itsinda, urishyireho umuyobozi, urebe n'abaririmo."
      sessionUser={sessionUser}
    >
      <DepartmentForm initialGroups={groups} canManage />
    </PageShell>
  );
}
