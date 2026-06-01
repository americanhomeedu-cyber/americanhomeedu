import { requireAdmin } from '@/lib/auth/require-admin'
import { syncCourseToStripe } from '@/lib/stripe/sync'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  try {
    const result = await syncCourseToStripe(params.id)
    return Response.json(result)
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'Не удалось синхронизировать' },
      { status: 500 },
    )
  }
}
