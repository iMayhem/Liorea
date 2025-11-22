import { NextResponse } from 'next/server'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const origin = requestUrl.origin

  console.log(`[Callback] Processing... Code exists: ${!!code}`);

  if (code) {
    // 1. Create an empty response first
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet) {
            console.log(`[Callback] Setting ${cookiesToSet.length} cookies`);
            cookiesToSet.forEach(({ name, value, options }) => {
              // 2. Set cookies on the RESPONSE object
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    console.log("[Callback] Exchanging code for session...");
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("[Callback] Session exchanged successfully. Redirecting to:", next);
      return response
    } else {
      console.error("[Callback] Exchange Error:", error.message);
    }
  } else {
      console.error("[Callback] No code provided in URL");
  }

  // Return the user to an error page with instructions
  console.log("[Callback] Redirecting to error page");
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}