import React from 'react'

export default function PackageCreatedModal({ show, onClose, onShowQR }) {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{textAlign:'center', maxWidth:400}}>
        <h3 style={{marginTop:0}}>Package Created</h3>
        <div style={{color:'var(--muted)', marginBottom:24}}>
          Your records have been packaged successfully.
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'center'}}>
            <button className="btn" onClick={onClose} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.3)'}}>Close</button>
            <button className="btn" onClick={onShowQR}>Show QR Code</button>
        </div>
      </div>
    </div>
  )
}
