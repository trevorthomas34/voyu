'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SoAControl, WorkspaceSoADecision, ImplementationStatus } from '@/lib/types'

const IMPL_STATUS_OPTIONS: { value: ImplementationStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'implemented', label: 'Implemented' },
]

interface SoAControlRowProps {
  decision: WorkspaceSoADecision & { control: SoAControl }
}

export default function SoAControlRow({ decision }: SoAControlRowProps) {
  const router = useRouter()
  const [isApplicable, setIsApplicable] = useState<boolean | null>(decision.is_applicable)
  const [justification, setJustification] = useState(decision.justification || '')
  const [implStatus, setImplStatus] = useState<ImplementationStatus | null>(decision.implementation_status)
  const [saving, setSaving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [justificationError, setJustificationError] = useState(false)

  const supabase = createClient()

  const saveDecision = async (updates: Partial<WorkspaceSoADecision>) => {
    setSaving(true)
    await supabase
      .from('workspace_soa_decisions')
      .update(updates)
      .eq('id', decision.id)
    setSaving(false)
    router.refresh()
  }

  const handleApplicableChange = async (value: boolean) => {
    setIsApplicable(value)
    setJustificationError(false)

    if (value === false && !justification.trim()) {
      setJustificationError(true)
      setShowDetails(true)
      return
    }

    await saveDecision({
      is_applicable: value,
      implementation_status: value ? (implStatus || 'not_started') : null,
    })
  }

  const handleJustificationSave = async () => {
    if (isApplicable === false && !justification.trim()) {
      setJustificationError(true)
      return
    }

    setJustificationError(false)
    await saveDecision({
      justification: justification.trim() || null,
      is_applicable: isApplicable,
    })
  }

  const handleImplStatusChange = async (value: ImplementationStatus) => {
    setImplStatus(value)
    await saveDecision({ implementation_status: value })
  }

  return (
    <div className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-500">{decision.control.control_id}</span>
            <h3 className="font-medium text-gray-900">{decision.control.control_name}</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 mt-1"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Applicable toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => handleApplicableChange(true)}
              disabled={saving}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                isApplicable === true
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Applicable
            </button>
            <button
              onClick={() => handleApplicableChange(false)}
              disabled={saving}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                isApplicable === false
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              N/A
            </button>
          </div>

          {/* Implementation status (only if applicable) */}
          {isApplicable === true && (
            <select
              value={implStatus || 'not_started'}
              onChange={(e) => handleImplStatusChange(e.target.value as ImplementationStatus)}
              disabled={saving}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white"
            >
              {IMPL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Details panel */}
      {showDetails && (
        <div className="mt-4 pl-4 border-l-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-3">{decision.control.control_description}</p>

          {/* Justification (required if not applicable) */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification
              {isApplicable === false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value)
                  setJustificationError(false)
                }}
                placeholder={isApplicable === false ? 'Required: explain why not applicable' : 'Optional notes'}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
                  justificationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <button
                onClick={handleJustificationSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {justificationError && (
              <p className="text-sm text-red-600 mt-1">Justification is required when marking as not applicable</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
