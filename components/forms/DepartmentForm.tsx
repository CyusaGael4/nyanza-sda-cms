"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type GroupItem = {
  _id: string;
  name: string;
  leaderName: string;
  totalMembers: number;
};

export function DepartmentForm({
  initialGroups,
  canManage
}: {
  initialGroups: { totalGroups: number; groups: GroupItem[] };
  canManage: boolean;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups.groups);
  const [form, setForm] = useState({ name: "", leaderName: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setGroups(initialGroups.groups);
  }, [initialGroups]);

  async function saveGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/groups/${editingId}` : "/api/groups";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      setMessage(data.message || "Byabitswe");

      if (response.ok) {
        setForm({ name: "", leaderName: "" });
        setEditingId(null);
        router.refresh();
      }
    } catch {
      setMessage("Kubika itsinda byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGroup(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "Byasibwe");

      if (response.ok) {
        setGroups((current) => current.filter((group) => group._id !== id));
        router.refresh();
      }
    } catch {
      setMessage("Gusiba itsinda byanze. Ongera ugerageze.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        <div className="section-title">
          <h3>Amatsinda yose</h3>
          <span className="badge">{groups.length} amatsinda</span>
        </div>

        <div className="list">
          {groups.length ? (
            groups.map((group) => (
              <article className="item" key={group._id}>
                <div className="item-head">
                  <strong>{group.name}</strong>
                  {canManage ? (
                    <div className="table-actions">
                      <button
                        className="btn soft"
                        type="button"
                        onClick={() => {
                          setEditingId(group._id);
                          setForm({ name: group.name, leaderName: group.leaderName });
                        }}
                      >
                        Hindura
                      </button>
                      <button
                        className="btn danger"
                        disabled={isDeletingId === group._id}
                        type="button"
                        onClick={() => deleteGroup(group._id)}
                      >
                        {isDeletingId === group._id ? (
                          <LoadingSpinner label="Birimo gusiba..." small />
                        ) : (
                          "Siba"
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="pill-row">
                  <span className="chip soft">Uyoboye: {group.leaderName}</span>
                  <span className="chip">{group.totalMembers} barimo</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">Nta tsinda rirandikwa.</div>
          )}
        </div>
      </section>

      <section className="card">
        {canManage ? (
          <form className="form" onSubmit={saveGroup}>
            <div className="section-title">
              <h3>{editingId ? "Hindura itsinda" : "Andika itsinda"}</h3>
              <span className="badge">{initialGroups.totalGroups} yose</span>
            </div>

            <label>
              Izina ry&apos;itsinda
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>

            <label>
              Uyoboye itsinda
              <input
                required
                value={form.leaderName}
                onChange={(event) => setForm({ ...form, leaderName: event.target.value })}
              />
            </label>

            <div className="card-actions">
              <button className="btn primary" disabled={isSaving} type="submit">
                {isSaving ? (
                  <LoadingSpinner label="Birimo kubika..." small />
                ) : editingId ? (
                  "Bika impinduka"
                ) : (
                  "Bika itsinda"
                )}
              </button>
              {editingId ? (
                <button
                  className="btn soft"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", leaderName: "" });
                  }}
                >
                  Reka
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="empty-state">Aha ushobora kureba amatsinda gusa.</div>
        )}

        {message ? <p className="muted">{message}</p> : null}
      </section>
    </div>
  );
}
