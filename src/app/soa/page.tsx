import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { SoAControl, WorkspaceSoADecision, SoACategory } from '@/lib/types'
import SoAControlRow from './soa-control'

const CATEGORY_ORDER: SoACategory[] = ['Organizational', 'People', 'Physical', 'Technological']

export default async function SoAPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!workspace) redirect('/onboarding')

  // Get SoA decisions with controls
  const { data: decisions } = await supabase
    .from('workspace_soa_decisions')
    .select(`
      *,
      control:soa_controls(*)
    `)
    .eq('workspace_id', workspace.id)
    .order('control(sort_order)')

  const soaDecisions = (decisions || []) as (WorkspaceSoADecision & { control: SoAControl })[]

  // Calculate stats
  const totalControls = soaDecisions.length
  const decidedControls = soaDecisions.filter((d) => d.is_applicable !== null).length
  const applicableControls = soaDecisions.filter((d) => d.is_applicable === true).length
  const notApplicableControls = soaDecisions.filter((d) => d.is_applicable === false).length
  const implementedControls = soaDecisions.filter((d) => d.implementation_status === 'implemented').length

  // Group by category
  const decisionsByCategory: Record<SoACategory, typeof soaDecisions> = {
    Organizational: [],
    People: [],
    Physical: [],
    Technological: [],
  }

  for (const decision of soaDecisions) {
    const category = decision.control.category as SoACategory
    decisionsByCategory[category].push(decision)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statement of Applicability</h1>
            <p className="text-gray-600">Decide which ISO 27001 controls apply to your organization</p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </Link>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalControls}</div>
              <div className="text-sm text-gray-500">Total Controls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{decidedControls}</div>
              <div className="text-sm text-gray-500">Decided</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{applicableControls}</div>
              <div className="text-sm text-gray-500">Applicable</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{notApplicableControls}</div>
              <div className="text-sm text-gray-500">Not Applicable</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{implementedControls}</div>
              <div className="text-sm text-gray-500">Implemented</div>
            </div>
          </div>
        </div>

        {/* Controls by Category */}
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const categoryDecisions = decisionsByCategory[category]
            if (categoryDecisions.length === 0) return null

            const categoryDecided = categoryDecisions.filter((d) => d.is_applicable !== null).length

            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{category} Controls</h2>
                    <span className="text-sm text-gray-500">
                      {categoryDecided} / {categoryDecisions.length} decided
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {categoryDecisions.map((decision) => (
                    <SoAControlRow key={decision.id} decision={decision} />
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
