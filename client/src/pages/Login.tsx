import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

type AuthView = "login" | "register" | "recovery";

interface AuthStatus {
  show: boolean;
  title: string;
  message: string;
  isError: boolean;
}

export default function Login() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AuthStatus>({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  // Login form
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register form
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Recovery form
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const showStatus = (title: string, message: string, isError = true) => {
    setStatus({ show: true, title, message, isError });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      if (response.ok) {
        showStatus("Sucesso", "Login realizado com sucesso!", false);
        setTimeout(() => navigate("/"), 2000);
      } else {
        const error = await response.json();
        showStatus("Falha no Acesso", error.message || "Credenciais inválidas");
      }
    } catch (error) {
      showStatus("Erro", "Falha ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      showStatus("Dados Incorretos", "As palavras-passe não coincidem");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        showStatus("Sucesso", "Conta criada com sucesso!", false);
        setTimeout(() => setView("login"), 2000);
      } else {
        const error = await response.json();
        showStatus("Erro no Registo", error.message || "Falha ao criar conta");
      }
    } catch (error) {
      showStatus("Erro", "Falha ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/trpc/auth.resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (response.ok) {
        showStatus(
          "Link Enviado",
          "Verifique o seu e-mail para repor a palavra-passe.",
          false
        );
        setTimeout(() => setView("login"), 2000);
      } else {
        showStatus("Erro no Envio", "Falha ao enviar link de recuperação");
      }
    } catch (error) {
      showStatus("Erro", "Falha ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo Animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Container Central */}
      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Abas */}
          {(view === "login" || view === "register") && (
            <div className="flex gap-8 mb-10 border-b border-slate-700/30">
              <button
                onClick={() => setView("login")}
                className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors ${
                  view === "login"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setView("register")}
                className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors ${
                  view === "register"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Registar
              </button>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === "login" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Bem-vindo.
                </h2>
                <p className="text-slate-400 text-sm">
                  Insira as suas credenciais para aceder.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Palavra-passe"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setView("recovery")}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Esqueceu-se da senha?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === "register" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Nova Conta.
                </h2>
                <p className="text-slate-400 text-sm">
                  Crie o seu perfil de acesso único.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="E-mail principal"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Palavra-passe segura"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Confirmar palavra-passe"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Acesso"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* RECOVERY VIEW */}
          {view === "recovery" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Recuperar.
                </h2>
                <p className="text-slate-400 text-sm">
                  Enviaremos um link de reposição.
                </p>
              </div>

              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="E-mail de recuperação"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
                >
                  Voltar
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-10 text-center opacity-30 hover:opacity-100 transition-opacity duration-700">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
            Protocolo de Segurança Ativo • Encriptação de Ponta
          </p>
        </div>
      </div>

      {/* Status Overlay */}
      {status.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
          <div className="mb-6">
            {status.isError ? (
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">{status.title}</h3>
          <p className="text-slate-400 text-sm max-w-xs mb-10">{status.message}</p>
          <button
            onClick={() => setStatus({ ...status, show: false })}
            className="px-10 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors text-white"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
