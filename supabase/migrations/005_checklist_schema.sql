-- Voyu ISO 27001 MVP: Checklist Schema
-- Migration 005: checklist_templates + workspace_checklist_items

-- Checklist Templates (global, seed data)
CREATE TABLE checklist_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text,
  category    text NOT NULL CHECK (category IN ('preparation', 'documentation', 'implementation', 'review')),
  sort_order  int NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Workspace Checklist Items (per-workspace status)
CREATE TABLE workspace_checklist_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id   uuid NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at  timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(workspace_id, template_id)
);

-- Trigger for updated_at
CREATE TRIGGER workspace_checklist_items_updated_at
  BEFORE UPDATE ON workspace_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX workspace_checklist_items_workspace_idx ON workspace_checklist_items(workspace_id);

-- Enable RLS
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- checklist_templates: SELECT only for authenticated
CREATE POLICY "Authenticated users can read checklist templates"
  ON checklist_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- workspace_checklist_items: CRUD via workspace ownership
CREATE POLICY "Users can read own checklist items"
  ON workspace_checklist_items
  FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can create checklist items in own workspaces"
  ON workspace_checklist_items
  FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own checklist items"
  ON workspace_checklist_items
  FOR UPDATE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own checklist items"
  ON workspace_checklist_items
  FOR DELETE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
