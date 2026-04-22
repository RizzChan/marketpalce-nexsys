import { getAuthUser, requireAuth } from '@/lib/auth.js'

export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  return Response.json({
    success: true,
    data: { user },
  })
}
