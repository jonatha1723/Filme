# Double - FPS 3D Game 🎮

Um jogo FPS 3D multiplayer em tempo real baseado em navegador, desenvolvido com React, Three.js, Supabase e tRPC.

## Características

### 🎯 Modos de Jogo
- **1v1 Duelo** - Combate direto entre dois jogadores. Primeiro a 10 kills vence.
- **3v3 Equipes** - Batalha em equipes de três jogadores. Primeiro time a 20 kills vence.
- **Treinamento** - Modo solo com entrada automática. Pratique suas habilidades sem pressão.

### 🎲 Mecânicas de FPS
- **Movimento** - WASD para movimento, Sprint com Shift
- **Câmera** - Controle total com mouse (pitch/yaw)
- **Mira** - Crosshair dinâmico no centro da tela
- **Disparo** - Clique esquerdo para disparar
- **Recarga** - Pressione R para recarregar

### 🔫 Sistema de Armas
1. **Rifle Assault** - Arma balanceada com bom dano e cadência
2. **Pistola 9mm** - Arma leve e rápida, ideal para iniciantes
3. **Shotgun** - Dano muito alto em curta distância
4. **Metralhadora** - Cadência muito rápida, ideal para spray
5. **Sniper** - Dano extremo, alcance máximo, cadência lenta
6. **Faca** - Arma melee, sem munição, dano alto

### 📊 Estatísticas e Rankings
- Rastreamento de kills, deaths e vitórias
- Cálculo automático de K/D ratio
- Rankings globais em tempo real
- Histórico de partidas

### 🎬 Sistema de Replays
- Gravação automática de partidas
- Upload para S3
- Reprodução com câmera automática
- Compartilhamento de links

### 🔔 Notificações
- Notificações ao dono quando partidas iniciam/terminam
- Alertas de problemas de conexão
- Relatórios de erros do servidor

## Tecnologias

- **Frontend**: React 19, Three.js, Tailwind CSS, Shadcn/UI
- **Backend**: Express, tRPC, Drizzle ORM
- **Banco de Dados**: MySQL/TiDB
- **Multiplayer**: Supabase Realtime
- **Storage**: AWS S3
- **Autenticação**: Manus OAuth

## Instalação e Execução

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Executar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

### Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

## Como Jogar

### 1. Login
- Clique em "Entrar" e autentique com sua conta Manus

### 2. Selecionar Modo
- **1v1**: Espere por um oponente na fila
- **3v3**: Espere por 5 outros jogadores na fila
- **Treinamento**: Entrada automática, comece imediatamente

### 3. Arena
- Use **WASD** para se mover
- Use **Mouse** para olhar ao redor
- **Clique esquerdo** para disparar
- **R** para recarregar
- **Shift** para correr
- **Espaço** para pular
- **ESC** para sair

### 4. Objetivo
- Acumule kills para vencer
- Evite morrer
- Trabalhe em equipe no modo 3v3
- Mire bem e controle o recoil

## Estrutura do Projeto

```
double-fps-game/
├── client/
│   ├── src/
│   │   ├── pages/          # Páginas (Home, GameArena, WaitingRoom)
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/          # Hooks customizados (useGameInput)
│   │   ├── lib/            # Lógica do jogo (GameEngine, WeaponSystem)
│   │   ├── App.tsx         # Roteador principal
│   │   └── main.tsx        # Entry point
│   └── public/             # Assets estáticos
├── server/
│   ├── db.ts               # Funções de banco de dados
│   ├── routers.ts          # Procedimentos tRPC
│   ├── matchmaking.ts      # Serviço de matchmaking
│   ├── replay.ts           # Sistema de replays
│   └── _core/              # Infraestrutura (OAuth, context, etc)
├── drizzle/
│   └── schema.ts           # Esquema do banco de dados
└── shared/                 # Código compartilhado

```

## Banco de Dados

### Tabelas Principais

- **users** - Informações de usuários
- **playerStats** - Estatísticas de jogadores (kills, deaths, vitórias)
- **matches** - Informações de partidas
- **matchPlayers** - Relação entre jogadores e partidas
- **replays** - Metadados de replays
- **gameQueue** - Fila de matchmaking

## API tRPC

### Game Router
- `game.getStats()` - Obter estatísticas do jogador
- `game.getRankings()` - Obter rankings globais
- `game.joinQueue()` - Entrar na fila ou modo treinamento
- `game.leaveQueue()` - Sair da fila
- `game.getQueueStatus()` - Verificar status da fila

### Match Router
- `match.create()` - Criar nova partida
- `match.start()` - Iniciar partida
- `match.end()` - Finalizar partida
- `match.updatePlayerStats()` - Atualizar estatísticas do jogador

### Replay Router
- `replay.getUserReplays()` - Obter replays do usuário

## Performance

- Renderização otimizada com Three.js
- Sincronização multiplayer com interpolação
- Culling de objetos fora de vista
- Compressão de dados de rede
- Cache de assets

## Roadmap

- [ ] Mais mapas
- [ ] Customização de personagens
- [ ] Sistema de clãs/equipes
- [ ] Modo battle royale
- [ ] Compras na loja
- [ ] Sistema de ranking competitivo
- [ ] Replay automático de highlights
- [ ] Chat de voz integrado

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, entre em contato através do [formulário de feedback](https://help.manus.im).

## Créditos

Desenvolvido com ❤️ usando Manus, React, Three.js e Supabase.

---

**Divirta-se jogando Double! 🎮🔫**
