-- Voyu ISO 27001 MVP: SoA Schema
-- Migration 006: soa_controls + workspace_soa_decisions

-- SoA Controls (global, ~20 core controls)
CREATE TABLE soa_controls (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id          text UNIQUE NOT NULL,
  control_name        text NOT NULL,
  control_description text NOT NULL,
  category            text NOT NULL CHECK (category IN ('Organizational', 'People', 'Physical', 'Technological')),
  is_core             boolean DEFAULT true,
  sort_order          int NOT NULL,
  created_at          timestamptz DEFAULT now()
);

-- Workspace SoA Decisions (per-workspace applicability)
CREATE TABLE workspace_soa_decisions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id            uuid NOT NULL REFERENCES soa_controls(id) ON DELETE CASCADE,
  is_applicable         boolean,
  justification         text,
  implementation_status text CHECK (implementation_status IN ('not_started', 'in_progress', 'implemented')),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE(workspace_id, control_id)
);

-- Trigger for updated_at
CREATE TRIGGER workspace_soa_decisions_updated_at
  BEFORE UPDATE ON workspace_soa_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX workspace_soa_decisions_workspace_idx ON workspace_soa_decisions(workspace_id);

-- Enable RLS
ALTER TABLE soa_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_soa_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- soa_controls: SELECT only for authenticated
CREATE POLICY "Authenticated users can read SoA controls"
  ON soa_controls
  FOR SELECT
  TO authenticated
  USING (true);

-- workspace_soa_decisions: CRUD via workspace ownership
CREATE POLICY "Users can read own SoA decisions"
  ON workspace_soa_decisions
  FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can create SoA decisions in own workspaces"
  ON workspace_soa_decisions
  FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own SoA decisions"
  ON workspace_soa_decisions
  FOR UPDATE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own SoA decisions"
  ON workspace_soa_decisions
  FOR DELETE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
