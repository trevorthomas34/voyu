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
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-gray-600">ISO 27001 Readiness Dashboard</p>
          </div>
          <SignOutButton />
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Organization */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-2">Organization</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Industry</dt>
                <dd className="text-gray-900">{workspace.industry || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Size</dt>
                <dd className="text-gray-900">{workspace.employee_count || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Assessment */}
          <Link
            href="/assessment"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-2">Assessment</h2>
            {!assessment ? (
              <>
                <p className="text-sm text-gray-500">Not started yet</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">Start Assessment &rarr;</p>
              </>
            ) : assessment.status === 'completed' ? (
              <>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-xs text-gray-500 mt-1">
                  {responseCount} of {totalQuestions} questions answered
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">In Progress ({assessmentProgress}%)</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${assessmentProgress}%` }} />
                </div>
              </>
            )}
          </Link>

          {/* Documents */}
          <Link
            href="/documents"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-2">Documents</h2>
            {documentCount === 0 ? (
              <>
                <p className="text-sm text-gray-500">No documents yet</p>
                {assessment?.status === 'completed' ? (
                  <p className="text-sm text-blue-600 mt-2 font-medium">Generate Documents &rarr;</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Complete assessment first</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-green-600 font-medium">{readyDocCount} of 12 ready</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">View Documents &rarr;</p>
              </>
            )}
          </Link>

          {/* Checklist */}
          <Link
            href="/checklist"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-2">Checklist</h2>
            {checklistTotal === 0 ? (
              <p className="text-sm text-gray-500">No checklist items</p>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-green-600">{checklistPercent}%</span> complete
                </p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${checklistPercent}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {checklistCompleted} of {checklistTotal} items
                </p>
              </>
            )}
          </Link>

          {/* SoA */}
          <Link
            href="/soa"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-2">Statement of Applicability</h2>
            {soaTotal === 0 ? (
              <p className="text-sm text-gray-500">No controls</p>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-blue-600">{soaDecided}</span> of {soaTotal} decided
                </p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.round((soaDecided / soaTotal) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </Link>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-800">
            <strong>All Milestones Complete:</strong> Assessment, document generation, implementation checklist, and Statement of Applicability are fully functional.
          </p>
        </div>
      </div>
    </main>
  )
}
