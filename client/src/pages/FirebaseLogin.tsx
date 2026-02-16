import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    onAuthStateChanged
} from "firebase/auth";

// CONFIGURAÇÃO DO PROJETO DOUBLE-58E74
const firebaseConfig = {
    apiKey: "AIzaSyBNXJyhXejSkQSliE4RTCkIhscO9qAoyzI",
    authDomain: "double-58e74.firebaseapp.com",
    projectId: "double-58e74",
    storageBucket: "double-58e74.firebasestorage.app",
    messagingSenderId: "703625067454",
    appId: "1:703625067454:web:c1a71bb9877c007d5757ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type AuthView = "login" | "register" | "recovery";

export default function FirebaseLogin() {
    const [, setLocation] = useLocation();
    const [view, setView] = useState<AuthView>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<{show: boolean, title: string, msg: string, isError: boolean}>({
        show: false,
        title: "",
        msg: "",
        isError: true
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Store user in localStorage for compatibility with other pages
                localStorage.setItem('user', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email?.split('@')[0] || "Player",
                    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.uid,
                }));
                setLocation('/lobby');
            }
        });
        return () => unsubscribe();
    }, [setLocation]);

    const notify = (title: string, msg: string, isError = true) => {
        setStatus({ show: true, title, msg, isError });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            notify("Acesso Negado", translateError(err.code));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return notify("Divergência", "As palavras-passe inseridas não são idênticas.");
        if (password.length < 6) return notify("Segurança Baixa", "A palavra-passe deve conter pelo menos 6 caracteres.");

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            notify("Sucesso", "A sua nova conta foi criada. Pode agora entrar.", false);
            setView('login');
        } catch (err: any) {
            notify("Erro de Registo", translateError(err.code));
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            notify("Link Enviado", "Verifique o seu e-mail para definir uma nova palavra-passe.", false);
            setView('login');
        } catch (err: any) {
            notify("Erro de Envio", translateError(err.code));
        }
    };

    function translateError(code: string) {
        switch (code) {
            case 'auth/invalid-email': return "O endereço de e-mail inserido não é válido.";
            case 'auth/user-not-found': return "Não existe nenhuma conta associada a este e-mail.";
            case 'auth/wrong-password': return "A palavra-passe introduzida está incorreta.";
            case 'auth/email-already-in-use': return "Este e-mail já se encontra registado no sistema.";
            case 'auth/weak-password': return "A palavra-passe escolhida é demasiado fraca.";
            case 'auth/invalid-credential': return "Credenciais inválidas. Verifique os dados.";
            default: return "Ocorreu um erro inesperado no servidor. Tente novamente.";
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] text-[#f8fafc] font-['Plus_Jakarta_Sans',_sans-serif] overflow-hidden relative">
            {/* Fundo Decorativo */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_#0f172a_0%,_#020617_100%)] z-0">
                <div className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(59,130,246,0.08)_0%,_transparent_70%)] blur-[100px] rounded-full top-[-300px] left-[-200px] pointer-events-none"></div>
                <div className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(59,130,246,0.08)_0%,_transparent_70%)] blur-[100px] rounded-full bottom-[-300px] right-[-200px] pointer-events-none"></div>
            </div>

            <main className="w-full max-w-[460px] p-6 z-10">
                <div className="bg-[rgba(255,255,255,0.01)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.06)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rounded-[3.5rem] p-10 md:p-14">
                    
                    {/* Seleção de Modo */}
                    {view !== 'recovery' && (
                        <div className="flex justify-center gap-10 mb-12">
                            <button onClick={() => setView('login')} className={`text-[0.75rem] tracking-[0.2em] font-extrabold uppercase transition-all duration-300 ${view === 'login' ? 'text-[#3b82f6] [text-shadow:0_0_15px_rgba(59,130,246,0.5)]' : 'text-[#475569]'}`}>Entrar</button>
                            <button onClick={() => setView('register')} className={`text-[0.75rem] tracking-[0.2em] font-extrabold uppercase transition-all duration-300 ${view === 'register' ? 'text-[#3b82f6] [text-shadow:0_0_15px_rgba(59,130,246,0.5)]' : 'text-[#475569]'}`}>Registar</button>
                        </div>
                    )}

                    {/* VISTA: LOGIN */}
                    {view === 'login' && (
                        <div className="animate-[slideIn_0.6s_ease_forwards]">
                            <header className="mb-10 text-center">
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Identificação</h2>
                                <p className="text-slate-500 text-xs font-medium italic">Aceda à sua área restrita</p>
                            </header>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl flex items-center px-5 py-1 focus-within:border-[#3b82f6] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.15)] focus-within:-translate-y-px transition-all duration-400">
                                    <span className="mr-4 text-slate-600 text-xs">📧</span>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="Endereço de E-mail" />
                                </div>
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl flex items-center px-5 py-1 focus-within:border-[#3b82f6] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.15)] focus-within:-translate-y-px transition-all duration-400">
                                    <span className="mr-4 text-slate-600 text-xs">🔑</span>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="Palavra-passe" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => setView('recovery')} className="text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase">Recuperar Senha?</button>
                                </div>
                                <button type="submit" className="bg-[linear-gradient(135deg,_#3b82f6_0%,_#1d4ed8_100%)] w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-4 shadow-xl hover:-translate-y-px hover:shadow-[0_12px_30px_-10px_rgba(37,99,235,0.6)] transition-all duration-300">Autenticação Segura</button>
                            </form>
                        </div>
                    )}

                    {/* VISTA: REGISTO */}
                    {view === 'register' && (
                        <div className="animate-[slideIn_0.6s_ease_forwards]">
                            <header className="mb-10 text-center">
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Novo Acesso</h2>
                                <p className="text-slate-500 text-xs font-medium italic">Crie as suas credenciais de elite</p>
                            </header>
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-1 focus-within:border-[#3b82f6] transition-all">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="E-mail principal" />
                                </div>
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-1 focus-within:border-[#3b82f6] transition-all">
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="Nova palavra-passe" />
                                </div>
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-1 focus-within:border-[#3b82f6] transition-all">
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="Confirmar palavra-passe" />
                                </div>
                                <button type="submit" className="bg-[linear-gradient(135deg,_#3b82f6_0%,_#1d4ed8_100%)] w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-4 shadow-xl hover:-translate-y-px transition-all">Gerar Acesso</button>
                            </form>
                        </div>
                    )}

                    {/* VISTA: RECUPERAÇÃO */}
                    {view === 'recovery' && (
                        <div className="animate-[slideIn_0.6s_ease_forwards] text-center">
                            <header className="mb-10">
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Recuperação</h2>
                                <p className="text-slate-500 text-xs font-medium italic">Redefina o seu acesso via e-mail</p>
                            </header>
                            <form onSubmit={handleRecovery} className="space-y-6">
                                <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-1 focus-within:border-[#3b82f6] transition-all">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-4 bg-transparent outline-none text-sm" placeholder="E-mail registado" />
                                </div>
                                <button type="submit" className="bg-[linear-gradient(135deg,_#3b82f6_0%,_#1d4ed8_100%)] w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-px transition-all">Enviar Link</button>
                                <button type="button" onClick={() => setView('login')} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                            </form>
                        </div>
                    )}
                </div>
                <p className="text-center mt-12 text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] opacity-40">Protocolo de Encriptação Ponta-a-Ponta Ativo</p>
            </main>

            {/* Overlay de Status */}
            {status.show && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                        {status.isError ? (
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <span className="text-3xl text-red-500">❌</span>
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                <span className="text-3xl text-blue-500">✅</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-3xl font-black mb-3 tracking-tighter">{status.title}</h3>
                    <p className="text-slate-400 text-sm max-w-xs mb-12 font-medium">{status.msg}</p>
                    <button onClick={() => setStatus({...status, show: false})} className="px-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Voltar</button>
                </div>
            )}
        </div>
    );
}
