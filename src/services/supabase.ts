import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Check your .env file.');
}

// Adaptador universal seguro (Web + iOS + Android)
const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            if (typeof window === 'undefined') return null;
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        }
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.setItem(key, value);
                } catch { }
            }
            return;
        }
        try {
            await SecureStore.setItemAsync(key, value);
        } catch { }
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.removeItem(key);
                } catch { }
            }
            return;
        }
        try {
            await SecureStore.deleteItemAsync(key);
        } catch { }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});