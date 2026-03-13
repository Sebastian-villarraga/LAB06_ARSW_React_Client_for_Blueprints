import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  deleteBlueprint
} from '../features/blueprints/blueprintsSlice.js'
import { selectTopBlueprints } from '../features/blueprints/selectors.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()

  const { byAuthor, current, loading, error } = useSelector((s) => s.blueprints)

  const topBlueprints = useSelector(selectTopBlueprints)

  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')

  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const totalPoints = useMemo(() => {
    return items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0)
  }, [items])

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const removeBlueprint = (bp) => {
    dispatch(deleteBlueprint({ author: bp.author, name: bp.name }))
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>

          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />

            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>

          {loading && <p>Cargando...</p>}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!items.length && !loading && <p>Sin resultados.</p>}

          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>
                      Blueprint name
                    </th>

                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #334155' }}>
                      Number of points
                    </th>

                    <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.author + bp.name}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        {bp.name}
                      </td>

                      <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #1f2937' }}>
                        {bp.points?.length || 0}
                      </td>

                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937', display: 'flex', gap: '8px' }}>
                        <button
                          className="btn"
                          onClick={() => openBlueprint(bp)}
                        >
                          Open
                        </button>

                        <button
                          className="btn danger"
                          onClick={() => removeBlueprint(bp)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ marginTop: 12, fontWeight: 700 }}>
            Total user points: {totalPoints}
          </p>
        </div>

        {/* Top 5 Blueprints */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Top 5 blueprints by points</h3>

          {!topBlueprints.length && <p>No data yet.</p>}

          {!!topBlueprints.length && (
            <ul>
              {topBlueprints.map((bp) => (
                <li key={bp.author + bp.name}>
                  {bp.name} ({bp.points.length} points)
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>
          Current blueprint: {current?.name || '—'}
        </h3>

        <BlueprintCanvas points={current?.points || []} />
      </section>
    </div>
  )
}