import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-lg text-center">
        {/* Logo mark */}
        <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Voyu
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Get your organization ready for ISO 27001 certification with guided assessments and automated documentation.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="btn-primary px-8 py-3 text-base"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="btn-secondary px-8 py-3 text-base"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Trusted by security-conscious teams worldwide
        </p>
      </div>
    </main>
  )
}
