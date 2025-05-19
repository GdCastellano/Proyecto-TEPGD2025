import { exportCVS } from "./exportCVS.js";
import { extractTweets } from "./extractTweets.js";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function main() {
    const twitterConfig = {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
    };

    const supabaseConfig = {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
    };

    const params = {
        accounts: ['jpeseteiroDT'],
        maxTweets: 10,
        startDate: '2024-06-21',
        endDate: '2024-06-24',
    };

    try {
        await extractTweets({ ...params, twitterConfig, supabaseConfig });
        await exportCVS(createClient(supabaseConfig.url, supabaseConfig.anonKey));
    } catch (error) {
        console.error('Extracción fallida:', error.message);
    }
}

main()