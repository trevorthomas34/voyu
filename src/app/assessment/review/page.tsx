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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/assessment" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Review Your Answers</h1>
              <p className="text-sm text-slate-500">
                {totalAnswered} of {questions?.length || 0} questions answered
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!isComplete && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-800 font-medium">Incomplete Assessment</p>
              <p className="text-amber-600 text-sm">
                Please answer all required questions before completing the assessment.
              </p>
            </div>
          </div>
        )}

        {isAlreadyCompleted && (
          <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-800 font-medium">Assessment Completed</p>
                <p className="text-emerald-600 text-sm">
                  Completed on {new Date(assessment.completed_at!).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link
              href="/documents"
              className="btn-primary inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Generate Documents
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
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
              <div key={section.key} className="card">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div>
                    <h2 className="font-semibold text-slate-900">{section.label}</h2>
                    <p className="text-sm text-slate-500">
                      {sectionAnswered} of {sectionQuestions.length} answered
                    </p>
                  </div>
                  <Link
                    href={`/assessment/${section.key}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit
                  </Link>
                </div>

                <div className="divide-y divide-slate-50">
                  {sectionQuestions.map((question) => (
                    <div key={question.id} className="px-5 py-4">
                      <p className="text-sm text-slate-500">{question.question_text}</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">
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
