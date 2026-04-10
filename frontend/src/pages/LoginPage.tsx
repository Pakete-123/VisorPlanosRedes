import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../stores/useAuthStore";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.access_token, data.user);
      navigate("/projects");
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-custom-dark flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-950 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-custom-blue text-center">
          Visor de Planos de Red
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Gestión de infraestructura de red
        </p>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
          required
        />
        <button
          type="submit"
          className="bg-custom-blue text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
