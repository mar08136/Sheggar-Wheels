"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getUsers, writeStorage, SESSION_KEY } from "@/lib/storage";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const users = getUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      setMessage("Account not found. Try one of the demo accounts below.");
      setLoading(false);
      return;
    }

    writeStorage(SESSION_KEY, {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      activeRole: user.roles.includes("admin")
        ? "admin"
        : user.roles.includes("renter")
          ? "renter"
          : "owner",
      signedInAt: new Date().toISOString(),
    });

    const requestedPath = searchParams.get("next");
    const safePath =
      requestedPath &&
      requestedPath.startsWith("/") &&
      !requestedPath.startsWith("//")
        ? requestedPath
        : user.roles.includes("admin")
          ? "/admin"
          : user.roles.includes("owner")
            ? "/owner"
            : "/dashboard";

    router.push(safePath);
  }

  const demoAccounts = [
    { label: "Renter", email: "hana@example.com" },
    { label: "Owner + renter", email: "dawit@example.com" },
    { label: "Owner", email: "selamawit@example.com" },
    { label: "Administrator", email: "admin@example.com" },
  ];

  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        SHEGGAR<span>WHEELS</span><span className="brand-dot">.</span>
      </Link>

      <section className="auth-card">
        <span className="section-label">WELCOME BACK</span>

        <h1>Your next journey starts here.</h1>

        <p className="auth-description">
          Sign in to manage your bookings and explore Addis Ababa.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          {message && (
            <p className="auth-error" role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="gold-button auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <section className="demo-accounts">
          <h2>Demo accounts</h2>
          <p>Choose an account to fill in its email.</p>

          <div className="demo-account-list">
            {demoAccounts.map((account) => (
              <button
                type="button"
                className="demo-account-button"
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setMessage("");
                }}
              >
                <span className="demo-account-role">{account.label}</span>
                <span className="demo-account-email">{account.email}</span>
              </button>
            ))}
          </div>
        </section>

        <p className="auth-footer">
          New to Sheggar Wheels?{" "}
          <Link href="/signup">Create an account</Link>
        </p>

        <p className="auth-demo-note">
          Demo mode: sign-in uses sample accounts and browser storage. No
          password or real payment is required.
        </p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={<main className="auth-page">Loading sign-in...</main>}
    >
      <SignInForm />
    </Suspense>
  );
}