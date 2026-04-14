import { ReactNode } from "react";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import { ChurchLogo } from "@/components/layout/ChurchLogo";
import { AppNav } from "@/components/layout/AppNav";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { SessionUser } from "@/lib/jwt";
import { getRoleLabel } from "@/lib/permissions";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  sessionUser?: SessionUser | null;
};

export function PageShell(props: PageShellProps) {
  const { children, sessionUser = null } = props;

  return (
    <main className="shell">
      <div className="container page-stack">
        <section className="hero hero-header">
          <div className="hero-head">
            <div className="hero-brand">
              <ChurchLogo small />
              <div>
                <p className="hero-title-top">Sisitemu y&apos;itorero</p>
                <h1 className="hero-title">Nyanza SDA Church</h1>
              </div>
            </div>

            <div className="hero-user">
              <PwaInstallButton compact />
              <div className="user-box">
                <strong>{sessionUser?.names || "Umushyitsi"}</strong>
                <span className="muted">{getRoleLabel(sessionUser?.role)}</span>
              </div>
              {sessionUser ? <LogoutButton /> : null}
            </div>
          </div>

          <AppNav user={sessionUser} />
        </section>
        {children}
      </div>
    </main>
  );
}
