"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type AnnouncementItem = {
  _id: string;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
};

export function AnnouncementForm({
  initialAnnouncements,
  canManage,
  currentUserName
}: {
  initialAnnouncements: AnnouncementItem[];
  canManage: boolean;
  currentUserName: string;
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [form, setForm] = useState({
    title: "",
    description: "",
    authorName: currentUserName
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/announcements/${editingId}` : "/api/announcements";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      setMessage(data.message || "Byabitswe");

      if (response.ok) {
        setEditingId(null);
        setForm({ title: "", description: "", authorName: currentUserName });
        router.refresh();
      }
    } catch {
      setMessage("Kubika itangazo byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAnnouncement(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "Byasibwe");

      if (response.ok) {
        setAnnouncements((current) => current.filter((item) => item._id !== id));
        router.refresh();
      }
    } catch {
      setMessage("Gusiba itangazo byanze. Ongera ugerageze.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        {canManage ? (
          <form className="form" onSubmit={saveAnnouncement}>
            <div className="section-title">
              <h3>{editingId ? "Hindura itangazo" : "Andika itangazo"}</h3>
              <span className="badge">{announcements.length} yose</span>
            </div>

            <label>
              Itangazo
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </label>

            <label>
              Ibisobanuro
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>

            <label>
              Ryakozwe na nde?
              <input
                required
                value={form.authorName}
                onChange={(event) => setForm({ ...form, authorName: event.target.value })}
              />
            </label>

            <div className="card-actions">
              <button className="btn primary" disabled={isSaving} type="submit">
                {isSaving ? (
                  <LoadingSpinner label="Birimo kubika..." small />
                ) : editingId ? (
                  "Bika impinduka"
                ) : (
                  "Bika itangazo"
                )}
              </button>
              {editingId ? (
                <button
                  className="btn soft"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: "", description: "", authorName: currentUserName });
                  }}
                >
                  Reka
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="empty-state">Aha ushobora kureba amatangazo gusa.</div>
        )}

        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="card">
        <div className="section-title">
          <h3>Amatangazo aheruka</h3>
          <span className="badge">{announcements.length}</span>
        </div>

        <div className="list">
          {announcements.length ? (
            announcements.map((item) => (
              <article className="item" key={item._id}>
                <div className="item-head">
                  <strong>{item.title}</strong>
                  {canManage ? (
                    <div className="table-actions">
                      <button
                        className="btn soft"
                        type="button"
                        onClick={() => {
                          setEditingId(item._id);
                          setForm({
                            title: item.title,
                            description: item.description,
                            authorName: item.authorName
                          });
                        }}
                      >
                        Hindura
                      </button>
                      <button
                        className="btn danger"
                        disabled={isDeletingId === item._id}
                        type="button"
                        onClick={() => deleteAnnouncement(item._id)}
                      >
                        {isDeletingId === item._id ? (
                          <LoadingSpinner label="Birimo gusiba..." small />
                        ) : (
                          "Siba"
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                <p style={{ margin: 0 }}>{item.description}</p>
                <div className="pill-row">
                  <span className="chip soft">{item.authorName}</span>
                  <span className="chip soft">
                    {new Date(item.createdAt).toLocaleDateString("rw-RW")}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">Nta matangazo arandikwa.</div>
          )}
        </div>
      </section>
    </div>
  );
}
