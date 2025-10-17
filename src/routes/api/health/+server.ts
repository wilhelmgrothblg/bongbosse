import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  try {
    // Test if Supabase is working
    if (!supabase) {
      return json({ 
        success: false, 
        error: 'Supabase client not initialized',
        env_check: {
          url_exists: !!process.env.PUBLIC_SUPABASE_URL,
          key_exists: !!process.env.PUBLIC_SUPABASE_ANON_KEY
        }
      });
    }

    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('generated_systems')
      .select('count')
      .limit(1);

    if (error) {
      return json({ 
        success: false, 
        error: error.message,
        supabase_available: true 
      });
    }

    return json({ 
      success: true, 
      message: 'Supabase connection working',
      systems_count: data?.length || 0
    });

  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}