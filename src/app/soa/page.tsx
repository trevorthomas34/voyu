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
              <h1 className="text-lg font-semibold text-slate-900">Statement of Applicability</h1>
              <p className="text-sm text-slate-500">Decide which ISO 27001 controls apply to your organization</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{totalControls}</div>
              <div className="text-sm text-slate-500 mt-1">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{decidedControls}</div>
              <div className="text-sm text-slate-500 mt-1">Decided</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{applicableControls}</div>
              <div className="text-sm text-slate-500 mt-1">Applicable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-400">{notApplicableControls}</div>
              <div className="text-sm text-slate-500 mt-1">Not Applicable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{implementedControls}</div>
              <div className="text-sm text-slate-500 mt-1">Implemented</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Decision Progress</span>
              <span className="font-medium text-indigo-600">{Math.round((decidedControls / totalControls) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(decidedControls / totalControls) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Controls by Category */}
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const categoryDecisions = decisionsByCategory[category]
            if (categoryDecisions.length === 0) return null

            const categoryDecided = categoryDecisions.filter((d) => d.is_applicable !== null).length
            const categoryPercent = Math.round((categoryDecided / categoryDecisions.length) * 100)

            return (
              <div key={category} className="card">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">{category} Controls</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {categoryDecided} / {categoryDecisions.length}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${categoryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
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
