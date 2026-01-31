-- Voyu ISO 27001 MVP: Seed Checklist Templates + SoA Controls
-- Migration 007

-- Checklist Templates (15 items)
INSERT INTO checklist_templates (template_key, title, description, category, sort_order) VALUES
('define_scope', 'Define ISMS Scope', 'Document systems, locations, and processes in scope for ISO 27001 certification', 'preparation', 1),
('identify_stakeholders', 'Identify Stakeholders', 'List internal and external interested parties and their requirements', 'preparation', 2),
('assign_security_lead', 'Assign Security Lead', 'Designate person responsible for ISMS implementation and maintenance', 'preparation', 3),
('create_security_policy', 'Create Information Security Policy', 'Draft and approve top-level information security policy', 'documentation', 4),
('document_risk_method', 'Document Risk Assessment Method', 'Define how risks are identified, analyzed, and evaluated', 'documentation', 5),
('complete_risk_register', 'Complete Risk Register', 'Identify and document all information security risks', 'documentation', 6),
('create_soa', 'Create Statement of Applicability', 'Document control applicability decisions with justifications', 'documentation', 7),
('draft_access_policy', 'Draft Access Control Policy', 'Document access management procedures and requirements', 'documentation', 8),
('create_incident_plan', 'Create Incident Response Plan', 'Document incident detection, response, and recovery procedures', 'documentation', 9),
('implement_access_controls', 'Implement Access Controls', 'Deploy SSO, MFA, and access review processes', 'implementation', 10),
('configure_monitoring', 'Configure Security Monitoring', 'Set up logging, alerting, and anomaly detection', 'implementation', 11),
('conduct_risk_assessment', 'Conduct Risk Assessment', 'Execute documented risk assessment methodology', 'implementation', 12),
('deliver_training', 'Deliver Security Training', 'Conduct security awareness training for all employees', 'implementation', 13),
('conduct_internal_audit', 'Conduct Internal Audit', 'Review ISMS effectiveness against ISO 27001 requirements', 'review', 14),
('management_review', 'Management Review', 'Executive review of ISMS status, risks, and improvement opportunities', 'review', 15);

-- SoA Controls (20 core controls from ISO 27001:2022 Annex A)
INSERT INTO soa_controls (control_id, control_name, control_description, category, is_core, sort_order) VALUES
('A.5.1', 'Policies for information security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.', 'Organizational', true, 1),
('A.5.2', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Organizational', true, 2),
('A.5.3', 'Segregation of duties', 'Conflicting duties and conflicting areas of responsibility shall be segregated.', 'Organizational', true, 3),
('A.5.15', 'Access control', 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.', 'Organizational', true, 4),
('A.5.17', 'Authentication information', 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.', 'Organizational', true, 5),
('A.5.23', 'Information security for use of cloud services', 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organization''s information security requirements.', 'Organizational', true, 6),
('A.5.24', 'Information security incident management planning and preparation', 'The organization shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.', 'Organizational', true, 7),
('A.5.29', 'Information security during disruption', 'The organization shall plan how to maintain information security at an appropriate level during disruption.', 'Organizational', true, 8),
('A.5.31', 'Identification of legal, statutory, regulatory and contractual requirements', 'Legal, statutory, regulatory and contractual requirements relevant to information security and the organization''s approach to meet these requirements shall be identified, documented and kept up to date.', 'Organizational', true, 9),
('A.6.3', 'Information security awareness, education and training', 'Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organization''s information security policy, topic-specific policies and procedures, as relevant for their job function.', 'People', true, 10),
('A.6.7', 'Remote working', 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organization''s premises.', 'People', true, 11),
('A.7.9', 'Security of assets off-premises', 'Off-site assets shall be protected.', 'Physical', true, 12),
('A.8.1', 'User endpoint devices', 'Information stored on, processed by or accessible via user endpoint devices shall be protected.', 'Technological', true, 13),
('A.8.5', 'Secure authentication', 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.', 'Technological', true, 14),
('A.8.9', 'Configuration management', 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.', 'Technological', true, 15),
('A.8.13', 'Information backup', 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.', 'Technological', true, 16),
('A.8.15', 'Logging', 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.', 'Technological', true, 17),
('A.8.16', 'Monitoring activities', 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.', 'Technological', true, 18),
('A.8.24', 'Use of cryptography', 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.', 'Technological', true, 19),
('A.8.28', 'Secure coding', 'Secure coding principles shall be applied to software development.', 'Technological', true, 20);
