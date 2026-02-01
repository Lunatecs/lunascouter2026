import React, { useState } from 'react'

export default function DataManager({
  records,
  setRecords,
  archives,
  teams,
  onCreatePackage,
  onDeleteArchive,
  onExportArchiveJSON,
  onExportArchiveCSV
}) {
  const [editingNoteIndex, setEditingNoteIndex] = useState(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')

  return (
    <section className={`panel full data-area`}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:16}}>
        <h2 style={{margin:0}}>Saved Records ({records.length})</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn small" onClick={onCreatePackage} style={{borderColor:'rgba(255,255,255,0.2)'}}>Create Package</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {records.length === 0 ? (
          <div style={{color:'var(--muted)',padding:'20px 0'}}>No current records saved. Go to the Scouting tab to start scouting teams!</div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {[...records].reverse().map((r, idx) => {
              const team = teams[r.teamIndex] || { name: 'Unknown Team', number: '-' }
              const color = r.bannerColor === 'red' ? '#fa1818' : r.bannerColor === 'blue' ? '#1e74ff' : '#9aa0a6'
              const isDiscarded = r.discarded === true
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
                      <div style={{fontWeight:700,fontSize:16}}>{team.name}</div>
                      <div style={{color:'var(--muted)',fontSize:14}}>Team {team.number}</div>
                      <div style={{marginTop:8,fontWeight:700}}>Match {r.matchNumber || '-'}</div>
                      {r.needsAttention === 'yes' && <div style={{color:'orange', fontWeight:'bold', marginTop:4}}>Needs Attention</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:4,minWidth:120}}>
                      <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',opacity:0.6}}>Scores</div>
                      <div style={{fontSize:14}}>Auto Level: {r.autoLevel}</div>
                      <div style={{fontSize:14}}>Teleop Level: {r.teleopLevel}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',opacity:0.6}}>Details</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Defense: {r.defense || '-'}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Moved: {r.movedFromStart || '-'}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Auto Zero: {r.autoScoredZeroFuel || '-'}</div>
                      <div style={{fontSize:13,color:'var(--muted)'}}>Teleop Zero: {r.teleopScoredZeroFuel || '-'}</div>
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
                            const newRecords = [...records]
                            newRecords[realIndex].teleopNote = editingNoteContent
                            setRecords(newRecords)
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
                          setEditingNoteContent(r.teleopNote || '')
                        }}
                        title="Click to edit note"
                      >
                        {r.teleopNote || <span style={{opacity:0.5, fontStyle:'italic'}}>No notes added. Click to edit.</span>}
                      </div>
                    )}
                    <div style={{marginTop:12,fontSize:11,opacity:0.4}}>Saved: {new Date(r.timestamp).toLocaleString()}</div>
                    <button 
                        className="btn small" 
                        style={{marginTop:12, borderColor: isDiscarded ? 'var(--muted)' : 'rgba(255,80,80,0.5)', color: isDiscarded ? 'var(--muted)' : '#ffb3b3'}}
                        onClick={() => {
                            const newRecords = [...records]
                            const realIndex = records.length - 1 - idx
                            newRecords[realIndex].discarded = !newRecords[realIndex].discarded
                            setRecords(newRecords)
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
                <div style={{display:'flex',gap:8}}>
                  <button className="btn small" onClick={() => onExportArchiveJSON(session)}>JSON</button>
                  <button className="btn small" onClick={() => onExportArchiveCSV(session)}>CSV</button>
                  <button className="delete-btn" style={{marginLeft:8}} onClick={() => onDeleteArchive(session.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
