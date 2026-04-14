"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatMoney } from "@/lib/utils";

type FinanceRecord = {
  _id: string;
  amount: number;
  type: string;
  giverName: string;
  note: string;
  recordedBy: string;
  date: string;
};

const offeringTypes = [
  "Amaturo y'ishimwe",
  "Amaturo y'itorero rikuru",
  "Icyacumi",
  "Ibirundo",
  "Inyubako"
];

export function FinanceForm({
  initialData,
  canManage,
  currentUserName
}: {
  initialData: {
    totalRevenue: number;
    monthTotal: number;
    records: FinanceRecord[];
  };
  canManage: boolean;
  currentUserName: string;
}) {
  const router = useRouter();
  const [records, setRecords] = useState(initialData.records);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    amount: "",
    type: "Amaturo y'ishimwe",
    date: new Date().toISOString().slice(0, 10),
    giverName: "",
    note: "",
    recordedBy: currentUserName
  });

  useEffect(() => {
    setRecords(initialData.records);
  }, [initialData.records]);

  async function saveFinance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/finance/${editingId}` : "/api/finance";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount)
        })
      });

      const data = await response.json();
      setMessage(data.message || "Byabitswe");

      if (response.ok) {
        setEditingId(null);
        setForm({
          amount: "",
          type: "Amaturo y'ishimwe",
          date: new Date().toISOString().slice(0, 10),
          giverName: "",
          note: "",
          recordedBy: currentUserName
        });
        router.refresh();
      }
    } catch {
      setMessage("Kubika amaturo byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "Byasibwe");

      if (response.ok) {
        setRecords((current) => current.filter((record) => record._id !== id));
        router.refresh();
      }
    } catch {
      setMessage("Gusiba amaturo byanze. Ongera ugerageze.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        <div className="grid two">
          <div className="stat">
            <p className="muted">Amafaranga yose</p>
            <h2>{formatMoney(initialData.totalRevenue)}</h2>
          </div>

          <div className="stat">
            <p className="muted">Ay&apos;uku kwezi</p>
            <h2>{formatMoney(initialData.monthTotal)}</h2>
          </div>
        </div>

        {canManage ? (
          <form className="form" onSubmit={saveFinance} style={{ marginTop: 16 }}>
            <div className="section-title">
              <h3>{editingId ? "Hindura amaturo" : "Andika amaturo"}</h3>
              <span className="badge">{records.length} byose</span>
            </div>

            <div className="row">
              <label>
                Amafaranga
                <input
                  required
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                />
              </label>

              <label>
                Ubwoko bw&apos;amaturo
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  {offeringTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="row">
              <label>
                Itariki
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </label>

              <label>
                Ubyanditse
                <input
                  required
                  value={form.recordedBy}
                  onChange={(event) => setForm({ ...form, recordedBy: event.target.value })}
                />
              </label>
            </div>

            <div className="row">
              <label>
                Uwatanze
                <input
                  value={form.giverName}
                  onChange={(event) => setForm({ ...form, giverName: event.target.value })}
                  placeholder="Si ngombwa"
                />
              </label>

              <label>
                Icyitonderwa
                <input
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Niba gihari"
                />
              </label>
            </div>

            <div className="card-actions">
              <button className="btn primary" disabled={isSaving} type="submit">
                {isSaving ? (
                  <LoadingSpinner label="Birimo kubika..." small />
                ) : editingId ? (
                  "Bika impinduka"
                ) : (
                  "Bika amaturo"
                )}
              </button>
              {editingId ? (
                <button
                  className="btn soft"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      amount: "",
                      type: "Amaturo y'ishimwe",
                      date: new Date().toISOString().slice(0, 10),
                      giverName: "",
                      note: "",
                      recordedBy: currentUserName
                    });
                  }}
                >
                  Reka
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="card">
        <div className="section-title">
          <h3>Amaturo aheruka</h3>
          <span className="badge">{records.length}</span>
        </div>

        <div className="list">
          {records.length ? (
            records.map((record) => (
              <article className="item" key={record._id}>
                <div className="item-head">
                  <strong>{record.type}</strong>
                  {canManage ? (
                    <div className="table-actions">
                      <button
                        className="btn soft"
                        type="button"
                        onClick={() => {
                          setEditingId(record._id);
                          setForm({
                            amount: String(record.amount),
                            type: record.type,
                            date: record.date.slice(0, 10),
                            giverName: record.giverName,
                            note: record.note,
                            recordedBy: record.recordedBy
                          });
                        }}
                      >
                        Hindura
                      </button>
                      <button
                        className="btn danger"
                        disabled={isDeletingId === record._id}
                        type="button"
                        onClick={() => deleteRecord(record._id)}
                      >
                        {isDeletingId === record._id ? (
                          <LoadingSpinner label="Birimo gusiba..." small />
                        ) : (
                          "Siba"
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="pill-row">
                  <span className="chip">{formatMoney(record.amount)}</span>
                  <span className="chip soft">
                    {new Date(record.date).toLocaleDateString("rw-RW")}
                  </span>
                  <span className="chip soft">{record.recordedBy}</span>
                </div>

                {record.giverName ? <p style={{ margin: 0 }}>Yatanzwe na: {record.giverName}</p> : null}
                {record.note ? (
                  <p className="muted" style={{ margin: 0 }}>
                    {record.note}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <div className="empty-state">Nta maturo arandikwa.</div>
          )}
        </div>
      </section>
    </div>
  );
}
