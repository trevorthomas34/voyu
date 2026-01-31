// Database types for Voyu ISO 27001 MVP

export interface Workspace {
  id: string
  user_id: string
  name: string
  industry: string | null
  employee_count: string | null
  website: string | null
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

export type WorkspaceInsert = Pick<Workspace, 'user_id' | 'name'> &
  Partial<Pick<Workspace, 'industry' | 'employee_count' | 'website'>>

// Assessment types

export interface QuestionSet {
  id: string
  version: string
  name: string
  is_active: boolean
  created_at: string
}

export type QuestionType = 'text' | 'single_choice' | 'multi_choice' | 'yes_no'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  question_set_id: string
  section: string
  section_order: number
  question_key: string
  question_text: string
  question_type: QuestionType
  options: QuestionOption[] | null
  help_text: string | null
  required: boolean
  show_na_option: boolean
}

export type AssessmentStatus = 'in_progress' | 'completed'

export interface Assessment {
  id: string
  workspace_id: string
  question_set_id: string
  status: AssessmentStatus
  current_section: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AssessmentAnswer {
  value: string | string[] | boolean | null
  is_na?: boolean
}

export interface AssessmentResponse {
  id: string
  assessment_id: string
  question_id: string
  answer: AssessmentAnswer
  created_at: string
  updated_at: string
}

// Section definitions
export const ASSESSMENT_SECTIONS = [
  { key: 'organization', label: 'Organization Context', order: 1 },
  { key: 'leadership', label: 'Leadership & Governance', order: 2 },
  { key: 'risk', label: 'Risk Management', order: 3 },
  { key: 'controls', label: 'Security Controls', order: 4 },
  { key: 'operations', label: 'Operations & Improvement', order: 5 },
] as const

export type SectionKey = typeof ASSESSMENT_SECTIONS[number]['key']

// Document types

export type DocumentStatus = 'pending' | 'generating' | 'ready' | 'failed'

export type DocumentType =
  | 'info_security_policy'
  | 'scope_statement'
  | 'roles_responsibilities_matrix'
  | 'risk_assessment_methodology'
  | 'risk_register'
  | 'risk_treatment_plan'
  | 'soa_lite'
  | 'access_control_policy'
  | 'acceptable_use_policy'
  | 'incident_response_procedure'
  | 'business_continuity_overview'
  | 'implementation_checklist'

export interface Document {
  id: string
  workspace_id: string
  assessment_id: string | null
  document_type: DocumentType
  title: string
  status: DocumentStatus
  content_html: string | null
  storage_path: string | null
  error_message: string | null
  generated_at: string | null
  created_at: string
  updated_at: string
}

export const DOCUMENT_DEFINITIONS: { type: DocumentType; title: string }[] = [
  { type: 'info_security_policy', title: 'Information Security Policy' },
  { type: 'scope_statement', title: 'ISMS Scope Statement' },
  { type: 'roles_responsibilities_matrix', title: 'Roles & Responsibilities Matrix' },
  { type: 'risk_assessment_methodology', title: 'Risk Assessment Methodology' },
  { type: 'risk_register', title: 'Risk Register' },
  { type: 'risk_treatment_plan', title: 'Risk Treatment Plan' },
  { type: 'soa_lite', title: 'Statement of Applicability (Lite)' },
  { type: 'access_control_policy', title: 'Access Control Policy' },
  { type: 'acceptable_use_policy', title: 'Acceptable Use Policy' },
  { type: 'incident_response_procedure', title: 'Incident Response Procedure' },
  { type: 'business_continuity_overview', title: 'Business Continuity Overview' },
  { type: 'implementation_checklist', title: 'Implementation Checklist' },
]

// Checklist types

export type ChecklistCategory = 'preparation' | 'documentation' | 'implementation' | 'review'
export type ChecklistStatus = 'pending' | 'in_progress' | 'completed'

export interface ChecklistTemplate {
  id: string
  template_key: string
  title: string
  description: string | null
  category: ChecklistCategory
  sort_order: number
  created_at: string
}

export interface WorkspaceChecklistItem {
  id: string
  workspace_id: string
  template_id: string
  status: ChecklistStatus
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  template?: ChecklistTemplate
}

// SoA types

export type SoACategory = 'Organizational' | 'People' | 'Physical' | 'Technological'
export type ImplementationStatus = 'not_started' | 'in_progress' | 'implemented'

export interface SoAControl {
  id: string
  control_id: string
  control_name: string
  control_description: string
  category: SoACategory
  is_core: boolean
  sort_order: number
  created_at: string
}

export interface WorkspaceSoADecision {
  id: string
  workspace_id: string
  control_id: string
  is_applicable: boolean | null
  justification: string | null
  implementation_status: ImplementationStatus | null
  created_at: string
  updated_at: string
  control?: SoAControl
}
