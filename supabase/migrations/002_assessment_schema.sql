-- Voyu ISO 27001 MVP: Assessment Schema
-- Migration 002: question_sets, questions, assessments, assessment_responses

-- Question Sets (versioned templates)
CREATE TABLE question_sets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version     text NOT NULL,
  name        text NOT NULL,
  is_active   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Questions (belong to a question set)
CREATE TABLE questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id uuid NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  section         text NOT NULL,
  section_order   int NOT NULL,
  question_key    text NOT NULL,
  question_text   text NOT NULL,
  question_type   text NOT NULL CHECK (question_type IN ('text', 'single_choice', 'multi_choice', 'yes_no')),
  options         jsonb,
  help_text       text,
  required        boolean DEFAULT true,
  show_na_option  boolean DEFAULT false,
  UNIQUE(question_set_id, question_key)
);

-- Assessments (one per workspace, tied to question set version)
CREATE TABLE assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  question_set_id uuid NOT NULL REFERENCES question_sets(id),
  status          text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_section text,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Assessment Responses
CREATE TABLE assessment_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id   uuid NOT NULL REFERENCES questions(id),
  answer        jsonb NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

-- Triggers for updated_at
CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER assessment_responses_updated_at
  BEFORE UPDATE ON assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX questions_set_section_idx ON questions(question_set_id, section, section_order);
CREATE INDEX assessments_workspace_idx ON assessments(workspace_id);
CREATE INDEX assessment_responses_assessment_idx ON assessment_responses(assessment_id);

-- Enable RLS
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- question_sets: read-only for authenticated users
CREATE POLICY "Authenticated users can read question sets"
  ON question_sets
  FOR SELECT
  TO authenticated
  USING (true);

-- questions: read-only for authenticated users
CREATE POLICY "Authenticated users can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- assessments: CRUD via workspace ownership
CREATE POLICY "Users can read own assessments"
  ON assessments
  FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can create assessments in own workspaces"
  ON assessments
  FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own assessments"
  ON assessments
  FOR UPDATE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own assessments"
  ON assessments
  FOR DELETE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- assessment_responses: CRUD via assessment -> workspace chain
CREATE POLICY "Users can read own responses"
  ON assessment_responses
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses in own assessments"
  ON assessment_responses
  FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses"
  ON assessment_responses
  FOR UPDATE
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own responses"
  ON assessment_responses
  FOR DELETE
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );
