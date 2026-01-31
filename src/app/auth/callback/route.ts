import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a workspace
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id')
          .eq('user_id', user.id)
          .single()

        // Redirect to onboarding if no workspace, otherwise dashboard
        if (workspace) {
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    }
  }

  // Auth failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
