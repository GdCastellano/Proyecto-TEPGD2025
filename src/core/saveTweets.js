export const saveTweets = async (supabaseClient, tweet, username) => {
    try {
        const tweetData = {
            tweet_id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            metrics: {
                likes: tweet.public_metrics.like_count,
                retweets: tweet.public_metrics.retweet_count,
            }
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
