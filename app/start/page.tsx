"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStartTriggered = useRef(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSession(payload: Record<string, string | undefined | null>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error("Failed to create session");
      }
      const data = await res.json();
      router.push(`/q/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    await createSession({ email: email || undefined });
  }

  async function handleResume() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        throw new Error("Session not found");
      }
      const data = await res.json();
      router.push(`/q/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoStartTriggered.current) {
      return;
    }

    const payload = {
      offer: searchParams.get("offer"),
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_content: searchParams.get("utm_content"),
      ref: searchParams.get("ref")
    };

    const hasParams = Object.values(payload).some((value) => value);
    if (!hasParams) {
      return;
    }

    autoStartTriggered.current = true;
    void createSession(payload);
  }, [searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-10 px-6 py-20">
      <section className="card rounded-3xl p-10">
        <h1 className="text-3xl font-semibold text-ink">Start your onboarding</h1>
        <p className="mt-3 text-slate-600">
          Create a new assessment session or resume one using your secure token.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">New session</h2>
            <p className="helper mt-1">Share your email to receive updates (optional).</p>
            <input
              className="input mt-4"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
            <button className="btn-primary mt-4 w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create session"}
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Resume session</h2>
            <p className="helper mt-1">Enter the token from your save link.</p>
            <input
              className="input mt-4"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Session token"
            />
            <button
              className="btn-secondary mt-4 w-full"
              onClick={handleResume}
              disabled={!token || loading}
            >
              {loading ? "Resuming…" : "Resume session"}
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>
    </main>
  );
}
