Start-Process node -ArgumentList "backend/server.js" -NoNewWindow
Start-Sleep -Seconds 4
$ErrorActionPreference = 'SilentlyContinue'
$body = @{ email = "kasthuri@gmail.com"; password = "Kasthu@123" } | ConvertTo-Json
Write-Host "--- TEST LOGIN ---"
$resLogin = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Login Status: $($resLogin.StatusCode)"
if ($resLogin.StatusCode -eq $null -or $resLogin.StatusCode -ge 400) {
    if ($Error.Count -gt 0) {
        Write-Host "Login Error: $($Error[0].Exception.Message)"
    }
} else {
    Write-Host "Login Response: $($resLogin.Content)"
}

Write-Host "
--- TEST GST HEALTH ---"
$resHealth = Invoke-WebRequest -Uri "http://localhost:5000/api/gst/health" -Method Get -UseBasicParsing
Write-Host "Health Status: $($resHealth.StatusCode)"
if ($resHealth.StatusCode -eq $null -or $resHealth.StatusCode -ge 400) {
    if ($Error.Count -gt 0) {
        Write-Host "Health Error: $($Error[0].Exception.Message)"
    }
} else {
    Write-Host "Health Response: $($resHealth.Content)"
}

Stop-Process -Name node -Force
