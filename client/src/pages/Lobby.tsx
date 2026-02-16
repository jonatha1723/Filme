import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Trophy, Users, Zap } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  token: string;
}

export default function Lobby() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Create guest user
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: 'guest@doublefps.com',
        name: 'Visitante',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
        token: '',
      };
      localStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
    } else {
      setUser(JSON.parse(userData));
    }
  }, [setLocation]);

  const handleLogout = () => {
    if (user?.id.startsWith('guest_')) {
      // Guest user - just clear and reload
      localStorage.removeItem('user');
      window.location.reload();
    } else {
      // Logged in user - go to login
      localStorage.removeItem('user');
      setLocation('/login');
    }
  };

  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
    // Navigate based on mode
    setTimeout(() => {
      if (mode === 'training') {
        // Training mode: direct entry, no waiting
        setLocation(`/training`);
      } else {
        // Multiplayer modes: go to waiting room
        setLocation(`/waiting?mode=${mode}`);
      }
    }, 300);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎮</div>
            <div>
              <h1 className="text-2xl font-black text-white">Double</h1>
              <p className="text-slate-400 text-xs">FPS 3D Multiplayer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-blue-500/50"
              />
              <div>
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-slate-400 text-xs">{user.email}</p>
              </div>
            </div>
            {user.id.startsWith('guest_') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/login')}
                className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                Fazer Login
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-2">
            Bem-vindo, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-slate-400">Escolha um modo de jogo para começar</p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 5v5 with AI */}
          <Card
            className={`group cursor-pointer transition-all duration-300 border-2 ${
              selectedMode === '5v5'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
            }`}
            onClick={() => handleSelectMode('5v5')}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">⚔️</div>
                <Users className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">5v5 com IA</h3>
              <p className="text-slate-400 text-sm mb-6">
                Jogue em equipes de 5 contra inteligência artificial. Perfeito para treinar e se divertir.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Modo Casual</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>5 Jogadores + 5 IA</span>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleSelectMode('5v5')}
              >
                Jogar Agora
              </Button>
            </div>
          </Card>

          {/* Ranked 1v1 */}
          <Card
            className={`group cursor-pointer transition-all duration-300 border-2 ${
              selectedMode === 'ranked'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'
            }`}
            onClick={() => handleSelectMode('ranked')}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🏆</div>
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Ranked 1v1</h3>
              <p className="text-slate-400 text-sm mb-6">
                Combata 1v1 contra outros jogadores. Suba de patente e domine o ranking global.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span>5 Patentes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Sistema de ELO</span>
                </div>
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleSelectMode('ranked')}
              >
                Jogar Agora
              </Button>
            </div>
          </Card>

          {/* Training Mode */}
          <Card
            className={`group cursor-pointer transition-all duration-300 border-2 ${
              selectedMode === 'training'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/10 hover:border-green-500/50 hover:bg-white/5'
            }`}
            onClick={() => handleSelectMode('training')}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🎯</div>
                <Zap className="w-6 h-6 text-green-400" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Treinamento</h3>
              <p className="text-slate-400 text-sm mb-6">
                Pratique suas habilidades sem pressão. Entrada instantânea, sem espera.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span>Modo Solo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>Bots de Treino</span>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleSelectMode('training')}
              >
                Treinar Agora
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-2">Partidas Jogadas</p>
              <p className="text-3xl font-black text-white">0</p>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-2">Taxa de Vitória</p>
              <p className="text-3xl font-black text-white">0%</p>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-2">Ranking</p>
              <p className="text-3xl font-black text-blue-400">Bronze</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
