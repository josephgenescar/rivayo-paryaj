
# rivayo-paryaj

Ti gid rapid - Sèvi ak Supabase kòm Postgres

1) Si w sèlman bezwen itilize Supabase kòm bazdone Postgres (pi senp):
   - Ale nan Supabase Project -> Settings -> Database -> Connection string
   - Kopi `Postgres connection string` la epi mete li kòm `DATABASE_URL` nan anviwònman sèvè ou (`backend/.env` oswa platform env vars).
   - Egzanp: `DATABASE_URL=postgres://USER:PASS@HOST:PORT/DATABASE`
   - Pa bezwen chanje kòd: `backend/server.js` deja li `process.env.DATABASE_URL`.

2) Si ou vle integrasyon pi fon ak Supabase (auth, realtime, storage):
   - W ap bezwen ajoute `@supabase/supabase-js` epi itilize `SUPABASE_URL` ak `SUPABASE_SERVICE_ROLE_KEY` sou sèvè.
   - Sa mande refaktoring nan queries / auth pou sèvi ak Supabase client.

3) Fichye egzanp anviwònman: [backend/.env.example](backend/.env.example)

Sekirite ak bon pratik
- Mete `JWT_SECRET` kòm yon vale fò, long, epi pa mete li nan kòd oswa nan repo.
- Mete `ALLOWED_ORIGINS` pou limite CORS sèlman sou domèn ou konfyans.
- Evite dezaktive TLS; pa mete `PGSSLMODE=no-verify` eksepte si w konnen konsekans yo.
- Kenbe `SUPABASE_SERVICE_ROLE_KEY` trè sekrè; itilize li sèlman sou sèvè (never expose in client).

Kouri enpòtasyon schema otomatikman (rapid):

1) Nan `backend` enstale deps si pa deja:
```bash
cd backend
npm install
```

2) Mete anviwònman yo epi kouri (egzanp Windows PowerShell):
```powershell
$env:DATABASE_URL = "postgres://USER:PASS@HOST:PORT/DATABASE"
$env:FORCE_DB_IMPORT = "true"
node scripts/import_schema.js
```

Sa ap kouri `database/schema.sql` sou bazdone ki nan `DATABASE_URL` ou a.

Si ou vle, mwen ka:
- Kreye yon `backend/.env` lokal (ki pa komite) soti nan `.env.example`.
- Refaktore `auth` pou itilize `@supabase/supabase-js` si ou vle entegrasyon auth ofisyèl.
- Kouri import schema pou ou si ou ban mwen `DATABASE_URL` ak otorizasyon (ou ka kouri li tou lokalman avèk enstriksyon pi wo a).

