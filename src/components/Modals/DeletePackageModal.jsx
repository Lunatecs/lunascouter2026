import React from 'react'

export default function DeletePackageModal({ show, onCancel, onConfirm }) {
  if (!show) return null

  return (
    <div className="modal-overlay">
        <div className="modal" style={{maxWidth:400, textAlign:'center'}}>
            <h3 style={{marginTop:0, color:'var(--banner-red)'}}>⚠️ Delete Package?</h3>
            <div style={{color:'var(--muted)', marginBottom:24}}>
                Are you sure you want to <strong>PERMANENTLY</strong> delete this package?
                <br/><br/>
                This action cannot be undone and all records within it will be lost forever.
            </div>
            <div style={{display:'flex', gap:12, justifyContent:'center'}}>
                <button className="btn small" onClick={onCancel} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.3)'}}>Cancel</button>
                <button className="btn small" style={{background:'rgba(255,80,80,0.8)', color:'white', border:'none'}} onClick={onConfirm}>Yes, Delete Permanently</button>
            </div>
        </div>
    </div>
  )
}
