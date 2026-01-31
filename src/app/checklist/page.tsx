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
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Implementation Checklist</h1>
            <p className="text-gray-600">Track your ISO 27001 implementation progress</p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </Link>
        </div>

        {/* Progress Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {completedItems} of {totalItems} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-gray-500">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              Completed: {completedItems}
            </span>
            <span className="text-gray-500">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
              In Progress: {inProgressItems}
            </span>
            <span className="text-gray-500">
              <span className="inline-block w-3 h-3 bg-gray-300 rounded-full mr-1"></span>
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

            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h2>
                    <span className="text-sm text-gray-500">
                      {categoryCompleted} / {categoryItems.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
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
