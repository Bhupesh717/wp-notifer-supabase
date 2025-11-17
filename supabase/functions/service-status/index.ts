import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    const { data: lastNotification } = await supabase
      .from('sent_notifications')
      .select('sent_at')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const now = new Date(istTime);
    const scheduleTimeParts = settings.schedule_time.split(':');
    const nextScheduled = new Date(istTime);
    nextScheduled.setHours(parseInt(scheduleTimeParts[0]), parseInt(scheduleTimeParts[1]), 0, 0);

    if (nextScheduled <= now) {
      nextScheduled.setDate(nextScheduled.getDate() + 1);
    }

    const status = {
      service_active: settings.service_active,
      daily_enabled: settings.daily_enabled,
      schedule_time: settings.schedule_time,
      next_scheduled: settings.daily_enabled ? nextScheduled.toISOString() : null,
      last_notification_sent: lastNotification?.sent_at || null,
      configured: !!settings.wordpress_url && !!settings.onesignal_app_id && !!settings.onesignal_api_key,
      timezone: 'Asia/Kolkata (IST, UTC+5:30)',
    };

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
