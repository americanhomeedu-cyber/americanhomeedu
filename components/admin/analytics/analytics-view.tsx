'use client'

import * as React from 'react'
import { Users, Eye, UserPlus, ShoppingBag, Target, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { PeriodSwitcher } from '@/components/admin/dashboard/period-switcher'
import { DonutChart } from '@/components/admin/dashboard/donut-chart'
import { MultiLineChart } from '@/components/admin/analytics/multi-line-chart'
import { formatPrice } from '@/lib/utils'

const COLORS = ['#C9A96E', '#2D4A3E', '#B33A3A', '#4A7C59', '#9CA3AF', '#2563EB', '#5B3A6B', '#B45309']
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const TABS = [
  ['overview', 'Обзор'],
  ['traffic', 'Трафик'],
  ['conversion', 'Конверсия'],
  ['content', 'Контент'],
  ['cohorts', 'Когорты'],
] as const
type TabKey = (typeof TABS)[number][0]

type Stats = {
  visitors: number
  pageViews: number
  registrations: number
  purchases: number
  conversion: number | null
  revenue: number
}

function NoData({ text }: { text?: string }) {
  return (
    <div style={{ padding: '28px 8px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
      {text || 'Данных пока нет — появятся после накопления статистики (трекинг подключается на этапе аналитики).'}
    </div>
  )
}

export function AnalyticsView({
  courseLabel,
  period,
  hasEvents,
  stats,
  timeline,
  heat,
  heatMax,
  sources,
  mediums,
  sourceRows,
  funnel,
  topPages,
  courseActivity,
  weeks,
}: {
  courseLabel: string
  period: string
  hasEvents: boolean
  stats: Stats
  timeline: { label: string; visitors: number; regs: number; buys: number }[]
  heat: number[][]
  heatMax: number
  sources: { name: string; value: number }[]
  mediums: { name: string; value: number }[]
  sourceRows: { name: string; visits: number; pct: number }[]
  funnel: { label: string; value: number }[]
  topPages: { url: string; views: number; uniques: number; pct: number }[]
  courseActivity: { title: string; done: number }[]
  weeks: { label: string; value: number }[]
}) {
  const [tab, setTab] = React.useState<TabKey>('overview')

  const sourceData = sources.slice(0, 6).map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] }))
  const mediumData = mediums.slice(0, 6).map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] }))
  const funnelBase = funnel.find((s) => s.value > 0)?.value || 1
  const maxWeek = Math.max(1, ...weeks.map((w) => w.value))
  const maxActivity = Math.max(1, ...courseActivity.map((c) => c.done))

  return (
    <>
      <PageHeader title="Аналитика" subtitle={`Трафик, конверсия и поведение · ${courseLabel}`}>
        <PeriodSwitcher value={period} />
      </PageHeader>

      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <>
          <div className="grid-3" style={{ marginBottom: 16 }}>
            <StatCard label="Уник. посетители" value={stats.visitors.toLocaleString('ru-RU')} icon={Users} />
            <StatCard label="Просмотры страниц" value={stats.pageViews.toLocaleString('ru-RU')} icon={Eye} />
            <StatCard
              label="Регистрации"
              value={stats.registrations.toLocaleString('ru-RU')}
              icon={UserPlus}
              iconBg="var(--success-soft)"
              iconColor="var(--success)"
            />
            <StatCard label="Покупки" value={stats.purchases.toLocaleString('ru-RU')} icon={ShoppingBag} />
            <StatCard
              label="Конверсия"
              value={stats.conversion == null ? '—' : `${stats.conversion.toFixed(2)}%`}
              icon={Target}
            />
            <StatCard
              label="Выручка"
              value={formatPrice(stats.revenue)}
              icon={DollarSign}
              iconBg="var(--accent-soft)"
              iconColor="#9A7B3F"
            />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <h3>Динамика</h3>
              <span className="ch-sub">посетители · регистрации · покупки</span>
            </div>
            <div className="card-body">
              <MultiLineChart
                data={timeline}
                lines={[
                  { key: 'visitors', name: 'Посетители', color: '#2D4A3E' },
                  { key: 'regs', name: 'Регистрации', color: '#C9A96E' },
                  { key: 'buys', name: 'Покупки', color: '#B33A3A' },
                ]}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Активность по часам</h3>
              <span className="ch-sub">когда аудитория активнее</span>
            </div>
            <div className="card-body">
              {!hasEvents ? (
                <NoData />
              ) : (
                <div style={{ display: 'grid', gap: 5 }}>
                  {DAYS.map((d, di) => (
                    <div key={d} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 3 }}>
                        {heat[di].map((v, hi) => (
                          <span
                            key={hi}
                            title={`${d} ${hi}:00 — ${v}`}
                            style={{
                              aspectRatio: '1',
                              borderRadius: 2,
                              background: v ? `rgba(45,74,62,${0.12 + 0.88 * (v / heatMax)})` : 'var(--border-2)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== TRAFFIC ===== */}
      {tab === 'traffic' && (
        <>
          <div className="table-wrap" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <h3>Источники трафика</h3>
            </div>
            {sourceRows.length === 0 ? (
              <NoData />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Источник</th>
                    <th>Визиты</th>
                    <th>% от общего</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.map((s, i) => (
                    <tr key={s.name}>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <span className="lg-dot" style={{ background: COLORS[i % COLORS.length] }} />
                          {s.name}
                        </div>
                      </td>
                      <td className="cell-strong">{s.visits.toLocaleString('ru-RU')}</td>
                      <td className="cell-muted">{s.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <h3>По utm_source</h3>
              </div>
              <div className="card-body">
                {sourceData.length === 0 ? (
                  <NoData />
                ) : (
                  <DonutChart
                    data={sourceData}
                    centerValue={sources.reduce((s, x) => s + x.value, 0).toLocaleString('ru-RU')}
                    centerLabel="визитов"
                  />
                )}
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <h3>По utm_medium</h3>
              </div>
              <div className="card-body">
                {mediumData.length === 0 ? (
                  <NoData />
                ) : (
                  <DonutChart
                    data={mediumData}
                    centerValue={mediums.reduce((s, x) => s + x.value, 0).toLocaleString('ru-RU')}
                    centerLabel="событий"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== CONVERSION ===== */}
      {tab === 'conversion' && (
        <div className="card">
          <div className="card-head">
            <h3>Воронка конверсии</h3>
            <span className="ch-sub">от визита до покупки</span>
          </div>
          <div className="card-body">
            {funnel.every((s) => s.value === 0) ? (
              <NoData />
            ) : (
              <div className="funnel">
                {funnel.map((s, i) => {
                  const pct = (s.value / funnelBase) * 100
                  const drop =
                    i > 0 && funnel[i - 1].value > 0
                      ? Math.round((1 - s.value / funnel[i - 1].value) * 100)
                      : null
                  return (
                    <div className="funnel-row" key={s.label}>
                      {drop != null && drop > 0 && <div className="funnel-drop">↓ отсеялось {drop}%</div>}
                      <div
                        className="funnel-bar"
                        style={{
                          width: `${Math.max(pct, 20)}%`,
                          background: i % 2 ? '#3D5A4E' : '#2D4A3E',
                        }}
                      >
                        <span className="fn-label">{s.label}</span>
                        <span className="fn-val">{s.value.toLocaleString('ru-RU')}</span>
                        <span className="fn-pct">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      {tab === 'content' && (
        <div className="grid-2">
          <div className="table-wrap">
            <div className="card-head">
              <h3>Топ страниц</h3>
              <span className="ch-sub">какие страницы смотрят</span>
            </div>
            {topPages.length === 0 ? (
              <NoData />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Просмотры</th>
                    <th>Уникальные</th>
                    <th>% от всех</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p) => (
                    <tr key={p.url}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.url}</td>
                      <td className="cell-strong">{p.views.toLocaleString('ru-RU')}</td>
                      <td className="tnum">{p.uniques.toLocaleString('ru-RU')}</td>
                      <td className="cell-muted">{p.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Активность в курсе</h3>
              <span className="ch-sub">завершений по секциям</span>
            </div>
            <div className="card-body">
              {courseActivity.every((c) => c.done === 0) ? (
                <NoData text="Пока никто не завершал секции." />
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {courseActivity.map((c) => (
                    <div key={c.title}>
                      <div className="between" style={{ marginBottom: 5, fontSize: 13 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </span>
                        <span className="cell-strong">{c.done}</span>
                      </div>
                      <div className="prog gold">
                        <div className="bar" style={{ width: `${(c.done / maxActivity) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== COHORTS ===== */}
      {tab === 'cohorts' && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <h3>Выручка по неделям</h3>
              <span className="ch-sub">последние 8 недель</span>
            </div>
            <div className="card-body">
              {weeks.every((w) => w.value === 0) ? (
                <NoData text="Покупок за период не было." />
              ) : (
                <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: 200 }}>
                  {weeks.map((w) => (
                    <div
                      key={w.label}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>${w.value}</div>
                      <div
                        title={`$${w.value}`}
                        style={{
                          width: '100%',
                          maxWidth: 46,
                          borderRadius: '6px 6px 0 0',
                          background: 'var(--primary)',
                          height: `${(w.value / maxWeek) * 150}px`,
                          minHeight: 2,
                        }}
                      />
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{w.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Retention по когортам</h3>
            </div>
            <div className="card-body">
              <NoData text="Retention-аналитика появится после накопления данных о повторных визитах." />
            </div>
          </div>
        </>
      )}
    </>
  )
}
