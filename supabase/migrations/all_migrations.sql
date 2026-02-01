-- VOYU ISO 27001 MVP - ALL MIGRATIONS (Fixed for Supabase SQL Editor)
-- Run this entire script in Supabase SQL Editor

-- Migration 001: Initial Schema
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE workspaces (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text NOT NULL,
  industry                text,
  employee_count          text,
  website                 text,
  onboarding_completed_at timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workspaces" ON workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON workspaces FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON workspaces FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX workspaces_user_id_idx ON workspaces(user_id);

-- Migration 002: Assessment Schema
CREATE TABLE question_sets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version     text NOT NULL,
  name        text NOT NULL,
  is_active   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

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

CREATE TABLE assessment_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id   uuid NOT NULL REFERENCES questions(id),
  answer        jsonb NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

CREATE TRIGGER assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER assessment_responses_updated_at BEFORE UPDATE ON assessment_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX questions_set_section_idx ON questions(question_set_id, section, section_order);
CREATE INDEX assessments_workspace_idx ON assessments(workspace_id);
CREATE INDEX assessment_responses_assessment_idx ON assessment_responses(assessment_id);

ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read question sets" ON question_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own assessments" ON assessments FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create assessments in own workspaces" ON assessments FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own assessments" ON assessments FOR UPDATE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())) WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own assessments" ON assessments FOR DELETE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can read own responses" ON assessment_responses FOR SELECT USING (assessment_id IN (SELECT a.id FROM assessments a JOIN workspaces w ON a.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create responses in own assessments" ON assessment_responses FOR INSERT WITH CHECK (assessment_id IN (SELECT a.id FROM assessments a JOIN workspaces w ON a.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update own responses" ON assessment_responses FOR UPDATE USING (assessment_id IN (SELECT a.id FROM assessments a JOIN workspaces w ON a.workspace_id = w.id WHERE w.user_id = auth.uid())) WITH CHECK (assessment_id IN (SELECT a.id FROM assessments a JOIN workspaces w ON a.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can delete own responses" ON assessment_responses FOR DELETE USING (assessment_id IN (SELECT a.id FROM assessments a JOIN workspaces w ON a.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Migration 003: Seed Questions
INSERT INTO question_sets (id, version, name, is_active) VALUES ('00000000-0000-0000-0000-000000000001', 'v1.0', 'ISO 27001 Core Assessment', true);

-- Organization section
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 1, 'org_name', 'What is your company''s legal name?', 'text', NULL, 'Enter the full legal name of your organization', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 2, 'org_industry', 'What industry does your company operate in?', 'single_choice', '[{"value":"technology","label":"Technology / Software"},{"value":"healthcare","label":"Healthcare / Medical"},{"value":"finance","label":"Finance / Banking"},{"value":"retail","label":"Retail / E-commerce"},{"value":"manufacturing","label":"Manufacturing"},{"value":"professional_services","label":"Professional Services"},{"value":"education","label":"Education"},{"value":"government","label":"Government"},{"value":"other","label":"Other"}]', NULL, true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 3, 'org_size', 'How many employees does your company have?', 'single_choice', '[{"value":"1-10","label":"1-10 employees"},{"value":"11-50","label":"11-50 employees"},{"value":"51-200","label":"51-200 employees"},{"value":"201-500","label":"201-500 employees"},{"value":"501-1000","label":"501-1000 employees"},{"value":"1000+","label":"1000+ employees"}]', NULL, true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 4, 'org_locations', 'Where are your offices/operations located?', 'multi_choice', '[{"value":"north_america","label":"North America"},{"value":"europe","label":"Europe"},{"value":"asia_pacific","label":"Asia Pacific"},{"value":"latin_america","label":"Latin America"},{"value":"middle_east","label":"Middle East"},{"value":"africa","label":"Africa"},{"value":"remote_only","label":"Fully Remote"}]', 'Select all regions where you have operations', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 5, 'org_regulations', 'What regulations apply to your business?', 'multi_choice', '[{"value":"gdpr","label":"GDPR"},{"value":"hipaa","label":"HIPAA"},{"value":"pci_dss","label":"PCI DSS"},{"value":"sox","label":"SOX"},{"value":"ccpa","label":"CCPA"},{"value":"fedramp","label":"FedRAMP"},{"value":"none","label":"None / Unsure"}]', 'Select all applicable regulations', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 6, 'org_existing_certs', 'Do you have any existing security certifications?', 'multi_choice', '[{"value":"soc2","label":"SOC 2"},{"value":"iso27001","label":"ISO 27001"},{"value":"iso9001","label":"ISO 9001"},{"value":"hipaa","label":"HIPAA Compliance"},{"value":"pci_dss","label":"PCI DSS"},{"value":"fedramp","label":"FedRAMP"},{"value":"none","label":"None"}]', NULL, true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 7, 'org_security_tools', 'What security tools do you currently use?', 'multi_choice', '[{"value":"antivirus","label":"Antivirus / EDR"},{"value":"firewall","label":"Firewall"},{"value":"siem","label":"SIEM"},{"value":"idp","label":"Identity Provider (Okta, Azure AD)"},{"value":"mfa","label":"MFA Solution"},{"value":"vpn","label":"VPN"},{"value":"dlp","label":"Data Loss Prevention"},{"value":"none","label":"None"}]', NULL, true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'organization', 8, 'org_previous_audits', 'Have you undergone security audits before?', 'yes_no', NULL, 'Including internal audits, penetration tests, or third-party assessments', true, false);

-- Leadership section
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 1, 'lead_sponsor', 'Who is the executive sponsor for ISO 27001?', 'text', NULL, 'Enter name and title (e.g., "Jane Smith, CTO")', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 2, 'lead_security_role', 'Do you have a dedicated security role?', 'yes_no', NULL, 'Someone whose primary responsibility is information security', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 3, 'lead_security_title', 'What is the security lead''s title?', 'single_choice', '[{"value":"ciso","label":"CISO"},{"value":"security_manager","label":"Security Manager"},{"value":"it_director","label":"IT Director"},{"value":"cto","label":"CTO"},{"value":"other","label":"Other"}]', NULL, false, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 4, 'lead_budget', 'Is there a dedicated security budget?', 'yes_no', NULL, 'A specific budget allocation for security initiatives', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 5, 'lead_board_reporting', 'Does security report to the board?', 'yes_no', NULL, 'Regular security updates to board or executives', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 6, 'lead_policies_exist', 'Do you have documented security policies?', 'yes_no', NULL, 'Written policies covering information security', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 7, 'lead_investor_req', 'Do investors require compliance certifications?', 'yes_no', NULL, 'Investor due diligence requiring security certifications', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'leadership', 8, 'lead_customer_req', 'Do customers ask about your security posture?', 'yes_no', NULL, 'Customer security questionnaires or audits', true, false);

-- Risk section
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 1, 'risk_assets', 'What are your most critical information assets?', 'multi_choice', '[{"value":"customer_data","label":"Customer Data"},{"value":"employee_data","label":"Employee Data"},{"value":"financial_data","label":"Financial Records"},{"value":"intellectual_property","label":"Intellectual Property / Source Code"},{"value":"contracts","label":"Contracts / Legal Documents"},{"value":"credentials","label":"System Credentials / Keys"},{"value":"other","label":"Other"}]', 'Select all that are critical to your business', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 2, 'risk_data_types', 'What types of sensitive data do you handle?', 'multi_choice', '[{"value":"pii","label":"Personal Identifiable Information (PII)"},{"value":"phi","label":"Protected Health Information (PHI)"},{"value":"financial","label":"Financial / Payment Data"},{"value":"credentials","label":"Authentication Credentials"},{"value":"proprietary","label":"Proprietary Business Data"},{"value":"none","label":"None"}]', NULL, true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 3, 'risk_data_locations', 'Where is your sensitive data stored?', 'multi_choice', '[{"value":"cloud_saas","label":"Cloud SaaS Applications"},{"value":"cloud_iaas","label":"Cloud Infrastructure (AWS, Azure, GCP)"},{"value":"on_premise","label":"On-Premise Servers"},{"value":"employee_devices","label":"Employee Devices"},{"value":"third_party","label":"Third-Party Vendors"},{"value":"paper","label":"Physical / Paper Documents"}]', NULL, true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 4, 'risk_vendors', 'Do you use third-party vendors for critical services?', 'yes_no', NULL, 'Vendors that process, store, or access your data', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 5, 'risk_vendor_list', 'Which critical third-party services do you use?', 'multi_choice', '[{"value":"cloud_hosting","label":"Cloud Hosting (AWS, Azure, GCP)"},{"value":"payment","label":"Payment Processing"},{"value":"crm","label":"CRM (Salesforce, HubSpot)"},{"value":"hr","label":"HR / Payroll"},{"value":"email","label":"Email / Collaboration"},{"value":"analytics","label":"Analytics"},{"value":"support","label":"Customer Support"},{"value":"other","label":"Other"}]', NULL, true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 6, 'risk_past_incidents', 'Have you experienced security incidents?', 'yes_no', NULL, 'Data breaches, malware, unauthorized access, etc.', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 7, 'risk_incident_types', 'What types of incidents have you experienced?', 'multi_choice', '[{"value":"phishing","label":"Phishing"},{"value":"malware","label":"Malware / Ransomware"},{"value":"data_breach","label":"Data Breach"},{"value":"unauthorized_access","label":"Unauthorized Access"},{"value":"insider_threat","label":"Insider Threat"},{"value":"ddos","label":"DDoS Attack"},{"value":"other","label":"Other"}]', NULL, false, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 8, 'risk_assessment_done', 'Have you performed a formal risk assessment?', 'yes_no', NULL, 'Documented assessment of information security risks', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 9, 'risk_known_gaps', 'What security gaps are you aware of?', 'text', NULL, 'Describe any known security weaknesses or areas for improvement', false, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'risk', 10, 'risk_priorities', 'What are your top security priorities?', 'multi_choice', '[{"value":"compliance","label":"Regulatory Compliance"},{"value":"data_protection","label":"Data Protection"},{"value":"access_control","label":"Access Control"},{"value":"incident_response","label":"Incident Response"},{"value":"vendor_management","label":"Vendor Security"},{"value":"training","label":"Security Awareness"},{"value":"monitoring","label":"Security Monitoring"}]', 'Select your top 3 priorities', true, false);

-- Controls section
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 1, 'ctrl_access_sso', 'Do you use SSO for application access?', 'yes_no', NULL, 'Single Sign-On for centralized authentication', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 2, 'ctrl_access_mfa', 'Is MFA required for all users?', 'yes_no', NULL, 'Multi-factor authentication for all user accounts', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 3, 'ctrl_access_review', 'Do you conduct access reviews?', 'yes_no', NULL, 'Periodic review of user access rights', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 4, 'ctrl_endpoint_mdm', 'Do you use endpoint management (MDM/EDR)?', 'yes_no', NULL, 'Mobile Device Management or Endpoint Detection & Response', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 5, 'ctrl_endpoint_encrypt', 'Are all devices encrypted?', 'yes_no', NULL, 'Full disk encryption on laptops and mobile devices', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 6, 'ctrl_cloud_provider', 'Which cloud providers do you use?', 'multi_choice', '[{"value":"aws","label":"Amazon Web Services (AWS)"},{"value":"azure","label":"Microsoft Azure"},{"value":"gcp","label":"Google Cloud Platform (GCP)"},{"value":"digitalocean","label":"DigitalOcean"},{"value":"heroku","label":"Heroku"},{"value":"vercel","label":"Vercel"},{"value":"other","label":"Other"},{"value":"none","label":"None / On-Premise Only"}]', NULL, true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 7, 'ctrl_cloud_security', 'Do you use cloud security tools (CSPM, etc.)?', 'yes_no', NULL, 'Cloud Security Posture Management or similar tools', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 8, 'ctrl_data_classification', 'Do you classify data by sensitivity?', 'yes_no', NULL, 'Data classification scheme (public, internal, confidential, etc.)', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 9, 'ctrl_data_encryption', 'Is data encrypted at rest and in transit?', 'yes_no', NULL, 'Encryption for stored data and data transmission', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 10, 'ctrl_backup_exists', 'Do you have regular backup procedures?', 'yes_no', NULL, 'Scheduled backups of critical data and systems', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 11, 'ctrl_backup_tested', 'Are backups regularly tested?', 'yes_no', NULL, 'Periodic restoration tests to verify backup integrity', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 12, 'ctrl_network_firewall', 'Do you use firewalls/network segmentation?', 'yes_no', NULL, 'Network security controls to isolate and protect systems', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 13, 'ctrl_vuln_scanning', 'Do you perform vulnerability scanning?', 'yes_no', NULL, 'Regular scanning for security vulnerabilities', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 14, 'ctrl_pentest', 'Do you conduct penetration testing?', 'yes_no', NULL, 'Third-party or internal penetration tests', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'controls', 15, 'ctrl_logging', 'Do you have centralized logging?', 'yes_no', NULL, 'Centralized log collection and monitoring', true, false);

-- Operations section
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 1, 'ops_change_mgmt', 'Do you have a change management process?', 'yes_no', NULL, 'Formal process for managing system changes', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 2, 'ops_change_documented', 'Are changes documented and approved?', 'yes_no', NULL, 'Change requests tracked and approved before implementation', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 3, 'ops_monitoring', 'Do you monitor systems for anomalies?', 'yes_no', NULL, 'Active monitoring for unusual activity or security events', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 4, 'ops_incident_process', 'Do you have an incident response process?', 'yes_no', NULL, 'Defined process for handling security incidents', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 5, 'ops_incident_documented', 'Is the incident process documented?', 'yes_no', NULL, 'Written incident response plan', true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 6, 'ops_training', 'Do employees receive security training?', 'yes_no', NULL, 'Security awareness training for all employees', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 7, 'ops_training_frequency', 'How often is training conducted?', 'single_choice', '[{"value":"onboarding","label":"Onboarding only"},{"value":"annual","label":"Annually"},{"value":"semi_annual","label":"Semi-annually"},{"value":"quarterly","label":"Quarterly"},{"value":"monthly","label":"Monthly"}]', NULL, true, true);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 8, 'ops_review_process', 'Do you conduct regular security reviews?', 'yes_no', NULL, 'Periodic review of security controls and policies', true, false);
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES ('00000000-0000-0000-0000-000000000001', 'operations', 9, 'ops_improvement_tracking', 'How do you track security improvements?', 'single_choice', '[{"value":"ticketing","label":"Ticketing System (Jira, etc.)"},{"value":"spreadsheet","label":"Spreadsheet"},{"value":"grc_tool","label":"GRC Tool"},{"value":"project_mgmt","label":"Project Management Tool"},{"value":"none","label":"No formal tracking"}]', NULL, true, true);

-- Migration 004: Documents Table
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

CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX documents_workspace_idx ON documents(workspace_id);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON documents FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create documents in own workspaces" ON documents FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())) WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Migration 005: Checklist Schema
CREATE TABLE checklist_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text,
  category    text NOT NULL CHECK (category IN ('preparation', 'documentation', 'implementation', 'review')),
  sort_order  int NOT NULL,
  created_at  timestamptz DEFAULT now()
);

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

CREATE TRIGGER workspace_checklist_items_updated_at BEFORE UPDATE ON workspace_checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX workspace_checklist_items_workspace_idx ON workspace_checklist_items(workspace_id);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read checklist templates" ON checklist_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own checklist items" ON workspace_checklist_items FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create checklist items in own workspaces" ON workspace_checklist_items FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own checklist items" ON workspace_checklist_items FOR UPDATE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())) WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own checklist items" ON workspace_checklist_items FOR DELETE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Migration 006: SoA Schema
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

CREATE TRIGGER workspace_soa_decisions_updated_at BEFORE UPDATE ON workspace_soa_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX workspace_soa_decisions_workspace_idx ON workspace_soa_decisions(workspace_id);

ALTER TABLE soa_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_soa_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read SoA controls" ON soa_controls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own SoA decisions" ON workspace_soa_decisions FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create SoA decisions in own workspaces" ON workspace_soa_decisions FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own SoA decisions" ON workspace_soa_decisions FOR UPDATE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())) WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own SoA decisions" ON workspace_soa_decisions FOR DELETE USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Migration 007: Seed Checklist Templates
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('define_scope', 'Define ISMS Scope', 'Document systems, locations, and processes in scope for ISO 27001 certification', 'preparation', 1);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('identify_stakeholders', 'Identify Stakeholders', 'List internal and external interested parties and their requirements', 'preparation', 2);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('assign_security_lead', 'Assign Security Lead', 'Designate person responsible for ISMS implementation and maintenance', 'preparation', 3);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('create_security_policy', 'Create Information Security Policy', 'Draft and approve top-level information security policy', 'documentation', 4);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('document_risk_method', 'Document Risk Assessment Method', 'Define how risks are identified, analyzed, and evaluated', 'documentation', 5);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('complete_risk_register', 'Complete Risk Register', 'Identify and document all information security risks', 'documentation', 6);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('create_soa', 'Create Statement of Applicability', 'Document control applicability decisions with justifications', 'documentation', 7);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('draft_access_policy', 'Draft Access Control Policy', 'Document access management procedures and requirements', 'documentation', 8);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('create_incident_plan', 'Create Incident Response Plan', 'Document incident detection, response, and recovery procedures', 'documentation', 9);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('implement_access_controls', 'Implement Access Controls', 'Deploy SSO, MFA, and access review processes', 'implementation', 10);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('configure_monitoring', 'Configure Security Monitoring', 'Set up logging, alerting, and anomaly detection', 'implementation', 11);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('conduct_risk_assessment', 'Conduct Risk Assessment', 'Execute documented risk assessment methodology', 'implementation', 12);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('deliver_training', 'Deliver Security Training', 'Conduct security awareness training for all employees', 'implementation', 13);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('conduct_internal_audit', 'Conduct Internal Audit', 'Review ISMS effectiveness against ISO 27001 requirements', 'review', 14);
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES ('management_review', 'Management Review', 'Executive review of ISMS status, risks, and improvement opportunities', 'review', 15);

-- Migration 007: Seed SoA Controls
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.1', 'Policies for information security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.', 'Organizational', true, 1);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.2', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Organizational', true, 2);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.3', 'Segregation of duties', 'Conflicting duties and conflicting areas of responsibility shall be segregated.', 'Organizational', true, 3);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.15', 'Access control', 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.', 'Organizational', true, 4);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.17', 'Authentication information', 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.', 'Organizational', true, 5);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.23', 'Information security for use of cloud services', 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organization''s information security requirements.', 'Organizational', true, 6);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.24', 'Information security incident management planning and preparation', 'The organization shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.', 'Organizational', true, 7);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.29', 'Information security during disruption', 'The organization shall plan how to maintain information security at an appropriate level during disruption.', 'Organizational', true, 8);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.5.31', 'Identification of legal, statutory, regulatory and contractual requirements', 'Legal, statutory, regulatory and contractual requirements relevant to information security and the organization''s approach to meet these requirements shall be identified, documented and kept up to date.', 'Organizational', true, 9);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.6.3', 'Information security awareness, education and training', 'Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organization''s information security policy, topic-specific policies and procedures, as relevant for their job function.', 'People', true, 10);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.6.7', 'Remote working', 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organization''s premises.', 'People', true, 11);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.7.9', 'Security of assets off-premises', 'Off-site assets shall be protected.', 'Physical', true, 12);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.1', 'User endpoint devices', 'Information stored on, processed by or accessible via user endpoint devices shall be protected.', 'Technological', true, 13);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.5', 'Secure authentication', 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.', 'Technological', true, 14);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.9', 'Configuration management', 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.', 'Technological', true, 15);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.13', 'Information backup', 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.', 'Technological', true, 16);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.15', 'Logging', 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.', 'Technological', true, 17);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.16', 'Monitoring activities', 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.', 'Technological', true, 18);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.24', 'Use of cryptography', 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.', 'Technological', true, 19);
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES ('A.8.28', 'Secure coding', 'Secure coding principles shall be applied to software development.', 'Technological', true, 20);

-- Verify
SELECT 'Migrations complete!' as status,
       (SELECT count(*) FROM questions) as questions,
       (SELECT count(*) FROM checklist_templates) as checklist_items,
       (SELECT count(*) FROM soa_controls) as soa_controls;
