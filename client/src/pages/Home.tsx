import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gamepad2, Users, Crosshair, Trophy } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

type GameMode = "1v1" | "3v3" | "training" | null;

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);

  const joinQueueMutation = trpc.game.joinQueue.useMutation();
  const getStatsQuery = trpc.game.getStats.useQuery(undefined, { enabled: isAuthenticated });
  const getRankingsQuery = trpc.game.getRankings.useQuery({ limit: 10 });

  const handleJoinQueue = async (mode: GameMode) => {
    if (!mode) return;
    
    setIsJoiningQueue(true);
    try {
      await joinQueueMutation.mutateAsync({ mode });
      // Navigate to waiting room
      navigate(`/waiting/${mode}`);
    } catch (error) {
      console.error("Failed to join queue:", error);
      setIsJoiningQueue(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-400">DOUBLE</CardTitle>
            <CardDescription className="text-slate-400">FPS 3D Multiplayer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-center mb-6">
              Bem-vindo ao Double! Um jogo de FPS 3D rápido e emocionante com modos 1v1, 3v3 e treinamento.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              Entrar com Manus
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">DOUBLE</h1>
          <p className="text-slate-400">Bem-vindo, {user?.name}!</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Modes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Selecione um Modo</h2>

            {/* 1v1 Mode */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedMode === "1v1"
                  ? "bg-blue-600 border-blue-400"
                  : "bg-slate-800 border-slate-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedMode("1v1")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Crosshair className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-white">1v1 Duelo</CardTitle>
                    <CardDescription className="text-slate-400">
                      Combate direto entre dois jogadores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Primeiro a 10 kills vence. Mapa compacto para ação rápida.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinQueue("1v1");
                  }}
                  disabled={isJoiningQueue}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isJoiningQueue ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                  Entrar na Fila
                </Button>
              </CardContent>
            </Card>

            {/* 3v3 Mode */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedMode === "3v3"
                  ? "bg-blue-600 border-blue-400"
                  : "bg-slate-800 border-slate-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedMode("3v3")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-white">3v3 Equipes</CardTitle>
                    <CardDescription className="text-slate-400">
                      Batalha em equipes de três jogadores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Primeiro time a 20 kills vence. Trabalho em equipe é essencial.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinQueue("3v3");
                  }}
                  disabled={isJoiningQueue}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isJoiningQueue ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                  Entrar na Fila
                </Button>
              </CardContent>
            </Card>

            {/* Training Mode */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedMode === "training"
                  ? "bg-blue-600 border-blue-400"
                  : "bg-slate-800 border-slate-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedMode("training")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-white">Treinamento</CardTitle>
                    <CardDescription className="text-slate-400">
                      Pratique suas habilidades sozinho
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Ambiente solo com alvos estáticos e móveis. Sem limite de tempo.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinQueue("training");
                  }}
                  disabled={isJoiningQueue}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isJoiningQueue ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                  Começar Treinamento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Player Stats */}
            {getStatsQuery.data && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Suas Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Kills:</span>
                    <span className="font-bold text-green-400">{getStatsQuery.data.totalKills}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Deaths:</span>
                    <span className="font-bold text-red-400">{getStatsQuery.data.totalDeaths}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>K/D Ratio:</span>
                    <span className="font-bold text-blue-400">{getStatsQuery.data.kdRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitórias:</span>
                    <span className="font-bold text-green-400">{getStatsQuery.data.totalWins}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxa de Vitória:</span>
                    <span className="font-bold text-blue-400">{getStatsQuery.data.winRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Rankings */}
            {getRankingsQuery.data && getRankingsQuery.data.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top 10 Jogadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getRankingsQuery.data.slice(0, 5).map((ranking, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold w-6">{idx + 1}.</span>
                          <span className="text-slate-300">{ranking.user.name}</span>
                        </div>
                        <span className="text-blue-400 font-bold">{ranking.stats.kdRatio.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
