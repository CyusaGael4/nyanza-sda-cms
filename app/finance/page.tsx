import { FinanceChartLoader } from "@/components/charts/FinanceChartLoader";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { PageShell } from "@/components/layout/PageShell";
import { getFinanceData } from "@/lib/analytics";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !hasPermission(sessionUser, "finance")) {
    return (
      <PageShell title="Amaturo" sessionUser={sessionUser}>
        <section className="card">
          <h3>Ntibyemewe</h3>
          <p className="muted">Ntufite uburenganzira bwo gukoresha iyi paji.</p>
        </section>
      </PageShell>
    );
  }

  const finance = await getFinanceData(sessionUser.accountOwnerId);

  return (
    <PageShell
      title="Amaturo"
      description="Andika amaturo, uyarebe ku rutonde, kandi urebe imibare y'amafaranga."
      sessionUser={sessionUser}
    >
      <FinanceForm
        initialData={{
          totalRevenue: finance.totalRevenue,
          monthTotal: finance.monthTotal,
          records: finance.records
        }}
        canManage
        currentUserName={sessionUser?.names || "Umukozi"}
      />

      <FinanceChartLoader
        breakdown={finance.breakdown}
        monthlyTrend={finance.monthlyTrend}
      />
    </PageShell>
  );
}
