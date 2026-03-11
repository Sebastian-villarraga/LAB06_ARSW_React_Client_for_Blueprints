import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/apiClient.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import UpdateBlueprintModal from '../components/UpdateBlueprintModal.jsx'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const navigate = useNavigate()
  
  const [blueprint, setBlueprint] = useState(null)
  const [error, setError] = useState(null)
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/v1/blueprints/${author}/${name}`)
      setBlueprint(res.data.data)
    } catch (err) {
      setError('No se pudo cargar el plano.')
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [author, name])

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>
  if (!blueprint) return <p>Loading blueprint details...</p>

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
          fetchDetails()
        }}
      />
    </div>
  )
}