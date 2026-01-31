import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAssessmentData } from '@/lib/documents/assessment-data'
import { TEMPLATE_GENERATORS } from '@/lib/documents/templates'
import { DOCUMENT_DEFINITIONS, type DocumentType } from '@/lib/types'

export async function POST() {
  const supabase = createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
  }

  // Get assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status')
    .eq('workspace_id', workspace.id)
    .single()

  if (!assessment) {
    return NextResponse.json({ error: 'No assessment found' }, { status: 404 })
  }

  // Get assessment data for templates
  const assessmentData = await getAssessmentData(supabase, workspace.id)
  if (!assessmentData) {
    return NextResponse.json({ error: 'Failed to load assessment data' }, { status: 500 })
  }

  const results: { type: DocumentType; status: 'ready' | 'failed'; error?: string }[] = []

  // Generate each document
  for (const docDef of DOCUMENT_DEFINITIONS) {
    try {
      // Mark as generating
      await supabase
        .from('documents')
        .upsert(
          {
            workspace_id: workspace.id,
            assessment_id: assessment.id,
            document_type: docDef.type,
            title: docDef.title,
            status: 'generating',
          },
          { onConflict: 'workspace_id,document_type' }
        )

      // Generate HTML content
      const generator = TEMPLATE_GENERATORS[docDef.type]
      const contentHtml = generator(assessmentData)

      // Update with generated content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'ready',
          content_html: contentHtml,
          generated_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('workspace_id', workspace.id)
        .eq('document_type', docDef.type)

      if (updateError) {
        throw updateError
      }

      results.push({ type: docDef.type, status: 'ready' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Mark as failed
      await supabase
        .from('documents')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('workspace_id', workspace.id)
        .eq('document_type', docDef.type)

      results.push({ type: docDef.type, status: 'failed', error: errorMessage })
    }
  }

  const successCount = results.filter(r => r.status === 'ready').length
  const failedCount = results.filter(r => r.status === 'failed').length

  return NextResponse.json({
    success: true,
    generated: successCount,
    failed: failedCount,
    results,
  })
}
