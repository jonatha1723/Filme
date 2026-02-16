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
    await leaveQueueMutation.mutateAsync();
    navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
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
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Aguardando Oponentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Info */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Modo</p>
              <p className="text-2xl font-bold text-blue-400">{getModeLabel()}</p>
            </div>

            {/* Queue Status */}
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
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
