"use client";

import { useState, useEffect } from "react";

interface Ticket {
  id: string;
  qr_code: string;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  owner_name: string;
  type_name: string;
  type_description: string;
  transferred_from: string | null;
  created_at: string;
}

export default function TicketSuccessPage() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferName, setTransferName] = useState("");
  const [transferTicketId, setTransferTicketId] = useState<string | null>(null);
  const [transferResult, setTransferResult] = useState("");

  // Check URL for order_id on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    if (orderId) {
      // Poll for order completion (Stripe webhook may take a moment)
      const poll = async () => {
        for (let i = 0; i < 10; i++) {
          const res = await fetch(`/api/v1/tickets/orders/${orderId}`);
          const data = await res.json();
          if (data.order?.status === "completed" && data.tickets?.length > 0) {
            setEmail(data.order.email);
            setTickets(data.tickets);
            setSearched(true);
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      };
      poll();
    }
  }, []);

  const lookupTickets = async () => {
    if (!email) return;
    setLoading(true);
    const res = await fetch(`/api/v1/tickets/mine?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setTickets(data.tickets || []);
    setSearched(true);
    setLoading(false);
  };

  const initiateTransfer = async (ticketId: string) => {
    if (!transferEmail) return;
    const res = await fetch(`/api/v1/tickets/${ticketId}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_email: email,
        to_email: transferEmail,
        to_name: transferName || undefined,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setTransferResult(`Transfer link sent! Token: ${data.transfer.token}`);
      setTransferTicketId(null);
      lookupTickets();
    } else {
      setTransferResult(data.error || "Transfer failed");
    }
  };

  const tierColor = (name: string) => {
    if (name.includes("Backstage")) return "#a842ff";
    if (name.includes("VIP")) return "#C9A962";
    return "rgba(255,255,255,0.6)";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #05060a 0%, #0a0d14 40%, #111827 100%)",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          padding: "24px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <a href="/" style={{ color: "#C9A962", textDecoration: "none", fontSize: 14, letterSpacing: 4, fontWeight: 600 }}>
          SOLUNA
        </a>
        <a href="/tickets" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 12, letterSpacing: 2 }}>
          BUY TICKETS
        </a>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>
          My Tickets
        </h1>

        {/* Email lookup */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupTickets()}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
              color: "#fff", fontSize: 15, outline: "none",
            }}
          />
          <button
            onClick={lookupTickets}
            disabled={loading}
            style={{
              padding: "12px 24px", borderRadius: 8, border: "none",
              background: "#C9A962", color: "#000", fontWeight: 600, cursor: "pointer",
            }}
          >
            {loading ? "..." : "Lookup"}
          </button>
        </div>

        {/* Tickets */}
        {searched && tickets.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>
            No tickets found for this email.
          </div>
        )}

        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${ticket.checked_in ? "rgba(0,200,0,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              position: "relative",
            }}
          >
            {/* Ticket type badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: tierColor(ticket.type_name) }}>
                  {ticket.type_name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {ticket.type_description}
                </div>
              </div>
              {ticket.checked_in ? (
                <span style={{ fontSize: 10, background: "rgba(0,200,0,0.15)", color: "#4ade80", padding: "4px 10px", borderRadius: 6, letterSpacing: 1 }}>
                  CHECKED IN
                </span>
              ) : (
                <span style={{ fontSize: 10, background: "rgba(201,169,98,0.15)", color: "#C9A962", padding: "4px 10px", borderRadius: 6, letterSpacing: 1 }}>
                  VALID
                </span>
              )}
            </div>

            {/* QR Code display */}
            <div
              style={{
                background: "#fff", borderRadius: 12, padding: 20,
                textAlign: "center", marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 8 }}>
                SCAN AT ENTRY
              </div>
              <div
                style={{
                  fontFamily: "monospace", fontSize: 24, fontWeight: 700,
                  color: "#000", letterSpacing: 3,
                }}
              >
                {ticket.qr_code}
              </div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
                {ticket.owner_name || ticket.id.slice(0, 8)}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
              <span>ID: {ticket.id.slice(0, 8)}</span>
              {ticket.transferred_from && <span>Transferred from {ticket.transferred_from}</span>}
              {ticket.checked_in_at && <span>Checked in: {new Date(ticket.checked_in_at).toLocaleString()}</span>}
            </div>

            {/* Transfer button */}
            {!ticket.checked_in && (
              <div style={{ marginTop: 16 }}>
                {transferTicketId === ticket.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="email"
                      placeholder="Recipient email"
                      value={transferEmail}
                      onChange={(e) => setTransferEmail(e.target.value)}
                      style={{
                        flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
                        color: "#fff", fontSize: 13, outline: "none",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={transferName}
                      onChange={(e) => setTransferName(e.target.value)}
                      style={{
                        width: 140, padding: "8px 12px", borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
                        color: "#fff", fontSize: 13, outline: "none",
                      }}
                    />
                    <button
                      onClick={() => initiateTransfer(ticket.id)}
                      style={{
                        padding: "8px 16px", borderRadius: 6, border: "none",
                        background: "#C9A962", color: "#000", fontWeight: 600,
                        fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setTransferTicketId(null)}
                      style={{
                        padding: "8px 12px", borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
                        color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setTransferTicketId(ticket.id)}
                    style={{
                      padding: "8px 16px", borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                      color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer",
                    }}
                  >
                    Transfer to someone
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {transferResult && (
          <div style={{ padding: 12, background: "rgba(201,169,98,0.1)", borderRadius: 8, fontSize: 13, color: "#C9A962", marginTop: 8 }}>
            {transferResult}
          </div>
        )}
      </div>
    </div>
  );
}
