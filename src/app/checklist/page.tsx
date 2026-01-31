import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ChecklistTemplate, WorkspaceChecklistItem, ChecklistCategory } from '@/lib/types'
import ChecklistItemRow from './checklist-item'

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  preparation: 'Preparation',
  documentation: 'Documentation',
  implementation: 'Implementation',
  review: 'Review',
}

const CATEGORY_ORDER: ChecklistCategory[] = ['preparation', 'documentation', 'implementation', 'review']

export default async function ChecklistPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!workspace) redirect('/onboarding')

  // Get checklist items with templates
  const { data: items } = await supabase
    .from('workspace_checklist_items')
    .select(`
      *,
      template:checklist_templates(*)
    `)
    .eq('workspace_id', workspace.id)
    .order('template(sort_order)')

  const checklistItems = (items || []) as (WorkspaceChecklistItem & { template: ChecklistTemplate })[]

  // Calculate progress
  const totalItems = checklistItems.length
  const completedItems = checklistItems.filter((i) => i.status === 'completed').length
  const inProgressItems = checklistItems.filter((i) => i.status === 'in_progress').length
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Group by category
  const itemsByCategory: Record<ChecklistCategory, typeof checklistItems> = {
    preparation: [],
    documentation: [],
    implementation: [],
    review: [],
  }

  for (const item of checklistItems) {
    const category = item.template.category as ChecklistCategory
    itemsByCategory[category].push(item)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Implementation Checklist</h1>
              <p className="text-sm text-slate-500">Track your ISO 27001 implementation progress</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Summary */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Overall Progress</h2>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{progressPercent}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{completedItems} of {totalItems} completed</p>
            </div>
          </div>
          <div className="progress-bar h-3 mb-4">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Completed: {completedItems}
            </span>
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
              In Progress: {inProgressItems}
            </span>
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
              Pending: {totalItems - completedItems - inProgressItems}
            </span>
          </div>
        </div>

        {/* Checklist by Category */}
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const categoryItems = itemsByCategory[category]
            if (categoryItems.length === 0) return null

            const categoryCompleted = categoryItems.filter((i) => i.status === 'completed').length
            const categoryPercent = Math.round((categoryCompleted / categoryItems.length) * 100)

            return (
              <div key={category} className="card">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">{CATEGORY_LABELS[category]}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {categoryCompleted} / {categoryItems.length}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${categoryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {categoryItems.map((item) => (
                    <ChecklistItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
