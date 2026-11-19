# Etapa 4 - Blindagem 24/7: energia, USB/HID, Windows Update e OneDrive.
. "$PSScriptRoot\comum.ps1"
Assert-Admin

foreach ($s in 'monitor-timeout', 'disk-timeout', 'standby-timeout', 'hibernate-timeout') {
    powercfg /change "$s-ac" 0
    powercfg /change "$s-dc" 0
}
$usbSub = '2a737441-1930-4402-8d77-b2bebba308a3'
$usbSel = '48e6b7a6-50f5-4782-a5d4-53bb8f07e226'
powercfg /setacvalueindex SCHEME_CURRENT $usbSub $usbSel 0
powercfg /setdcvalueindex SCHEME_CURRENT $usbSub $usbSel 0
powercfg /setactive SCHEME_CURRENT
powercfg /h off
Write-Log 'Energia: tela/disco/suspensao/hibernacao = nunca; suspensao seletiva USB off; hibernacao e inicializacao rapida off.'

# Equivale a desmarcar "O computador pode desligar este dispositivo" (touch, balanca, leitor, rede).
$n = 0
Get-CimInstance -Namespace root\wmi -ClassName MSPower_DeviceEnable -ErrorAction SilentlyContinue |
    Where-Object { $_.Enable } |
    ForEach-Object { Set-CimInstance -InputObject $_ -Property @{ Enable = $false }; $n++ }
Write-Log "Economia de energia desligada em $n dispositivos."

$ux  = 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings'
$pol = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate'
Set-RegValue -Path $ux  -Name 'ActiveHoursStart' -Value 6
Set-RegValue -Path $ux  -Name 'ActiveHoursEnd'   -Value 23
Set-RegValue -Path $pol -Name 'SetActiveHours'   -Value 1
Set-RegValue -Path $pol -Name 'ActiveHoursStart' -Value 6
Set-RegValue -Path $pol -Name 'ActiveHoursEnd'   -Value 23
Set-RegValue -Path $pol -Name 'DeferFeatureUpdates' -Value 1
Set-RegValue -Path $pol -Name 'DeferFeatureUpdatesPeriodInDays' -Value 365
Set-RegValue -Path "$pol\AU" -Name 'NoAutoRebootWithLoggedOnUsers' -Value 1
Write-Log 'Windows Update: horario ativo 06h-23h, sem reinicio automatico com usuario logado, recursos adiados 365 dias.'

Set-RegValue -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\OneDrive' -Name 'DisableFileSyncNGSC' -Value 1
Write-Log 'OneDrive desativado por politica para todos os usuarios.'

Write-Log 'Etapa 4 concluida.'
