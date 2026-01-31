'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Government',
  'Other',
]

const EMPLOYEE_COUNTS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [website, setWebsite] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Create workspace
    const { data: workspace, error: insertError } = await supabase
      .from('workspaces')
      .insert({
        user_id: userId,
        name,
        industry: industry || null,
        employee_count: employeeCount || null,
        website: website || null,
        onboarding_completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !workspace) {
      setError(insertError?.message || 'Failed to create workspace')
      setLoading(false)
      return
    }

    // Initialize checklist items (idempotent via upsert)
    const { data: checklistTemplates } = await supabase
      .from('checklist_templates')
      .select('id')

    if (checklistTemplates && checklistTemplates.length > 0) {
      const checklistItems = checklistTemplates.map((t) => ({
        workspace_id: workspace.id,
        template_id: t.id,
        status: 'pending',
      }))

      await supabase
        .from('workspace_checklist_items')
        .upsert(checklistItems, { onConflict: 'workspace_id,template_id' })
    }

    // Initialize SoA decisions (idempotent via upsert)
    const { data: soaControls } = await supabase
      .from('soa_controls')
      .select('id')

    if (soaControls && soaControls.length > 0) {
      const soaDecisions = soaControls.map((c) => ({
        workspace_id: workspace.id,
        control_id: c.id,
        is_applicable: null,
        implementation_status: null,
      }))

      await supabase
        .from('workspace_soa_decisions')
        .upsert(soaDecisions, { onConflict: 'workspace_id,control_id' })
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="label">
          Organization Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Inc."
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="industry" className="label">
          Industry
        </label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input bg-white cursor-pointer"
        >
          <option value="">Select industry...</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="employeeCount" className="label">
          Company Size
        </label>
        <select
          id="employeeCount"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          className="input bg-white cursor-pointer"
        >
          <option value="">Select size...</option>
          {EMPLOYEE_COUNTS.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="website" className="label">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          className="input"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-rose-50 text-rose-700 border border-rose-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name}
        className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Workspace'}
      </button>
    </form>
  )
}
