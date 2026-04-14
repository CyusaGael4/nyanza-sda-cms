import { AttendanceChartsLoader } from "@/components/charts/AttendanceChartsLoader";
import { AttendanceForm } from "@/components/forms/AttendanceForm";
import { PageShell } from "@/components/layout/PageShell";
import { getAttendanceData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "attendance")) {
    return (
      <PageShell title="Ubwitabire" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo gukoresha iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const attendance = await getAttendanceData(sessionUser.accountOwnerId);

  return (
    <PageShell
      title="Ubwitabire"
      description="Shyiraho Yaje cyangwa Ntago yaje, hanyuma chart ihite yigaragaza hasi."
      sessionUser={sessionUser}
    >
      <AttendanceForm
        initialMembers={attendance.members}
        initialGroups={attendance.groups}
        currentUserName={sessionUser?.names || "Umukozi"}
      />

      <AttendanceChartsLoader
        sabbathData={attendance.sabbathData}
        monthlyTrend={attendance.monthlyTrend}
      />
    </PageShell>
  );
}
