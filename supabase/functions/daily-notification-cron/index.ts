import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (!settings) {
      return new Response(
        JSON.stringify({ error: 'Settings not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!settings.service_active || !settings.daily_enabled) {
      return new Response(
        JSON.stringify({
          message: 'Service inactive or daily notifications disabled',
          service_active: settings.service_active,
          daily_enabled: settings.daily_enabled,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const istTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
    const istDate = new Date(istTime);
    const currentTimeIST = istDate.toTimeString().slice(0, 5);
    const scheduledTime = settings.schedule_time.slice(0, 5);

    if (currentTimeIST !== scheduledTime) {
      return new Response(
        JSON.stringify({
          message: 'Not scheduled time yet',
          current_time_ist: currentTimeIST,
          scheduled_time: scheduledTime,
          timezone: 'Asia/Kolkata (IST, UTC+5:30)',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (
      !settings.wordpress_url ||
      !settings.onesignal_app_id ||
      !settings.onesignal_api_key
    ) {
      return new Response(
        JSON.stringify({ error: 'Service not fully configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      return new Response(
        JSON.stringify({ error: 'No posts found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const latestPost = posts[0];
    const postTitle = latestPost.title.rendered;
    const postUrl = latestPost.link;
    const postId = latestPost.id.toString();

    const { data: existingNotification } = await supabase
      .from('sent_notifications')
      .select('id')
      .eq('post_id', postId)
      .eq('status', 'sent')
      .maybeSingle();

    if (existingNotification) {
      return new Response(
        JSON.stringify({
          message: 'Notification already sent for this post',
          post_id: postId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const oneSignalPayload = {
      app_id: settings.onesignal_app_id,
      included_segments: ['All'],
      headings: { en: 'New Post Available!' },
      contents: { en: postTitle },
      url: postUrl,
    };

    const oneSignalResponse = await fetch(
      'https://onesignal.com/api/v1/notifications',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${settings.onesignal_api_key}`,
        },
        body: JSON.stringify(oneSignalPayload),
      }
    );

    const oneSignalResult = await oneSignalResponse.json();

    if (!oneSignalResponse.ok) {
      await supabase.from('sent_notifications').insert({
        post_id: postId,
        post_title: postTitle,
        post_url: postUrl,
        status: 'failed',
        error_message: JSON.stringify(oneSignalResult),
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to send notification',
          details: oneSignalResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('sent_notifications').insert({
      post_id: postId,
      post_title: postTitle,
      post_url: postUrl,
      status: 'sent',
      recipients_count: oneSignalResult.recipients || 0,
      onesignal_notification_id: oneSignalResult.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily notification sent successfully at IST',
        notification_id: oneSignalResult.id,
        recipients: oneSignalResult.recipients,
        post: { id: postId, title: postTitle, url: postUrl },
        timezone: 'Asia/Kolkata (IST, UTC+5:30)',
        timestamp_ist: istTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
