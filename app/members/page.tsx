import { MemberForm } from "@/components/forms/MemberForm";
import { MemberList } from "@/components/forms/MemberList";
import { PageShell } from "@/components/layout/PageShell";
import { getGroupsData, getMembersData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "members")) {
    return (
      <PageShell title="Abanyamuryango" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo gukoresha iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const accountOwnerId = sessionUser.accountOwnerId;
  const [members, groups] = await Promise.all([
    getMembersData(accountOwnerId),
    getGroupsData(accountOwnerId)
  ]);

  return (
    <PageShell
      title="Abanyamuryango"
      description="Andika, shakisha, hindura cyangwa usibe amakuru y'abanyamuryango."
      sessionUser={sessionUser}
    >
      <div className="grid two">
        <MemberForm groups={groups.groups} />
        <MemberList initialMembers={members} groups={groups.groups} canManage />
      </div>
    </PageShell>
  );
}
