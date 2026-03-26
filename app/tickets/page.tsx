"use client";

import { useState, useEffect } from "react";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  available: number;
  sold_out: boolean;
  max_per_order: number;
}

interface CartItem {
  type: TicketType;
  quantity: number;
}

export default function TicketsPage() {
  const [types, setTypes] = useState<TicketType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/tickets/types")
      .then((r) => r.json())
      .then((d) => setTypes(d.ticket_types || []));
  }, []);

  const addToCart = (type: TicketType) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.type.id === type.id);
      if (existing) {
        if (existing.quantity >= type.max_per_order) return prev;
        return prev.map((c) =>
          c.type.id === type.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { type, quantity: 1 }];
    });
  };

  const removeFromCart = (typeId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.type.id === typeId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.type.id === typeId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.type.id !== typeId);
    });
  };

  const total = cart.reduce((sum, c) => sum + c.type.price * c.quantity, 0);
  const totalTickets = cart.reduce((sum, c) => sum + c.quantity, 0);

  const checkout = async () => {
    if (!email) return setError("Email is required");
    if (cart.length === 0) return setError("Add tickets to cart");
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/tickets/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        items: cart.map((c) => ({ type_id: c.type.id, quantity: c.quantity })),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      setError(data.error || "Checkout failed");
    }
  };

  const formatPrice = (yen: number) =>
    new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(yen);

  const tierColors: Record<string, string> = {
    ga: "rgba(255,255,255,0.06)",
    vip: "rgba(201,169,98,0.1)",
    backstage: "rgba(168,66,255,0.1)",
  };

  const tierBorder: Record<string, string> = {
    ga: "rgba(255,255,255,0.1)",
    vip: "rgba(201,169,98,0.3)",
    backstage: "rgba(168,66,255,0.3)",
  };

  const getTier = (id: string) => {
    if (id.startsWith("backstage")) return "backstage";
    if (id.startsWith("vip")) return "vip";
    return "ga";
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
      {/* Header */}
      <header
        style={{
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <a href="/" style={{ color: "#C9A962", textDecoration: "none", fontSize: 14, letterSpacing: 4, fontWeight: 600 }}>
          SOLUNA
        </a>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 2 }}>TICKETS</span>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, margin: 0, lineHeight: 1.2 }}>
            SOLUNA FEST HAWAII 2026
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, letterSpacing: 2, marginTop: 12 }}>
            SEP 4-5 &middot; OAHU, HAWAII
          </p>
        </div>

        {/* Ticket Types */}
        <div style={{ display: "grid", gap: 16 }}>
          {types.map((type) => {
            const tier = getTier(type.id);
            const inCart = cart.find((c) => c.type.id === type.id);
            return (
              <div
                key={type.id}
                style={{
                  background: tierColors[tier],
                  border: `1px solid ${tierBorder[tier]}`,
                  borderRadius: 16,
                  padding: "24px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  opacity: type.sold_out ? 0.4 : 1,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: tier === "vip" ? "#C9A962" : tier === "backstage" ? "#a842ff" : "#fff" }}>
                      {type.name}
                    </h3>
                    {type.sold_out && (
                      <span style={{ fontSize: 10, background: "rgba(255,60,60,0.2)", color: "#ff6666", padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
                    {type.description}
                  </p>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                    {type.available.toLocaleString()} remaining
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: tier === "vip" ? "#C9A962" : "#fff", marginBottom: 12 }}>
                    {formatPrice(type.price)}
                  </div>
                  {!type.sold_out && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {inCart && (
                        <>
                          <button
                            onClick={() => removeFromCart(type.id)}
                            style={{
                              width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)",
                              background: "transparent", color: "#fff", fontSize: 18, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 16, fontWeight: 600, minWidth: 24, textAlign: "center" }}>
                            {inCart.quantity}
                          </span>
                        </>
                      )}
                      <button
                        onClick={() => addToCart(type)}
                        disabled={inCart && inCart.quantity >= type.max_per_order}
                        style={{
                          width: 32, height: 32, borderRadius: "50%",
                          border: `1px solid ${tier === "vip" ? "#C9A962" : "rgba(255,255,255,0.3)"}`,
                          background: tier === "vip" ? "rgba(201,169,98,0.15)" : "rgba(255,255,255,0.05)",
                          color: tier === "vip" ? "#C9A962" : "#fff",
                          fontSize: 18, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: inCart && inCart.quantity >= type.max_per_order ? 0.3 : 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart / Checkout */}
        {cart.length > 0 && (
          <div
            style={{
              marginTop: 32,
              background: "rgba(201,169,98,0.06)",
              border: "1px solid rgba(201,169,98,0.2)",
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 14, letterSpacing: 2, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
              CHECKOUT
            </h3>

            {/* Summary */}
            {cart.map((c) => (
              <div key={c.type.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                <span>{c.type.name} x{c.quantity}</span>
                <span style={{ color: "#C9A962" }}>{formatPrice(c.type.price * c.quantity)}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 12,
                fontSize: 18, fontWeight: 700,
              }}
            >
              <span>Total ({totalTickets} tickets)</span>
              <span style={{ color: "#C9A962" }}>{formatPrice(total)}</span>
            </div>

            {/* Form */}
            <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
                  color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
                }}
              />
              <input
                type="text"
                placeholder="Full name (for ticket)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)",
                  color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
                }}
              />

              {error && <div style={{ color: "#ff6666", fontSize: 13 }}>{error}</div>}

              <button
                onClick={checkout}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg, #C9A962, #a88b3d)",
                  color: "#000", fontSize: 16, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                  letterSpacing: 1, opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
              </button>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12, textAlign: "center" }}>
              Secure payment powered by Stripe. Tickets are non-refundable but transferable.
            </p>
          </div>
        )}

        {/* Lookup */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Already have tickets?{" "}
            <a href="/tickets/success" style={{ color: "#C9A962", textDecoration: "none" }}>
              View my tickets
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
