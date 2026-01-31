import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ASSESSMENT_SECTIONS, type Question, type Assessment, type AssessmentResponse } from '@/lib/types'
import SectionForm from './section-form'

interface Props {
  params: { section: string }
}

export default async function SectionPage({ params }: Props) {
  const sectionKey = params.section
  const sectionInfo = ASSESSMENT_SECTIONS.find((s) => s.key === sectionKey)

  if (!sectionInfo) {
    notFound()
  }

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

  // Update current_section
  if (assessment.current_section !== sectionKey) {
    await supabase
      .from('assessments')
      .update({ current_section: sectionKey })
      .eq('id', assessment.id)
  }

  // Get questions for this section
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('question_set_id', assessment.question_set_id)
    .eq('section', sectionKey)
    .order('section_order')

  if (!questions || questions.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Questions</h1>
          <p className="text-gray-600">No questions found for this section.</p>
        </div>
      </main>
    )
  }

  // Get existing responses for these questions
  const questionIds = questions.map((q) => q.id)
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessment.id)
    .in('question_id', questionIds)

  // Build answers map
  const answersMap: Record<string, AssessmentResponse['answer']> = {}
  for (const resp of responses || []) {
    answersMap[resp.question_id] = resp.answer
  }

  // Find prev/next sections
  const currentIdx = ASSESSMENT_SECTIONS.findIndex((s) => s.key === sectionKey)
  const prevSection = currentIdx > 0 ? ASSESSMENT_SECTIONS[currentIdx - 1] : null
  const nextSection = currentIdx < ASSESSMENT_SECTIONS.length - 1 ? ASSESSMENT_SECTIONS[currentIdx + 1] : null

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Section {sectionInfo.order} of {ASSESSMENT_SECTIONS.length}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{sectionInfo.label}</h1>
          </div>
          <Link
            href="/assessment"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Overview
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <SectionForm
            assessmentId={assessment.id}
            questions={questions as Question[]}
            initialAnswers={answersMap}
          />
        </div>

        <div className="flex items-center justify-between">
          {prevSection ? (
            <Link
              href={`/assessment/${prevSection.key}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              &larr; {prevSection.label}
            </Link>
          ) : (
            <div />
          )}

          {nextSection ? (
            <Link
              href={`/assessment/${nextSection.key}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {nextSection.label} &rarr;
            </Link>
          ) : (
            <Link
              href="/assessment/review"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Review Answers &rarr;
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
