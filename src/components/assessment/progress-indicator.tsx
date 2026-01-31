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
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900">Overall Progress</span>
        <span className="text-sm font-medium text-indigo-600">
          {overallPercent}%
        </span>
      </div>
      <div className="progress-bar mb-1">
        <div
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${overallPercent}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mb-5">{totalAnswered} of {totalQuestions} questions</p>

      <div className="space-y-3">
        {ASSESSMENT_SECTIONS.map((section) => {
          const answered = answeredBySection[section.key] || 0
          const total = totalBySection[section.key] || 0
          const percent = total > 0 ? Math.round((answered / total) * 100) : 0
          const isCurrent = currentSection === section.key
          const isComplete = percent === 100

          return (
            <div key={section.key} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-600'
                  : isCurrent
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {isComplete ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">{section.order}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`truncate ${isCurrent ? 'font-medium text-indigo-600' : 'text-slate-600'}`}>
                    {section.label}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {answered}/{total}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isComplete ? 'bg-emerald-500' : 'bg-indigo-400'
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
