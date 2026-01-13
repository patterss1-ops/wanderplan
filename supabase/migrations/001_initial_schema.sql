-- WanderPlan Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase Auth users with app-specific data
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS TABLE
-- Core entity - each trip a user plans
-- ============================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'booking', 'booked', 'completed')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIP MEMBERS TABLE
-- Collaboration - who has access to each trip
-- ============================================
CREATE TABLE trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_email TEXT, -- For pending invitations
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(trip_id, user_id)
);

-- ============================================
-- SAVED ITEMS TABLE
-- Research, places, links saved to a trip
-- ============================================
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,

  -- Basic info
  url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  category TEXT CHECK (category IN ('accommodation', 'activity', 'transport', 'food', 'other')),

  -- Location data
  place_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Booking status
  booking_status TEXT DEFAULT 'idea' CHECK (booking_status IN ('idea', 'researching', 'ready', 'booked')),
  is_anchor BOOLEAN DEFAULT FALSE,
  price_estimate DECIMAL(10, 2),
  currency TEXT DEFAULT 'AUD',

  -- Metadata
  image_url TEXT,
  favicon_url TEXT,
  saved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITINERARY DAYS TABLE
-- Day-by-day structure
-- ============================================
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  UNIQUE(trip_id, date)
);

-- ============================================
-- ITINERARY ITEMS TABLE
-- Items scheduled on specific days
-- ============================================
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE NOT NULL,
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE SET NULL,

  -- Custom items (not from saved)
  custom_title TEXT,
  custom_notes TEXT,

  time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening', 'anytime')),
  start_time TIME,
  position INTEGER NOT NULL DEFAULT 0,
  is_anchor BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMENTS TABLE
-- Discussion on saved items
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE
-- Uploaded files (confirmations, tickets)
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- Performance optimization
-- ============================================
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX idx_saved_items_trip_id ON saved_items(trip_id);
CREATE INDEX idx_saved_items_category ON saved_items(category);
CREATE INDEX idx_saved_items_booking_status ON saved_items(booking_status);
CREATE INDEX idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX idx_itinerary_items_day_id ON itinerary_items(day_id);
CREATE INDEX idx_comments_saved_item_id ON comments(saved_item_id);
CREATE INDEX idx_documents_trip_id ON documents(trip_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only see their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips: Users can see trips they're members of
CREATE POLICY "Users can view trips they're members of" ON trips
  FOR SELECT USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip owners/editors can update trips" ON trips
  FOR UPDATE USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

CREATE POLICY "Trip owners can delete trips" ON trips
  FOR DELETE USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Trip Members: Can see members of trips you're in
CREATE POLICY "View members of your trips" ON trip_members
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON trip_members
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Saved Items: Can see items in trips you're a member of
CREATE POLICY "View saved items in your trips" ON saved_items
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Create items in your trips" ON saved_items
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

CREATE POLICY "Update items in your trips" ON saved_items
  FOR UPDATE USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

CREATE POLICY "Delete items in your trips" ON saved_items
  FOR DELETE USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

-- Itinerary Days: Same pattern
CREATE POLICY "View itinerary days in your trips" ON itinerary_days
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Manage itinerary days in your trips" ON itinerary_days
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

-- Itinerary Items: Based on day access
CREATE POLICY "View itinerary items" ON itinerary_items
  FOR SELECT USING (
    day_id IN (
      SELECT id FROM itinerary_days WHERE trip_id IN (
        SELECT trip_id FROM trip_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Manage itinerary items" ON itinerary_items
  FOR ALL USING (
    day_id IN (
      SELECT id FROM itinerary_days WHERE trip_id IN (
        SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
      )
    )
  );

-- Comments: View/create on items you can access
CREATE POLICY "View comments on accessible items" ON comments
  FOR SELECT USING (
    saved_item_id IN (
      SELECT id FROM saved_items WHERE trip_id IN (
        SELECT trip_id FROM trip_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Create comments on accessible items" ON comments
  FOR INSERT WITH CHECK (
    saved_item_id IN (
      SELECT id FROM saved_items WHERE trip_id IN (
        SELECT trip_id FROM trip_members WHERE user_id = auth.uid()
      )
    )
  );

-- Documents: Same as saved items
CREATE POLICY "View documents in your trips" ON documents
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Manage documents in your trips" ON documents
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-add creator as owner when trip is created
CREATE OR REPLACE FUNCTION public.handle_new_trip()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_trip();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_saved_items_updated_at
  BEFORE UPDATE ON saved_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
