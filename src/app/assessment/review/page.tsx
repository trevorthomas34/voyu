import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ASSESSMENT_SECTIONS, type Question, type Assessment, type AssessmentAnswer } from '@/lib/types'
import CompleteButton from './complete-button'

function formatAnswer(question: Question, answer: AssessmentAnswer | undefined): string {
  if (!answer) return '—'
  if (answer.is_na) return 'Not Applicable'

  const val = answer.value
  if (val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
    return '—'
  }

  if (question.question_type === 'yes_no') {
    return val === true ? 'Yes' : val === false ? 'No' : '—'
  }

  if (question.question_type === 'text') {
    return String(val)
  }

  if (question.question_type === 'single_choice' && question.options) {
    const opt = question.options.find((o) => o.value === val)
    return opt?.label || String(val)
  }

  if (question.question_type === 'multi_choice' && question.options && Array.isArray(val)) {
    return val
      .map((v) => question.options?.find((o) => o.value === v)?.label || v)
      .join(', ')
  }

  return String(val)
}

export default async function ReviewPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!workspace) redirect('/onboarding')

  // Get assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('workspace_id', workspace.id)
    .single<Assessment>()

  if (!assessment) redirect('/assessment')

  // Get all questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('question_set_id', assessment.question_set_id)
    .order('section')
    .order('section_order')

  // Get all responses
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessment.id)

  // Build answers map
  const answersMap: Record<string, AssessmentAnswer> = {}
  for (const resp of responses || []) {
    answersMap[resp.question_id] = resp.answer as AssessmentAnswer
  }

  // Group questions by section
  const questionsBySection: Record<string, Question[]> = {}
  for (const section of ASSESSMENT_SECTIONS) {
    questionsBySection[section.key] = ((questions as Question[]) || []).filter(
      (q) => q.section === section.key
    )
  }

  // Calculate completion stats
  let totalAnswered = 0
  let totalRequired = 0

  for (const q of (questions as Question[]) || []) {
    if (q.required) totalRequired++
    const answer = answersMap[q.id]
    if (answer) {
      if (answer.is_na) {
        totalAnswered++
      } else {
        const val = answer.value
        if (val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
          totalAnswered++
        }
      }
    }
  }

  const isComplete = totalAnswered >= totalRequired
  const isAlreadyCompleted = assessment.status === 'completed'

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Your Answers</h1>
            <p className="text-gray-600">
              {totalAnswered} of {questions?.length || 0} questions answered
            </p>
          </div>
          <Link
            href="/assessment"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Overview
          </Link>
        </div>

        {!isComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Incomplete Assessment</p>
            <p className="text-yellow-600 text-sm">
              Please answer all required questions before completing the assessment.
            </p>
          </div>
        )}

        {isAlreadyCompleted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">Assessment Completed</p>
              <p className="text-green-600 text-sm">
                Completed on {new Date(assessment.completed_at!).toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/documents"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Generate Documents &rarr;
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {ASSESSMENT_SECTIONS.map((section) => {
            const sectionQuestions = questionsBySection[section.key] || []
            const sectionAnswered = sectionQuestions.filter((q) => {
              const answer = answersMap[q.id]
              if (!answer) return false
              if (answer.is_na) return true
              const val = answer.value
              return val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
            }).length

            return (
              <div key={section.key} className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-semibold text-gray-900">{section.label}</h2>
                    <p className="text-sm text-gray-500">
                      {sectionAnswered} of {sectionQuestions.length} answered
                    </p>
                  </div>
                  <Link
                    href={`/assessment/${section.key}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {sectionQuestions.map((question) => (
                    <div key={question.id} className="px-4 py-3">
                      <p className="text-sm text-gray-600">{question.question_text}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatAnswer(question, answersMap[question.id])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <CompleteButton
            assessmentId={assessment.id}
            disabled={!isComplete}
            isAlreadyCompleted={isAlreadyCompleted}
          />
        </div>
      </div>
    </main>
  )
}
