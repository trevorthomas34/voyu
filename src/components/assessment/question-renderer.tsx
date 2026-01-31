'use client'

import type { Question, AssessmentAnswer } from '@/lib/types'

interface QuestionRendererProps {
  question: Question
  answer: AssessmentAnswer | undefined
  onChange: (answer: AssessmentAnswer) => void
}

export default function QuestionRenderer({ question, answer, onChange }: QuestionRendererProps) {
  const currentValue = answer?.value
  const isNA = answer?.is_na ?? false

  const handleValueChange = (value: AssessmentAnswer['value']) => {
    onChange({ value, is_na: false })
  }

  const handleNAToggle = () => {
    if (isNA) {
      onChange({ value: null, is_na: false })
    } else {
      onChange({ value: null, is_na: true })
    }
  }

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        {question.question_text}
        {question.required && !question.show_na_option && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {question.help_text && (
        <p className="text-xs text-gray-500 mb-2">{question.help_text}</p>
      )}

      <div className={isNA ? 'opacity-50 pointer-events-none' : ''}>
        {question.question_type === 'text' && (
          <input
            type="text"
            value={(currentValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter your answer..."
          />
        )}

        {question.question_type === 'yes_no' && (
          <div className="flex gap-4">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  checked={currentValue === option.value}
                  onChange={() => handleValueChange(option.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === 'single_choice' && question.options && (
          <select
            value={(currentValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">Select an option...</option>
            {question.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {question.question_type === 'multi_choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const selected = Array.isArray(currentValue) && currentValue.includes(opt.value)
              return (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const currentArr = Array.isArray(currentValue) ? currentValue : []
                      if (e.target.checked) {
                        handleValueChange([...currentArr, opt.value])
                      } else {
                        handleValueChange(currentArr.filter((v) => v !== opt.value))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {question.show_na_option && (
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isNA}
            onChange={handleNAToggle}
            className="w-4 h-4 text-gray-500 rounded"
          />
          <span className="text-sm text-gray-500">Not Applicable</span>
        </label>
      )}
    </div>
  )
}
