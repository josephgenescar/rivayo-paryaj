// supabase/functions/upload-streamtape/index.ts
// Edge Function — kouri nan Supabase, kache Streamtape API kredansyèl
// Deploy: supabase functions deploy upload-streamtape

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ST_LOGIN          = Deno.env.get("STREAMTAPE_LOGIN") || "";
const ST_KEY            = Deno.env.get("STREAMTAPE_KEY") || "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ST_API            = "https://api.streamtape.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // 1. Verifye itilizatè a konekte
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Pa otorize" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "Token envalid" }, 401);

    // 2. Resevwa done
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    const videoId  = formData.get("video_id") as string;
    const title    = formData.get("title") as string || file?.name || "video";

    if (!file || !videoId) return json({ error: "Fichye ak video_id obligatwa" }, 400);

    // 3. ETAP 1 — Mande URL upload sou Streamtape
    const urlRes = await fetch(
      `${ST_API}/file/ul?login=${ST_LOGIN}&key=${ST_KEY}`
    );
    const urlData = await urlRes.json();

    if (urlData.status !== 200) {
      await supabase.from("videos").update({ status: "failed" }).eq("id", videoId);
      return json({ error: "Streamtape URL echèk: " + urlData.msg }, 500);
    }

    const uploadUrl = urlData.result.url;

    // 4. ETAP 2 — Uploade fichye a sou URL Streamtape ba nou an
    const stForm = new FormData();
    stForm.append("file1", file, file.name);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: stForm,
    });
    const uploadData = await uploadRes.json();

    if (uploadData.status !== 200) {
      await supabase.from("videos").update({ status: "failed" }).eq("id", videoId);
      return json({ error: "Streamtape upload echèk" }, 500);
    }

    const fileId     = uploadData.result.id;
    const embedUrl   = `https://streamtape.com/e/${fileId}`;
    const thumbUrl   = `https://thumb.tapecontent.net/thumb/${fileId}/thumb.jpg`;

    // 5. ETAP 3 — Update vidéo nan Supabase
    // embed_url SÈLMAN ki al nan frontend — pa janm fileId dirèkteman
    await supabase.from("videos").update({
      boodstream_id:  fileId,      // kache nan backend
      embed_url:      embedUrl,    // sa frontend wè
      thumbnail_url:  thumbUrl,
      status:         "ready",
    }).eq("id", videoId);

    console.log(`✅ Vidéo "${title}" uploade sou Streamtape: ${fileId}`);
    return json({ success: true, embedUrl, thumbUrl });

  } catch (err) {
    console.error(err);
    return json({ error: "Erè sèvè entèn" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
