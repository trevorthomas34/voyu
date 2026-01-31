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
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Ready</span>
    case 'generating':
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Generating...</span>
    case 'failed':
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Failed</span>
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Pending</span>
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
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">
              {hasDocuments
                ? `${readyCount} of ${docs.length} documents ready`
                : 'Generate your ISO 27001 documentation'}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {!assessment && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Complete the <Link href="/assessment" className="text-yellow-900 underline">assessment</Link> first to generate documents.
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
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500">No documents generated yet.</p>
            {assessment && assessment.status === 'completed' && (
              <p className="text-sm text-gray-400 mt-2">Click "Generate Documents" to create your documentation.</p>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {docs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    {getStatusBadge(doc.status)}
                  </div>
                  {doc.generated_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Generated: {formatDate(doc.generated_at)}
                    </p>
                  )}
                  {doc.error_message && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: {doc.error_message}
                    </p>
                  )}
                </div>
                {doc.status === 'ready' && (
                  <Link
                    href={`/documents/${doc.id}`}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View &rarr;
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
