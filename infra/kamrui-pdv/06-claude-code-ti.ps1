# Etapa 6 - Claude Code CLI no perfil do TI_Admin (rodar logado como TI_Admin, ex.: via ssh kamrui).
. "$PSScriptRoot\comum.ps1"

if ($env:USERNAME -ne 'TI_Admin') { throw "Rode como TI_Admin (usuario atual: $env:USERNAME)." }
if (-not (Get-Command git -ErrorAction SilentlyContinue) -and -not (Test-Path 'C:\Program Files\Git\cmd\git.exe')) {
    throw 'Git nao encontrado. Rode a etapa 01 antes.'
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    Write-Log 'Claude Code instalado no perfil do TI_Admin.'
} else { Write-Log 'Claude Code ja instalado.' }

Copy-Item -Path "$PSScriptRoot\CLAUDE.md" -Destination 'C:\Hortii\CLAUDE.md' -Force
Write-Log 'Regras do agente copiadas para C:\Hortii\CLAUDE.md. Para usar: cd C:\Hortii ; claude'
