import { AttendanceChartsLoader } from "@/components/charts/AttendanceChartsLoader";
import { FinanceChartLoader } from "@/components/charts/FinanceChartLoader";
import { PageShell } from "@/components/layout/PageShell";
import {
  getAttendanceData,
  getDashboardData,
  getFinanceData
} from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "dashboard")) {
    return (
      <PageShell title="Ahabanza" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo kureba iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const accountOwnerId = sessionUser.accountOwnerId;
  const [dashboard, attendance, finance] = await Promise.all([
    getDashboardData(accountOwnerId),
    getAttendanceData(accountOwnerId),
    getFinanceData(accountOwnerId)
  ]);

  return (
    <PageShell
      title="Ahabanza"
      description="Aha ni ho urebera muri make uko itorero rihagaze uyu munsi."
      sessionUser={sessionUser}
    >
      <section className="grid three">
        <article className="stat">
          <p className="muted">Abanyamuryango bose</p>
          <h2>{dashboard.memberCount}</h2>
        </article>
        <article className="stat">
          <p className="muted">Ubwitabire bw&apos; I Sabato</p>
          <h2>{dashboard.latestSabbathAttendance}</h2>
        </article>
        <article className="stat">
          <p className="muted">Icyacumi n&apos;amaturo</p>
          <h2>{formatMoney(dashboard.totalRevenue)}</h2>
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="section-title">
            <h3>Amatangazo aheruka</h3>
            <span className="badge">{dashboard.recentAnnouncements.length}</span>
          </div>

          <div className="list">
            {dashboard.recentAnnouncements.length ? (
              dashboard.recentAnnouncements.map((item) => (
                <div className="item" key={item._id}>
                  <strong>{item.title}</strong>
                  <p style={{ marginBottom: 8 }}>{item.description}</p>
                  <span className="chip soft">{item.authorName}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Nta matangazo arandikwa.</div>
            )}
          </div>
        </article>

        <article className="card">
          <div className="section-title">
            <h3>Kwibutsa Sabato z&apos;ukwezi</h3>
            <span className="badge">{dashboard.sabbathReminders.length}</span>
          </div>

          <div className="list">
            {dashboard.sabbathReminders.map((item) => (
              <div className="item" key={item.label}>
                <div className="item-head">
                  <strong>{item.label}</strong>
                  {item.isToday ? <span className="chip">Uyu munsi</span> : null}
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {item.dateText}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>Charts z&apos;ubwitabire</h3>
        <AttendanceChartsLoader
          sabbathData={attendance.sabbathData}
          monthlyTrend={attendance.monthlyTrend}
        />
      </section>

      <section className="card">
        <h3>Charts z&apos;amaturo</h3>
        <FinanceChartLoader
          breakdown={finance.breakdown}
          monthlyTrend={finance.monthlyTrend}
        />
      </section>
    </PageShell>
  );
}
