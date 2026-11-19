# Etapa 5 - Titan abrindo no login do Caixa_01 e teclado virtual sempre disponivel.
param([Parameter(Mandatory)][string]$TitanExe)
. "$PSScriptRoot\comum.ps1"
Assert-Admin

if (-not (Test-Path $TitanExe)) { throw "Executavel do Titan nao encontrado: $TitanExe" }

$startup = Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs\StartUp'
$lnk = Join-Path $startup 'PDV Titan.lnk'
$sh = New-Object -ComObject WScript.Shell
$s = $sh.CreateShortcut($lnk)
$s.TargetPath = $TitanExe
$s.WorkingDirectory = Split-Path $TitanExe
$s.Save()
Write-Log "Atalho de inicializacao do PDV criado: $lnk -> $TitanExe"

# TouchKeyboardTapInvoke: 2 = sempre mostrar o teclado virtual ao tocar num campo.
$hive = 'C:\Users\Caixa_01\NTUSER.DAT'
if (Test-Path $hive) {
    reg load 'HKU\Caixa01Tmp' $hive | Out-Null
    try {
        Set-RegValue -Path 'Registry::HKEY_USERS\Caixa01Tmp\Software\Microsoft\TabletTip\1.7' -Name 'TouchKeyboardTapInvoke' -Value 2
        Write-Log 'Teclado virtual automatico ativado para Caixa_01.'
    } finally {
        [gc]::Collect()
        reg unload 'HKU\Caixa01Tmp' | Out-Null
    }
} else {
    Write-Log 'Perfil do Caixa_01 ainda nao existe (precisa de 1 login). Rodar esta etapa de novo depois.'
}

Write-Log 'Etapa 5 concluida.'
