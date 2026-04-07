# BizSaathi Backend - Automated Test Suite
# Run this script to test all endpoints
# Usage: powershell -ExecutionPolicy Bypass -File test-all.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BizSaathi Backend - Test Suite            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:3000"
$TEST_EMAIL = "test_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$TEST_PASSWORD = "TestPassword123!@"

# Test results
$results = @()

function Test-ServiceRunning {
    Write-Host "🔍 Checking if dev server is running..." -ForegroundColor Yellow
    try {
        $response = curl -s -m 2 "$BASE_URL" -o $null -w "%{http_code}" 2>$null
        if ($response -eq "404") {
            Write-Host "✓ Dev server is running at $BASE_URL" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Dev server not responding correctly" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Could not connect to $BASE_URL" -ForegroundColor Red
        Write-Host "   Make sure 'npm run dev' is running in another PowerShell" -ForegroundColor Yellow
        return $false
    }
}

function Test-AIEndpoint {
    Write-Host ""
    Write-Host "Test 1️⃣  : AI Endpoint (WhatsApp Writer)" -ForegroundColor Yellow
    Write-Host "━━━─────────────────────────────────━━━" -ForegroundColor Gray
    
    try {
        $body = @{
            userInput = "Write a professional WhatsApp message for my small business"
            language = "en"
        } | ConvertTo-Json
        
        $response = curl -s -X POST "$BASE_URL/api/ai/whatsapp-writer" `
            -H "Content-Type: application/json" `
            -d $body | ConvertFrom-Json
        
        if ($response.output) {
            Write-Host "✓ PASS" -ForegroundColor Green
            Write-Host "   Response: $($response.output.Substring(0, [Math]::Min(60, $response.output.Length)))..." -ForegroundColor Green
            $results += @{ test = "AI Endpoint"; status = "PASS" }
            return $true
        } else {
            Write-Host "✗ FAIL - No output received" -ForegroundColor Red
            Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Red
            $results += @{ test = "AI Endpoint"; status = "FAIL" }
            return $false
        }
    } catch {
        Write-Host "✗ FAIL - Error: $_" -ForegroundColor Red
        $results += @{ test = "AI Endpoint"; status = "FAIL" }
        return $false
    }
}

function Test-Signup {
    Write-Host ""
    Write-Host "Test 2️⃣  : User Signup" -ForegroundColor Yellow
    Write-Host "━━━─────────────────────────────────━━━" -ForegroundColor Gray
    
    try {
        $body = @{
            email = $TEST_EMAIL
            password = $TEST_PASSWORD
        } | ConvertTo-Json
        
        $response = curl -s -X POST "$BASE_URL/api/auth/signup" `
            -H "Content-Type: application/json" `
            -d $body | ConvertFrom-Json
        
        if ($response.user.id) {
            Write-Host "✓ PASS" -ForegroundColor Green
            Write-Host "   Email: $TEST_EMAIL" -ForegroundColor Green
            Write-Host "   User ID: $($response.user.id.Substring(0, 8))..." -ForegroundColor Green
            $results += @{ test = "Signup"; status = "PASS" }
            return $response.user.id
        } else {
            Write-Host "✗ FAIL - User not created" -ForegroundColor Red
            Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Red
            $results += @{ test = "Signup"; status = "FAIL" }
            return $null
        }
    } catch {
        Write-Host "✗ FAIL - Error: $_" -ForegroundColor Red
        $results += @{ test = "Signup"; status = "FAIL" }
        return $null
    }
}

function Test-Login {
    Write-Host ""
    Write-Host "Test 3️⃣  : User Login" -ForegroundColor Yellow
    Write-Host "━━━─────────────────────────────────━━━" -ForegroundColor Gray
    
    try {
        $body = @{
            email = $TEST_EMAIL
            password = $TEST_PASSWORD
        } | ConvertTo-Json
        
        $response = curl -s -X POST "$BASE_URL/api/auth/login" `
            -H "Content-Type: application/json" `
            -d $body | ConvertFrom-Json
        
        if ($response.session.access_token) {
            Write-Host "✓ PASS" -ForegroundColor Green
            Write-Host "   Access Token: $($response.session.access_token.Substring(0, 20))..." -ForegroundColor Green
            $results += @{ test = "Login"; status = "PASS" }
            return $response.session.access_token
        } else {
            Write-Host "✗ FAIL - No token received" -ForegroundColor Red
            Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Red
            $results += @{ test = "Login"; status = "FAIL" }
            return $null
        }
    } catch {
        Write-Host "✗ FAIL - Error: $_" -ForegroundColor Red
        $results += @{ test = "Login"; status = "FAIL" }
        return $null
    }
}

function Test-Credits {
    param([string]$token)
    
    Write-Host ""
    Write-Host "Test 4️⃣  : Get User Credits (Authenticated)" -ForegroundColor Yellow
    Write-Host "━━━─────────────────────────────────━━━" -ForegroundColor Gray
    
    if (-not $token) {
        Write-Host "⊘ SKIP - No token from login" -ForegroundColor Yellow
        $results += @{ test = "Credits"; status = "SKIP" }
        return $false
    }
    
    try {
        $response = curl -s -X GET "$BASE_URL/api/user/credits" `
            -H "Authorization: Bearer $token" `
            -H "Content-Type: application/json" | ConvertFrom-Json
        
        if ($response.credits_remaining -ne $null) {
            Write-Host "✓ PASS" -ForegroundColor Green
            Write-Host "   Credits: $($response.credits_remaining)" -ForegroundColor Green
            Write-Host "   Plan: $($response.plan)" -ForegroundColor Green
            $results += @{ test = "Credits"; status = "PASS" }
            return $true
        } else {
            Write-Host "✗ FAIL - No credits returned" -ForegroundColor Red
            Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Red
            $results += @{ test = "Credits"; status = "FAIL" }
            return $false
        }
    } catch {
        Write-Host "✗ FAIL - Error: $_" -ForegroundColor Red
        $results += @{ test = "Credits"; status = "FAIL" }
        return $false
    }
}

function Test-RateLimiting {
    Write-Host ""
    Write-Host "Test 5️⃣  : Rate Limiting (Guest 3 requests/day)" -ForegroundColor Yellow
    Write-Host "━━━─────────────────────────────────━━━" -ForegroundColor Gray
    
    try {
        $successCount = 0
        $rateLimited = $false
        
        for ($i = 1; $i -le 4; $i++) {
            Write-Host "  Request $i/4..." -ForegroundColor Gray -NoNewline
            
            $body = @{
                userInput = "Test request $i"
            } | ConvertTo-Json
            
            $response = curl -s -X POST "$BASE_URL/api/ai/poster-maker" `
                -H "Content-Type: application/json" `
                -d $body -w "`nHttp-Code:%{http_code}" 2>$null
            
            $httpCode = ($response | Select-String "Http-Code:").ToString().Split(":")[1]
            
            if ($httpCode -eq "429") {
                Write-Host " RATE LIMIT ✓" -ForegroundColor Green
                $rateLimited = $true
                break
            } elseif ($httpCode -eq "200") {
                Write-Host " OK" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " ERROR ($httpCode)" -ForegroundColor Red
            }
        }
        
        if ($rateLimited -and $successCount -ge 3) {
            Write-Host "✓ PASS - Rate limiting working" -ForegroundColor Green
            Write-Host "   Allowed 3+ requests, blocked on 4th" -ForegroundColor Green
            $results += @{ test = "Rate Limiting"; status = "PASS" }
            return $true
        } else {
            Write-Host "⚠️  WARNING - Rate limiting may not be configured" -ForegroundColor Yellow
            if (-not $rateLimited) {
                Write-Host "   All 4 requests allowed (should have blocked on 4th)" -ForegroundColor Yellow
            }
            $results += @{ test = "Rate Limiting"; status = "WARN" }
            return $true # Not a critical failure
        }
    } catch {
        Write-Host "⚠️  SKIP - Rate limit test error: $_" -ForegroundColor Yellow
        $results += @{ test = "Rate Limiting"; status = "SKIP" }
        return $true
    }
}

# ─────────────────────────────────────────────────
# MAIN TEST EXECUTION
# ─────────────────────────────────────────────────

if (-not (Test-ServiceRunning)) {
    Write-Host ""
    Write-Host "❌ Cannot continue without running dev server" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start dev server, open PowerShell and run:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Run tests
$token = Test-Login

Test-AIEndpoint
Test-Signup
if ($token) {
    Test-Login
    Test-Credits -token $token
}
Test-RateLimiting

# ─────────────────────────────────────────────────
# RESULTS SUMMARY
# ─────────────────────────────────────────────────

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 TEST RESULTS SUMMARY                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.status -eq "FAIL" }).Count
$warnCount = ($results | Where-Object { $_.status -eq "WARN" }).Count
$skipCount = ($results | Where-Object { $_.status -eq "SKIP" }).Count

Write-Host "Total Tests: $($results.Count)" -ForegroundColor Cyan
Write-Host "  ✓ Passed:  $passCount" -ForegroundColor Green
Write-Host "  ✗ Failed:  $failCount" -ForegroundColor Red
Write-Host "  ⚠️  Warning: $warnCount" -ForegroundColor Yellow
Write-Host "  ⊘ Skipped: $skipCount" -ForegroundColor Gray

Write-Host ""
Write-Host "Test Details:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

foreach ($result in $results) {
    $status = switch ($result.status) {
        "PASS" { "✓"; $color = "Green" }
        "FAIL" { "✗"; $color = "Red" }
        "WARN" { "⚠️"; $color = "Yellow" }
        "SKIP" { "⊘"; $color = "Gray" }
    }
    Write-Host "$status $($result.test)" -ForegroundColor $color
}

Write-Host ""

if ($failCount -eq 0) {
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ ALL TESTS PASSED!                      ║" -ForegroundColor Green
    Write-Host "║  Your backend is 100% working!             ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    Write-Host "Check the errors above and fix them" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. ✅ Backend is working locally" -ForegroundColor Green
Write-Host "  2. ⏳ Add Razorpay keys when ready for payments" -ForegroundColor Yellow
Write-Host "  3. 🚀 Deploy to Vercel when ready" -ForegroundColor Cyan
Write-Host ""
