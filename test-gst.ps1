Start-Process node -ArgumentList "backend/server.js" -NoNewWindow
Start-Sleep -Seconds 10
$ErrorActionPreference = 'SilentlyContinue'

Write-Host "
--- TEST GST MISSING ---"
$resMissing = Invoke-WebRequest -Uri "http://localhost:5000/api/gst/auth/login" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
Write-Host "Missing Status: $($resMissing.StatusCode)"

Write-Host "
--- TEST GST UNKNOWN ---"
$bodyUnknown = @{ username = "unknown_user"; password = "password" } | ConvertTo-Json
$resUnknown = Invoke-WebRequest -Uri "http://localhost:5000/api/gst/auth/login" -Method Post -Body $bodyUnknown -ContentType "application/json" -UseBasicParsing
Write-Host "Unknown Status: $($resUnknown.StatusCode)"

Write-Host "
--- TEST CRM LOGIN ---"
$bodyCRM = @{ email = "kasthuri@gmail.com"; password = "ignored" } | ConvertTo-Json
$resCRM = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $bodyCRM -ContentType "application/json" -UseBasicParsing
Write-Host "CRM Login Status: $($resCRM.StatusCode)"

Stop-Process -Name node -Force
