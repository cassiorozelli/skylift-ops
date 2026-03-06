# Copiar banco Supabase online para local

## Pré-requisitos

- Docker em execução (para Supabase local)
- Supabase CLI instalado
- Logado no Supabase (`supabase login`)

## Passo a passo

### 1. Obter o Project Ref

No [Supabase Dashboard](https://supabase.com/dashboard), abra seu projeto. O **Project Ref** aparece na URL:
```
https://supabase.com/dashboard/project/XXXXXXXX
                                      ^^^^^^^^
                                      Este é o project ref
```

Ou em **Settings → General → Reference ID**.

### 2. Vincular ao projeto remoto

```powershell
supabase link --project-ref SEU_PROJECT_REF
```

Será solicitada a **senha do banco de dados** (não a senha da sua conta). Encontre em:
**Settings → Database → Database password**.

### 3. Extrair schema e dados do remoto

```powershell
# Puxar o schema (estrutura das tabelas) do projeto vinculado
supabase db pull

# Exportar apenas os dados do remoto
supabase db dump --linked --data-only -f supabase/dump-data.sql
```

### 4. Iniciar Supabase local

```powershell
supabase start
```

**Importante:** O Docker precisa estar em execução.

### 5. Aplicar os dados no banco local

Use o psql com a URL local (a senha padrão é `postgres`):

```powershell
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/dump-data.sql
```

Se o psql não estiver no PATH, use o Docker:

```powershell
docker exec -i supabase_db_skylift-novo-cursor psql -U postgres -d postgres < supabase/dump-data.sql
```

(O nome do container pode variar — liste com `docker ps` e procure o do Supabase.)

## Resumo dos comandos

```powershell
cd "c:\Users\Cassio\Desktop\Aerorio\Skylift - Novo - Cursor"

supabase link --project-ref SEU_PROJECT_REF
supabase db pull
supabase db dump --linked --data-only -f supabase/dump-data.sql
supabase start
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/dump-data.sql
```

## URL do banco local

Após `supabase start`:
- **API URL:** http://127.0.0.1:54321
- **DB URL:** postgresql://postgres:postgres@127.0.0.1:54322/postgres

Para usar o banco local no frontend, configure no `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave local exibida pelo supabase start>
```
