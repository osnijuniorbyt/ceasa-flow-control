# Etapa 1 - Acessos permanentes: AnyDesk (servico), Tailscale (unattended), OpenSSH Server, Git.
# Rodar elevado. A senha do AnyDesk e digitada na tela do Kamrui e nunca vai para log.
param(
    [string]$ChavePublicaSsh,
    [switch]$PularAnyDeskSenha
)
. "$PSScriptRoot\comum.ps1"
Assert-Admin
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# --- AnyDesk ---
$adDir = 'C:\Program Files (x86)\AnyDesk'
$adExe = Join-Path $adDir 'AnyDesk.exe'
if (-not (Get-Service -Name 'AnyDesk*' -ErrorAction SilentlyContinue)) {
    $inst = Join-Path $SetupDir 'AnyDesk.exe'
    Invoke-WebRequest -Uri 'https://download.anydesk.com/AnyDesk.exe' -OutFile $inst -UseBasicParsing
    Start-Process -FilePath $inst -ArgumentList "--install `"$adDir`" --start-with-win --create-shortcuts --silent" -Wait
    Write-Log 'AnyDesk instalado como servico.'
} else { Write-Log 'AnyDesk ja instalado.' }

if (-not $PularAnyDeskSenha) {
    $sec = Read-Host 'Digite a senha de acesso sem supervisao do AnyDesk' -AsSecureString
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
    $plain | & $adExe --set-password
    $plain = $null
    Write-Log 'Senha sem supervisao do AnyDesk definida.'
}
$adId = (& $adExe --get-id | Out-String).Trim()
Write-Log "AnyDesk ID deste Kamrui: $adId"

# --- Tailscale ---
$tsExe = 'C:\Program Files\Tailscale\tailscale.exe'
if (-not (Test-Path $tsExe)) {
    $msi = Join-Path $SetupDir 'tailscale.msi'
    Invoke-WebRequest -Uri 'https://pkgs.tailscale.com/stable/tailscale-setup-latest-amd64.msi' -OutFile $msi -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart TS_UNATTENDEDMODE=always" -Wait
    Write-Log 'Tailscale instalado.'
} else { Write-Log 'Tailscale ja instalado.' }
Write-Log 'Iniciando login do Tailscale: abra o link exibido e aprove o dispositivo.'
& $tsExe up --unattended --hostname kamrui

# --- OpenSSH Server ---
$cap = Get-WindowsCapability -Online -Name 'OpenSSH.Server*'
if ($cap.State -ne 'Installed') { Add-WindowsCapability -Online -Name $cap.Name | Out-Null; Write-Log 'OpenSSH Server instalado.' }
Set-Service -Name sshd -StartupType Automatic
Start-Service sshd
Set-RegValue -Path 'HKLM:\SOFTWARE\OpenSSH' -Name 'DefaultShell' -Value 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -Type String

$fw = Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue
if (-not $fw) {
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow | Out-Null
}
Set-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -RemoteAddress '100.64.0.0/10' -Enabled True
Write-Log 'Porta 22 liberada apenas para a faixa do Tailscale (100.64.0.0/10).'

if ($ChavePublicaSsh) {
    $ak = 'C:\ProgramData\ssh\administrators_authorized_keys'
    if (-not ((Test-Path $ak) -and (Select-String -Path $ak -SimpleMatch $ChavePublicaSsh -Quiet))) {
        Add-Content -Path $ak -Value $ChavePublicaSsh -Encoding ASCII
    }
    icacls $ak /inheritance:r /grant '*S-1-5-32-544:F' /grant '*S-1-5-18:F' | Out-Null

    # Substitui a linha existente: anexar no fim cairia dentro do bloco "Match Group administrators".
    $cfg = 'C:\ProgramData\ssh\sshd_config'
    $txt = Get-Content $cfg -Raw
    if ($txt -match '(?m)^#?\s*PasswordAuthentication\s+\w+') {
        $txt = $txt -replace '(?m)^#?\s*PasswordAuthentication\s+\w+', 'PasswordAuthentication no'
    } else {
        $txt = "PasswordAuthentication no`r`n" + $txt
    }
    Set-Content -Path $cfg -Value $txt -Encoding ASCII
    Restart-Service sshd
    Write-Log 'SSH: chave publica instalada e login por senha desativado.'
} else {
    Write-Log 'SSH: sem chave publica informada; login por senha mantido (apenas via Tailscale).'
}

# --- Git (pre-requisito do Claude Code no Windows) ---
if (-not (Get-Command git -ErrorAction SilentlyContinue) -and -not (Test-Path 'C:\Program Files\Git\cmd\git.exe')) {
    winget install --id Git.Git -e --silent --scope machine --accept-package-agreements --accept-source-agreements
    Write-Log 'Git para Windows instalado.'
} else { Write-Log 'Git ja instalado.' }

Write-Log 'Etapa 1 concluida.'
