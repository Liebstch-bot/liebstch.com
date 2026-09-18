param(
  [string]$ProjectRef = 'vcxzbeysegoojxdyooyv'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env.local'
$pnpm = 'C:\Users\26862\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'

if (-not (Test-Path -LiteralPath $envPath)) {
  throw "缺少 $envPath，请先运行 scripts\configure-secrets.ps1"
}

$envMap = @{}
Get-Content -LiteralPath $envPath | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
    $key = $matches[1]
    $value = $matches[2].Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1, $value.Length - 2) }
    $envMap[$key] = $value
  }
}

foreach ($key in @('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL')) {
  if (-not $envMap[$key]) { throw "$envPath 缺少 $key" }
}

$cronSecret = $envMap['CRON_SECRET']
if (-not $cronSecret) {
  $bytes = [Security.Cryptography.RandomNumberGenerator]::GetBytes(36)
  $cronSecret = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
  $updated = Get-Content -Raw -LiteralPath $envPath
  if ($updated -match '(?m)^CRON_SECRET=.*$') { $updated = [regex]::Replace($updated, '(?m)^CRON_SECRET=.*$', "CRON_SECRET=$cronSecret") }
  else { $updated = $updated.TrimEnd() + [Environment]::NewLine + "CRON_SECRET=$cronSecret" + [Environment]::NewLine }
  [System.IO.File]::WriteAllText($envPath, $updated, [System.Text.UTF8Encoding]::new($false))
  Write-Host '已生成本地 CRON_SECRET。' -ForegroundColor Green
}

Write-Host '1/4 关联 Supabase 项目...' -ForegroundColor Cyan
& $pnpm dlx supabase link --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { throw 'supabase link 失败。请先运行 pnpm dlx supabase login。' }

Write-Host '2/4 推送数据库迁移...' -ForegroundColor Cyan
& $pnpm dlx supabase db push
if ($LASTEXITCODE -ne 0) { throw 'supabase db push 失败。' }

Write-Host '3/4 设置 Edge Function Secrets...' -ForegroundColor Cyan
& $pnpm dlx supabase secrets set "RESEND_API_KEY=$($envMap['RESEND_API_KEY'])" "RESEND_FROM_EMAIL=$($envMap['RESEND_FROM_EMAIL'])" "CRON_SECRET=$cronSecret"
if ($LASTEXITCODE -ne 0) { throw 'supabase secrets set 失败。' }

Write-Host '4/4 部署 send-reminders...' -ForegroundColor Cyan
& $pnpm dlx supabase functions deploy send-reminders --no-verify-jwt
if ($LASTEXITCODE -ne 0) { throw 'Edge Function 部署失败。' }

Write-Host ''
Write-Host 'Supabase 部署完成。接下来把 supabase/cron.sql 中的占位值替换后在 SQL Editor 执行。' -ForegroundColor Green
