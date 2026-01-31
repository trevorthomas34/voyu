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
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ISO 27001 Assessment</h1>
            <p className="text-gray-600">Complete the assessment to generate your documentation</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {isCompleted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Assessment Completed</p>
            <p className="text-green-600 text-sm">You can still review or update your answers.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {ASSESSMENT_SECTIONS.map((section) => {
              const answered = answeredBySection[section.key] || 0
              const total = totalBySection[section.key] || 0
              const isComplete = answered === total && total > 0
              const isCurrent = section.key === currentSection

              return (
                <Link
                  key={section.key}
                  href={`/assessment/${section.key}`}
                  className={`block p-4 rounded-lg border transition-colors ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : isComplete
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{section.label}</h3>
                      <p className="text-sm text-gray-500">
                        {answered} of {total} questions answered
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <span className="text-green-600 text-sm font-medium">Complete</span>
                      )}
                      {isCurrent && !isComplete && (
                        <span className="text-blue-600 text-sm font-medium">In Progress</span>
                      )}
                      <span className="text-gray-400">&rarr;</span>
                    </div>
                  </div>
                </Link>
              )
            })}

            <Link
              href="/assessment/review"
              className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors mt-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Review & Complete</h3>
                  <p className="text-sm text-gray-500">Review all answers and complete the assessment</p>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </div>
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
