# Copiar dados do Supabase local para o remoto

## Pré-requisitos

- **Docker Desktop** em execução (sem erro 500)
- Supabase CLI instalado
- Projeto já vinculado (`supabase link --project-ref pdpzvdohgpdpbwbqtwea`)

---

## Passo a passo

### 1. Reiniciar o Docker (se necessário)

Se aparecer erro 500 ao rodar `supabase`, feche e abra o Docker Desktop novamente.

### 2. Iniciar o Supabase local

```powershell
cd "c:\Users\Cassio\Desktop\Aerorio\Skylift - Novo - Cursor"
supabase start
```

Aguarde todos os serviços subirem. Anote o **anon key** se for usar o banco local depois.

### 3. Exportar os dados do banco local

```powershell
supabase db dump -f supabase/dump-local-data.sql --data-only
```

Isso gera `supabase/dump-local-data.sql` com apenas os dados (não o schema).

### 4. Obter a URL de conexão do banco remoto

No [Supabase Dashboard](https://supabase.com/dashboard/project/pdpzvdohgpdpbwbqtwea):

1. **Settings** → **Database**
2. Em **Connection string**, escolha **URI**
3. Copie a URL (algo como `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)
4. Substitua `[YOUR-PASSWORD]` pela senha do banco (em **Database password**)

### 5. Aplicar o dump no banco remoto

Com **psql** instalado:

```powershell
psql "SUA_URL_REMOTA_AQUI" -f supabase/dump-local-data.sql
```

**Ou** usando Docker (se não tiver psql):

```powershell
Get-Content supabase/dump-local-data.sql | docker run -i --rm postgres:15 psql "SUA_URL_REMOTA_AQUI" -f -
```

---

## Observações

- O dump local sobrescreve dados existentes no remoto nas tabelas afetadas. Faça backup antes se necessário.
- Se houver conflitos de schema, ajuste o arquivo SQL manualmente antes de aplicar.
- A senha do banco **não** é a senha da sua conta Supabase; é a definida em **Settings → Database**.
