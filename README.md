# Skylift Ops — Aerorio Táxi Aéreo

Sistema interno de operações para Aerorio Táxi Aéreo.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + Database)
- **shadcn/ui** (componentes)

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## Configuração

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

Em `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 2. Banco de dados (Supabase)

No **SQL Editor** do Supabase Dashboard, execute o conteúdo do arquivo:

```
supabase/migrations/001_initial_schema.sql
```

Isso criará as tabelas: `mono_flights`, `jato_flights`, `helicoptero_flights` e `profiles`.

### 3. Perfis de usuário

Após criar usuários em **Authentication → Users**, adicione-os na tabela `profiles`:

```sql
INSERT INTO profiles (id, role) VALUES ('uuid-do-usuario', 'admin');
-- ou
INSERT INTO profiles (id, role) VALUES ('uuid-do-usuario', 'operacoes');
```

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## Integração com N8N

O N8N pode fazer **INSERT** ou **UPSERT** nas tabelas de voos usando a **REST API do Supabase** com a **Service Role Key** (armazenada apenas no N8N, nunca no frontend).

- Endpoint: `https://seu-projeto.supabase.co/rest/v1/{tabela}`
- Tabelas: `mono_flights`, `jato_flights`, `helicoptero_flights`
- A Service Role Key bypassa o RLS automaticamente

## Estrutura

```
/app              # Páginas (App Router)
/components       # Componentes UI e de negócio
/lib              # Supabase client e utils
/hooks            # Hooks React
/types            # Tipos TypeScript
/supabase         # Migrations SQL
```

## Roles

- **admin**: acesso completo + botão "Gerenciar Usuários"
- **operacoes**: acesso ao dashboard e edição de pilotos
