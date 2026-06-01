import type { Metadata } from 'next'
import { LayoutDashboard } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { EmptyState } from '@/components/admin/empty-state'

export const metadata: Metadata = { title: 'Админка — American Home Blueprint' }

export default function AdminHomePage() {
  return (
    <>
      <PageHeader title="Главная" subtitle="Обзор показателей школы" />
      <EmptyState
        icon={LayoutDashboard}
        title="Дашборд в разработке"
        text="Метрики, графики выручки и воронка конверсии появятся на этапе аналитики."
      />
    </>
  )
}
