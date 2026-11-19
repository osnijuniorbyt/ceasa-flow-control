# Etapa 2 - Usuarios locais TI_Admin (admin) e Caixa_01 (padrao, sem senha).
# -AtivarAutoLogon so depois de o TI_Admin estar validado (o proximo boot entra direto no Caixa_01).
param([switch]$AtivarAutoLogon)
. "$PSScriptRoot\comum.ps1"
Assert-Admin

$SidAdmins = 'S-1-5-32-544'
$SidUsers  = 'S-1-5-32-545'

function Add-ToGroupBySid {
    param([string]$Sid, [string]$User)
    $members = Get-LocalGroupMember -SID $Sid | ForEach-Object { $_.Name.Split('\')[-1] }
    if ($members -notcontains $User) { Add-LocalGroupMember -SID $Sid -Member $User }
}

if (-not (Get-LocalUser -Name 'TI_Admin' -ErrorAction SilentlyContinue)) {
    $pw = Read-Host 'Digite a senha NOVA do TI_Admin (nao use a do documento V2)' -AsSecureString
    New-LocalUser -Name 'TI_Admin' -Password $pw -PasswordNeverExpires -FullName 'TI Hortii' -Description 'Administrador de TI do PDV' | Out-Null
    Write-Log 'Usuario TI_Admin criado.'
} else { Write-Log 'Usuario TI_Admin ja existe.' }
Add-ToGroupBySid -Sid $SidAdmins -User 'TI_Admin'
Add-ToGroupBySid -Sid $SidUsers  -User 'TI_Admin'

if (-not (Get-LocalUser -Name 'Caixa_01' -ErrorAction SilentlyContinue)) {
    New-LocalUser -Name 'Caixa_01' -NoPassword -UserMayNotChangePassword -AccountNeverExpires -FullName 'Caixa 01' -Description 'Operador de caixa (restrito)' | Out-Null
    Write-Log 'Usuario Caixa_01 criado.'
} else { Write-Log 'Usuario Caixa_01 ja existe.' }
Set-LocalUser -Name 'Caixa_01' -PasswordNeverExpires $true
Add-ToGroupBySid -Sid $SidUsers -User 'Caixa_01'
$adminsNow = Get-LocalGroupMember -SID $SidAdmins | ForEach-Object { $_.Name.Split('\')[-1] }
if ($adminsNow -contains 'Caixa_01') { Remove-LocalGroupMember -SID $SidAdmins -Member 'Caixa_01'; Write-Log 'Caixa_01 removido de Administradores.' }

if ($AtivarAutoLogon) {
    # Sem isso o Windows 11 esconde/ignora o auto-logon quando "entrar so com Windows Hello" esta ligado.
    Set-RegValue -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device' -Name 'DevicePasswordLessBuildVersion' -Value 0
    $wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
    Set-RegValue -Path $wl -Name 'AutoAdminLogon'    -Value '1'                -Type String
    Set-RegValue -Path $wl -Name 'DefaultUserName'   -Value 'Caixa_01'         -Type String
    Set-RegValue -Path $wl -Name 'DefaultDomainName' -Value $env:COMPUTERNAME  -Type String
    Set-RegValue -Path $wl -Name 'DefaultPassword'   -Value ''                 -Type String
    Write-Log 'Auto-logon configurado para Caixa_01 (vale no proximo boot; nada foi reiniciado).'
}

Write-Log 'Etapa 2 concluida.'
