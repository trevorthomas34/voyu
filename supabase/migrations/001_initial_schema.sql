-- Voyu ISO 27001 MVP: Initial Schema
-- Migration 001: workspaces table with RLS

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Workspaces table (single-user workspace model)
CREATE TABLE workspaces (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text NOT NULL,
  industry                text,
  employee_count          text,  -- '1-10', '11-50', '51-200', '201-500', '500+'
  website                 text,
  onboarding_completed_at timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- Trigger to auto-update updated_at on workspaces
CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own workspaces

-- SELECT: Users can read their own workspaces
CREATE POLICY "Users can read own workspaces"
  ON workspaces
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create workspaces for themselves
CREATE POLICY "Users can create own workspaces"
  ON workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own workspaces
CREATE POLICY "Users can update own workspaces"
  ON workspaces
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own workspaces
CREATE POLICY "Users can delete own workspaces"
  ON workspaces
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster user lookups
CREATE INDEX workspaces_user_id_idx ON workspaces(user_id);
