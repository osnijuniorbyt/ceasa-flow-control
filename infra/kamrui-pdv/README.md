# Kamrui PDV — setup do terminal de caixa (Titan)

Scripts PowerShell que deixam o Mini PC Kamrui (Windows 11 Pro) pronto como PDV Offline Titan, com acesso remoto permanente e o Claude como agente de TI.

## Passo único do Osni (uma vez, no Kamrui)
1. Instalar o **Claude Desktop** (claude.ai/download) e entrar com a conta Claude.
2. Abrir o Claude Desktop com **botão direito → Executar como administrador**.
3. **Settings → Claude Code → Remote Control**: ligar e adicionar a pasta `C:\Hortii` (crie a pasta vazia se precisar).
4. Avisar o Claude na conversa e tocar em **Permitir** quando aparecer o pedido de conexão.

Daqui em diante o Claude executa tudo. Cliques que só você pode dar, e o Claude avisa na hora:
- aprovar o link de login do Tailscale;
- digitar as senhas (TI_Admin e AnyDesk) na tela do Kamrui;
- instaladores com janela (Titan, software do teclado Smart), se não houver modo silencioso.

## Ordem de execução (o Claude roda, em sessão elevada)
| Script | O que faz |
|---|---|
| `01-acessos.ps1 [-ChavePublicaSsh "ssh-ed25519 ..."]` | AnyDesk como serviço + senha sem supervisão, Tailscale (`kamrui`), OpenSSH Server (só chave e só pelo Tailscale), Git |
| `02-usuarios.ps1` | Cria `TI_Admin` (admin) e `Caixa_01` (padrão, sem senha) |
| `03-pastas-acl.ps1` | `C:\Titan_PDV`, `C:\Hortii\...` e permissão de escrita para Users |
| `04-blindagem.ps1` | Energia, USB/HID, Windows Update 06h–23h, OneDrive desativado |
| `06-claude-code-ti.ps1` | Claude Code CLI no perfil do TI_Admin (rodar **como TI_Admin**, ex.: `ssh kamrui`) |
| `02-usuarios.ps1 -AtivarAutoLogon` | Liga o auto-logon do Caixa_01 (só depois de o TI_Admin estar validado) |
| `05-pdv-teclados.ps1 -TitanExe "C:\Titan_PDV\...exe"` | Titan abre no login do Caixa_01 + teclado virtual automático |
| `verificar.ps1` | Checklist OK/FALHA + relatório em `C:\Hortii\Logs_Agente\` |

## Acesso depois de pronto
- **SSH (sempre disponível, mesmo depois de reiniciar):** `ssh TI_Admin@kamrui` (pelo Tailscale). Depois `cd C:\Hortii; claude`.
- **AnyDesk:** acesso visual sem supervisão (tela do PDV, touch, instaladores).
- **Remote Control:** volta quando o TI_Admin estiver logado. Faça isso pelo AnyDesk com "Trocar usuário", sem deslogar o caixa.

## Pendências
- Modelo e software do fabricante do teclado Smart 44 teclas → preencher `mapa-teclado.csv`.
- Lista de acesso do AnyDesk (só o ID do Osni) e 2FA: configurar na interface do AnyDesk.
- Remover a conta Microsoft do Windows: só depois de o TI_Admin estar validado, e com confirmação.
- Troca de RAM: desligar pelo Iniciar, trocar e rodar `verificar.ps1`.

## Plano B (se o Remote Control não estiver liberado na conta)
No Kamrui, abra o **PowerShell como administrador**, cole o conteúdo da pasta em `C:\Hortii\Setup\` (pela transferência de arquivos do AnyDesk ou por um pendrive) e rode:
```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force; C:\Hortii\Setup\01-acessos.ps1
```
Com o SSH e o Tailscale de pé, o Claude segue pelo `ssh kamrui`.
