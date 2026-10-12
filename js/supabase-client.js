import { APP_CONFIG, getConfigurationMessage, isBackendConfigured } from './config.js';

let clientPromise;

export function assertBackendConfigured() {
    if (!isBackendConfigured()) {
        throw new Error(getConfigurationMessage());
    }
}

export async function getSupabaseClient() {
    assertBackendConfigured();

    if (!clientPromise) {
        clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
            .then(({ createClient }) => createClient(
                APP_CONFIG.supabaseUrl,
                APP_CONFIG.supabasePublishableKey,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                    },
                },
            ));
    }

    return clientPromise;
}

