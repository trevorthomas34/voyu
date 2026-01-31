import { SupabaseClient } from '@supabase/supabase-js'
import type { Question, AssessmentAnswer, QuestionOption } from '@/lib/types'

export interface AssessmentData {
  workspaceName: string
  workspaceIndustry: string | null
  workspaceSize: string | null
  generatedDate: string
  answers: Record<string, AssessmentAnswer>
  questions: Record<string, Question>
}

export async function getAssessmentData(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<AssessmentData | null> {
  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, industry, employee_count')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return null

  // Get assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, question_set_id')
    .eq('workspace_id', workspaceId)
    .single()

  if (!assessment) return null

  // Get all questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('question_set_id', assessment.question_set_id)

  // Get all responses
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('question_id, answer')
    .eq('assessment_id', assessment.id)

  // Build maps
  const questionsByKey: Record<string, Question> = {}
  const questionIdToKey: Record<string, string> = {}

  for (const q of questions || []) {
    questionsByKey[q.question_key] = q as Question
    questionIdToKey[q.id] = q.question_key
  }

  const answersByKey: Record<string, AssessmentAnswer> = {}
  for (const r of responses || []) {
    const key = questionIdToKey[r.question_id]
    if (key) {
      answersByKey[key] = r.answer as AssessmentAnswer
    }
  }

  return {
    workspaceName: workspace.name,
    workspaceIndustry: workspace.industry,
    workspaceSize: workspace.employee_count,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    answers: answersByKey,
    questions: questionsByKey,
  }
}

// Helper to get a string answer
export function getString(data: AssessmentData, key: string, fallback = '[Not provided]'): string {
  const answer = data.answers[key]
  if (!answer || answer.is_na) return fallback
  if (typeof answer.value === 'string' && answer.value) return answer.value
  return fallback
}

// Helper to get a boolean answer
export function getBool(data: AssessmentData, key: string): boolean | null {
  const answer = data.answers[key]
  if (!answer || answer.is_na) return null
  if (typeof answer.value === 'boolean') return answer.value
  return null
}

// Helper to get yes/no/na string
export function getYesNo(data: AssessmentData, key: string): string {
  const answer = data.answers[key]
  if (!answer) return 'Not answered'
  if (answer.is_na) return 'N/A'
  if (answer.value === true) return 'Yes'
  if (answer.value === false) return 'No'
  return 'Not answered'
}

// Helper to get array of selected values
export function getArray(data: AssessmentData, key: string): string[] {
  const answer = data.answers[key]
  if (!answer || answer.is_na) return []
  if (Array.isArray(answer.value)) return answer.value
  return []
}

// Helper to get labels for selected options
export function getSelectedLabels(data: AssessmentData, key: string): string[] {
  const values = getArray(data, key)
  const question = data.questions[key]
  if (!question?.options) return values

  return values.map((v) => {
    const opt = (question.options as QuestionOption[]).find((o) => o.value === v)
    return opt?.label || v
  })
}

// Helper to get single choice label
export function getChoiceLabel(data: AssessmentData, key: string, fallback = '[Not selected]'): string {
  const answer = data.answers[key]
  if (!answer || answer.is_na) return fallback
  const value = answer.value as string
  if (!value) return fallback

  const question = data.questions[key]
  if (!question?.options) return value

  const opt = (question.options as QuestionOption[]).find((o) => o.value === value)
  return opt?.label || value
}

// Check if answer is N/A
export function isNA(data: AssessmentData, key: string): boolean {
  const answer = data.answers[key]
  return answer?.is_na === true
}
