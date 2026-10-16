import { WatchlistItem } from '../types/stock';
import { supabase } from './supabase';

// Obtener la watchlist del usuario logueado desde Supabase
export async function fetchUserWatchlist(): Promise<WatchlistItem[]> {
    const { data, error } = await supabase
        .from('watchlists')
        .select('ticker, name, shares')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching watchlist:', error.message);
        throw error;
    }

    return (data || []).map((item) => ({
        ticker: item.ticker,
        name: item.name,
        shares: Number(item.shares) || 1,
    }));
}

// Guardar nueva acción en la nube
export async function addStockToCloud(stock: { ticker: string; name: string; shares: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('watchlists').insert({
        user_id: user.id,
        ticker: stock.ticker,
        name: stock.name,
        shares: stock.shares,
    });

    if (error) {
        console.error('Error adding stock:', error.message);
        throw error;
    }
}

// Eliminar acción de la nube
export async function removeStockFromCloud(ticker: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.id)
        .eq('ticker', ticker);

    if (error) {
        console.error('Error removing stock:', error.message);
        throw error;
    }
}