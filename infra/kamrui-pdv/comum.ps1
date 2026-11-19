$ErrorActionPreference = 'Stop'

$HortiiRoot = 'C:\Hortii'
$LogDir     = Join-Path $HortiiRoot 'Logs_Agente'
$SetupDir   = Join-Path $HortiiRoot 'Setup'
New-Item -ItemType Directory -Force -Path $LogDir, $SetupDir | Out-Null

function Write-Log {
    param([string]$Msg)
    $line = '{0:yyyy-MM-dd HH:mm:ss} [{1}] {2}' -f (Get-Date), $env:USERNAME, $Msg
    Write-Host $line
    Add-Content -Path (Join-Path $LogDir 'setup.log') -Value $line -Encoding UTF8
}

function Assert-Admin {
    $p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Sessao sem elevacao. Abra o Claude/PowerShell com "Executar como administrador".'
    }
}

function Set-RegValue {
    param([string]$Path, [string]$Name, $Value, [string]$Type = 'DWord')
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType $Type -Force | Out-Null
}

# Bloqueia reinicio/parada do PDV no horario da loja, salvo confirmacao explicita.
function Assert-ForaDoExpediente {
    param([switch]$Confirmado)
    $h = (Get-Date).Hour
    if ($h -ge 6 -and $h -lt 23 -and -not $Confirmado) {
        throw 'Horario de loja (06h-23h): use -Confirmado apenas com autorizacao do Osni.'
    }
}
