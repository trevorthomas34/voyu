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
    <div className="p-5 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{decision.control.control_id}</span>
            <h3 className="font-medium text-slate-900">{decision.control.control_name}</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-slate-500 hover:text-slate-700 mt-1 inline-flex items-center gap-1"
          >
            {showDetails ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
                Hide details
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                Show details
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Applicable toggle */}
          <div className="flex rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => handleApplicableChange(true)}
              disabled={saving}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                isApplicable === true
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Applicable
            </button>
            <button
              onClick={() => handleApplicableChange(false)}
              disabled={saving}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                isApplicable === false
                  ? 'bg-slate-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-l-0 border-slate-200'
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
              className={`px-3 py-1.5 text-xs font-medium rounded-full border-0 cursor-pointer ${
                implStatus === 'implemented'
                  ? 'bg-emerald-50 text-emerald-700'
                  : implStatus === 'in_progress'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
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
        <div className="mt-4 ml-0 pl-4 border-l-2 border-indigo-100">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{decision.control.control_description}</p>

          {/* Justification (required if not applicable) */}
          <div>
            <label className="label">
              Justification
              {isApplicable === false && <span className="text-rose-500 ml-1">*</span>}
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
                className={`input flex-1 ${justificationError ? 'border-rose-300 bg-rose-50' : ''}`}
              />
              <button
                onClick={handleJustificationSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {justificationError && (
              <p className="text-sm text-rose-600 mt-1.5">Justification is required when marking as not applicable</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
