import React, { useState, useEffect } from 'react'

export default function TeleopModal({ show, onCancel, onSubmit }) {
  const [level, setLevel] = useState(0)
  const [comments, setComments] = useState('')

  useEffect(() => {
    if (show) {
      setLevel(0)
      setComments('')
    }
  }, [show])

  if (!show) return null

  const handleSubmit = () => {
      onSubmit({ level, comments })
  }
  
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Teleop Details</h3>
        <div style={{marginTop:8}}>
          <div style={{fontWeight:700,marginBottom:8}}>What Level</div>
          <div className="level-buttons">
            {[1,2,3].map(n => (
              <button key={n} className={`level-button ${level===n? 'selected':''}`} onClick={() => setLevel(n)}>{n}</button>
            ))}
            <button className={`level-button ${level===0? 'selected':''}`} onClick={() => setLevel(0)}>0</button>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <div style={{fontWeight:700,marginBottom:8}}>Comments</div>
          <textarea className="input modal-textarea" placeholder="Add comments..." value={comments} onChange={e => setComments(e.target.value)} />
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
          <button className="btn small" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  )
}
