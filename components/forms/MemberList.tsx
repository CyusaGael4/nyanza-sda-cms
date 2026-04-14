"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type Member = {
  _id: string;
  names: string;
  birthDate: string;
  phone: string;
  address: string;
  gender: "gabo" | "gore";
  churchRole: string;
  baptized: boolean;
  groupId: string;
  groupName: string;
};

type GroupOption = {
  _id: string;
  name: string;
};

type EditState = {
  names: string;
  birthDate: string;
  phone: string;
  address: string;
  gender: "gabo" | "gore";
  churchRole: string;
  groupId: string;
  baptized: "yego" | "oya";
};

export function MemberList({
  initialMembers,
  groups,
  canManage
}: {
  initialMembers: Member[];
  groups: GroupOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({
    names: "",
    birthDate: "",
    phone: "",
    address: "",
    gender: "gabo",
    churchRole: "",
    groupId: "",
    baptized: "oya"
  });

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  function startEdit(member: Member) {
    setEditingId(member._id);
    setEditForm({
      names: member.names,
      birthDate: member.birthDate.slice(0, 10),
      phone: member.phone,
      address: member.address,
      gender: member.gender,
      churchRole: member.churchRole,
      groupId: member.groupId,
      baptized: member.baptized ? "yego" : "oya"
    });
  }

  async function saveEdit(id: string) {
    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          baptized: editForm.baptized === "yego"
        })
      });

      const data = await response.json();
      setMessage(data.message || "Byahindutse");

      if (response.ok) {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      setMessage("Guhindura umunyamuryango byanze. Ongera ugerageze.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function deleteMember(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/members/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "Byasibwe");

      if (response.ok) {
        setMembers((current) => current.filter((member) => member._id !== id));
        router.refresh();
      }
    } catch {
      setMessage("Gusiba umunyamuryango byanze. Ongera ugerageze.");
    } finally {
      setIsDeletingId(null);
    }
  }

  const filteredMembers = members.filter((member) => {
    const haystack = [
      member.names,
      member.phone,
      member.address,
      member.groupName,
      member.churchRole
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  return (
    <section className="card">
      <div className="section-title">
        <h3>Urutonde rw&apos;abanyamuryango</h3>
        <span className="badge">{members.length} bose</span>
      </div>

      <div className="search-wrap">
        <label>
          Shaka umuntu
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Andika amazina cyangwa telefoni..."
          />
        </label>
      </div>

      <div className="list">
        {filteredMembers.length ? (
          filteredMembers.map((member) => (
            <article className="item" key={member._id}>
              {editingId === member._id ? (
                <div className="form">
                  <div className="row">
                    <label>
                      Amazina
                      <input
                        value={editForm.names}
                        onChange={(event) =>
                          setEditForm({ ...editForm, names: event.target.value })
                        }
                      />
                    </label>

                    <label>
                      Telefoni
                      <input
                        value={editForm.phone}
                        onChange={(event) =>
                          setEditForm({ ...editForm, phone: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="row">
                    <label>
                      Aho atuye
                      <input
                        value={editForm.address}
                        onChange={(event) =>
                          setEditForm({ ...editForm, address: event.target.value })
                        }
                      />
                    </label>

                    <label>
                      Itariki y&apos;amavuko
                      <input
                        type="date"
                        value={editForm.birthDate}
                        onChange={(event) =>
                          setEditForm({ ...editForm, birthDate: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="row">
                    <label>
                      Igitsina
                      <select
                        value={editForm.gender}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            gender: event.target.value as "gabo" | "gore"
                          })
                        }
                      >
                        <option value="gabo">Gabo</option>
                        <option value="gore">Gore</option>
                      </select>
                    </label>

                    <label>
                      Uruhare mu itorero
                      <input
                        value={editForm.churchRole}
                        onChange={(event) =>
                          setEditForm({ ...editForm, churchRole: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="row">
                    <label>
                      Itsinda
                      <select
                        value={editForm.groupId}
                        onChange={(event) =>
                          setEditForm({ ...editForm, groupId: event.target.value })
                        }
                      >
                        <option value="">Nta tsinda</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Yabatijwe?
                      <select
                        value={editForm.baptized}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            baptized: event.target.value as "yego" | "oya"
                          })
                        }
                      >
                        <option value="oya">Oya</option>
                        <option value="yego">Yego</option>
                      </select>
                    </label>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn primary"
                      disabled={isSavingEdit}
                      onClick={() => saveEdit(member._id)}
                      type="button"
                    >
                      {isSavingEdit ? (
                        <LoadingSpinner label="Birimo kubika..." small />
                      ) : (
                        "Bika ibyo wahinduye"
                      )}
                    </button>
                    <button className="btn soft" onClick={() => setEditingId(null)} type="button">
                      Reka
                    </button>
                  </div>
                </div>
              ) : (
                <div className="stack-sm">
                  <div className="item-head">
                    <strong>{member.names}</strong>
                    {canManage ? (
                      <div className="table-actions">
                        <button className="btn soft" onClick={() => startEdit(member)} type="button">
                          Hindura
                        </button>
                        <button
                          className="btn danger"
                          disabled={isDeletingId === member._id}
                          onClick={() => deleteMember(member._id)}
                          type="button"
                        >
                          {isDeletingId === member._id ? (
                            <LoadingSpinner label="Birimo gusiba..." small />
                          ) : (
                            "Siba"
                          )}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="pill-row">
                    <span className="chip soft">{member.phone}</span>
                    <span className="chip soft">
                      {member.gender === "gabo" ? "Gabo" : "Gore"}
                    </span>
                    <span className="chip soft">{member.groupName || "Nta tsinda"}</span>
                    <span className={member.baptized ? "chip" : "chip danger"}>
                      {member.baptized ? "Yabatijwe" : "Ntarabatizwa"}
                    </span>
                  </div>

                  <p className="muted" style={{ margin: 0 }}>
                    {member.address}
                  </p>

                  <p style={{ margin: 0 }}>
                    Uruhare: <strong>{member.churchRole || "Ntarwandikwa"}</strong>
                  </p>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state">Nta muntu uhuye n&apos;ibyo washatse.</div>
        )}
      </div>

      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
