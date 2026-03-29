// supabase/functions/upload-boodstream/index.ts
// Edge Function — kouri nan Supabase, kache Boodstream API key
// Deploy: supabase functions deploy upload-boodstream

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOODSTREAM_API_KEY = Deno.env.get("BOODSTREAM_API_KEY") || "";
const BOODSTREAM_API_URL = Deno.env.get("BOODSTREAM_API_URL") || "https://boodstream.com/api";
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // Verifye itilizatè a konekte
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Pa otorize" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "Token envalid" }, 401);

    // Resevwa fichye + done
    const formData = await req.formData();
    const file      = formData.get("file") as File;
    const videoId   = formData.get("video_id") as string;

    if (!file || !videoId) return json({ error: "Fichye ak video_id obligatwa" }, 400);

    // Voye fichye a sou Boodstream
    const bs = new FormData();
    bs.append("api_key", BOODSTREAM_API_KEY);
    bs.append("file", file);
    bs.append("name", formData.get("title") as string || file.name);

    const bsRes = await fetch(`${BOODSTREAM_API_URL}/upload`, {
      method: "POST",
      body: bs,
    });

    if (!bsRes.ok) {
      // Mete video a failed
      await supabase.from("videos").update({ status: "failed" }).eq("id", videoId);
      return json({ error: "Boodstream upload echèk" }, 500);
    }

    const bsData = await bsRes.json();
    const fileCode   = bsData.file_code || bsData.id || "";
    const embedUrl   = bsData.embed_url || `https://boodstream.com/e/${fileCode}`;
    const thumbUrl   = bsData.splash_img || bsData.thumbnail || "";

    // Update vidéo nan Supabase — embed_url sèlman ki al nan frontend
    await supabase.from("videos").update({
      boodstream_id:  fileCode,
      embed_url:      embedUrl,
      thumbnail_url:  thumbUrl,
      status:         "ready",
    }).eq("id", videoId);

    return json({ success: true, embedUrl, thumbUrl });

  } catch (err) {
    console.error(err);
    return json({ error: "Erè sèvè" }, 500);
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
