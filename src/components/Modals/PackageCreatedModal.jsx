import React from 'react'

export default function PackageCreatedModal({ show, onClose }) {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{textAlign:'center', maxWidth:400}}>
        <h3 style={{marginTop:0}}>Package Created</h3>
        <div style={{color:'var(--muted)', marginBottom:24}}>
          Your records have been packaged successfully.
          <br/>
          <span style={{fontSize:12, opacity:0.7}}>(Sharing and Export options coming soon)</span>
        </div>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
