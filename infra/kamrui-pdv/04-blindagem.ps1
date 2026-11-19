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
# Causas comuns de tela touch apagando alem do timeout: escurecimento, tela de bloqueio,
# brilho adaptativo e economia de energia do link PCIe (derruba controladora USB do touch).
foreach ($v in 'VIDEODIM', 'VIDEOCONLOCK', 'ADAPTBRIGHT') {
    powercfg /setacvalueindex SCHEME_CURRENT SUB_VIDEO $v 0
    powercfg /setdcvalueindex SCHEME_CURRENT SUB_VIDEO $v 0
}
powercfg /setacvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0
powercfg /setdcvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0
# USB 3 Link Power Management: o link U1/U2 pode derrubar a controladora USB do touch.
$usbLpm = 'd4e98f31-5ffe-4ce1-be31-1b38b384c009'
powercfg /setacvalueindex SCHEME_CURRENT $usbSub $usbLpm 0
powercfg /setdcvalueindex SCHEME_CURRENT $usbSub $usbLpm 0
powercfg /setactive SCHEME_CURRENT
powercfg /h off
Set-RegValue -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -Name 'InactivityTimeoutSecs' -Value 0
Write-Log 'Energia: tela/disco/suspensao/hibernacao = nunca; sem escurecer, sem apagar no bloqueio, brilho adaptativo off; USB seletivo, USB3 LPM e ASPM off; bloqueio por inatividade off.'

# Proteção de tela e bloqueio ficam no perfil de cada usuário: aplica no usuário atual e no
# perfil padrão (Caixa_01 herda no primeiro logon, pois o 02-usuarios roda depois deste script).
function Set-SemProtecaoDeTela([string]$Raiz) {
    $d = "$Raiz\Control Panel\Desktop"
    Set-RegValue -Path $d -Name 'ScreenSaveActive'    -Value '0' -Type String
    Set-RegValue -Path $d -Name 'ScreenSaverIsSecure' -Value '0' -Type String
    Set-RegValue -Path $d -Name 'ScreenSaveTimeOut'   -Value '0' -Type String
}
Set-SemProtecaoDeTela 'HKCU:'
reg load 'HKU\HortiiDefault' 'C:\Users\Default\NTUSER.DAT' | Out-Null
if ($LASTEXITCODE -eq 0) {
    try { Set-SemProtecaoDeTela 'Registry::HKEY_USERS\HortiiDefault' }
    finally { [gc]::Collect(); reg unload 'HKU\HortiiDefault' | Out-Null }
}
Write-Log 'Protecao de tela desligada (usuario atual e perfil padrao).'

# Equivale a desmarcar "O computador pode desligar este dispositivo" (touch, balanca, leitor, rede).
# Um dispositivo que recusa a mudanca nao pode abortar o resto da blindagem.
$n = 0; $falhas = 0
Get-CimInstance -Namespace root\wmi -ClassName MSPower_DeviceEnable -ErrorAction SilentlyContinue |
    Where-Object { $_.Enable } |
    ForEach-Object {
        $dev = $_
        try { Set-CimInstance -InputObject $dev -Property @{ Enable = $false }; $n++ }
        catch { $falhas++; Write-Log "Aviso: nao alterou $($dev.InstanceName)." }
    }
Write-Log "Economia de energia desligada em $n dispositivos ($falhas recusaram)."

# Suspensao seletiva por dispositivo USB/HID (touch, leitor, balanca), alem da opcao do plano.
$m = 0
Get-ChildItem 'HKLM:\SYSTEM\CurrentControlSet\Enum\USB', 'HKLM:\SYSTEM\CurrentControlSet\Enum\HID' -ErrorAction SilentlyContinue |
    Get-ChildItem -ErrorAction SilentlyContinue |
    ForEach-Object {
        $dp = Join-Path $_.PSPath 'Device Parameters'
        if (Test-Path $dp) {
            try {
                foreach ($k in 'EnhancedPowerManagementEnabled', 'SelectiveSuspendEnabled', 'AllowIdleIrpInD3') {
                    New-ItemProperty -Path $dp -Name $k -Value 0 -PropertyType DWord -Force | Out-Null
                }
                $m++
            } catch { }
        }
    }
Write-Log "Suspensao seletiva desligada em $m dispositivos USB/HID (vale apos reconectar ou reiniciar)."

# Diagnostico para o log: quem pede energia e como ficou o video.
(powercfg /requests | Out-String).Trim() | ForEach-Object { Write-Log "powercfg /requests: $_" }
(powercfg /query SCHEME_CURRENT SUB_VIDEO | Select-String 'Current AC|Atual.*CA|Power Setting|Configura' | Out-String).Trim() |
    ForEach-Object { Write-Log "SUB_VIDEO: $_" }

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
