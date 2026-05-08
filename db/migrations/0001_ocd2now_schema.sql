-- =====================================================================
-- OCD2Now schema — ocd_ prefix tables in ajax-harwood-clinic project
-- Apply via Supabase Studio SQL editor. Idempotent — safe to re-run.
-- =====================================================================

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ocd_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('ocd', 'unsure', 'other', 'unset')) DEFAULT 'unset',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Soft markers the app uses internally. NEVER rendered to the user as a
  -- score. See playbook §0.8.
  total_sessions INT DEFAULT 0,
  weeks_active INT DEFAULT 0,
  last_invitation_id INT,
  on_ramp_shown_at TIMESTAMPTZ
);

-- 2. Sessions table — every app session logged
CREATE TABLE IF NOT EXISTS ocd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ocd_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  invitation_id INT,
  completed BOOLEAN DEFAULT FALSE,
  daily_session_count_at_start INT
);

-- 3. Invitation library (sensory experiences)
CREATE TABLE IF NOT EXISTS ocd_invitations (
  id INT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed the 8 v1 invitations. ON CONFLICT keeps re-runs idempotent.
INSERT INTO ocd_invitations (id, slug, title, duration_seconds) VALUES
  (1, 'three-sounds', 'Three sounds', 60),
  (2, 'cold-water', 'Cold water', 60),
  (3, 'five-contacts', 'Five contacts', 50),
  (4, 'one-exhale', 'One slow exhale', 60),
  (5, 'eyes-around', 'Eyes around the room', 45),
  (6, 'bilateral-tap', 'Bilateral tap', 60),
  (7, 'hot-cool', 'What''s hottest, what''s coolest', 45),
  (8, 'next-sound', 'The next sound', 60)
ON CONFLICT (id) DO NOTHING;

-- 4. Crisis modal opens — NOT logged. Intentional. Privacy. (playbook §0.9)

-- =====================================================================
-- Row-level security
-- =====================================================================

ALTER TABLE ocd_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocd_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own row" ON ocd_users;
CREATE POLICY "Users see own row" ON ocd_users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users see own sessions" ON ocd_sessions;
CREATE POLICY "Users see own sessions" ON ocd_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Invitations readable" ON ocd_invitations;
CREATE POLICY "Invitations readable" ON ocd_invitations
  FOR SELECT USING (TRUE);

-- =====================================================================
-- Trigger: create ocd_users row when auth.users row is created.
-- SECURITY DEFINER bypasses RLS so we don't need a client-side INSERT path.
-- (playbook §3 — do not rewrite this to bootstrap from the client.)
-- =====================================================================

CREATE OR REPLACE FUNCTION ocd_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ocd_users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS ocd_on_auth_user_created ON auth.users;
CREATE TRIGGER ocd_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ocd_handle_new_user();

-- =====================================================================
-- Indexes
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_ocd_sessions_user_started
  ON ocd_sessions (user_id, started_at DESC);
