import {TwitterApi} from "twitter-api-v2"
import { createClient } from "@supabase/supabase-js";

export const clients = (twitterConfig, supabaseConfig)  => {
    const twitterClient = new TwitterApi(twitterConfig.bearerToken);
    const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    return { twitterClient, supabaseClient };
}

