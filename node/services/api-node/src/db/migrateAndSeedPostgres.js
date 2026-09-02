const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = process.env.PG_PORT || '5432';
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const PG_DATABASE = process.env.PG_DATABASE || 'topolgira';

const ROOT_CONN_STRING = `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/postgres`;
const APP_CONN_STRING = `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;

async function runMigrationAndSeed() {
  console.log(`🔌 Connecting to PostgreSQL at ${PG_HOST}:${PG_PORT}...`);
  
  // 1. Ensure Database Exists
  const rootPool = new Pool({ connectionString: ROOT_CONN_STRING });
  try {
    const res = await rootPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [PG_DATABASE]);
    if (res.rows.length === 0) {
      await rootPool.query(`CREATE DATABASE ${PG_DATABASE}`);
      console.log(`✅ Created PostgreSQL database '${PG_DATABASE}'`);
    } else {
      console.log(`ℹ️ PostgreSQL database '${PG_DATABASE}' already exists`);
    }
  } catch (err) {
    console.warn(`Database check note:`, err.message);
  } finally {
    await rootPool.end();
  }

  // 2. Run Schema DDL
  const appPool = new Pool({ connectionString: APP_CONN_STRING });
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log(`📜 Running DDL schema tables in PostgreSQL...`);
  await appPool.query(schemaSql);
  console.log(`✅ PostgreSQL tables created / verified successfully!`);

  // 3. Seed Users and Profiles into PostgreSQL
  const SEED_PROFILES = [
    {
      userId: 'user_ananya_01',
      email: 'ananya.sharma@example.com',
      name: 'Ananya Sharma',
      age: 24,
      gender: 'female',
      city: 'Ranchi',
      profession: 'UI/UX Designer & Illustrator',
      education: 'NID Ahmedabad (B.Des)',
      relationshipGoal: 'marriage',
      bio: 'Loves classical music, indie coffee roasters, weekend hikes around Hundru Falls, and designing delightful mobile experiences.',
      interests: ['Music', 'Travel', 'Art', 'Design', 'Photography', 'Coffee'],
      languages: ['Hindi', 'English', 'Bengali'],
      hobbies: ['Watercolor Painting', 'Acoustic Guitar', 'Baking', 'Trekking'],
      foodPreferences: ['Street Food', 'Authentic Biryani', 'Matcha Latte', 'South Indian'],
      musicInterests: ['Classical', 'Indie Folk', 'Acoustic', 'Coke Studio'],
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_priya_02',
      email: 'priya.hansda@example.com',
      name: 'Priya Hansda',
      age: 23,
      gender: 'female',
      city: 'Jamshedpur',
      profession: 'Sustainable Architect',
      education: 'IIT Kharagpur (B.Arch)',
      relationshipGoal: 'serious_relationship',
      bio: 'Passionate about tribal vernacular architecture, cycling across Jubilee Park, playing ukulele, and collecting vintage vinyl records.',
      interests: ['Architecture', 'Music', 'Cricket', 'Photography', 'Nature', 'Cinema'],
      languages: ['Santhali', 'Hindi', 'English'],
      hobbies: ['Ukulele', 'Cycling', 'Architectural Sketching', 'Bouldering'],
      foodPreferences: ['Local Tribal Delicacies', 'Spicy Momos', 'Fresh Pastas'],
      musicInterests: ['Indie Rock', 'Jazz', 'Santhali Folk Fusion', 'Old Bollywood'],
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_sneha_03',
      email: 'sneha.murmu@example.com',
      name: 'Sneha Murmu',
      age: 25,
      gender: 'female',
      city: 'Ranchi',
      profession: 'AI & Data Scientist',
      education: 'BIT Mesra (M.Tech CS)',
      relationshipGoal: 'marriage',
      bio: 'Building transformer models by day, exploring stargazing spots by night. Big fan of sci-fi novels, gaming tournaments, and late-night drives.',
      interests: ['Technology', 'AI', 'Gaming', 'Music', 'Fitness', 'Astronomy'],
      languages: ['Hindi', 'English', 'Santhali'],
      hobbies: ['Stargazing', 'Competitive Valorant', 'Running 10ks', 'Chess'],
      foodPreferences: ['Ramen', 'Spicy Indian Curries', 'Chaat', 'Dark Chocolate'],
      musicInterests: ['Synthwave', 'Electronic', 'A.R. Rahman', 'Lo-Fi Beats'],
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_aarav_04',
      email: 'aarav.gupta@example.com',
      name: 'Aarav Gupta',
      age: 27,
      gender: 'male',
      city: 'Ranchi',
      profession: 'Product Lead & Entrepreneur',
      education: 'XLRI Jamshedpur (MBA)',
      relationshipGoal: 'marriage',
      bio: 'Startup builder with a love for badminton, specialty pour-overs, and weekend road trips to Patratu Valley. Looking for deep conversations & mutual growth.',
      interests: ['Startups', 'Badminton', 'Travel', 'Reading', 'Philosophy'],
      languages: ['Hindi', 'English'],
      hobbies: ['Badminton', 'Pour-over Brewing', 'Book Club', 'Road Trips'],
      foodPreferences: ['Mediterranean', 'North Indian', 'Filter Coffee'],
      musicInterests: ['Acoustic Pop', 'Blues', 'Classic Rock'],
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_riya_05',
      email: 'riya.sengupta@example.com',
      name: 'Riya Sengupta',
      age: 24,
      gender: 'female',
      city: 'Dhanbad',
      profession: 'Wildlife Veterinarian',
      education: 'WBUAFS Kolkata (BVSc & AH)',
      relationshipGoal: 'serious_relationship',
      bio: 'Dog mom to two rescue golden retrievers. Passionate about animal rescue missions, wildlife photography, and experimenting with sourdough bread.',
      interests: ['Animals', 'Nature', 'Photography', 'Baking', 'Volunteering'],
      languages: ['Bengali', 'Hindi', 'English'],
      hobbies: ['Dog Agility Training', 'Wildlife Safaris', 'Sourdough Baking'],
      foodPreferences: ['Authentic Bengali Fish Curry', 'Italian Pastas', 'Sweets'],
      musicInterests: ['Rabindra Sangeet', 'Soft Rock', 'Folk'],
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_rahul_06',
      email: 'rahul.soren@example.com',
      name: 'Rahul Soren',
      age: 26,
      gender: 'male',
      city: 'Dhanbad',
      profession: 'Full-Stack Software Engineer',
      education: 'IIT (ISM) Dhanbad (B.Tech CSE)',
      relationshipGoal: 'marriage',
      bio: 'Open source contributor, avid guitarist, and weekend cricketer. Always down for sunset walks, good music, and exploring new cuisines.',
      interests: ['Cricket', 'Technology', 'Music', 'Gaming', 'Guitar'],
      languages: ['Hindi', 'English', 'Santhali'],
      hobbies: ['Electric Guitar', 'Weekend Cricket League', 'Hackathons'],
      foodPreferences: ['Litti Chokha', 'Tandoori Platters', 'Biryani'],
      musicInterests: ['Rock', 'Indian Indie', 'Metal'],
      photos: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_tanvi_07',
      email: 'tanvi.patel@example.com',
      name: 'Tanvi Patel',
      age: 25,
      gender: 'female',
      city: 'Ranchi',
      profession: 'Clinical Psychologist',
      education: 'CIP Ranchi (M.Phil Clinical Psychology)',
      relationshipGoal: 'marriage',
      bio: 'Practicing mindfulness, pottery on weekends, and loving podcast discussions on human behavior. Seeking someone kind, thoughtful, and expressive.',
      interests: ['Psychology', 'Mindfulness', 'Pottery', 'Books', 'Podcasts'],
      languages: ['Gujarati', 'Hindi', 'English'],
      hobbies: ['Ceramic Pottery', 'Yoga & Meditation', 'Journaling'],
      foodPreferences: ['Gujarati Thali', 'Avocado Toast', 'Herbal Teas'],
      musicInterests: ['Ambient', 'Classical Sitar', 'Pop'],
      photos: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      userId: 'user_vikram_08',
      email: 'vikram.sethi@example.com',
      name: 'Vikram Sethi',
      age: 28,
      gender: 'male',
      city: 'Jamshedpur',
      profession: 'Senior Metallurgical Engineer',
      education: 'Tata Steel Academy / NIT Jamshedpur',
      relationshipGoal: 'marriage',
      bio: 'Automotive enthusiast, marathon runner, and amateur jazz pianist. Believer in balanced living, strong family bonds, and world travel.',
      interests: ['Automotive', 'Marathons', 'Jazz', 'Travel', 'Cooking'],
      languages: ['Punjabi', 'Hindi', 'English'],
      hobbies: ['Marathon Training', 'Jazz Piano', 'Barbecue Grilling'],
      foodPreferences: ['Tandoori Kebabs', 'Dal Makhani', 'Continental'],
      musicInterests: ['Jazz', 'Soul', 'Punjabi Pop'],
      photos: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  const defaultPasswordHash = await bcrypt.hash('user123', 10);

  // Seed default Demo User (bhima@topolgira.com / bhima@example.com)
  const defaultUsers = [
    {
      id: '70da1f2d-a391-48b1-a4da-d7ad8111efcd',
      email: 'bhima@topolgira.com',
      passwordHash: defaultPasswordHash,
      name: 'Bhima',
      city: 'Ranchi'
    },
    {
      id: '0acb93b6-b8da-4c98-b556-10d54d85cce3',
      email: 'bhima@example.com',
      passwordHash: defaultPasswordHash,
      name: 'Bhima',
      city: 'Ranchi'
    }
  ];

  for (const u of defaultUsers) {
    await appPool.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified) 
       VALUES ($1, $2, $3, 'user', true) 
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash`,
      [u.id, u.email, u.passwordHash]
    );
  }

  // Insert seed profiles into PostgreSQL
  for (const p of SEED_PROFILES) {
    // Generate UUID from seed ID
    const pseudoId = '00000000-0000-0000-0000-' + p.userId.padEnd(12, '0').slice(0, 12).replace(/[^a-f0-9]/g, '0');
    
    // 1. Insert User
    await appPool.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified) 
       VALUES ($1, $2, $3, 'user', true) 
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
      [pseudoId, p.email, defaultPasswordHash]
    );

    // 2. Insert Profile
    await appPool.query(
      `INSERT INTO profiles (
        id, user_id, name, age, gender, city, latitude, longitude, education, profession,
        relationship_goal, bio, interests, languages, hobbies, food_preferences, music_interests, photos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        age = EXCLUDED.age,
        profession = EXCLUDED.profession,
        education = EXCLUDED.education,
        relationship_goal = EXCLUDED.relationship_goal,
        bio = EXCLUDED.bio,
        interests = EXCLUDED.interests,
        languages = EXCLUDED.languages,
        hobbies = EXCLUDED.hobbies,
        food_preferences = EXCLUDED.food_preferences,
        music_interests = EXCLUDED.music_interests,
        photos = EXCLUDED.photos`,
      [
        pseudoId, pseudoId, p.name, p.age, p.gender, p.city, 23.3441, 85.3096, p.education, p.profession,
        p.relationshipGoal, p.bio, p.interests, p.languages, p.hobbies, p.foodPreferences, p.musicInterests, p.photos
      ]
    );
  }

  const profileCount = await appPool.query('SELECT COUNT(*) FROM profiles');
  console.log(`🎉 Seeded PostgreSQL Database Successfully! Total Profiles in PostgreSQL: ${profileCount.rows[0].count}`);

  await appPool.end();
}

runMigrationAndSeed().catch(err => {
  console.error('❌ PostgreSQL Migration & Seed Error:', err);
  process.exit(1);
});
