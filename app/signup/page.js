
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUsers, saveUser, writeStorage, SESSION_KEY } from "@/lib/storage";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setMessage("Please complete all fields.");
      return;
    }

    const existingUser = getUsers().some(
      (user) => user.email.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      setMessage("An account with this email already exists. Please sign in.");
      return;
    }

    setLoading(true);

    const user = {
      id: `user-${crypto.randomUUID()}`,
      name: cleanName,
      email: cleanEmail,
      roles: ["renter"],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    try {
      saveUser(user);

      writeStorage(SESSION_KEY, {
        userId: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        activeRole: "renter",
        signedInAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch {
      setMessage("We couldn't create your account. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        SHEGGAR<span>WHEELS</span><span className="brand-dot">.</span>
      </Link>

      <section className="auth-card">
        <span className="section-label">JOIN SHEGGAR WHEELS</span>
        <h1>Your next journey begins here.</h1>
        <p className="auth-description">
          Create an account to discover cars and manage your rental bookings.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="catalogue-field">
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>

          <label className="catalogue-field">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {message && <p className="auth-error" role="alert">{message}</p>}

          <button
            type="submit"
            className="gold-button auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/signin">Sign in</Link>
        </p>

        <p className="auth-footnote">
          Demo mode: this creates a renter account in your browser.
          No password or real payment is required.
        </p>
      </section>
    </main>
  );
}
