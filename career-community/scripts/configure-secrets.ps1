param(
  [string]$ProjectRef = 'vcxzbeysegoojxdyooyv'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env.local'

function Read-SecretText {
  param([string]$Prompt)
  $secure = Read-Host -Prompt $Prompt -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

Write-Host '配置 liebstch 本地环境变量' -ForegroundColor Cyan
Write-Host "Supabase Project Ref: $ProjectRef" -ForegroundColor DarkGray

$supabaseUrl = "https://$ProjectRef.supabase.co"
$anonKey = (Read-SecretText 'Supabase anon public key').Trim()
$serviceRoleKey = (Read-SecretText 'Supabase service_role key').Trim()
$resendApiKey = (Read-SecretText 'Resend API key').Trim()
$siteUrl = (Read-Host "Site URL [http://localhost:3000]").Trim()
if (-not $siteUrl) { $siteUrl = 'http://localhost:3000' }
$fromEmail = (Read-Host 'Resend sender [liebstch <noreply@mail.liebstch.com>]').Trim()
if (-not $fromEmail) { $fromEmail = 'liebstch <noreply@mail.liebstch.com>' }

if (-not $anonKey -or -not $serviceRoleKey -or -not $resendApiKey) {
  throw '三个密钥都不能为空。'
}

Write-Host '正在验证 Supabase anon key...' -ForegroundColor DarkGray
$health = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/health" -Headers @{ apikey = $anonKey } -TimeoutSec 20
if (-not $health) { throw 'Supabase 健康检查失败。' }

Write-Host '正在验证 Resend API key...' -ForegroundColor DarkGray
$resendResponse = Invoke-RestMethod -Uri 'https://api.resend.com/domains' -Headers @{ Authorization = "Bearer $resendApiKey" } -TimeoutSec 20
$verifiedDomain = @($resendResponse.data | Where-Object { $_.name -eq 'mail.liebstch.com' -and $_.status -eq 'verified' }).Count -gt 0
if (-not $verifiedDomain) {
  Write-Warning 'Resend 中没有找到已验证的 mail.liebstch.com。邮箱发送前请先确认域名状态为 verified。'
}

$content = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey

NEXT_PUBLIC_SITE_URL=$siteUrl
NEXT_PUBLIC_SITE_NAME=liebstch
NEXT_PUBLIC_SITE_DESCRIPTION=作品、求职记录与公开面经社区

RESEND_API_KEY=$resendApiKey
RESEND_FROM_EMAIL="$fromEmail"
CRON_SECRET=
"@

[System.IO.File]::WriteAllText($envPath, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "已写入：$envPath" -ForegroundColor Green
Write-Host '密钥未输出到终端，也不会提交到 Git。' -ForegroundColor Green
