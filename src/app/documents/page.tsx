import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Document } from '@/lib/types'
import GenerateButton from './generate-button'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ready':
      return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">Ready</span>
    case 'generating':
      return <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">Generating...</span>
    case 'failed':
      return <span className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 rounded-full">Failed</span>
    default:
      return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">Pending</span>
  }
}

export default async function DocumentsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!workspace) redirect('/onboarding')

  // Check if assessment is completed
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status')
    .eq('workspace_id', workspace.id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: true })

  const docs = (documents || []) as Document[]
  const readyCount = docs.filter(d => d.status === 'ready').length
  const hasDocuments = docs.length > 0

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
              <h1 className="text-lg font-semibold text-slate-900">Documents</h1>
              <p className="text-sm text-slate-500">
                {hasDocuments
                  ? `${readyCount} of ${docs.length} documents ready`
                  : 'Generate your ISO 27001 documentation'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!assessment && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-amber-800">
              Complete the <Link href="/assessment" className="text-amber-900 underline font-medium">assessment</Link> first to generate documents.
            </p>
          </div>
        )}

        {assessment && (
          <div className="mb-6">
            <GenerateButton
              hasDocuments={hasDocuments}
              assessmentCompleted={assessment.status === 'completed'}
            />
          </div>
        )}

        {docs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No documents generated yet</p>
            {assessment && assessment.status === 'completed' && (
              <p className="text-sm text-slate-500 mt-1">Click "Generate Documents" above to create your documentation.</p>
            )}
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {docs.map((doc) => (
              <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-900">{doc.title}</h3>
                      {getStatusBadge(doc.status)}
                    </div>
                    {doc.generated_at && (
                      <p className="text-sm text-slate-500 mt-1">
                        Generated {formatDate(doc.generated_at)}
                      </p>
                    )}
                    {doc.error_message && (
                      <p className="text-sm text-rose-600 mt-1">
                        Error: {doc.error_message}
                      </p>
                    )}
                  </div>
                </div>
                {doc.status === 'ready' && (
                  <Link
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    View
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
