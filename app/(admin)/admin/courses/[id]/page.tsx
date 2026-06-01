import { redirect } from 'next/navigation'

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  redirect(`/admin/courses/${params.id}/settings`)
}
