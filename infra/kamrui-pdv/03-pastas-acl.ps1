# Etapa 3 - Estrutura de pastas e permissao de escrita do grupo Users onde o PDV grava.
. "$PSScriptRoot\comum.ps1"
Assert-Admin

$pastas = @(
    'C:\Titan_PDV',
    'C:\Hortii\Operacao_PDV',
    'C:\Hortii\Backups_PDV',
    'C:\Hortii\Logs_Agente',
    'C:\Hortii\Setup'
)
foreach ($p in $pastas) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
Write-Log ('Pastas garantidas: ' + ($pastas -join ', '))

foreach ($p in 'C:\Titan_PDV', 'C:\Hortii\Backups_PDV') {
    icacls $p /grant '*S-1-5-32-545:(OI)(CI)M' | Out-Null
    Write-Log "Users com Modificar em $p"
}

$mapa = 'C:\Hortii\Operacao_PDV\mapa-teclado.csv'
if (-not (Test-Path $mapa)) {
    'tecla;produto;codigo_titan;observacao' | Set-Content -Path $mapa -Encoding UTF8
    Write-Log "Modelo do mapa do teclado criado em $mapa"
}

$od = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('MyDocuments')) | Where-Object { $_ -match 'OneDrive' }
if ($od) { Write-Log ('ATENCAO: pastas do usuario atual dentro do OneDrive: ' + ($od -join ', ')) }

Write-Log 'Etapa 3 concluida.'
