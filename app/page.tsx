import { PwaInstallButton } from "@/components/PwaInstallButton";
import { LoadingLink } from "@/components/NavigationProgress";
import { ChurchLogo } from "@/components/layout/ChurchLogo";

export default function HomePage() {
  return (
    <main className="shell landing-shell">
      <div className="container page-stack">
        <section className="hero landing-friendly-hero">
          <div className="landing-friendly-grid">
            <div className="landing-main-copy">
              <ChurchLogo />
              <span className="badge">Murakaza neza</span>
              <h1 className="landing-friendly-title">Sisitemu y&apos;itorero</h1>
              <p className="landing-friendly-text muted">
                Aha ni ho winjirira ugakurikira abanyamuryango, ubwitabire bw&apos;I Sabato,
                amatangazo n&apos;amaturo y&apos;itorero.
              </p>

              <div className="landing-actions">
                <LoadingLink className="btn primary" href="/login">
                  Injira muri sisitemu
                </LoadingLink>
                <LoadingLink className="btn soft" href="/register">
                  Kora konti ya mbere
                </LoadingLink>
                <PwaInstallButton />
              </div>
            </div>

            <div className="landing-welcome-panel">
              <div className="landing-welcome-card">
                <p className="landing-small-title">Ibyo ushobora gukorera hano</p>
                <div className="landing-simple-list">
                  <div className="landing-simple-item">
                    <strong>Kubika abanyamuryango</strong>
                    <p className="muted">
                      Andika, shakisha, hindura cyangwa usibe amakuru yabo.
                    </p>
                  </div>
                  <div className="landing-simple-item">
                    <strong>Kwandika ubwitabire</strong>
                    <p className="muted">
                      Shyiraho abaje n&apos;abataje ku i Sabato mu buryo bwihuse.
                    </p>
                  </div>
                  <div className="landing-simple-item">
                    <strong>Kureba amatangazo n&apos;amaturo</strong>
                    <p className="muted">
                      Urebe ibigezweho n&apos;amafaranga amaze kwandikwa mu itorero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-help-grid">
          <article className="landing-help-card">
            <p className="landing-small-title">Uko watangira</p>
            <div className="landing-simple-list">
              <div className="landing-step-item">
                <span className="landing-step-number">1</span>
                <div>
                  <strong>Injira</strong>
                  <p className="muted">Niba usanzwe ufite konti, kanda kuri Injira.</p>
                </div>
              </div>
              <div className="landing-step-item">
                <span className="landing-step-number">2</span>
                <div>
                  <strong>Kora konti ya mbere</strong>
                  <p className="muted">Niba ari ubwa mbere, banza ukore konti ya super admin.</p>
                </div>
              </div>
              <div className="landing-step-item">
                <span className="landing-step-number">3</span>
                <div>
                  <strong>Tangira gukoresha sisitemu</strong>
                  <p className="muted">
                    Nyuma yo kwinjira, uhita ubona ahabandikira amakuru yose y&apos;itorero.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="landing-help-card soft">
            <p className="landing-small-title">Ibikuru uzahita ubona</p>
            <div className="landing-tool-grid">
              {[
                "Abanyamuryango",
                "Ubwitabire bwa Sabato",
                "Amatangazo",
                "Amatsinda",
                "Amaturo",
                "Abakoresha"
              ].map((item) => (
                <div className="landing-tool-card" key={item}>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
