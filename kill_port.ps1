$conn = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "Found PID:" $conn.OwningProcess "on port 8080"
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    $check = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($check) {
        Write-Host "Port 8080 still in use!"
    } else {
        Write-Host "Port 8080 successfully killed!"
    }
} else {
    Write-Host "Port 8080 is already free"
}

# Check all other dev ports too
$devPorts = @(8081, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185)
foreach ($port in $devPorts) {
    $c = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($c) {
        Write-Host "Killing PID" $c.OwningProcess "on port" $port
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "Final check:"
foreach ($port in @(8080, 8081, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181)) {
    $c = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($c) {
        Write-Host "  Port" $port "still in use by PID" $c.OwningProcess
    } else {
        Write-Host "  Port" $port "FREE"
    }
}
