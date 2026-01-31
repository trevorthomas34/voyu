'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistTemplate, WorkspaceChecklistItem, ChecklistStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: ChecklistStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
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
    <div className="p-4 flex items-start gap-4">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.template.title}</h3>
        {item.template.description && (
          <p className="text-sm text-gray-500 mt-1">{item.template.description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as ChecklistStatus)}
          disabled={saving}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border-0 cursor-pointer ${currentStatusOption?.color} disabled:opacity-50`}
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
