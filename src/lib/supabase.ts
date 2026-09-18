import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljrgpcjhpqucqwsqtylc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cVV3m279ezG7ZlbY2XvsGA_n4dZPPtr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage helper with fallback for offline / mock testing
export async function uploadDocument(file: File, folder: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('aei-documents')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn('Supabase storage upload error, using local object URL fallback:', error.message);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from('aei-documents')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Storage exception, fallback to local URL:', err);
    return URL.createObjectURL(file);
  }
}
