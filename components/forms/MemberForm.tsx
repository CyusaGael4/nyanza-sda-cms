"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type GroupOption = {
  _id: string;
  name: string;
};

type MemberFormState = {
  names: string;
  birthDate: string;
  phone: string;
  address: string;
  gender: "gabo" | "gore";
  churchRole: string;
  groupId: string;
  baptized: "yego" | "oya";
};

const defaultState = {
  names: "",
  birthDate: "",
  phone: "",
  address: "",
  gender: "gabo",
  churchRole: "",
  groupId: "",
  baptized: "oya"
} satisfies MemberFormState;

export function MemberForm({ groups }: { groups: GroupOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState<MemberFormState>({ ...defaultState });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          baptized: form.baptized === "yego"
        })
      });

      const data = await response.json();
      setMessage(data.message || "Byabitswe");

      if (response.ok) {
        setForm({ ...defaultState });
        router.refresh();
      }
    } catch {
      setMessage("Kubika umunyamuryango byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form card" onSubmit={submitMember}>
      <div className="section-title">
        <h3>Andika umunyamuryango</h3>
        <span className="badge">Bishya</span>
      </div>

      <div className="row">
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
      </div>

      <div className="row">
        <label>
          Aho atuye
          <input
            required
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </label>

        <label>
          Itariki y&apos;amavuko
          <input
            required
            type="date"
            value={form.birthDate}
            onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
          />
        </label>
      </div>

      <div className="row">
        <label>
          Igitsina
          <select
            value={form.gender}
            onChange={(event) =>
              setForm({ ...form, gender: event.target.value as "gabo" | "gore" })
            }
          >
            <option value="gabo">Gabo</option>
            <option value="gore">Gore</option>
          </select>
        </label>

        <label>
          Uruhare mu itorero
          <input
            value={form.churchRole}
            onChange={(event) => setForm({ ...form, churchRole: event.target.value })}
            placeholder="Urugero: Diyakoni, Chorale, Elder..."
          />
        </label>
      </div>

      <div className="row">
        <label>
          Yabatijwe?
          <select
            value={form.baptized}
            onChange={(event) =>
              setForm({ ...form, baptized: event.target.value as "yego" | "oya" })
            }
          >
            <option value="oya">Oya</option>
            <option value="yego">Yego</option>
          </select>
        </label>

        <label>
          Itsinda
          <select
            value={form.groupId}
            onChange={(event) => setForm({ ...form, groupId: event.target.value })}
          >
            <option value="">Nta tsinda</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="btn primary" disabled={isSaving} type="submit">
        {isSaving ? <LoadingSpinner label="Birimo kubika..." small /> : "Bika umunyamuryango"}
      </button>

      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
