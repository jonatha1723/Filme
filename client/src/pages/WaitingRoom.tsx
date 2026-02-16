import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

type GameMode = "1v1" | "3v3" | "training";

interface WaitingRoomProps {
  mode: GameMode;
}

export default function WaitingRoom({ mode }: WaitingRoomProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [waitTime, setWaitTime] = useState(0);

  const getQueueStatusQuery = trpc.game.getQueueStatus.useQuery(
    { mode },
    { refetchInterval: 2000 }
  );

  const leaveQueueMutation = trpc.game.leaveQueue.useMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLeaveQueue = async () => {
    try {
      await leaveQueueMutation.mutateAsync();
      navigate("/lobby");
    } catch (error) {
      console.error('Error leaving queue:', error);
      navigate("/lobby");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case "1v1":
        return "Duelo 1v1";
      case "3v3":
        return "Equipes 3v3";
      case "training":
        return "Treinamento";
      default:
        return mode;
    }
  };

  // Check if match is found and redirect
  useEffect(() => {
    if (getQueueStatusQuery.data?.matchFound) {
      setTimeout(() => {
        navigate(`/game?mode=${mode}`);
      }, 2000);
    }
  }, [getQueueStatusQuery.data?.matchFound, mode, navigate]);

  const requiredPlayers = mode === '1v1' ? 2 : mode === '3v3' ? 6 : 1;
  const currentPlayers = getQueueStatusQuery.data?.playersWaiting || 1;
  const progressPercentage = (currentPlayers / requiredPlayers) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="max-w-2xl w-full space-y-4 relative z-10">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={handleLeaveQueue}
          className="text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Main Card */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Aguardando Oponentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Info */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Modo</p>
              <p className="text-2xl font-bold text-blue-400">{getModeLabel()}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">{currentPlayers}/{requiredPlayers} Jogadores</span>
                <span className="text-slate-400 text-sm">{formatTime(waitTime)}</span>
              </div>
              <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Queue Status */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">Jogadores na fila</p>
                <p className="text-3xl font-bold text-green-400">
                  {getQueueStatusQuery.data?.playersWaiting || 0}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">Tempo de espera</p>
                <p className="text-2xl font-bold text-yellow-400">{formatTime(waitTime)}</p>
              </div>

              {getQueueStatusQuery.data?.estimatedWaitTime && (
                <div className="text-center space-y-2 border-t border-slate-600 pt-3">
                  <p className="text-slate-400 text-xs">Tempo estimado</p>
                  <p className="text-sm text-slate-300">
                    ~{getQueueStatusQuery.data.estimatedWaitTime} segundos
                  </p>
                </div>
              )}
            </div>

            {/* Your Info */}
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">Você está jogando como</p>
              <p className="text-white font-semibold">{user?.name}</p>
            </div>

            {/* Leave Button */}
            <Button
              onClick={handleLeaveQueue}
              variant="destructive"
              className="w-full"
            >
              Sair da Fila
            </Button>

            {/* Tips */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                💡 Dica: Você será notificado quando uma partida for encontrada. Mantenha esta aba aberta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
