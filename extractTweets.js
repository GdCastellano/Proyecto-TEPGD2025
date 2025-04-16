require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { createClient } = require('@supabase/supabase-js');
//const fetch = require('node-fetch');

/**
 * Configura los clientes de Twitter y Supabase
 */
function setupClients(twitterConfig, supabaseConfig) {
  const twitterClient = new TwitterApi(twitterConfig.bearerToken);
  const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  return { twitterClient, supabaseClient };
}

/**
 * Guarda un tweet en Supabase como documento JSONB
 */
async function saveTweet(supabaseClient, tweet, username) {
  try {
    const tweetData = {
      tweet_id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: {
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
      },
      // sentiment: null, // Comentado: análisis de sentimiento
      // hashtags: [],    // Comentado: tendencias
      // keywords: [],    // Comentado: tendencias
    };
    const { error } = await supabaseClient.from('tweets_nosql').insert([
      {
        tweet_data: tweetData,
        username,
        created_at: tweet.created_at,
      },
    ]);
    if (error) throw new Error(`Error saving tweet: ${error.message}`);
    console.log(`Tweet ${tweet.id} saved successfully`);
  } catch (error) {
    console.error(`Failed to save tweet ${tweet.id}:`, error.message);
  }
}

/*
// Comentado: Análisis de sentimiento usando Hugging Face
async function analyzeSentiment(text) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });
    const result = await response.json();
    const label = result[0][0].label;
    return label.includes('5') || label.includes('4') ? 'Positivo' : label.includes('1') || label.includes('2') ? 'Negativo' : 'Neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    return 'Neutral';
  }
}

// Comentado: Extracción de hashtags y palabras clave
function extractTrends(text) {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3 && !word.startsWith('#') && !['para', 'con', 'del', 'los', 'las'].includes(word));
  return { hashtags, keywords: words.slice(0, 5) };
}
*/

/**
 * Extrae tweets de cuentas especificadas
 */
async function extractTweets({
  accounts,
  maxTweets,
  startDate,
  endDate,
  twitterConfig,
  supabaseConfig,
}) {
  const { twitterClient, supabaseClient } = setupClients(twitterConfig, supabaseConfig);
  let totalRequests = 0;

  // Validaciones
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
        await saveTweet(supabaseClient, tweet, username);

        // Comentado: Análisis de sentimiento y tendencias
        /*
        const sentiment = await analyzeSentiment(tweet.text);
        const { hashtags, keywords } = extractTrends(tweet.text);
        await supabaseClient
          .from('tweets_nosql')
          .update({
            tweet_data: {
              tweet_id: tweet.id,
              text: tweet.text,
              created_at: tweet.created_at,
              metrics: tweet.public_metrics,
              sentiment,
              hashtags,
              keywords,
            },
          })
          .eq('tweet_data->>tweet_id', tweet.id);
        */
        tweetsFetched++;
      }

      console.log(`Extraídos ${tweetsFetched} tweets para ${username}`);
    } catch (error) {
      console.error(`Error procesando ${username}:`, error.message);
      console.error(error); // <-- Agrega esta línea
    }
  }

  console.log(`Extracción completada. Total de solicitudes API: ${totalRequests}`);
}

/**
 * Exporta datos a CSV para Power BI
 */
async function exportToCSV(supabaseClient) {
  try {
    const { data } = await supabaseClient.from('tweets_nosql').select('tweet_data, username');
    const csv = data.map(row => {
      const d = row.tweet_data;
      // Solo exporta los campos básicos, los de análisis están comentados
      return `${d.tweet_id},${row.username},${d.text.replace(/,/g, '')},${d.created_at}`;
      // Para análisis, descomentar:
      // return `${d.tweet_id},${row.username},${d.text.replace(/,/g, '')},${d.created_at},${d.sentiment || ''},${(d.hashtags || []).join(';')},${(d.keywords || []).join(';')}`;
    }).join('\n');
    require('fs').writeFileSync('tweets.csv', `tweet_id,username,text,created_at\n${csv}`);
    // Para análisis, descomentar:
    // require('fs').writeFileSync('tweets.csv', `tweet_id,username,text,created_at,sentiment,hashtags,keywords\n${csv}`);
    console.log('Datos exportados a tweets.csv');
  } catch (error) {
    console.error('Error exportando a CSV:', error.message);
  }
}

/**
 * Ejemplo de uso
 */
async function main() {
  const twitterConfig = {
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  };

  const supabaseConfig = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  };

  const params = {
    accounts: ['rafalejov'],
    maxTweets: 5, //5 TWEETS ES EL MINIMO QUE ACEPTA LA API, MAXIMO 100
    startDate: '2025-03-20',
    endDate: '2025-03-21',
  };

  try {
    await extractTweets({ ...params, twitterConfig, supabaseConfig });
    await exportToCSV(createClient(supabaseConfig.url, supabaseConfig.anonKey));
  } catch (error) {
    console.error('Extracción fallida:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractTweets };