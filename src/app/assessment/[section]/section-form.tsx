'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionRenderer from '@/components/assessment/question-renderer'
import type { Question, AssessmentAnswer } from '@/lib/types'

interface SectionFormProps {
  assessmentId: string
  questions: Question[]
  initialAnswers: Record<string, AssessmentAnswer>
}

export default function SectionForm({ assessmentId, questions, initialAnswers }: SectionFormProps) {
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>(initialAnswers)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const pendingSaves = useRef<Set<string>>(new Set())
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({})
  const supabase = createClient()

  const saveAnswer = useCallback(async (questionId: string, answer: AssessmentAnswer) => {
    pendingSaves.current.add(questionId)
    setSaving(true)

    try {
      const { error } = await supabase
        .from('assessment_responses')
        .upsert(
          {
            assessment_id: assessmentId,
            question_id: questionId,
            answer,
          },
          {
            onConflict: 'assessment_id,question_id',
          }
        )

      if (error) {
        console.error('Failed to save:', error)
      } else {
        setLastSaved(new Date())
      }
    } finally {
      pendingSaves.current.delete(questionId)
      if (pendingSaves.current.size === 0) {
        setSaving(false)
      }
    }
  }, [assessmentId, supabase])

  const handleChange = useCallback((questionId: string, answer: AssessmentAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))

    // Clear existing timeout for this question
    if (saveTimeouts.current[questionId]) {
      clearTimeout(saveTimeouts.current[questionId])
    }

    // Debounce save by 1 second
    saveTimeouts.current[questionId] = setTimeout(() => {
      saveAnswer(questionId, answer)
    }, 1000)
  }, [saveAnswer])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts.current).forEach(clearTimeout)
    }
  }, [])

  // Calculate answered count
  const answeredCount = questions.filter((q) => {
    const answer = answers[q.id]
    if (!answer) return false
    if (answer.is_na) return true
    const val = answer.value
    if (val === null || val === '') return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  }).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <span className="text-sm text-gray-500">
          {answeredCount} of {questions.length} answered
        </span>
        <span className="text-xs text-gray-400">
          {saving ? (
            'Saving...'
          ) : lastSaved ? (
            `Saved at ${lastSaved.toLocaleTimeString()}`
          ) : (
            'Changes auto-save'
          )}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            answer={answers[question.id]}
            onChange={(answer) => handleChange(question.id, answer)}
          />
        ))}
      </div>
    </div>
  )
}
