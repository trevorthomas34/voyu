'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CompleteButtonProps {
  assessmentId: string
  disabled: boolean
  isAlreadyCompleted: boolean
}

export default function CompleteButton({ assessmentId, disabled, isAlreadyCompleted }: CompleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (isAlreadyCompleted) {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (error) {
      console.error('Failed to complete assessment:', error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (isAlreadyCompleted) {
    return (
      <button
        onClick={handleComplete}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
      >
        Back to Dashboard
      </button>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={disabled || loading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Completing...' : 'Complete Assessment'}
    </button>
  )
}
