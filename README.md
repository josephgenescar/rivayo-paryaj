
# rivayo-paryaj

Ti gid rapid - Sèvi ak Supabase kòm Postgres

1) Si w sèlman bezwen itilize Supabase kòm bazdone Postgres (pi senp):
   - Ale nan Supabase Project -> Settings -> Database -> Connection string
   - Kopi `Postgres connection string` la epi mete li kòm `DATABASE_URL` nan anviwònman sèvè ou (`backend/.env` oswa platform env vars).
   - Egzanp: `DATABASE_URL=postgres://USER:PASS@HOST:PORT/DATABASE`
   - Pa bezwen chanje kòd: `backend/server.js` deja li `process.env.DATABASE_URL`.
   - Si w pa sèvi ak Railway ankò, retire nenpòt Railway URL nan frontend ak backend, epi sèvi ak backend ou nouvo kote w host li.

2) Si ou vle integrasyon pi fon ak Supabase (auth, realtime, storage):
   - W ap bezwen ajoute `@supabase/supabase-js` epi itilize `SUPABASE_URL` ak `SUPABASE_SERVICE_ROLE_KEY` sou sèvè.
   - Sa mande refaktoring nan queries / auth pou sèvi ak Supabase client.

3) Fichye egzan anviwònman backend: [backend/.env.example](backend/.env.example)
4) Fichye egzan anviwònman frontend: [frontend/.env.example](frontend/.env.example)

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

SI W PA ITILIZE RAILWAY ANKO
- Mete `REACT_APP_API_URL` sou frontend la ak URL backend ou si li deplwaye yon lòt kote.
- Pa kite `https://rivayo-paryaj-production.up.railway.app/api` nan `frontend/src/App.js`.
- Asire `backend` kouri sou yon sèvè oswa sèvis hosting (Render, Vercel, elatriye) pandan li konekte ak `DATABASE_URL` Supabase.

### Deployment rapid sou Render
1) Konekte repo GitHub ou sou Render.
2) Chwazi `Create new service` → `Web Service`.
3) Chwazi repo a epi Render ap chaje `render.yaml` otomatikman.
4) Verifye bagay sa yo nan tab `Advanced` oswa `Environment` si nesesè:
   - `Build Command`: `cd backend && npm install`
   - `Start Command`: `cd backend && npm start`
   - `Root Directory`: repo a (rasin)
5) Ajoute sekrè Render sa yo nan `Environment`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS=https://rivayo-paryaj.vercel.app,http://localhost:3000`
6) Lanse deploy la. Render ap sèvi backend la sou yon URL tankou `https://<service-name>.onrender.com`.
7) Si w deploye frontend sou Vercel oswa lòt kote, mete `REACT_APP_API_URL` ak URL backend Render la.

Si ou vle, mwen ka:
- ede w kreye sèvis Render la etap-pa-etap,
- ede w mete `REACT_APP_API_URL` nan frontend si w deploye frontend la tou,
- ede w verifye ke backend Render la konekte ak Supabase.

