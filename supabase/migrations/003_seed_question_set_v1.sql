-- Voyu ISO 27001 MVP: Seed Question Set v1.0
-- Migration 003: Insert question set and 50 questions

-- Insert the question set
INSERT INTO question_sets (id, version, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'v1.0', 'ISO 27001 Core Assessment', true);

-- Section: Organization Context (8 questions)
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES
('00000000-0000-0000-0000-000000000001', 'organization', 1, 'org_name', 'What is your company''s legal name?', 'text', NULL, 'Enter the full legal name of your organization', true, false),

('00000000-0000-0000-0000-000000000001', 'organization', 2, 'org_industry', 'What industry does your company operate in?', 'single_choice', '[{"value":"technology","label":"Technology / Software"},{"value":"healthcare","label":"Healthcare / Medical"},{"value":"finance","label":"Finance / Banking"},{"value":"retail","label":"Retail / E-commerce"},{"value":"manufacturing","label":"Manufacturing"},{"value":"professional_services","label":"Professional Services"},{"value":"education","label":"Education"},{"value":"government","label":"Government"},{"value":"other","label":"Other"}]', NULL, true, false),

('00000000-0000-0000-0000-000000000001', 'organization', 3, 'org_size', 'How many employees does your company have?', 'single_choice', '[{"value":"1-10","label":"1-10 employees"},{"value":"11-50","label":"11-50 employees"},{"value":"51-200","label":"51-200 employees"},{"value":"201-500","label":"201-500 employees"},{"value":"501-1000","label":"501-1000 employees"},{"value":"1000+","label":"1000+ employees"}]', NULL, true, false),

('00000000-0000-0000-0000-000000000001', 'organization', 4, 'org_locations', 'Where are your offices/operations located?', 'multi_choice', '[{"value":"north_america","label":"North America"},{"value":"europe","label":"Europe"},{"value":"asia_pacific","label":"Asia Pacific"},{"value":"latin_america","label":"Latin America"},{"value":"middle_east","label":"Middle East"},{"value":"africa","label":"Africa"},{"value":"remote_only","label":"Fully Remote"}]', 'Select all regions where you have operations', true, false),

('00000000-0000-0000-0000-000000000001', 'organization', 5, 'org_regulations', 'What regulations apply to your business?', 'multi_choice', '[{"value":"gdpr","label":"GDPR"},{"value":"hipaa","label":"HIPAA"},{"value":"pci_dss","label":"PCI DSS"},{"value":"sox","label":"SOX"},{"value":"ccpa","label":"CCPA"},{"value":"fedramp","label":"FedRAMP"},{"value":"none","label":"None / Unsure"}]', 'Select all applicable regulations', true, true),

('00000000-0000-0000-0000-000000000001', 'organization', 6, 'org_existing_certs', 'Do you have any existing security certifications?', 'multi_choice', '[{"value":"soc2","label":"SOC 2"},{"value":"iso27001","label":"ISO 27001"},{"value":"iso9001","label":"ISO 9001"},{"value":"hipaa","label":"HIPAA Compliance"},{"value":"pci_dss","label":"PCI DSS"},{"value":"fedramp","label":"FedRAMP"},{"value":"none","label":"None"}]', NULL, true, true),

('00000000-0000-0000-0000-000000000001', 'organization', 7, 'org_security_tools', 'What security tools do you currently use?', 'multi_choice', '[{"value":"antivirus","label":"Antivirus / EDR"},{"value":"firewall","label":"Firewall"},{"value":"siem","label":"SIEM"},{"value":"idp","label":"Identity Provider (Okta, Azure AD)"},{"value":"mfa","label":"MFA Solution"},{"value":"vpn","label":"VPN"},{"value":"dlp","label":"Data Loss Prevention"},{"value":"none","label":"None"}]', NULL, true, true),

('00000000-0000-0000-0000-000000000001', 'organization', 8, 'org_previous_audits', 'Have you undergone security audits before?', 'yes_no', NULL, 'Including internal audits, penetration tests, or third-party assessments', true, false);

-- Section: Leadership & Governance (8 questions)
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES
('00000000-0000-0000-0000-000000000001', 'leadership', 1, 'lead_sponsor', 'Who is the executive sponsor for ISO 27001?', 'text', NULL, 'Enter name and title (e.g., "Jane Smith, CTO")', true, false),

('00000000-0000-0000-0000-000000000001', 'leadership', 2, 'lead_security_role', 'Do you have a dedicated security role?', 'yes_no', NULL, 'Someone whose primary responsibility is information security', true, false),

('00000000-0000-0000-0000-000000000001', 'leadership', 3, 'lead_security_title', 'What is the security lead''s title?', 'single_choice', '[{"value":"ciso","label":"CISO"},{"value":"security_manager","label":"Security Manager"},{"value":"it_director","label":"IT Director"},{"value":"cto","label":"CTO"},{"value":"other","label":"Other"}]', NULL, false, true),

('00000000-0000-0000-0000-000000000001', 'leadership', 4, 'lead_budget', 'Is there a dedicated security budget?', 'yes_no', NULL, 'A specific budget allocation for security initiatives', true, false),

('00000000-0000-0000-0000-000000000001', 'leadership', 5, 'lead_board_reporting', 'Does security report to the board?', 'yes_no', NULL, 'Regular security updates to board or executives', true, true),

('00000000-0000-0000-0000-000000000001', 'leadership', 6, 'lead_policies_exist', 'Do you have documented security policies?', 'yes_no', NULL, 'Written policies covering information security', true, false),

('00000000-0000-0000-0000-000000000001', 'leadership', 7, 'lead_investor_req', 'Do investors require compliance certifications?', 'yes_no', NULL, 'Investor due diligence requiring security certifications', true, true),

('00000000-0000-0000-0000-000000000001', 'leadership', 8, 'lead_customer_req', 'Do customers ask about your security posture?', 'yes_no', NULL, 'Customer security questionnaires or audits', true, false);

-- Section: Risk Management (10 questions)
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES
('00000000-0000-0000-0000-000000000001', 'risk', 1, 'risk_assets', 'What are your most critical information assets?', 'multi_choice', '[{"value":"customer_data","label":"Customer Data"},{"value":"employee_data","label":"Employee Data"},{"value":"financial_data","label":"Financial Records"},{"value":"intellectual_property","label":"Intellectual Property / Source Code"},{"value":"contracts","label":"Contracts / Legal Documents"},{"value":"credentials","label":"System Credentials / Keys"},{"value":"other","label":"Other"}]', 'Select all that are critical to your business', true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 2, 'risk_data_types', 'What types of sensitive data do you handle?', 'multi_choice', '[{"value":"pii","label":"Personal Identifiable Information (PII)"},{"value":"phi","label":"Protected Health Information (PHI)"},{"value":"financial","label":"Financial / Payment Data"},{"value":"credentials","label":"Authentication Credentials"},{"value":"proprietary","label":"Proprietary Business Data"},{"value":"none","label":"None"}]', NULL, true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 3, 'risk_data_locations', 'Where is your sensitive data stored?', 'multi_choice', '[{"value":"cloud_saas","label":"Cloud SaaS Applications"},{"value":"cloud_iaas","label":"Cloud Infrastructure (AWS, Azure, GCP)"},{"value":"on_premise","label":"On-Premise Servers"},{"value":"employee_devices","label":"Employee Devices"},{"value":"third_party","label":"Third-Party Vendors"},{"value":"paper","label":"Physical / Paper Documents"}]', NULL, true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 4, 'risk_vendors', 'Do you use third-party vendors for critical services?', 'yes_no', NULL, 'Vendors that process, store, or access your data', true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 5, 'risk_vendor_list', 'Which critical third-party services do you use?', 'multi_choice', '[{"value":"cloud_hosting","label":"Cloud Hosting (AWS, Azure, GCP)"},{"value":"payment","label":"Payment Processing"},{"value":"crm","label":"CRM (Salesforce, HubSpot)"},{"value":"hr","label":"HR / Payroll"},{"value":"email","label":"Email / Collaboration"},{"value":"analytics","label":"Analytics"},{"value":"support","label":"Customer Support"},{"value":"other","label":"Other"}]', NULL, true, true),

('00000000-0000-0000-0000-000000000001', 'risk', 6, 'risk_past_incidents', 'Have you experienced security incidents?', 'yes_no', NULL, 'Data breaches, malware, unauthorized access, etc.', true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 7, 'risk_incident_types', 'What types of incidents have you experienced?', 'multi_choice', '[{"value":"phishing","label":"Phishing"},{"value":"malware","label":"Malware / Ransomware"},{"value":"data_breach","label":"Data Breach"},{"value":"unauthorized_access","label":"Unauthorized Access"},{"value":"insider_threat","label":"Insider Threat"},{"value":"ddos","label":"DDoS Attack"},{"value":"other","label":"Other"}]', NULL, false, true),

('00000000-0000-0000-0000-000000000001', 'risk', 8, 'risk_assessment_done', 'Have you performed a formal risk assessment?', 'yes_no', NULL, 'Documented assessment of information security risks', true, false),

('00000000-0000-0000-0000-000000000001', 'risk', 9, 'risk_known_gaps', 'What security gaps are you aware of?', 'text', NULL, 'Describe any known security weaknesses or areas for improvement', false, true),

('00000000-0000-0000-0000-000000000001', 'risk', 10, 'risk_priorities', 'What are your top security priorities?', 'multi_choice', '[{"value":"compliance","label":"Regulatory Compliance"},{"value":"data_protection","label":"Data Protection"},{"value":"access_control","label":"Access Control"},{"value":"incident_response","label":"Incident Response"},{"value":"vendor_management","label":"Vendor Security"},{"value":"training","label":"Security Awareness"},{"value":"monitoring","label":"Security Monitoring"}]', 'Select your top 3 priorities', true, false);

-- Section: Security Controls (15 questions)
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES
('00000000-0000-0000-0000-000000000001', 'controls', 1, 'ctrl_access_sso', 'Do you use SSO for application access?', 'yes_no', NULL, 'Single Sign-On for centralized authentication', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 2, 'ctrl_access_mfa', 'Is MFA required for all users?', 'yes_no', NULL, 'Multi-factor authentication for all user accounts', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 3, 'ctrl_access_review', 'Do you conduct access reviews?', 'yes_no', NULL, 'Periodic review of user access rights', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 4, 'ctrl_endpoint_mdm', 'Do you use endpoint management (MDM/EDR)?', 'yes_no', NULL, 'Mobile Device Management or Endpoint Detection & Response', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 5, 'ctrl_endpoint_encrypt', 'Are all devices encrypted?', 'yes_no', NULL, 'Full disk encryption on laptops and mobile devices', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 6, 'ctrl_cloud_provider', 'Which cloud providers do you use?', 'multi_choice', '[{"value":"aws","label":"Amazon Web Services (AWS)"},{"value":"azure","label":"Microsoft Azure"},{"value":"gcp","label":"Google Cloud Platform (GCP)"},{"value":"digitalocean","label":"DigitalOcean"},{"value":"heroku","label":"Heroku"},{"value":"vercel","label":"Vercel"},{"value":"other","label":"Other"},{"value":"none","label":"None / On-Premise Only"}]', NULL, true, true),

('00000000-0000-0000-0000-000000000001', 'controls', 7, 'ctrl_cloud_security', 'Do you use cloud security tools (CSPM, etc.)?', 'yes_no', NULL, 'Cloud Security Posture Management or similar tools', true, true),

('00000000-0000-0000-0000-000000000001', 'controls', 8, 'ctrl_data_classification', 'Do you classify data by sensitivity?', 'yes_no', NULL, 'Data classification scheme (public, internal, confidential, etc.)', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 9, 'ctrl_data_encryption', 'Is data encrypted at rest and in transit?', 'yes_no', NULL, 'Encryption for stored data and data transmission', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 10, 'ctrl_backup_exists', 'Do you have regular backup procedures?', 'yes_no', NULL, 'Scheduled backups of critical data and systems', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 11, 'ctrl_backup_tested', 'Are backups regularly tested?', 'yes_no', NULL, 'Periodic restoration tests to verify backup integrity', true, true),

('00000000-0000-0000-0000-000000000001', 'controls', 12, 'ctrl_network_firewall', 'Do you use firewalls/network segmentation?', 'yes_no', NULL, 'Network security controls to isolate and protect systems', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 13, 'ctrl_vuln_scanning', 'Do you perform vulnerability scanning?', 'yes_no', NULL, 'Regular scanning for security vulnerabilities', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 14, 'ctrl_pentest', 'Do you conduct penetration testing?', 'yes_no', NULL, 'Third-party or internal penetration tests', true, false),

('00000000-0000-0000-0000-000000000001', 'controls', 15, 'ctrl_logging', 'Do you have centralized logging?', 'yes_no', NULL, 'Centralized log collection and monitoring', true, false);

-- Section: Operations & Improvement (9 questions)
INSERT INTO questions (question_set_id, section, section_order, question_key, question_text, question_type, options, help_text, required, show_na_option) VALUES
('00000000-0000-0000-0000-000000000001', 'operations', 1, 'ops_change_mgmt', 'Do you have a change management process?', 'yes_no', NULL, 'Formal process for managing system changes', true, false),

('00000000-0000-0000-0000-000000000001', 'operations', 2, 'ops_change_documented', 'Are changes documented and approved?', 'yes_no', NULL, 'Change requests tracked and approved before implementation', true, true),

('00000000-0000-0000-0000-000000000001', 'operations', 3, 'ops_monitoring', 'Do you monitor systems for anomalies?', 'yes_no', NULL, 'Active monitoring for unusual activity or security events', true, false),

('00000000-0000-0000-0000-000000000001', 'operations', 4, 'ops_incident_process', 'Do you have an incident response process?', 'yes_no', NULL, 'Defined process for handling security incidents', true, false),

('00000000-0000-0000-0000-000000000001', 'operations', 5, 'ops_incident_documented', 'Is the incident process documented?', 'yes_no', NULL, 'Written incident response plan', true, true),

('00000000-0000-0000-0000-000000000001', 'operations', 6, 'ops_training', 'Do employees receive security training?', 'yes_no', NULL, 'Security awareness training for all employees', true, false),

('00000000-0000-0000-0000-000000000001', 'operations', 7, 'ops_training_frequency', 'How often is training conducted?', 'single_choice', '[{"value":"onboarding","label":"Onboarding only"},{"value":"annual","label":"Annually"},{"value":"semi_annual","label":"Semi-annually"},{"value":"quarterly","label":"Quarterly"},{"value":"monthly","label":"Monthly"}]', NULL, true, true),

('00000000-0000-0000-0000-000000000001', 'operations', 8, 'ops_review_process', 'Do you conduct regular security reviews?', 'yes_no', NULL, 'Periodic review of security controls and policies', true, false),

('00000000-0000-0000-0000-000000000001', 'operations', 9, 'ops_improvement_tracking', 'How do you track security improvements?', 'single_choice', '[{"value":"ticketing","label":"Ticketing System (Jira, etc.)"},{"value":"spreadsheet","label":"Spreadsheet"},{"value":"grc_tool","label":"GRC Tool"},{"value":"project_mgmt","label":"Project Management Tool"},{"value":"none","label":"No formal tracking"}]', NULL, true, true);
