"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type Member = { _id: string; names: string; groupId: string; groupName: string };
type Group = { _id: string; name: string };

export function AttendanceForm({
  initialMembers,
  initialGroups,
  currentUserName
}: {
  initialMembers: Member[];
  initialGroups: Group[];
  currentUserName: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, "present" | "absent">>({});

  useEffect(() => {
    const initialMap = initialMembers.reduce(
      (acc, member) => {
        acc[member._id] = "absent";
        return acc;
      },
      {} as Record<string, "present" | "absent">
    );

    setStatusMap(initialMap);
  }, [initialMembers]);

  useEffect(() => {
    if (!selectedGroupId && initialGroups.length) {
      setSelectedGroupId(initialGroups[0]._id);
    }
  }, [initialGroups, selectedGroupId]);

  async function submitAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const selectedMembers = filteredMembers;

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "Sabbath",
          date,
          takenBy: currentUserName,
          groupId: selectedGroupId,
          records: selectedMembers.map((member) => ({
            memberId: member._id,
            status: statusMap[member._id] || "absent"
          }))
        })
      });

      const data = await response.json();
      setMessage(data.message || "Byabitswe");

      if (response.ok) {
        router.refresh();
      }
    } catch {
      setMessage("Kubika ubwitabire byanze. Ongera ugerageze.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generatePdf() {
    setIsGeneratingPdf(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);

      const selectedGroup = initialGroups.find((group) => group._id === selectedGroupId);
      const selectedMembers = filteredMembers;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Nyanza SDA Church", 14, 18);
      doc.setFontSize(11);
      doc.text(`Itsinda: ${selectedGroup?.name || "Nta tsinda"}`, 14, 28);
      doc.text(`Itariki: ${new Date(date).toLocaleDateString("rw-RW")}`, 14, 35);
      doc.text(`Uwafashe ubwitabire: ${currentUserName}`, 14, 42);

      autoTable(doc, {
        startY: 50,
        head: [["Amazina", "Itsinda", "Uko yitabiye"]],
        body: selectedMembers.map((member) => [
          member.names,
          member.groupName || "Nta tsinda",
          statusMap[member._id] === "present" ? "Yaje" : "Ntago yaje"
        ])
      });

      doc.save(
        `ubwitabire-${(selectedGroup?.name || "itsinda").replace(/\s+/g, "-").toLowerCase()}-${date}.pdf`
      );
    } catch {
      setMessage("Gukora PDF byanze. Ongera ugerageze.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  const filteredMembers = initialMembers.filter(
    (member) =>
      member.groupId === selectedGroupId &&
      member.names.toLowerCase().includes(search.toLowerCase())
  );

  const selectedGroupName =
    initialGroups.find((group) => group._id === selectedGroupId)?.name || "Itsinda";

  return (
    <form className="card form" onSubmit={submitAttendance}>
      <div className="section-title">
        <h3>Andika ubwitabire bwa Sabato</h3>
        <span className="badge">{filteredMembers.length} bo muri {selectedGroupName}</span>
      </div>

      <div className="row">
        <label>
          Itsinda
          <select
            required
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
          >
            <option value="">Hitamo itsinda</option>
            {initialGroups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Itariki
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label>
          Shaka umuntu
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Andika amazina..."
          />
        </label>
      </div>

      <div className="list">
        {filteredMembers.length ? (
          filteredMembers.map((member) => (
            <div className="item toggle-row" key={member._id}>
              <strong>{member.names}</strong>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${statusMap[member._id] === "present" ? "active" : ""}`}
                  onClick={() =>
                    setStatusMap((current) => ({
                      ...current,
                      [member._id]: "present"
                    }))
                  }
                  type="button"
                >
                  Yaje
                </button>
                <button
                  className={`toggle-btn ${statusMap[member._id] === "absent" ? "inactive" : ""}`}
                  onClick={() =>
                    setStatusMap((current) => ({
                      ...current,
                      [member._id]: "absent"
                    }))
                  }
                  type="button"
                >
                  Ntago yaje
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">Nta banyamuryango bari muri iri tsinda cyangwa ibyo wanditse ntibyabonetse.</div>
        )}
      </div>

      <div className="card-actions">
        <button className="btn primary" disabled={!selectedGroupId || isSaving} type="submit">
          {isSaving ? <LoadingSpinner label="Birimo kubika..." small /> : "Bika ubwitabire"}
        </button>
        <button
          className="btn soft"
          disabled={!selectedGroupId || !filteredMembers.length || isGeneratingPdf}
          onClick={generatePdf}
          type="button"
        >
          {isGeneratingPdf ? <LoadingSpinner label="Birimo gukora PDF..." small /> : "Kora PDF"}
        </button>
      </div>

      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
