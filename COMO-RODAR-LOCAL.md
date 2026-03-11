# Como rodar o projeto localmente

## 1. Dependências

```powershell
npm install
```

## 2. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto (copie de `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-do-supabase
```

Obtenha os valores em: Supabase Dashboard → Project Settings → API.

## 3. Subir o servidor

```powershell
npm run dev
```

Acesse: **http://localhost:3000**

---

## Problemas comuns

### "EADDRINUSE: address already in use :::3000"
A porta 3000 está em uso. Encerre o processo:

```powershell
netstat -ano | findstr :3000
taskkill /PID <número_do_PID> /F
```

Depois rode `npm run dev` novamente.

### Página em branco ou erros 404 nos arquivos JS
Cache corrompido. Limpe e reinicie:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### Login não funciona / dados não carregam
Verifique se `.env.local` tem as variáveis corretas do Supabase e se o projeto está configurado no dashboard.
