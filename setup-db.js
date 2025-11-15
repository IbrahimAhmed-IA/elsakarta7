#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up Supabase database...');
    
    // Users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tournaments table
    console.log('Creating tournaments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        format VARCHAR(50) DEFAULT 'round-robin',
        round_repeats INTEGER DEFAULT 1,
        code VARCHAR(20) UNIQUE NOT NULL,
        creator_id INTEGER NOT NULL REFERENCES users(id),
        score_submission_rule VARCHAR(50) DEFAULT 'admin_only',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tournament admins table
    console.log('Creating tournament_admins table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_admins (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_head_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);

    // Participants table
    console.log('Creating participants table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        eliminated BOOLEAN DEFAULT false,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);

    // Matches table
    console.log('Creating matches table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        player1_id INTEGER NOT NULL REFERENCES users(id),
        player2_id INTEGER NOT NULL REFERENCES users(id),
        round_number INTEGER NOT NULL,
        round_date DATE,
        player1_score INTEGER,
        player2_score INTEGER,
        status VARCHAR(20) DEFAULT 'scheduled',
        winner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    console.log('Creating database indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tournaments_code ON tournaments(code)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_participants_tournament_user ON participants(tournament_id, user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(tournament_id, round_number)');

    // Enable Row Level Security
    console.log('Enabling Row Level Security...');
    await client.query('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE tournament_admins ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE participants ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE matches ENABLE ROW LEVEL SECURITY');

    // Create policies for public access
    console.log('Creating access policies...');
    await client.query('CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON users FOR ALL USING (true)');
    await client.query('CREATE POLICY IF NOT EXISTS "Allow all operations on tournaments" ON tournaments FOR ALL USING (true)');
    await client.query('CREATE POLICY IF NOT EXISTS "Allow all operations on tournament_admins" ON tournament_admins FOR ALL USING (true)');
    await client.query('CREATE POLICY IF NOT EXISTS "Allow all operations on participants" ON participants FOR ALL USING (true)');
    await client.query('CREATE POLICY IF NOT EXISTS "Allow all operations on matches" ON matches FOR ALL USING (true)');

    console.log('✅ Database setup completed successfully!');
    console.log('Your tournament manager is ready to deploy!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);