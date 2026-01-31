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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/assessment" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                Section {sectionInfo.order} of {ASSESSMENT_SECTIONS.length}
              </p>
              <h1 className="text-lg font-semibold text-slate-900">{sectionInfo.label}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-6 md:p-8 mb-6">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {prevSection.label}
            </Link>
          ) : (
            <div />
          )}

          {nextSection ? (
            <Link
              href={`/assessment/${nextSection.key}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              {nextSection.label}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/assessment/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Review Answers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
