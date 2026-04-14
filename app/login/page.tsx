"use client";

import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LoadingLink } from "@/components/NavigationProgress";
import { BackHomeButton } from "@/components/layout/BackHomeButton";
import { ChurchLogo } from "@/components/layout/ChurchLogo";

export default function LoginPage() {
  const [form, setForm] = useState({
    phone: "",
    password: "",
    recoveryPassword: ""
  });
  const [message, setMessage] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
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
      <form className="hero auth-card form" onSubmit={handleLogin}>
        <BackHomeButton />
        <ChurchLogo small />
        <span className="badge">Injira</span>
        <h1 style={{ margin: 0 }}>Murakaza neza</h1>
        <p className="muted">
          Injiza telefoni yawe n&apos;ijambo ry&apos;ibanga. Niba wararyibagiwe, kanda hasi
          ubone aho ushyira iryo kugarura.
        </p>

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
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>

        <button
          className="btn soft"
          type="button"
          onClick={() => {
            setShowRecovery((current) => !current);
            setForm((current) => ({
              ...current,
              password: current.password,
              recoveryPassword: current.recoveryPassword
            }));
          }}
        >
          {showRecovery ? "Hisha aho kugarurira" : "Wibagiwe ijambo ry'ibanga?"}
        </button>

        {showRecovery ? (
          <label>
            Ijambo ryo kugarura
            <input
              type="password"
              value={form.recoveryPassword}
              onChange={(event) =>
                setForm({ ...form, recoveryPassword: event.target.value })
              }
            />
          </label>
        ) : null}

        <button className="btn primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? <LoadingSpinner label="Birimo kugenzura..." small /> : "Injira"}
        </button>

        <p className="muted" style={{ margin: 0 }}>
          Ni ubwa mbere ukoresha system?{" "}
          <LoadingLink href="/register">Kora konti ya mbere</LoadingLink>
        </p>

        {message ? <p className="muted">{message}</p> : null}
      </form>
    </main>
  );
}
