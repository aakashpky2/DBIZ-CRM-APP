Start-Process node -ArgumentList "backend/server.js" -NoNewWindow
Start-Sleep -Seconds 3
$ErrorActionPreference = 'SilentlyContinue'
$body = @{ username = "gst1234"; password = "Kich@2026" } | ConvertTo-Json
Write-Host "--- TEST LOGIN ---"
$resLogin = Invoke-WebRequest -Uri "http://localhost:5000/api/gst/auth/login" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Login Status: $($resLogin.StatusCode)"
if ($resLogin.StatusCode -eq $null -or $resLogin.StatusCode -ge 400) {
    if ($Error.Count -gt 0) {
        Write-Host "Login Error: $($Error[0].Exception.Message)"
    }
} else {
    Write-Host "Login Response: $($resLogin.Content)"
}
Stop-Process -Name node -Force
