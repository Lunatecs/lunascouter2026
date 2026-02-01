import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodeModal({ show, onClose, payload, initialBaseUrl }) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl || '')
  
  useEffect(() => {
    if (initialBaseUrl) setBaseUrl(initialBaseUrl)
  }, [initialBaseUrl])

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{textAlign:'center', maxWidth:400}}>
        <h3 style={{marginTop:0}}>Share Team List</h3>
        
        <div style={{marginBottom:16, textAlign:'left'}}>
            <label style={{fontSize:12, fontWeight:700, display:'block', marginBottom:4}}>Base URL (editable)</label>
            <input 
                className="input" 
                style={{width:'100%', fontSize:14, padding:8}} 
                value={baseUrl} 
                onChange={e => setBaseUrl(e.target.value)} 
            />
        </div>

        <div className="qr-container" style={{background:'white', padding:16, borderRadius:8, display:'inline-block', marginBottom:16}}>
          <QRCodeCanvas 
            value={`${baseUrl}?importedTeams=${payload}`} 
            size={256} 
            fgColor="#000000"
            bgColor="#FFFFFF"
            level="L"
          />
        </div>
        <div style={{color:'var(--muted)', fontSize:12, marginBottom:16, wordBreak:'break-all'}}>
          Scan this code with another device to import the team list.
        </div>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
