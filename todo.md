# Double - FPS 3D Game TODO

## Autenticação e Usuários
- [x] Integrar autenticação Manus OAuth (já incluída no template)
- [ ] Sistema de perfil de jogador com nickname e avatar
- [ ] Persistir dados de sessão do jogador

## Banco de Dados
- [x] Tabela de usuários com estatísticas (kills, deaths, vitórias, derrotas, KD ratio)
- [x] Tabela de partidas (modo, duração, resultado, jogadores participantes)
- [x] Tabela de rankings globais
- [x] Tabela de replays (URL S3, duração, data, jogadores)
- [x] Tabela de armas e configurações de jogo
- [x] Tabela de fila de matchmaking

## Engine 3D e Renderização
- [x] Configurar Three.js com câmera FPS
- [x] Criar sistema de iluminação e sombras
- [ ] Implementar modelos 3D de personagens
- [x] Criar ambientes de mapa (arena para 1v1, arena para 3v3, range de treinamento)
- [x] Sistema de colisão e física básica

## Mecânicas de FPS
- [x] Movimento WASD + Sprint
- [x] Câmera com controle de mouse (pitch/yaw)
- [x] Sistema de mira com crosshair
- [x] Disparo com feedback visual
- [x] Sistema de recarga de armas
- [x] Sistema de vida e dano
- [x] Sistema de munição e inventário
- [ ] Efeitos de impacto (sangue, pó, som)

## Sistema de Armas
- [x] Pistola (dano médio, cadência rápida)
- [x] Rifle (dano alto, cadência lenta, alcance longo)
- [x] Shotgun (dano muito alto, cadência lenta, alcance curto)
- [x] Metralhadora (dano baixo, cadência muito rápida)
- [x] Faca/Melee (dano alto, sem munição)
- [x] Sniper (dano muito alto, cadência lenta, alcance muito longo)

## Lobby e UI
- [x] Tela de login com Manus OAuth
- [ ] Tela de seleção de nickname
- [x] Menu principal com opções de modo de jogo
- [x] Sala de espera (waiting room) para matchmaking
- [x] Seleção de modo: 1v1, 3v3, Treinamento
- [x] Contador de jogadores aguardando
- [ ] Chat de lobby

## Matchmaking e Multiplayer
- [x] Sistema de fila de espera por modo
- [x] Emparelhamento automático de jogadores
- [x] Sincronização de posição de jogadores em tempo real
- [x] Sincronização de rotação (câmera)
- [x] Sincronização de disparos
- [x] Sincronização de danos
- [ ] Sincronização de morte
- [ ] Sistema de latência e interpolação

## Modo 1v1
- [ ] Mapa arena para dois jogadores
- [ ] Lógica de vitória (primeiro a 10 kills ou tempo limite)
- [ ] Respawn automático após morte
- [ ] Placar em tempo real

## Modo 3v3
- [ ] Mapa arena para seis jogadores
- [ ] Sistema de times (Equipe A vs Equipe B)
- [ ] Lógica de vitória (primeiro time a 20 kills ou tempo limite)
- [ ] Respawn com delay por time
- [ ] Placar de equipes em tempo real

## Modo Treinamento
- [ ] Ambiente solo sem inimigos
- [ ] Alvos estáticos para praticar mira
- [ ] Alvos móveis para praticar tracking
- [ ] Contador de acertos/erros
- [ ] Sem limite de tempo

## HUD (Head-Up Display)
- [x] Crosshair no centro da tela
- [x] Barra de vida
- [x] Indicador de munição
- [ ] Minimapa com posições de jogadores
- [x] Placar (kills, deaths, assists)
- [x] Timer de partida
- [ ] Indicador de arma atual
- [ ] Notificações de kills/deaths em tempo real

## Sistema de Replays
- [x] Gravar dados de partida (posições, disparos, danos)
- [x] Fazer upload de replay para S3
- [ ] Listar replays do jogador
- [ ] Reproduzir replay com câmera automática
- [ ] Compartilhar link de replay

## Estatísticas e Rankings
- [x] Salvar kills, deaths, vitórias, derrotas no banco
- [x] Calcular KD ratio
- [x] Tabela de rankings globais
- [ ] Estatísticas por modo de jogo
- [ ] Histórico de últimas partidas

## Notificações
- [x] Notificar dono quando partida inicia
- [x] Notificar dono quando partida termina
- [x] Notificar dono sobre problemas de conexão
- [x] Notificar dono sobre erros do servidor

## Testes e Otimizações
- [ ] Testar multiplayer com múltiplos clientes
- [ ] Otimizar renderização 3D
- [ ] Testar sincronização de rede
- [ ] Testar em diferentes navegadores
- [ ] Testes de performance
- [ ] Testes de latência alta

## Melhorias Solicitadas
- [x] Entrada automática no modo Treinamento (sem fila)
- [x] Melhorar física e colisões
- [x] Adicionar feedback visual melhorado
- [x] Otimizar performance do jogo
- [x] Exportar para GitHub

## Deployment
- [ ] Configurar variáveis de ambiente
- [ ] Testar em produção
- [ ] Documentar como jogar
