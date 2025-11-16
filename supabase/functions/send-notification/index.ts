import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from("notification_settings")
      .select("wordpress_url, onesignal_app_id, onesignal_api_key")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    if (
      !settings ||
      !settings.wordpress_url ||
      !settings.onesignal_app_id ||
      !settings.onesignal_api_key
    ) {
      return new Response(
        JSON.stringify({ error: "Service not fully configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const wpApiUrl = `${settings.wordpress_url}/wp-json/wp/v2/posts?per_page=1&orderby=date`;
    const wpResponse = await fetch(wpApiUrl);

    if (!wpResponse.ok) {
      throw new Error(`WordPress API error: ${wpResponse.statusText}`);
    }

    const posts = await wpResponse.json();

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ error: "No posts found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const latestPost = posts[0];
    const postTitle = latestPost.title.rendered;
    const postUrl = latestPost.link;
    const postId = latestPost.id.toString();

    const oneSignalPayload = {
      app_id: settings.onesignal_app_id,
      included_segments: ["All"],
      headings: { en: "New Post Available!" },
      contents: { en: postTitle },
      url: postUrl,
    };

    const oneSignalResponse = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${settings.onesignal_api_key}`,
        },
        body: JSON.stringify(oneSignalPayload),
      }
    );

    const oneSignalResult = await oneSignalResponse.json();

    if (!oneSignalResponse.ok) {
      await supabase.from("sent_notifications").insert({
        post_id: postId,
        post_title: postTitle,
        post_url: postUrl,
        status: "failed",
        error_message: JSON.stringify(oneSignalResult),
      });

      return new Response(
        JSON.stringify({
          error: "Failed to send notification",
          details: oneSignalResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase.from("sent_notifications").insert({
      post_id: postId,
      post_title: postTitle,
      post_url: postUrl,
      status: "sent",
      recipients_count: oneSignalResult.recipients || 0,
      onesignal_notification_id: oneSignalResult.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: oneSignalResult.id,
        recipients: oneSignalResult.recipients,
        post: { id: postId, title: postTitle, url: postUrl },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
