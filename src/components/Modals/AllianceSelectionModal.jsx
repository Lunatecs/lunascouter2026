import React from 'react'

export default function AllianceSelectionModal({ show, onSelect }) {
  if (!show) return null

  return (
    <div className="modal-overlay">
      <div className="modal" style={{textAlign:'center'}}>
        <h3 style={{marginTop:0}}>Select Alliance</h3>
        <div style={{color:'var(--muted)', marginBottom:16}}>Please select your alliance position to continue.</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
          {['Red 1','Red 2','Red 3','Blue 1','Blue 2','Blue 3'].map(b => (
              <button
                key={b}
                className={`banner-btn ${b.startsWith('Red') ? 'is-red' : 'is-blue'}`}
                style={{
                  background: b.startsWith('Red') ? 'var(--banner-red)' : 'var(--banner-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  fontSize: '16px'
                }}
                onClick={() => onSelect(b)}
              >
                {b}
              </button>
          ))}
        </div>
      </div>
    </div>
  )
}
