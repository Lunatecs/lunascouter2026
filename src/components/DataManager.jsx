import React, { useState } from 'react'
import { useStore } from '../store'
import ConfirmationModal from './Modals/ConfirmationModal'

export default function DataManager({
  onCreatePackage,
  onDeleteArchive,
  onExportArchiveJSON,
  onExportArchiveCSV,
  onExportArchiveQR
}) {
  const records = useStore(state => state.records)
  const setRecords = useStore(state => state.setRecords)
  const archives = useStore(state => state.archives)
  const teams = useStore(state => state.teams)
  
  // Also grab specific actions if needed, though setRecords covers bulk updates
  // But using toggleRecordDiscard is cleaner
  const toggleRecordDiscard = useStore(state => state.toggleRecordDiscard)
  const updateRecordNote = useStore(state => state.updateRecordNote)
  const clearRecords = useStore(state => state.clearRecords)
  const deleteArchive = useStore(state => state.deleteArchive)

  const [editingNoteIndex, setEditingNoteIndex] = useState(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false,
    confirmLabel: 'Confirm'
  })

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, show: false }))

  const handleClearSession = () => {
    if (records.length === 0) return
    
    setConfirmModal({
        show: true,
        title: 'Discard Session?',
        message: 'Are you sure you want to discard the current session records?\n\nThis action cannot be undone.',
        confirmLabel: 'Discard Records',
        isDanger: true,
        onConfirm: () => {
            clearRecords()
            closeConfirm()
        }
    })
  }

  const handleLoadArchive = (session) => {
    const hasRecords = records.length > 0;
    
    setConfirmModal({
        show: true,
        title: hasRecords ? 'Replace Current Session?' : 'Load Archive?',
        message: hasRecords 
            ? 'Warning: You have active records. Loading this archive will REPLACE them.\n\nThis action will also REMOVE this archive package to prevent duplication.'
            : 'Load this archive? This will move records to your active session and REMOVE this archive package.',
        confirmLabel: 'Load Archive',
        isDanger: hasRecords,
        onConfirm: () => {
            setRecords(session.data || [])
            deleteArchive(session.id)
            setActiveMenuId(null)
            closeConfirm()
        }
    })
  }

  const handleCreatePackage = () => {
    if (records.length === 0) return
    
    setConfirmModal({
        show: true,
        title: 'Create Package?',
        message: 'Create a package from current records?\n\nThis will archive the current data and clear the view.',
        confirmLabel: 'Create Package',
        isDanger: false,
        onConfirm: () => {
            onCreatePackage()
            closeConfirm()
        }
    })
  }

  return (
    <section className={`panel full data-area`}>
      <ConfirmationModal 
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        isDanger={confirmModal.isDanger}
        confirmLabel={confirmModal.confirmLabel}
      />
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:16}}>
        <h2 style={{margin:0}}>Saved Records ({records.length})</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {records.length > 0 && (
            <button className="btn small" onClick={handleClearSession} style={{background:'transparent', borderColor:'rgba(255,80,80,0.5)', color:'#ffb3b3'}}>Discard Session</button>
          )}
          <button className="btn small" onClick={handleCreatePackage} style={{borderColor:'rgba(255,255,255,0.2)'}}>Create Package</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {records.length === 0 ? (
          <div style={{color:'var(--muted)',padding:'20px 0'}}>No current records saved. Go to the Scouting tab to start scouting teams!</div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {[...records].reverse().map((r, idx) => {
              // Schema Compatibility Layer
              const isNewSchema = !!r.values;
              const values = isNewSchema ? r.values : r;
              
              let teamName = 'Unknown Team';
              let teamNumber = '-';
              
              if (isNewSchema) {
                const t = teams.find(team => team.number === r.team);
                if (t) teamName = t.name;
                teamNumber = r.team;
              } else {
                const t = teams[r.teamIndex];
                if (t) {
                   teamName = t.name;
                   teamNumber = t.number;
                }
              }

              let color = '#9aa0a6';
              if (isNewSchema) {
                  if (r.position && r.position.startsWith('Red')) color = '#fa1818';
                  else if (r.position && r.position.startsWith('Blue')) color = '#1e74ff';
              } else {
                  if (r.bannerColor === 'red') color = '#fa1818';
                  else if (r.bannerColor === 'blue') color = '#1e74ff';
              }

              const isDiscarded = r.discarded === true || (r.values && r.values.discarded === true)
              
              const formatBool = (val) => {
                  if (val === true) return 'Yes'
                  if (val === false) return 'No'
                  if (val === 'yes') return 'Yes'
                  if (val === 'no') return 'No'
                  return '-'
              }

              return (
                <div key={idx} className="record-row" style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'flex-start',
                    padding:16,
                    borderRadius:12,
                    background:'rgba(255,255,255,0.02)',
                    borderLeft:`4px solid ${color}`,
                    opacity: isDiscarded ? 0.5 : 1,
                    textDecoration: isDiscarded ? 'line-through' : 'none'
                }}>
                  <div style={{display:'flex',gap:16,alignItems:'flex-start',flex:1}}>
                    <div style={{display:'flex',flexDirection:'column',minWidth:140}}>
                      <div style={{fontWeight:700,fontSize:16}}>{teamName}</div>
                      <div style={{color:'var(--muted)',fontSize:14}}>Team {teamNumber}</div>
                      <div style={{marginTop:8,fontWeight:700}}>Match {r.matchNumber || '-'}</div>
                      <div style={{color:'var(--muted)',fontSize:13}}>Scout: {r.scoutName || 'Unknown'}</div>
                      {(values.needsAttention === 'yes' || values.needsAttention === true) && <div style={{color:'orange', fontWeight:'bold', marginTop:4}}>Needs Attention</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:4,minWidth:120}}>
                      <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',opacity:0.6}}>Scores</div>
                      <div style={{fontSize:14}}>Auto Level: {values.autoLevel}</div>
                      <div style={{fontSize:14}}>Teleop Level: {values.teleopLevel}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',opacity:0.6}}>Details</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Defense: {formatBool(values.defense)}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Moved: {formatBool(values.movedFromStart)}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Auto Zero: {formatBool(values.autoScoredZeroFuel)}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Teleop Zero: {formatBool(values.teleopScoredZeroFuel)}</div>
                    </div>
                  </div>
                  <div style={{flex:1,marginLeft:20}}>
                    <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',opacity:0.6,marginBottom:4}}>Notes</div>
                    {editingNoteIndex === (records.length - 1 - idx) ? (
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <textarea
                          className="input"
                          style={{minHeight:60, fontSize:13, padding:8, width:'100%', boxSizing:'border-box'}}
                          value={editingNoteContent}
                          onChange={e => setEditingNoteContent(e.target.value)}
                          onClick={e => e.stopPropagation()} 
                          autoFocus
                        />
                        <div style={{display:'flex', gap:8}}>
                          <button className="btn small" onClick={(e) => {
                            e.stopPropagation()
                            const realIndex = records.length - 1 - idx
                            updateRecordNote(realIndex, editingNoteContent)
                            setEditingNoteIndex(null)
                          }}>Save</button>
                          <button className="btn small" style={{background:'transparent', border:'1px solid rgba(255,255,255,0.3)'}} onClick={(e) => {
                            e.stopPropagation()
                            setEditingNoteIndex(null)
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        style={{color:'var(--muted)',fontSize:13,whiteSpace:'pre-wrap', cursor:'pointer', padding:'4px 0', borderBottom:'1px dashed rgba(255,255,255,0.1)'}}
                        onClick={() => {
                          const realIndex = records.length - 1 - idx
                          setEditingNoteIndex(realIndex)
                          setEditingNoteContent(values.teleopNote || '')
                        }}
                        title="Click to edit note"
                      >
                        {values.teleopNote || <span style={{opacity:0.5, fontStyle:'italic'}}>No notes added. Click to edit.</span>}
                      </div>
                    )}
                    <div style={{marginTop:12,fontSize:11,opacity:0.4}}>Saved: {new Date(r.timestamp).toLocaleString()}</div>
                    <button 
                        className="btn small" 
                        style={{marginTop:12, borderColor: isDiscarded ? 'var(--muted)' : 'rgba(255,80,80,0.5)', color: isDiscarded ? 'var(--muted)' : '#ffb3b3'}}
                        onClick={() => {
                            const realIndex = records.length - 1 - idx
                            toggleRecordDiscard(realIndex)
                        }}
                    >
                        {isDiscarded ? 'Restore' : 'Discard'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {archives.length > 0 && (
        <div style={{marginTop:48}}>
          <h2 style={{marginBottom:16}}>Archive History</h2>
          <div style={{display:'grid',gap:12}}>
            {archives.map((session) => (
              <div key={session.id} className="record-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>Archive Session - {new Date(session.timestamp).toLocaleString()}</div>
                  <div style={{color:'var(--muted)',fontSize:13,marginTop:4}}>{session.data.length} records in this session</div>
                </div>
                <div style={{display:'flex',gap:8, alignItems:'center'}}>
                  <button className="btn small" onClick={() => onExportArchiveQR(session)}>QR</button>
                  
                  <div style={{position: 'relative'}}>
                    <button 
                        className="btn small" 
                        style={{padding: '0 8px', fontSize: '18px', lineHeight: '1', height: '32px', minWidth: '32px'}}
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(activeMenuId === session.id ? null : session.id)
                        }}
                    >
                        ⋮
                    </button>
                    
                    {activeMenuId === session.id && (
                        <div style={{
                            position: 'absolute', 
                            right: 0, 
                            top: '100%', 
                            marginTop: 4,
                            zIndex: 100, 
                            background: '#2a2a2a', 
                            border: '1px solid #444', 
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 140,
                            overflow: 'hidden'
                        }}>
                            <button 
                                style={{
                                    background: 'transparent', 
                                    border: 'none', 
                                    padding: '12px 16px', 
                                    textAlign: 'left', 
                                    color: 'white', 
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #333',
                                    fontSize: 14
                                }}
                                onClick={() => handleLoadArchive(session)}
                            >
                                Load
                            </button>
                            <button 
                                style={{
                                    background: 'transparent', 
                                    border: 'none', 
                                    padding: '12px 16px', 
                                    textAlign: 'left', 
                                    color: 'white', 
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #333',
                                    fontSize: 14
                                }}
                                onClick={() => { onExportArchiveJSON(session); setActiveMenuId(null); }}
                            >
                                Export JSON
                            </button>
                            <button 
                                style={{
                                    background: 'transparent', 
                                    border: 'none', 
                                    padding: '12px 16px', 
                                    textAlign: 'left', 
                                    color: 'white', 
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #333',
                                    fontSize: 14
                                }}
                                onClick={() => { onExportArchiveCSV(session); setActiveMenuId(null); }}
                            >
                                Export CSV
                            </button>
                            <button 
                                style={{
                                    background: 'transparent', 
                                    border: 'none', 
                                    padding: '12px 16px', 
                                    textAlign: 'left', 
                                    color: '#ff6b6b', 
                                    cursor: 'pointer',
                                    fontSize: 14
                                }}
                                onClick={() => { onDeleteArchive(session.id); setActiveMenuId(null); }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}