import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      saveToken(response.token, response.user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-char flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-2">
            Palheiro <span className="italic text-sand">Admin</span>
          </h1>
          <p className="text-cream/60">Painel de Administração</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-cream/5 border border-cream/20 rounded-lg p-8 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block label text-cream/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-cream/10 border border-cream/20 rounded text-cream placeholder:text-cream/40 focus:outline-none focus:border-sun"
              placeholder="admin@palheirovelho.pt"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block label text-cream/60 mb-2">Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-cream/10 border border-cream/20 rounded text-cream placeholder:text-cream/40 focus:outline-none focus:border-sun"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sun text-char font-semibold rounded hover:bg-sun/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "A autenticar..." : "Entrar"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-cream/40 text-sm mt-6">
          © 2026 Palheiro Velho · Admin
        </p>
      </div>
    </div>
  );
}
