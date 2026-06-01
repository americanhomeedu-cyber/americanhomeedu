'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function RevenueChart({ data }: { data: { date: string; value: number }[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D4A3E" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2D4A3E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F0ECE3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => (d.includes('-') ? d.slice(5) : d)}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString('en-US')}`, 'Выручка']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2D4A3E"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
