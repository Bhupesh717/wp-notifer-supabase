import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      .select('wordpress_url')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (!settings || !settings.wordpress_url) {
      return new Response(
        JSON.stringify({ error: 'WordPress URL not configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const wpApiUrl = `${settings.wordpress_url}/wp-json/wp/v2/posts?per_page=100&orderby=date`;
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

    const randomPost = posts[Math.floor(Math.random() * posts.length)];

    const postData = {
      id: randomPost.id.toString(),
      title: randomPost.title.rendered,
      url: randomPost.link,
      excerpt: randomPost.excerpt?.rendered || '',
      image: randomPost.jetpack_featured_media_url || randomPost.featured_media_url || null,
    };

    await supabase.from('random_posts_cache').insert({
      post_id: postData.id,
      post_title: postData.title,
      post_url: postData.url,
      post_excerpt: postData.excerpt,
      post_image: postData.image,
    });

    return new Response(JSON.stringify(postData), {
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