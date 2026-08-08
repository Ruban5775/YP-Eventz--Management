import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/context/SettingsProvider";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function LoginPage() {
  const navigate = useNavigate();

  const { settings, loading } = useSettings();

  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!u.trim() || !p) {
      toast.error("Please enter username and password.");
      return;
    }

    try {
      setLoggingIn(true);

      const response = await fetch(
        `${API_BASE}/admin/login.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: u.trim(),
            password: p,
          }),
        }
      );

      const result = await response.json();

      // Login failed
      if (!result.success) {
        toast.error(
          result.message || "Invalid username or password."
        );

        return;
      }

      // Login successful
      localStorage.setItem("yp_admin", "1");

      // Store admin information if needed
      localStorage.setItem(
        "yp_admin_user",
        JSON.stringify(result.user)
      );

      toast.success("Welcome back!");

      navigate("/ypeventz/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        "Unable to login. Please try again."
      );

    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-panel px-4 py-10 sm:px-6">

      {/* Background decorations */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />


      <motion.form
        onSubmit={submit}
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-soft sm:p-10"
      >

        {/* Logo and heading */}

        <div className="flex flex-col items-center text-center">

          {!loading && settings?.logo && (
            <img
              src={`${API_BASE}/uploads/${settings.logo}`}
              alt={
                settings.company_name ||
                "Company Logo"
              }
              className="h-16 w-auto object-contain"
            />
          )}

          <h1 className="mt-6 text-2xl font-black text-ink sm:text-3xl">
            Admin Login
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to manage your website.
          </p>

        </div>


        {/* Login fields */}

        <div className="mt-8 space-y-4">

          {/* Username */}

          <label className="block">

            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
              Username
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">

              <FiUser className="text-muted-foreground" />

              <input
                value={u}
                onChange={(e) =>
                  setU(e.target.value)
                }
                type="text"
                placeholder="Enter username"
                autoComplete="username"
                disabled={loggingIn}
                className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

          </label>


          {/* Password */}

          {/* Password */}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
              Password
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">

              <FiLock className="shrink-0 text-muted-foreground" />

              <input
                value={p}
                onChange={(e) => setP(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loggingIn}
                className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loggingIn}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 text-muted-foreground transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>

            </div>
          </label>

        </div>


        {/* Sign In Button */}

        <button
          type="submit"
          disabled={loggingIn}
          className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingIn
            ? "Signing In..."
            : "Sign In"}
        </button>


        {/* Footer */}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          {settings?.company_name || ""}
        </p>

      </motion.form>

    </div>
  );
}