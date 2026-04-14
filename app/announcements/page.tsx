import { AnnouncementForm } from "@/components/forms/AnnouncementForm";
import { PageShell } from "@/components/layout/PageShell";
import { getAnnouncementsData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "announcements")) {
    return (
      <PageShell title="Amatangazo" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo gukoresha iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const announcements = await getAnnouncementsData(sessionUser.accountOwnerId);

  return (
    <PageShell
      title="Amatangazo"
      description="Andika itangazo, ibisobanuro byaryo n'uwarikoreye."
      sessionUser={sessionUser}
    >
      <AnnouncementForm
        initialAnnouncements={announcements}
        canManage
        currentUserName={sessionUser?.names || "Umukozi"}
      />
    </PageShell>
  );
}
