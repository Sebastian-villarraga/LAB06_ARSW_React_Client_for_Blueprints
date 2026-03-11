import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/apiClient.js'
import CreateBlueprintModal from '../components/CreateBlueprintModal.jsx'

export default function BlueprintsPage() {
  const navigate = useNavigate()

  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [blueprints, setBlueprints] = useState([])
  const [warning, setWarning] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setWarning(null)
    try {
      let data = []
      if (author && name) {
        const res = await api.get(`/v1/blueprints/${author}/${name}`)
        data = [res.data.data]
      } else if (author) {
        const res = await api.get(`/v1/blueprints/${author}`)
        data = res.data.data
      }
      setBlueprints(data)
      setAuthor('')
      setName('')
    } catch (err) {
      setBlueprints([])
      setWarning('No se encontraron resultados o hubo un error en la búsqueda.')
    }
  }

  const handleListAll = async () => {
    setWarning(null)
    try {
      const res = await api.get('/v1/blueprints')
      setBlueprints(res.data.data)
      setAuthor('')
      setName('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <h2 style={{ marginTop: 0 }}>Gestión de Blueprints</h2>
      
      <form onSubmit={handleSearch} className="grid cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
        <div>
          <label>Author</label>
          <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          <label>Blueprint Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn primary">Search</button>
          <button type="button" className="btn" onClick={handleListAll}>List All</button>
          <button type="button" className="btn" style={{ background: '#10b981' }} onClick={() => setIsModalOpen(true)}>
            + Create New Blueprint
          </button>
        </div>
      </form>

      {warning && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {warning}
        </div>
      )}

      {blueprints.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>Author</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>Blueprint</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {blueprints.map((bp) => (
              <tr key={`${bp.author}-${bp.name}`}>
                <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>{bp.author}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>{bp.name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                  <button className="btn" onClick={() => navigate(`/blueprint/${bp.author}/${bp.name}`)}>
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateBlueprintModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false)
          handleListAll()
        }} 
      />
    </div>
  )
}