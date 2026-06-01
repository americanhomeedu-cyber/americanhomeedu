import { nanoid } from 'nanoid'
import { requireAdmin } from '@/lib/auth/require-admin'

const ALLOWED_BUCKETS = ['course-images', 'course-covers', 'course-files']

export async function POST(req: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  const form = await req.formData()
  const file = form.get('file')
  const bucketRaw = (form.get('bucket') as string) || 'course-images'
  const bucket = ALLOWED_BUCKETS.includes(bucketRaw) ? bucketRaw : 'course-images'
  if (!(file instanceof File)) {
    return Response.json({ error: 'Файл не передан' }, { status: 400 })
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `${nanoid()}.${ext}`
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) return Response.json({ error: error.message }, { status: 400 })

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return Response.json({ url: data.publicUrl, path })
}
