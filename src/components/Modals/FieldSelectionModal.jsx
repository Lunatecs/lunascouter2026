import React from 'react'

export default function FieldSelectionModal({ show, onClose, onSelect, selectedPos, trigger }) {
  if (!show) return null

  const positions = ['1', '2', '3', '4']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%' }}>
        <h3 style={{ marginTop: 0 }}>Select Starting Position</h3>
        <div className="field-container" style={{ position: 'relative', width: '100%', aspectRatio: '1330/661', overflow: 'hidden', borderRadius: '8px', background: '#222' }}>
          <img src="field.jpg" alt="Field Map" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
          
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {positions.map(pos => (
              <div
                key={pos}
                onClick={() => {
                  if (trigger) trigger('selection')
                  onSelect(pos)
                  onClose()
                }}
                style={{
                  flex: 1,
                  borderRight: pos !== '4' ? '2px dashed rgba(0,0,0,0.5)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: selectedPos === pos ? 'rgba(207, 254, 0, 0.3)' : 'transparent',
                  position: 'relative'
                }}
                className="field-zone"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(207, 254, 0, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = selectedPos === pos ? 'rgba(207, 254, 0, 0.3)' : 'transparent'}
              >
                <div style={{ 
                  background: selectedPos === pos ? '#cffe00' : 'rgba(0,0,0,0.6)', 
                  color: selectedPos === pos ? '#000' : '#fff',
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px'
                }}>
                  {pos}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
