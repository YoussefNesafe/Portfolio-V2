"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw]">
      <div className="w-full max-w-[90vw] tablet:max-w-[50vw] desktop:max-w-[20.833vw] bg-bg-secondary border border-border-subtle rounded-lg p-[8vw] tablet:p-[4vw] desktop:p-[1.667vw]">
        <div className="text-center mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw]">
            Admin Login
          </h1>
          <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            Sign in to manage your blog
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] mb-[5.333vw] tablet:mb-[2.5vw] desktop:mb-[1.042vw]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
          <div>
            <label className="block text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg bg-background border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
            />
          </div>

          <div>
            <label className="block text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg bg-background border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[3vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-lg text-white font-medium text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-[5.333vw] tablet:mt-[2.5vw] desktop:mt-[1.042vw] text-center">
          <a
            href="/"
            className="text-text-muted hover:text-accent-cyan transition-colors text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
          >
            Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
