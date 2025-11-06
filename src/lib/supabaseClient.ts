import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

// CREATE TABLE newsletter_subscriptions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   source VARCHAR(100) DEFAULT 'website',
//   active BOOLEAN DEFAULT true
// );

// -- Contact form submissions
// CREATE TABLE contact_submissions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   email VARCHAR(255) NOT NULL,
//   company VARCHAR(255),
//   budget VARCHAR(100),
//   timeline VARCHAR(100),
//   message TEXT NOT NULL,
//   submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   status VARCHAR(50) DEFAULT 'new'
// );

// -- Projects portfolio
// CREATE TABLE projects (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   title VARCHAR(255) NOT NULL,
//   description TEXT,
//   category VARCHAR(100),
//   technologies TEXT[],
//   image_url VARCHAR(500),
//   live_url VARCHAR(500),
//   github_url VARCHAR(500),
//   featured BOOLEAN DEFAULT false,
//   published BOOLEAN DEFAULT true,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// -- Team members (for about page)
// CREATE TABLE team_members (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   role VARCHAR(255),
//   bio TEXT,
//   image_url VARCHAR(500),
//   order_index INTEGER DEFAULT 0,
//   active BOOLEAN DEFAULT true
// );

// -- Testimonials
// CREATE TABLE testimonials (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   company VARCHAR(255),
//   role VARCHAR(255),
//   content TEXT NOT NULL,
//   rating INTEGER DEFAULT 5,
//   project VARCHAR(255),
//   featured BOOLEAN DEFAULT false,
//   active BOOLEAN DEFAULT true
// );