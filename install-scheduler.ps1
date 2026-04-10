# WorthApply — Install Windows Task Scheduler Job
# =================================================
# Run this ONCE as Administrator to register the daily push task.
# It will push committed articles to GitHub every day at 6:05 AM.
#
# Usage (run as Administrator):
#   PowerShell -ExecutionPolicy Bypass -File "F:\Worthapply-main\install-scheduler.ps1"

$taskName   = "WorthApply-GitPush"
$scriptPath = "F:\Worthapply-main\push-articles.ps1"
$triggerTime = "06:05"

# Remove existing task if it exists
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Removed existing task: $taskName"
}

# Create the action
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

# Create daily trigger at 6:05 AM
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

# Run as current user
$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType S4U `
    -RunLevel Highest

# Settings
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable

# Register the task
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Pushes WorthApply SEO articles committed by Cowork to GitHub daily at 6:05 AM" `
    -Force

Write-Host ""
Write-Host "SUCCESS — Task '$taskName' registered!" -ForegroundColor Green
Write-Host "  Runs daily at: $triggerTime"
Write-Host "  Script: $scriptPath"
Write-Host "  Log: F:\Worthapply-main\push-log.txt"
Write-Host ""
Write-Host "Test it now with:"
Write-Host "  Start-ScheduledTask -TaskName '$taskName'"
