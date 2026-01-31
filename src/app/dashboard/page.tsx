import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Workspace, Assessment } from '@/lib/types'
import SignOutButton from './sign-out-button'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .single<Workspace>()

  if (!workspace) {
    redirect('/onboarding')
  }

  // Get assessment if exists
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('workspace_id', workspace.id)
    .single<Assessment>()

  // Get response count if assessment exists
  let responseCount = 0
  let totalQuestions = 0
  if (assessment) {
    const { count: qCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', assessment.question_set_id)

    const { count: rCount } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessment.id)

    totalQuestions = qCount || 0
    responseCount = rCount || 0
  }

  // Get document counts
  const { count: totalDocs } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)

  const { count: readyDocs } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)
    .eq('status', 'ready')

  const documentCount = totalDocs || 0
  const readyDocCount = readyDocs || 0

  // Get checklist progress
  const { count: totalChecklist } = await supabase
    .from('workspace_checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)

  const { count: completedChecklist } = await supabase
    .from('workspace_checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)
    .eq('status', 'completed')

  const checklistTotal = totalChecklist || 0
  const checklistCompleted = completedChecklist || 0
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0

  // Get SoA progress
  const { count: totalSoA } = await supabase
    .from('workspace_soa_decisions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)

  const { data: decidedSoA } = await supabase
    .from('workspace_soa_decisions')
    .select('id')
    .eq('workspace_id', workspace.id)
    .not('is_applicable', 'is', null)

  const soaTotal = totalSoA || 0
  const soaDecided = decidedSoA?.length || 0

  const assessmentProgress = totalQuestions > 0 ? Math.round((responseCount / totalQuestions) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{workspace.name}</h1>
              <p className="text-sm text-slate-500">ISO 27001 Readiness</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Track your certification readiness progress</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Organization Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Organization</h3>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Industry</dt>
                <dd className="text-slate-900 font-medium">{workspace.industry || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Size</dt>
                <dd className="text-slate-900 font-medium">{workspace.employee_count || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Assessment Card */}
          <Link href="/assessment" className="card-hover p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Assessment</h3>
            </div>
            {!assessment ? (
              <>
                <p className="text-sm text-slate-500 mb-3">Not started yet</p>
                <span className="text-sm text-indigo-600 font-medium inline-flex items-center gap-1">
                  Start Assessment
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </>
            ) : assessment.status === 'completed' ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </span>
                </div>
                <p className="text-sm text-slate-500">{responseCount} of {totalQuestions} questions</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-2">In Progress</p>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${assessmentProgress}%` }} />
                </div>
                <p className="text-sm text-slate-500">{assessmentProgress}% complete</p>
              </>
            )}
          </Link>

          {/* Documents Card */}
          <Link href="/documents" className="card-hover p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Documents</h3>
            </div>
            {documentCount === 0 ? (
              <>
                <p className="text-sm text-slate-500 mb-3">No documents yet</p>
                {assessment?.status === 'completed' ? (
                  <span className="text-sm text-indigo-600 font-medium inline-flex items-center gap-1">
                    Generate Documents
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                ) : (
                  <p className="text-sm text-slate-400">Complete assessment first</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {readyDocCount} of 12 ready
                  </span>
                </div>
                <span className="text-sm text-indigo-600 font-medium inline-flex items-center gap-1">
                  View Documents
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </>
            )}
          </Link>

          {/* Checklist Card */}
          <Link href="/checklist" className="card-hover p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Checklist</h3>
            </div>
            {checklistTotal === 0 ? (
              <p className="text-sm text-slate-500">No checklist items</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-semibold text-emerald-600">{checklistPercent}%</span>
                  <span className="text-sm text-slate-500">complete</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${checklistPercent}%` }} />
                </div>
                <p className="text-sm text-slate-500">{checklistCompleted} of {checklistTotal} items</p>
              </>
            )}
          </Link>

          {/* SoA Card */}
          <Link href="/soa" className="card-hover p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Statement of Applicability</h3>
            </div>
            {soaTotal === 0 ? (
              <p className="text-sm text-slate-500">No controls</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-semibold text-indigo-600">{soaDecided}</span>
                  <span className="text-sm text-slate-500">of {soaTotal} decided</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${Math.round((soaDecided / soaTotal) * 100)}%` }} />
                </div>
              </>
            )}
          </Link>
        </div>
      </div>
    </main>
  )
}
