-- Database Schema for Game-Pen Cloudinary Integration
-- Run these commands in your PostgreSQL database

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  genre VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table for game demos
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  genre VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, image_id)
);

-- Create video likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT,
  description TEXT,
  genre VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_genre ON images(genre);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_genre ON videos(genre);
CREATE INDEX IF NOT EXISTS idx_videos_is_public ON videos(is_public);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_image_id ON likes(image_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id); 