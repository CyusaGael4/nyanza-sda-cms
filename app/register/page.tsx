"use client";

import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LoadingLink } from "@/components/NavigationProgress";
import { BackHomeButton } from "@/components/layout/BackHomeButton";
import { ChurchLogo } from "@/components/layout/ChurchLogo";

export default function RegisterPage() {
  const [form, setForm] = useState({
    names: "",
    phone: "",
    password: "",
    recoveryPassword: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      setMessage(data.message || "Ntibyagenze neza");

      if (response.ok) {
        window.location.assign("/dashboard");
      }
    } catch {
      setMessage("Hari ikibazo cya internet cyangwa server. Ongera ugerageze.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="hero auth-card form" onSubmit={handleRegister}>
        <BackHomeButton />
        <ChurchLogo small />
        <span className="badge">Kwiyandikisha</span>
        <h1 style={{ margin: 0 }}>Kora konti ya super admin</h1>
        <p className="muted">
          Iyi paji ikora konti nshya ya nyir&apos;iyi system. Abandi bakoresha bazongerwa nyuma
          muri paji y&apos;abakoresha.
        </p>

        <label>
          Amazina
          <input
            required
            value={form.names}
            onChange={(event) => setForm({ ...form, names: event.target.value })}
          />
        </label>

        <label>
          Telefoni
          <input
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </label>

        <label>
          Ijambo ry&apos;ibanga
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>

        <label>
          Ijambo ryo kugarura
          <input
            required
            type="password"
            value={form.recoveryPassword}
            onChange={(event) => setForm({ ...form, recoveryPassword: event.target.value })}
          />
        </label>

        <p className="muted" style={{ marginTop: -6 }}>
          Jambo ry&apos;ibanga n&apos;iryo kugarura bigomba kuba nibura inyuguti 8 kugira ngo
          konti ibe ifite umutekano.
        </p>

        <button className="btn primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? <LoadingSpinner label="Birimo gukora konti..." small /> : "Kora konti"}
        </button>

        <p className="muted" style={{ margin: 0 }}>
          Usanzwe ufite konti? <LoadingLink href="/login">Injira</LoadingLink>
        </p>

        {message ? <p className="muted">{message}</p> : null}
      </form>
    </main>
  );
}
