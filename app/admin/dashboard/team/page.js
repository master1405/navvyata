"use client";

import React, { useState, useEffect } from "react";

export default function AdminTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTeam(data.team || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const triggerFeedback = (type, message) => {
    if (type === "success") {
      setSuccessFeedback(message);
      setErrorFeedback("");
      setTimeout(() => setSuccessFeedback(""), 3000);
    } else {
      setErrorFeedback(message);
      setSuccessFeedback("");
      setTimeout(() => setErrorFeedback(""), 4000);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      triggerFeedback("error", "All fields are required!");
      return;
    }

    const payload = {
      name,
      email: email.toLowerCase(),
      password,
      role,
    };

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setRole("Manager");
        triggerFeedback("success", "Team member registered!");
        loadTeam();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to add member");
      }
    } catch (err) {
      triggerFeedback("error", "Error occurred saving team member");
    }
  };

  const handleDeleteMember = async (id, memberName) => {
    try {
      const res = await fetch("/api/admin/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        triggerFeedback("success", `Team member ${memberName} removed`);
        setConfirmDeleteId(null);
        loadTeam();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to delete member");
      }
    } catch (err) {
      triggerFeedback("error", "Error occurred deleting team member");
    }
  };

  if (forbidden) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "14px" }}>🔒</div>
        <h2 style={{ color: "#EF4444" }}>Access Denied</h2>
        <p style={{ color: "#94A3B8", marginTop: "8px" }}>
          Forbidden: Only the store Owner can view or modify team Role-Based Access Control (RBAC) settings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "left" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0 }}>👥 Team RBAC Settings</h2>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Manage administrative logins and role distributions</p>
      </div>

      {/* Feedback Alerts */}
      {successFeedback && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", color: "#34D399", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ✅ {successFeedback}
        </div>
      )}
      {errorFeedback && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#F87171", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ⚠️ {errorFeedback}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        {/* Create Team Member Form */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155", height: "fit-content" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            ➕ Add Team Member
          </h3>
          <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>NAME *</label>
              <input
                className="inp"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>EMAIL ADDRESS *</label>
              <input
                className="inp"
                type="email"
                placeholder="e.g. ramesh@navvyata.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>PASSWORD *</label>
              <input
                className="inp"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>ASSIGN ROLE *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
              >
                <option value="Manager">Store Manager (Catalog &amp; Stocks)</option>
                <option value="Writer">Content Writer (Blog Authoring)</option>
                <option value="Owner">Co-Owner (Full Admin Powers)</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                background: "var(--teal)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Register Team Member
            </button>
          </form>
        </div>

        {/* Team Members List panel */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            👥 Admin Logins
          </h3>

          {loading ? (
            <div style={{ color: "#94A3B8", fontSize: "13px" }}>Loading team logs...</div>
          ) : team.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px" }}>
              No team members registered.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {team.map((member) => (
                <div
                  key={member.id}
                  style={{
                    background: "#0F172A",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    border: "1px solid #334155",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                      {member.email}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        background:
                          member.role === "Owner"
                            ? "rgba(244, 63, 94, 0.15)"
                            : member.role === "Manager"
                            ? "rgba(20, 184, 166, 0.15)"
                            : "rgba(168, 85, 247, 0.15)",
                        color:
                          member.role === "Owner"
                            ? "#F43F5E"
                            : member.role === "Manager"
                            ? "#20B8A6"
                            : "#A855F7",
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        marginTop: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {member.role}
                    </span>
                  </div>

                  {confirmDeleteId === member.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(member.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      Delete 🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
