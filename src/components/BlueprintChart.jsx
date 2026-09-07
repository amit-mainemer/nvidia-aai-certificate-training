import { blueprint } from '../data/exam.js'

export default function BlueprintChart({ scores }) {
  return (
    <div>
      {blueprint.map((d) => {
        const s = scores?.[d.id]
        return (
          <div className="bp-row" key={d.id}>
            <div className="bp-name">
              <i style={{ background: d.color }} />
              <b>{d.name}</b>
            </div>
            <div className="bp-pct">
              {s ? <span style={{ color: s.right / s.total >= 0.7 ? 'var(--ok)' : 'var(--bad)' }}>{s.right}/{s.total}</span> : `${d.weight}%`}
            </div>
            <div className="bp-track">
              <i style={{ width: `${s ? (s.right / s.total) * 100 : d.weight * 6.5}%`, background: d.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
