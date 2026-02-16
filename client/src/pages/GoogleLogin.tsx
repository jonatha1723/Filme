import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '2191174521-fif401smvhmsa93v39q3h90sevkvmnvc.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'dark',
            size: 'large',
            width: '100%',
          }
        );

        setLoading(false);
      }
    };

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decode JWT token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);

      // Store user data
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userData.sub,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          token: response.credential,
        })
      );

      // Redirect to lobby
      setLocation('/lobby');
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-3xl">🎮</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Double</h1>
            <p className="text-slate-400 text-sm">FPS 3D Multiplayer</p>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Double</h2>
            <p className="text-slate-400 text-sm">
              Faça login com sua conta Google para começar a jogar
            </p>
          </div>

          {/* Google Sign-In Button */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div id="google-signin-button" className="mb-6"></div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">⚔️</span>
              <div>
                <p className="text-white font-semibold text-sm">Modo 5v5 com IA</p>
                <p className="text-slate-400 text-xs">Jogue contra inteligência artificial</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">🏆</span>
              <div>
                <p className="text-white font-semibold text-sm">Ranked 1v1</p>
                <p className="text-slate-400 text-xs">Suba de patente e domine o ranking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">🌐</span>
              <div>
                <p className="text-white font-semibold text-sm">Multiplayer em Tempo Real</p>
                <p className="text-slate-400 text-xs">Sincronização perfeita com outros jogadores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-xs">
          <p>© 2026 Double Games. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
