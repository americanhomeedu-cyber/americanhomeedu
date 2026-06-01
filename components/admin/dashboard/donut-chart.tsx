'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: { name: string; value: number; color: string }[]
  centerValue: string
  centerLabel: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  return (
    <div
      className="row"
      style={{ gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      <div style={{ position: 'relative', width: 180, height: 180, flex: 'none' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={1}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>
              {centerValue}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{centerLabel}</div>
          </div>
        </div>
      </div>
      <div className="legend" style={{ flex: 1, minWidth: 160 }}>
        {data.map((d, i) => (
          <div className="lg-row" key={i}>
            <span className="lg-dot" style={{ background: d.color }} />
            <span className="lg-name">{d.name}</span>
            <span className="lg-val">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
