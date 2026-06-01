/**
 * Instant route-segment fallback for the whole /admin subtree. Without this,
 * every navigation blocks on the server component's Supabase queries with no
 * visual feedback (felt like the app was freezing). App Router shows this
 * skeleton immediately while the next page streams in.
 */
export default function AdminLoading() {
  return (
    <div className="page-fade" aria-busy="true" aria-label="Загрузка">
      <div className="page-head">
        <div style={{ flex: 1 }}>
          <div className="sk" style={{ width: 260, height: 32, maxWidth: '60%' }} />
          <div
            className="sk"
            style={{ width: 180, height: 15, marginTop: 12, maxWidth: '40%' }}
          />
        </div>
        <div className="sk" style={{ width: 150, height: 38, borderRadius: 8 }} />
      </div>

      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="stat-card" key={i}>
            <div className="sc-top">
              <div className="sk" style={{ width: 90, height: 12 }} />
              <div className="sk" style={{ width: 36, height: 36, borderRadius: 9 }} />
            </div>
            <div className="sk" style={{ width: 110, height: 30, margin: '14px 0 10px' }} />
            <div className="sk" style={{ width: 130, height: 13 }} />
          </div>
        ))}
      </div>

      <div className="table-wrap mt-6">
        <div className="toolbar">
          <div className="sk" style={{ width: 220, height: 36, borderRadius: 8 }} />
          <div className="sk" style={{ width: 130, height: 36, borderRadius: 8 }} />
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="sk"
              style={{ height: 46, marginTop: 8, opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
