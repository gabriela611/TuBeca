import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Retorna el cliente de Supabase inicializado a través de la configuración
 * del servidor sin exponer variables con la palabra "public" en el frontend.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    if (typeof window === 'undefined') return null;

    try {
      const res = await fetch('/api/auth/config');
      if (!res.ok) return null;
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        cachedClient = createClient(data.supabaseUrl, data.supabaseAnonKey);
        return cachedClient;
      }
    } catch (e) {
      console.warn('No se pudo inicializar el cliente de Supabase:', e);
    }
    return null;
  })();

  return clientPromise;
}
