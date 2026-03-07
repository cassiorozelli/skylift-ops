# Copia dados do Supabase remoto para o local
# Pré-requisitos: supabase login (ou SUPABASE_ACCESS_TOKEN), supabase start, projeto linkado

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location $projectDir

Write-Host "0. Resetando banco local com todas as migracoes (sem seed)..." -ForegroundColor Cyan
supabase db reset --no-seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no reset. Certifique-se de que 'supabase start' esta rodando." -ForegroundColor Red
    exit 1
}

Write-Host "1. Exportando dados do remoto..." -ForegroundColor Cyan
supabase db dump --linked --data-only -s public -f supabase/dump-remote-data.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro: configure o token com 'supabase login' ou `$env:SUPABASE_ACCESS_TOKEN" -ForegroundColor Red
    exit 1
}

Write-Host "2. Aplicando dados no banco local..." -ForegroundColor Cyan
$containerName = (docker ps --format "{{.Names}}" | Select-String "supabase_db").ToString()
if ($containerName) {
    Get-Content supabase/dump-remote-data.sql | docker exec -i $containerName psql -U postgres -d postgres 2>&1 | Out-Null
    Write-Host "Concluído." -ForegroundColor Green
} else {
    Write-Host "Container do Supabase nao encontrado. Execute 'supabase start' primeiro." -ForegroundColor Red
    exit 1
}
