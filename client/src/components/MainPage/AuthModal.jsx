import { useState } from "react";

export default function AuthModal({
  isOpen,
  mode = "signin", // "signin" | "signup"
  onClose,
  onSuccess,
  onSignin,
  onSignup,
}) {
  const [activeMode, setActiveMode] = useState(mode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const isSignup = activeMode === "signup";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("All fields are required");
        }
        await onSignup(formData);
      } else {
        if (!formData.email || !formData.password) {
          throw new Error("Email and password are required");
        }
        await onSignin({ email: formData.email, password: formData.password });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#0f0e3a] p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-bold">
            {isSignup ? "Create Account" : "Log In to formrescue"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#25246b] text-white/70 hover:bg-[#2e2d7d] hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/15 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isSignup && (
            <div>
              <label className="mb-1 block text-xs font-medium text-white/80">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-white/10 bg-[#15144a] px-3.5 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-white/80">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-[#15144a] px-3.5 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/80">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-[#15144a] px-3.5 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#6c63ff] py-2.5 text-xs font-semibold text-white transition hover:bg-[#7b73ff] disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-white/60">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setActiveMode("signin");
                  setError(null);
                }}
                className="font-medium text-[#8f86ff] underline hover:text-white"
              >
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setActiveMode("signup");
                  setError(null);
                }}
                className="font-medium text-[#8f86ff] underline hover:text-white"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
