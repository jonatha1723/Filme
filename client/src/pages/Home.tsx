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
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-6 h-6" />
                Selecione um Modo
              </h2>

              {/* 1v1 Mode */}
              <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer"
                onClick={() => setSelectedMode("1v1")}>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-400">1v1 Duelo</CardTitle>
                  <CardDescription className="text-slate-400">
                    Combate direto entre dois jogadores
                  </CardDescription>
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
                    {isJoiningQueue ? <Loader2 className="animate-spin mr-2" /> : null}
                    Entrar na Fila
                  </Button>
                </CardContent>
              </Card>

              {/* 3v3 Mode */}
              <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer"
                onClick={() => setSelectedMode("3v3")}>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    3v3 Equipes
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Batalha em equipes de três jogadores
                  </CardDescription>
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
                    {isJoiningQueue ? <Loader2 className="animate-spin mr-2" /> : null}
                    Entrar na Fila
                  </Button>
                </CardContent>
              </Card>

              {/* Training Mode */}
              <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer"
                onClick={() => setSelectedMode("training")}>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                    <Crosshair className="w-5 h-5" />
                    Treinamento
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Pratique suas habilidades sozinho
                  </CardDescription>
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
                    {isJoiningQueue ? <Loader2 className="animate-spin mr-2" /> : null}
                    Começar Treinamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Suas Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getStatsQuery.isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                ) : getStatsQuery.data ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Kills:</span>
                      <span className="text-green-400 font-bold">{getStatsQuery.data.totalKills}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Deaths:</span>
                      <span className="text-red-400 font-bold">{getStatsQuery.data.totalDeaths}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">K/D Ratio:</span>
                      <span className="text-blue-400 font-bold">{getStatsQuery.data.kdRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Vitórias:</span>
                      <span className="text-yellow-400 font-bold">{getStatsQuery.data.totalWins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Taxa de Vitória:</span>
                      <span className="text-yellow-400 font-bold">{(getStatsQuery.data.winRate * 100).toFixed(1)}%</span>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Top 10 Rankings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">Top 10 Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                {getRankingsQuery.isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                ) : getRankingsQuery.data && getRankingsQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {getRankingsQuery.data.map((player, index) => (
                      <div key={player.userId} className="flex justify-between text-sm">
                        <span className="text-slate-400">#{index + 1} {player.name}</span>
                        <span className="text-blue-400 font-bold">{player.kdRatio.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Nenhum jogador ainda</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
