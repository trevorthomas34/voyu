-- Voyu ISO 27001 MVP: Documents Table (HTML storage)
-- Migration 004: documents table with content_html

CREATE TABLE documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES assessments(id) ON DELETE SET NULL,
  document_type   text NOT NULL,
  title           text NOT NULL,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  content_html    text,
  storage_path    text,
  error_message   text,
  generated_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(workspace_id, document_type)
);

-- Trigger for updated_at
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX documents_workspace_idx ON documents(workspace_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: CRUD via workspace ownership
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can create documents in own workspaces"
  ON documents
  FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
