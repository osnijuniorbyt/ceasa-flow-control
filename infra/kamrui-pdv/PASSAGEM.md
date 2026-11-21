# Passagem de contexto — PDV Kamrui (Hortii Campos)

Documento para continuar este trabalho em outra conta ou sessão do Claude. Leia tudo antes de agir.

## Objetivo
Transformar o Mini PC Kamrui (Windows 11 Pro) no **PDV de teste do Titan** da Hortii Campos. O Claude faz todo o TI, e o Osni acessa de fora. O Osni **não executa comandos**: o Claude executa e o Osni só aprova links e digita senhas na tela do Kamrui.

Referências no Drive: "Especificação e Plano de Setup PDV Kamrui (Claude Code) — Hortii Campos" (V1, Titan) e "... V2" (DeSoft, AnyDesk, Antifraude). **O alvo atual é o Titan.**

## Decisões tomadas
- **Usuários:** `TI_Admin` (administrador local) e `Caixa_01` (padrão, sem senha, auto-logon direto no Titan).
- **Conta Microsoft:** o Windows foi resetado e está com uma conta Microsoft da empresa (admin). Ela será removida depois que o TI_Admin estiver validado.
- **Acesso de fora (permanente):** AnyDesk como serviço (sem supervisão), Tailscale (`kamrui`) e OpenSSH Server (só chave, porta 22 só pela faixa `100.64.0.0/10`).
- **Claude no Kamrui:** Claude Desktop com Remote Control (pasta `C:\Hortii`) para o Claude executar a partir da nuvem. Claude Code CLI no TI_Admin como caminho que sobrevive a reinícios (`ssh kamrui` e depois `claude`).
- **Blindagem 24/7:** energia nunca desliga, USB/HID sem economia de energia, sem escurecer ou apagar a tela (a **tela touch está apagando** e isso é prioridade), Windows Update com horário ativo 06h–23h e sem reinício automático, OneDrive desativado.
- **Periféricos:** balança Prix, leitor de código de barras, impressora térmica, tela touch, **teclado programável Smart 44 teclas** (desenho de um item por tecla; cada tecla manda o código do produto no Titan + Enter) e teclado virtual.
- **Hardware:** a RAM será ampliada depois.

## Estado atual
- Scripts prontos e com sintaxe validada em `infra/kamrui-pdv/` (ordem e uso no `README.md`; regras do agente no `CLAUDE.md`).
- **Ainda nada foi executado no Kamrui.** Falta o passo único do Osni: instalar o Claude Desktop, abrir como administrador, ligar o Remote Control com a pasta `C:\Hortii` e aprovar a conexão. Esse passo pode ser feito pelo AnyDesk, de fora.
- Ordem de execução: `04-blindagem` (corrige a tela touch) → `01-acessos` → `02-usuarios` → `03-pastas-acl` → `06-claude-code-ti` (como TI_Admin) → `02-usuarios -AtivarAutoLogon` → `05-pdv-teclados` → `verificar`.

## Antifraude (Sentinela): validação feita
A direção está certa (gravar tela e câmera como prova). Correções obrigatórias antes de implantar:
1. **Gatilho:** ler o cancelamento direto do banco ou log local do Titan (operador, horário, item, valor), não da tela.
2. **Gravação contínua em ciclo** (segmentos de 5 min, guarda de 7 a 30 dias). Os eventos (cancelamento, desconto, gaveta sem venda, sangria) só marcam e recortam. Gravar só no cancelamento perde a venda não registrada.
3. **Proteção contra sabotagem:** a gravação de tela roda na sessão do Caixa_01, com um vigia do sistema que religa e registra lacunas. Pasta de evidências onde o caixa grava mas não apaga, com hash SHA-256 por trecho e cópia fora da máquina.
4. **Desempenho:** codificação por hardware (AMD `h264_amf`), tela a 2–5 fps, rotação automática de arquivos.
5. **LGPD e trabalhista:** termo assinado pelo funcionário, placa para clientes, sem áudio, câmera só na área do caixa.
- Preferir a câmera do DVR da loja (se existir), com relógio sincronizado por NTP entre Titan, Kamrui e DVR.

## Sentinela v2: decisões posteriores (21/11)
O plano completo, em formato de mapa axial OPE, está em **`PLANO-MESTRE.md`**. O roteiro para os fornecedores está em `fornecedores-antifraude.md`.
- A pesagem é sempre no caixa (balança de checkout embutida). A loja **não tem câmeras**.
- **Câmera da balança:** Raspberry Pi AI Camera (Sony IMX500) + Raspberry Pi 5, ligada ao Kamrui por rede. No piloto ela manda fotos para a IA da nuvem. Depois, roda o modelo treinado dentro da câmera.
- **Gatilho:** o teclado em tempo real (tecla Smart, PLU+Enter, nome, leitor, cancelar), com memória de 5 s. Ignora campos de senha e não guarda a digitação.
- **Regras:** certeza mínima e prejuízo (item cobrado mais barato que o visto). Aviso na tela para erro honesto. Alerta silencioso ao gerente para fraude.
- **CFTV:** Hikvision profissional com PoE (dome AcuSense no teto do caixa + gravador série I com POS). Mapa de calor, contagem e depósito na fase de escala.
- **Áudio desligado em todas as câmeras.** Reconhecimento facial desligado.

## Pendências e perguntas em aberto
- Qual banco de dados o Titan PDV usa localmente? (descobrir no Kamrui ou com o suporte Titan)
- Remote Control liberado na conta escolhida para ser o TI.
- Modelo da gaveta Elgin (de tampa para cima) e se ela tem sensor.
- Modelo e software do fabricante do teclado Smart 44 teclas.
- Lista de acesso do AnyDesk (só o ID do Osni) e 2FA.
- A senha do TI_Admin aparece em texto no documento V2 do Drive: usar uma senha **nova** e apagar a antiga do documento.

## Regras invioláveis
pt-BR. Nunca apagar arquivos de usuário. Backup antes de mexer no banco do PDV. **Não reiniciar nem parar o PDV entre 06h e 23h** sem o OK do Osni. Senhas nunca em arquivo, log ou chat.

## Primeira mensagem sugerida na outra conta
> Leia `infra/kamrui-pdv/PASSAGEM.md`, `README.md` e `CLAUDE.md` da branch `claude/check-environment-L9VTx` do repositório `osnijuniorbyt/ceasa-flow-control` (PR #2). Continue o setup do PDV Kamrui a partir das pendências. Eu não executo comandos: você executa e me pede só aprovações e senhas na tela.
