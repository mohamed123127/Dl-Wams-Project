import { useState, useEffect, useRef } from "react";
import { Fingerprint, Eye, EyeOff, Wifi } from "lucide-react";
import { authApi } from "../services/api";

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [operatorId, setOperatorId] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");
  const [systemIntegrity, setSystemIntegrity] = useState(0);
  const [networkSync, setNetworkSync] = useState(0);
  const [statusLines, setStatusLines] = useState<string[]>([]);

  const [nodeId] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 2; i++) {
      id += chars[Math.floor(Math.random() * 26)];
    }
    id += "-";
    for (let i = 0; i < 2; i++) {
      id += chars[Math.floor(Math.random() * 10 + 26)];
    }
    return id;
  });

  const terminalRef = useRef<HTMLDivElement>(null);

  // Animate system integrity bars on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setSystemIntegrity(82), 300);
    const timer2 = setTimeout(() => setNetworkSync(45), 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Animate terminal status lines
  useEffect(() => {
    const lines = [
      "> INITIALIZING_NEURAL_LINK...",
      "> BIOMETRIC_SCAN_READY",
      "> WAITING_FOR_OPERATOR_CREDENTIALS",
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setStatusLines((prev) => [...prev, line]);
        }, 1200 + i * 800)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [statusLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!operatorId.trim() || !encryptedKey.trim()) {
      setError("ALL_FIELDS_REQUIRED");
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await authApi.login({
        username: operatorId,
        password: encryptedKey,
      });

      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);

      onLogin();
    } catch (err: any) {
      console.error("Login error:", err);
      setError("AUTHENTICATION_FAILED");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120] px-4">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-slate-700/40 rounded-sm p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
              <Fingerprint className="w-7 h-7 text-slate-400" />
            </div>

            <h2 className="text-lg font-bold tracking-[0.25em] text-slate-200 mb-1">
              AUTHENTICATION
            </h2>

            <p className="text-[10px] font-medium tracking-[0.3em] text-slate-500">
              SECURE GATEWAY ACCESS
            </p>

            <p className="text-[9px] text-slate-600 mt-2">
              NODE: {nodeId}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
              <p className="text-[10px] font-bold tracking-[0.2em] text-red-400 text-center">
                ⚠ {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Operator ID */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.3em] text-slate-400 mb-2">
                OPERATOR_ID
              </label>

              <div className="relative">
                <input
                  id="login-operator-id"
                  type="text"
                  value={operatorId}
                  onChange={(e) => {
                    setOperatorId(e.target.value);
                    setError("");
                  }}
                  placeholder="UID-000-00-0000"
                  className="w-full px-4 py-3 bg-[#0d1321] border border-slate-700/50 rounded-sm text-sm text-slate-200 placeholder-slate-600 tracking-wider focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  disabled={isAuthenticating}
                  autoComplete="username"
                />

                <Wifi className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              </div>
            </div>

            {/* Encrypted Key */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.3em] text-slate-400 mb-2">
                PASSWORD
              </label>

              <div className="relative">
                <input
                  id="login-encrypted-key"
                  type={showPassword ? "text" : "password"}
                  value={encryptedKey}
                  onChange={(e) => {
                    setEncryptedKey(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-[#0d1321] border border-slate-700/50 rounded-sm text-sm text-slate-200 placeholder-slate-600 tracking-wider focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all pr-10"
                  disabled={isAuthenticating}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-authenticate-btn"
              onClick={handleSubmit}
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 mt-2 text-xs font-bold tracking-[0.3em] rounded-sm transition-all duration-300 cursor-pointer disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: isAuthenticating
                  ? "linear-gradient(135deg, #1e3a5f, #1e3a5f)"
                  : "linear-gradient(135deg, #2563eb, #3b82f6)",
                color: "#e2e8f0",
                boxShadow: isAuthenticating
                  ? "none"
                  : "0 0 20px rgba(59,130,246,0.3), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              {isAuthenticating ? (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 
                      12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  <span>VERIFYING...</span>
                </span>
              ) : (
                "AUTHENTICATE"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-2 text-center">
            <button className="text-[10px] font-medium tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors bg-transparent border-none cursor-pointer">
              FORGOT_CREDENTIALS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};