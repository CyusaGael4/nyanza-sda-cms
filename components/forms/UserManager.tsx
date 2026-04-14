"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  createPermissions,
  getRoleLabel,
  normalizePermissions,
  permissionKeys,
  permissionLabels
} from "@/lib/permissions";
import { PermissionKey, Permissions, UserRole } from "@/types";

type UserItem = {
  _id: string;
  names: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  permissions: Permissions;
};

type FormRole = UserRole | "";

function emptyForm() {
  return {
    names: "",
    phone: "",
    password: "",
    recoveryPassword: "",
    role: "" as FormRole,
    permissions: createPermissions("assistant")
  };
}

export function UserManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  function updateRole(role: FormRole) {
    setForm({
      ...form,
      role,
      permissions: normalizePermissions(form.permissions, role || "assistant")
    });
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
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
        setForm(emptyForm());
        router.refresh();
      }
    } catch {
      setMessage("Kubika umukoresha byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteUser(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "Byahindutse");

      if (response.ok) {
        setUsers((current) => current.filter((user) => user._id !== id));
        router.refresh();
      }
    } catch {
      setMessage("Gusiba umukoresha byanze. Ongera ugerageze.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        <form className="form" onSubmit={saveUser}>
          <div className="section-title">
            <h3>{editingId ? "Hindura umukoresha" : "Andika umukoresha"}</h3>
            <span className="badge">{users.length} bose</span>
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

          <label>
            Ijambo ry&apos;ibanga
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder={editingId ? "Shyiramo gusa niba ushaka kurihindura" : ""}
              required={!editingId}
            />
          </label>

          <label>
            Ijambo ryo kugarura
            <input
              type="password"
              value={form.recoveryPassword}
              onChange={(event) => setForm({ ...form, recoveryPassword: event.target.value })}
              placeholder="Si ngombwa, ariko rifasha igihe bibagiwe"
            />
          </label>

          <label>
            Uruhare
            <select
              required
              value={form.role}
              onChange={(event) => updateRole(event.target.value as FormRole)}
            >
              <option value="">Hitamo uruhare</option>
              <option value="assistant">Umukozi</option>
              <option value="admin">Umuyobozi</option>
            </select>
          </label>

          <p className="muted" style={{ marginTop: -6 }}>
            Super admin wa mbere akomeza kuba umwe. Aha wongeramo admin cyangwa umukozi.
          </p>

          <div>
            <p style={{ marginTop: 0, marginBottom: 10, fontWeight: 700 }}>
              Uburenganzira: ni nde wemerewe kubona iki
            </p>
            <div className="permission-grid">
              {permissionKeys.map((key) => (
                <label className="check-row" key={key}>
                  <input
                    checked={form.role === "super_admin" ? true : Boolean(form.permissions[key])}
                    disabled={!form.role || form.role === "super_admin"}
                    type="checkbox"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        permissions: {
                          ...form.permissions,
                          [key]: event.target.checked
                        }
                      })
                    }
                  />
                  <span>{permissionLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button className="btn primary" disabled={isSaving} type="submit">
              {isSaving ? (
                <LoadingSpinner label="Birimo kubika..." small />
              ) : editingId ? (
                "Bika impinduka"
              ) : (
                "Bika umukoresha"
              )}
            </button>
            {editingId ? (
              <button
                className="btn soft"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                }}
              >
                Reka
              </button>
            ) : null}
          </div>
        </form>

        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="card">
        <div className="section-title">
          <h3>Abakoresha</h3>
          <span className="badge">{users.length} bose</span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Amazina</th>
                <th>Telefoni</th>
                <th>Uruhare</th>
                <th>Uburenganzira</th>
                <th>Igikorwa</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.names}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span>{getRoleLabel(user.role)}</span>
                  </td>
                  <td>
                    <div className="stack-sm">
                      {permissionKeys
                        .filter((key) => user.permissions[key as PermissionKey])
                        .map((key) => (
                          <span className="chip soft" key={key}>
                            {permissionLabels[key]}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn soft"
                        type="button"
                        onClick={() => {
                          setEditingId(user._id);
                          setForm({
                            names: user.names,
                            phone: user.phone,
                            password: "",
                            recoveryPassword: "",
                            role: user.role as FormRole,
                            permissions: normalizePermissions(user.permissions, user.role)
                          });
                        }}
                      >
                        Hindura
                      </button>
                      <button
                        className="btn danger"
                        disabled={isDeletingId === user._id}
                        type="button"
                        onClick={() => deleteUser(user._id)}
                      >
                        {isDeletingId === user._id ? (
                          <LoadingSpinner label="Birimo gusiba..." small />
                        ) : (
                          "Siba"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
