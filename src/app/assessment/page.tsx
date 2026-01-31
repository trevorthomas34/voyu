import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ASSESSMENT_SECTIONS, type Question, type Assessment, type AssessmentResponse } from '@/lib/types'
import ProgressIndicator from '@/components/assessment/progress-indicator'

export default async function AssessmentHubPage() {
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

  // Get active question set
  const { data: questionSet } = await supabase
    .from('question_sets')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!questionSet) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Assessment Not Available</h1>
          <p className="text-gray-600">No active question set found. Please contact support.</p>
        </div>
      </main>
    )
  }

  // Get or create assessment
  let { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('workspace_id', workspace.id)
    .single<Assessment>()

  if (!assessment) {
    const { data: newAssessment, error } = await supabase
      .from('assessments')
      .insert({
        workspace_id: workspace.id,
        question_set_id: questionSet.id,
        status: 'in_progress',
        current_section: 'organization',
      })
      .select()
      .single<Assessment>()

    if (error) {
      return (
        <main className="min-h-screen p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-600">Failed to create assessment: {error.message}</p>
          </div>
        </main>
      )
    }
    assessment = newAssessment
  }

  // Get all questions for this question set
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('question_set_id', questionSet.id)
    .order('section')
    .order('section_order')

  // Get all responses for this assessment
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessment.id)

  // Calculate progress by section
  const questionsBySection: Record<string, Question[]> = {}
  const answeredBySection: Record<string, number> = {}
  const totalBySection: Record<string, number> = {}

  for (const section of ASSESSMENT_SECTIONS) {
    questionsBySection[section.key] = (questions || []).filter((q) => q.section === section.key)
    totalBySection[section.key] = questionsBySection[section.key].length

    const sectionQuestionIds = questionsBySection[section.key].map((q) => q.id)
    const sectionResponses = (responses || []).filter((r) => sectionQuestionIds.includes(r.question_id))
    answeredBySection[section.key] = sectionResponses.filter((r) => {
      const answer = r.answer as { value: unknown; is_na?: boolean }
      return answer.is_na || (answer.value !== null && answer.value !== '' && !(Array.isArray(answer.value) && answer.value.length === 0))
    }).length
  }

  const currentSection = assessment.current_section || 'organization'
  const isCompleted = assessment.status === 'completed'

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">ISO 27001 Assessment</h1>
              <p className="text-sm text-slate-500">Complete the assessment to generate documentation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isCompleted && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-800 font-medium">Assessment Completed</p>
              <p className="text-emerald-600 text-sm">You can still review or update your answers.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {ASSESSMENT_SECTIONS.map((section, index) => {
              const answered = answeredBySection[section.key] || 0
              const total = totalBySection[section.key] || 0
              const isComplete = answered === total && total > 0
              const isCurrent = section.key === currentSection

              return (
                <Link
                  key={section.key}
                  href={`/assessment/${section.key}`}
                  className={`card-hover p-5 flex items-center gap-4 ${
                    isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-600'
                      : isCurrent
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{section.label}</h3>
                    <p className="text-sm text-slate-500">
                      {answered} of {total} questions answered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isComplete && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Complete</span>
                    )}
                    {isCurrent && !isComplete && (
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">In Progress</span>
                    )}
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              )
            })}

            <Link
              href="/assessment/review"
              className="card-hover p-5 flex items-center gap-4 mt-4 bg-slate-50 border-dashed"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">Review & Complete</h3>
                <p className="text-sm text-slate-500">Review all answers and finalize the assessment</p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          <div>
            <ProgressIndicator
              answeredBySection={answeredBySection}
              totalBySection={totalBySection}
              currentSection={currentSection as typeof ASSESSMENT_SECTIONS[number]['key']}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
