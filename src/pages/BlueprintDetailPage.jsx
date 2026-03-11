import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/apiClient.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import UpdateBlueprintModal from '../components/UpdateBlueprintModal.jsx'
import { fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'
import { useDispatch, useSelector } from 'react-redux'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { current: blueprint, status, error } = useSelector((s) => s.blueprints)
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  if (status === 'loading') return <p>Loading blueprint details...</p>
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>
  if (!blueprint) return null

  return (
    <div className="card" style={{ position: 'relative' }}>
      <button className="btn" style={{ marginBottom: '16px' }} onClick={() => navigate('/blueprint')}>
        &larr; Back to List
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>{blueprint.name}</h2>
          <p style={{ margin: '4px 0' }}><strong>Author:</strong> {blueprint.author}</p>
          <p style={{ margin: '4px 0' }}><strong>Total Points:</strong> {blueprint.points?.length || 0}</p>
        </div>

        <button 
          className="btn" 
          style={{ background: '#f59e0b', height: 'fit-content' }} 
          onClick={() => setIsUpdateModalOpen(true)}
        >
          + Add Point
        </button>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <BlueprintCanvas points={blueprint.points || []} />
      </div>

      <UpdateBlueprintModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        author={author}
        name={name}
        onSuccess={() => {
          setIsUpdateModalOpen(false)
          dispatch(fetchBlueprint({ author, name }))
        }}
      />
    </div>
  )
}