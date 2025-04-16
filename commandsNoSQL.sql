CREATE TABLE tweets_nosql (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  username TEXT NOT NULL
);