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
                            const newRecords = [...records]
                            // Handle Schema
                            if (newRecords[realIndex].values) {
                                newRecords[realIndex].values.teleopNote = editingNoteContent
                            } else {
                                newRecords[realIndex].teleopNote = editingNoteContent
                            }
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
                            const newRecords = [...records]
                            const realIndex = records.length - 1 - idx
                            
                            // Toggle at top level for new structure preference
                            // We need to ensure we don't duplicate state if it's in values
                            if (newRecords[realIndex].discarded === undefined && newRecords[realIndex].values && newRecords[realIndex].values.discarded !== undefined) {
                                // Migrate to top level on toggle
                                newRecords[realIndex].discarded = !newRecords[realIndex].values.discarded
                                delete newRecords[realIndex].values.discarded
                            } else {
                                newRecords[realIndex].discarded = !isDiscarded
                            }
                            
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