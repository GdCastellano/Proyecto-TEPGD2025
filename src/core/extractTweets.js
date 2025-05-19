import { saveTweets } from "./saveTweets.js"
import { clients } from "./setupClients.js"
import { tweetFilter } from "./tweetFilter.js";

export const extractTweets = async ({
    accounts,
    maxTweets,
    startDate,
    endDate,
    twitterConfig,
    supabaseConfig,
}) => {
    const { twitterClient, supabaseClient } = clients(twitterConfig, supabaseConfig);
    let totalRequests = 0;

    if (!accounts || accounts.length === 0) {
        throw new Error('Se requiere al menos una cuenta');
    }
    if (accounts.length > 10) {
        throw new Error('Máximo 10 cuentas permitidas');
    }
    if (!maxTweets || maxTweets < 1 || maxTweets > 100) {
        throw new Error('maxTweets debe estar entre 1 y 100');
    }
    if (!startDate || !endDate) {
        throw new Error('startDate y endDate son requeridos');
    }

    const startTime = `${startDate}T00:00:00Z`;
    const endTime = `${endDate}T23:59:59Z`;

    console.log(`Extrayendo hasta ${maxTweets} tweets por cuenta desde ${startDate} hasta ${endDate}`);

    for (const username of accounts) {
        try {
            console.log(`Procesando cuenta: ${username}`);
            totalRequests++;
            const user = await twitterClient.v2.userByUsername(username);
            if (!user.data) {
                console.warn(`Usuario ${username} no encontrado`);
                continue;
            }

            let tweetsFetched = 0;
            totalRequests++;
            const tweets = await twitterClient.v2.userTimeline(user.data.id, {
                max_results: Math.min(maxTweets, 100),
                'tweet.fields': 'created_at,public_metrics,text',
                start_time: startTime,
                end_time: endTime,
            });

            for await (const tweet of tweets) {
                if (tweetsFetched >= maxTweets) break;
                let tweetFiltered = await tweetFilter(tweet)

                if (Object.keys(tweetFiltered).length === 0) {
                    await saveTweets(supabaseClient, tweet, username);
                };

                tweetsFetched++;
            }

            console.log(`Extraídos ${tweetsFetched} tweets para ${username}`);
        } catch (error) {
            console.error(`Error procesando ${username}:`, error.message);
            console.error(error);
        }
    }

    console.log(`Extracción completada. Total de solicitudes API: ${totalRequests}`);
}