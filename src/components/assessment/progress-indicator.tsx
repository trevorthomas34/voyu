import { ASSESSMENT_SECTIONS, type SectionKey } from '@/lib/types'

interface ProgressIndicatorProps {
  answeredBySection: Record<string, number>
  totalBySection: Record<string, number>
  currentSection?: SectionKey
}

export default function ProgressIndicator({
  answeredBySection,
  totalBySection,
  currentSection,
}: ProgressIndicatorProps) {
  const totalAnswered = Object.values(answeredBySection).reduce((a, b) => a + b, 0)
  const totalQuestions = Object.values(totalBySection).reduce((a, b) => a + b, 0)
  const overallPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
        <span className="text-sm text-gray-500">
          {totalAnswered} / {totalQuestions} ({overallPercent}%)
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        {ASSESSMENT_SECTIONS.map((section) => {
          const answered = answeredBySection[section.key] || 0
          const total = totalBySection[section.key] || 0
          const percent = total > 0 ? Math.round((answered / total) * 100) : 0
          const isCurrent = currentSection === section.key

          return (
            <div key={section.key} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isCurrent ? 'font-medium text-blue-600' : 'text-gray-600'}>
                    {section.label}
                  </span>
                  <span className="text-gray-400">
                    {answered}/{total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percent === 100 ? 'bg-green-500' : 'bg-blue-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
