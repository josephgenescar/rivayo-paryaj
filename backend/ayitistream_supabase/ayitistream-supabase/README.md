# AyitiStream — Streamtape Version

## Achitekti
```
Itilizatè uploade vidéo
        ↓
Frontend → Supabase Auth
        ↓
Edge Function "upload-streamtape" (kache kredansyèl)
        ↓
Streamtape API → embed_url
        ↓
Supabase DB → sove embed_url
        ↓
Frontend montre iframe — itilizatè pa wè "Streamtape"
        ↓
Vue konte → Streamtape peye ou
```

## ETAP 1 — Kreye baz done
Supabase → SQL Editor → kole supabase/schema.sql → Run

## ETAP 2 — Deploy Edge Function
```bash
npm install -g supabase
supabase login
supabase link --project-ref TON_PROJECT_REF
supabase secrets set STREAMTAPE_LOGIN=a7208872fbb52769b9d7
supabase secrets set STREAMTAPE_KEY=TA_NOUVO_CLE_APRE_CHANJMAN
supabase functions deploy upload-streamtape
```

## ETAP 3 — Konfigire frontend/index.html
Chanje 2 liy:
const SUPABASE_URL      = 'https://XXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';

## ETAP 4 — Ouvri frontend/index.html nan Chrome
