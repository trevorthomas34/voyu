'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistTemplate, WorkspaceChecklistItem, ChecklistStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: ChecklistStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
]

interface ChecklistItemRowProps {
  item: WorkspaceChecklistItem & { template: ChecklistTemplate }
}

export default function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  const router = useRouter()
  const [status, setStatus] = useState<ChecklistStatus>(item.status)
  const [saving, setSaving] = useState(false)

  const handleStatusChange = async (newStatus: ChecklistStatus) => {
    setSaving(true)
    setStatus(newStatus)

    const supabase = createClient()

    await supabase
      .from('workspace_checklist_items')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', item.id)

    setSaving(false)
    router.refresh()
  }

  const currentStatusOption = STATUS_OPTIONS.find((s) => s.value === status)

  return (
    <div className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        status === 'completed'
          ? 'bg-emerald-100 text-emerald-600'
          : status === 'in_progress'
          ? 'bg-indigo-100 text-indigo-600'
          : 'bg-slate-100 text-slate-400'
      }`}>
        {status === 'completed' ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : status === 'in_progress' ? (
          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
        ) : (
          <div className="w-2 h-2 bg-slate-300 rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
          {item.template.title}
        </h3>
        {item.template.description && (
          <p className="text-sm text-slate-500 mt-0.5">{item.template.description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as ChecklistStatus)}
          disabled={saving}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border-0 cursor-pointer transition-colors ${currentStatusOption?.color} disabled:opacity-50`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
