'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GenerateButtonProps {
  hasDocuments: boolean
  assessmentCompleted: boolean
}

export default function GenerateButton({ hasDocuments, assessmentCompleted }: GenerateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate documents')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!assessmentCompleted) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 text-sm">
          Complete your assessment to generate documents.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : hasDocuments ? 'Regenerate Documents' : 'Generate Documents'}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {hasDocuments && !loading && (
        <p className="text-sm text-gray-500">
          Regenerating will update all documents with current assessment data.
        </p>
      )}
    </div>
  )
}
