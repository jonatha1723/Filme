import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Gamepad2, LogOut, Trophy, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface GameRoom {
  id: number;
  name: string;
  mode: "1v1" | "3v3" | "training";
  playersCount: number;
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  createdAt: string;
}

export default function GameRooms() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"all" | "1v1" | "3v3" | "training">("all");

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/login");
    },
  });

  useEffect(() => {
    // Simular carregamento de salas
    const mockRooms: GameRoom[] = [
      {
        id: 1,
        name: "Duelo Rápido #1",
        mode: "1v1",
        playersCount: 1,
        maxPlayers: 2,
        status: "waiting",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Equipe Épica",
        mode: "3v3",
        playersCount: 4,
        maxPlayers: 6,
        status: "playing",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Treino Intensivo",
        mode: "training",
        playersCount: 1,
        maxPlayers: 1,
        status: "playing",
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: "Arena Aberta",
        mode: "1v1",
        playersCount: 2,
        maxPlayers: 2,
        status: "playing",
        createdAt: new Date().toISOString(),
      },
      {
        id: 5,
        name: "Batalha de Equipes",
        mode: "3v3",
        playersCount: 2,
        maxPlayers: 6,
        status: "waiting",
        createdAt: new Date().toISOString(),
      },
    ];

    setRooms(mockRooms);
    setLoading(false);
  }, []);

  const filteredRooms = rooms.filter(
    (room) => selectedMode === "all" || room.mode === selectedMode
  );

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "1v1":
        return "Duelo";
      case "3v3":
        return "Equipes";
      case "training":
        return "Treinamento";
      default:
        return mode;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "playing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "finished":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "waiting":
        return "Aguardando";
      case "playing":
        return "Em Jogo";
      case "finished":
        return "Finalizado";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-2">DOUBLE</h1>
            <p className="text-slate-400">Bem-vindo, {user?.name}!</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
              onClick={() => navigate("/profile")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Kills</p>
                <p className="text-3xl font-bold text-green-400">1,234</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Deaths</p>
                <p className="text-3xl font-bold text-red-400">567</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">K/D Ratio</p>
                <p className="text-3xl font-bold text-blue-400">2.17</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Vitórias</p>
                <p className="text-3xl font-bold text-yellow-400">89</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mode Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-blue-400" />
            Salas Disponíveis
          </h2>
          <div className="flex gap-3 flex-wrap">
            {["all", "1v1", "3v3", "training"].map((mode) => (
              <Button
                key={mode}
                variant={selectedMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMode(mode as any)}
                className={
                  selectedMode === mode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-slate-700 hover:bg-slate-800"
                }
              >
                {mode === "all" ? "Todas" : getModeLabel(mode)}
              </Button>
            ))}
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer hover:shadow-lg hover:shadow-blue-500/20"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-white">
                        {room.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {getModeLabel(room.mode)}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        room.status
                      )}`}
                    >
                      {getStatusLabel(room.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Players */}
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      {room.playersCount}/{room.maxPlayers} Jogadores
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(room.playersCount / room.maxPlayers) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {/* Join Button */}
                  <Button
                    onClick={() => navigate(`/game/${room.id}`)}
                    disabled={room.status === "finished"}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold"
                  >
                    {room.status === "finished"
                      ? "Finalizado"
                      : room.status === "playing"
                      ? "Observar"
                      : "Entrar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Nenhuma sala disponível</p>
              <Button
                onClick={() => navigate("/create-room")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Criar Nova Sala
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Room Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
            onClick={() => navigate("/create-room")}
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Criar Nova Sala
          </Button>
        </div>
      </div>
    </div>
  );
}
