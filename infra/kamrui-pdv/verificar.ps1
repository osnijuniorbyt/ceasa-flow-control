# Confere o estado do Kamrui e grava relatorio em C:\Hortii\Logs_Agente\relatorio-setup-kamrui.md
. "$PSScriptRoot\comum.ps1"
$ErrorActionPreference = 'Continue'

$res = New-Object System.Collections.Generic.List[object]
function Check { param([string]$Item, [scriptblock]$Test)
    try { $ok = [bool](& $Test) } catch { $ok = $false }
    $res.Add([pscustomobject]@{ Item = $Item; Status = $(if ($ok) { 'OK' } else { 'FALHA' }) })
}
function Members($sid) { Get-LocalGroupMember -SID $sid | ForEach-Object { $_.Name.Split('\')[-1] } }
function RegVal($path, $name) { (Get-ItemProperty -Path $path -Name $name -ErrorAction Stop).$name }

Check 'Servico sshd automatico e rodando' { $s = Get-Service sshd; $s.Status -eq 'Running' -and $s.StartType -eq 'Automatic' }
Check 'Servico AnyDesk rodando' { (Get-Service 'AnyDesk*' | Where-Object Status -eq 'Running') }
Check 'Servico Tailscale rodando' { (Get-Service Tailscale).Status -eq 'Running' }
Check 'Tailscale conectado' { (& 'C:\Program Files\Tailscale\tailscale.exe' status --json | ConvertFrom-Json).BackendState -eq 'Running' }
Check 'Firewall SSH restrito ao Tailscale' { (Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' | Get-NetFirewallAddressFilter).RemoteAddress -contains '100.64.0.0/255.192.0.0' -or (Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' | Get-NetFirewallAddressFilter).RemoteAddress -contains '100.64.0.0/10' }
Check 'TI_Admin em Administradores' { (Members 'S-1-5-32-544') -contains 'TI_Admin' }
Check 'Caixa_01 existe e fora de Administradores' { (Get-LocalUser Caixa_01) -and ((Members 'S-1-5-32-544') -notcontains 'Caixa_01') }
Check 'Auto-logon apontando para Caixa_01' { $wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'; (RegVal $wl AutoAdminLogon) -eq '1' -and (RegVal $wl DefaultUserName) -eq 'Caixa_01' }
Check 'Pastas C:\Titan_PDV e C:\Hortii' { (Test-Path 'C:\Titan_PDV') -and (Test-Path 'C:\Hortii\Backups_PDV') -and (Test-Path 'C:\Hortii\Operacao_PDV') }
Check 'Users com Modificar em C:\Titan_PDV' { (icacls 'C:\Titan_PDV' | Out-String) -match '(BUILTIN\\Users|BUILTIN\\Usu.rios):\(OI\)\(CI\)\(M\)' }
Check 'Hibernacao desligada' { -not (Test-Path 'C:\hiberfil.sys') }
Check 'Suspensao seletiva USB desligada' { (powercfg /q SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 | Out-String) -match '(?s)AC.*?0x00000000' }
Check 'Tela nunca desliga' { (powercfg /q SCHEME_CURRENT SUB_VIDEO VIDEOIDLE | Out-String) -match '(?s)AC.*?0x00000000' }
Check 'Suspensao nunca' { (powercfg /q SCHEME_CURRENT SUB_SLEEP STANDBYIDLE | Out-String) -match '(?s)AC.*?0x00000000' }
Check 'Windows Update horario ativo 06-23' { $p = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate'; (RegVal $p ActiveHoursStart) -eq 6 -and (RegVal $p ActiveHoursEnd) -eq 23 }
Check 'Sem reinicio automatico com usuario logado' { (RegVal 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU' NoAutoRebootWithLoggedOnUsers) -eq 1 }
Check 'OneDrive desativado por politica' { (RegVal 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\OneDrive' DisableFileSyncNGSC) -eq 1 }
Check 'Atalho do PDV na inicializacao' { Test-Path (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs\StartUp\PDV Titan.lnk') }

$ips = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { "$($_.InterfaceAlias)=$($_.IPAddress)" }) -join ', '
$adId = try { (& 'C:\Program Files (x86)\AnyDesk\AnyDesk.exe' --get-id | Out-String).Trim() } catch { '?' }

$res | Format-Table -AutoSize | Out-String | Write-Host

$md = @("# Relatorio de setup - Kamrui PDV", "", "Gerado em $(Get-Date -Format 'yyyy-MM-dd HH:mm') por $env:USERNAME", "",
        "- Maquina: $env:COMPUTERNAME", "- IPs: $ips", "- AnyDesk ID: $adId", "", "| Item | Status |", "|---|---|")
$md += $res | ForEach-Object { "| $($_.Item) | $($_.Status) |" }
$md | Set-Content -Path (Join-Path $LogDir 'relatorio-setup-kamrui.md') -Encoding UTF8
Write-Log ("Verificacao: {0} OK, {1} FALHA" -f ($res | Where-Object Status -eq 'OK').Count, ($res | Where-Object Status -eq 'FALHA').Count)
