import React, { useState, useEffect } from 'react'
import { toCSV } from './utils/csvHelpers'

// Components
import SetupPanel from './components/SetupPanel'
import ScoutingForm from './components/ScoutingForm'
import DataManager from './components/DataManager'
import AllianceSelectionModal from './components/Modals/AllianceSelectionModal'
import TeleopModal from './components/Modals/TeleopModal'
import QRCodeModal from './components/Modals/QRCodeModal'
import NextMatchModal from './components/Modals/NextMatchModal'
import DeletePackageModal from './components/Modals/DeletePackageModal'
import PackageCreatedModal from './components/Modals/PackageCreatedModal'

export default function App() {
  // Persistence: Load initial state from localStorage synchronously
  const [initialState] = useState(() => {
    try {
      const raw = localStorage.getItem('luna_v2_state')
      return raw ? JSON.parse(raw) : {}
    } catch (e) { return {} }
  })

  const [theme] = useState(initialState.theme || 'blue')
  const [allianceSelection, setAllianceSelection] = useState(initialState.allianceSelection || initialState.bannerSelection || '')
  const [teams, setTeams] = useState(initialState.teams || [])
  
  // Tabs
  const [active, setActive] = useState('setup')

  // Scouting State
  const [matchNumber, setMatchNumber] = useState('')
  const [autoLevel, setAutoLevel] = useState(0) // 0,1,2,3
  const [movedFromStart, setMovedFromStart] = useState('no') // 'yes' | 'no'
  const [autoScoredZeroFuel, setAutoScoredZeroFuel] = useState('no') // 'yes' | 'no'
  const [teleopScoredZeroFuel, setTeleopScoredZeroFuel] = useState('no') // 'yes' | 'no'
  const [defense, setDefense] = useState('no') // 'yes' | 'no'
  const [needsAttention, setNeedsAttention] = useState('no') // 'yes' | 'no'
  const [selectedTeam, setSelectedTeam] = useState(initialState.selectedTeam ?? null)
  
  // Modals State
  const [showAllianceModal, setShowAllianceModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showNextMatchModal, setShowNextMatchModal] = useState(false)
  const [qrBaseUrl, setQrBaseUrl] = useState('')
  const [qrPayload, setQrPayload] = useState('')
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState(null)
  const [showTeleopModal, setShowTeleopModal] = useState(false)

  // Data State
  const [records, setRecords] = useState(initialState.records || []) 
  const [archives, setArchives] = useState(() => {
    try {
      const raw = localStorage.getItem('luna_v2_archives')
      return raw ? JSON.parse(raw) : (initialState.archives || [])
    } catch (e) { return [] }
  }) 

  // Initial Alliance Check
  useEffect(() => {
    if (!allianceSelection) {
      setShowAllianceModal(true)
    }
  }, [])
  
  // URL Import Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const importedData = params.get('importedTeams')
    if (importedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(importedData))
        if (Array.isArray(decoded) && decoded.length > 0) {
          if (window.confirm(`Found ${decoded.length} teams in URL. Do you want to IMPORT them? \n\nClick OK to Append to existing list, Cancel to Replace existing list.`)) {
             setTeams(prev => {
               const existingNums = new Set(prev.map(t => t.number))
               const newTeams = decoded.filter(t => !existingNums.has(t.number))
               const count = newTeams.length
               if (count === 0) alert('All teams in link already exist.')
               else alert(`Imported ${count} new teams.`)
               return [...prev, ...newTeams]
             })
          } else {
             if (window.confirm("Do you want to REPLACE your current team list with these teams? This cannot be undone.")) {
                setTeams(decoded)
                alert('Team list replaced.')
             }
          }
        }
      } catch (e) {
        console.error('Failed to parse imported teams', e)
      }
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Persistence Effects
  useEffect(() => {
    try {
      const snapshot = { teams, records, allianceSelection, theme, selectedTeam }
      localStorage.setItem('luna_v2_state', JSON.stringify(snapshot))
    } catch (err) {
      console.warn('Failed to save state', err)
    }
  }, [teams, records, allianceSelection, theme, selectedTeam])

  useEffect(() => {
    try {
      localStorage.setItem('luna_v2_archives', JSON.stringify(archives))
    } catch (err) {
      console.warn('Failed to save archives', err)
    }
  }, [archives])


  // Handlers
  const handleShareTeams = () => {
    if (teams.length === 0) {
      alert('No teams to share.')
      return
    }
    const rawPayload = JSON.stringify(teams)
    if (rawPayload.length > 2000) {
      if (!window.confirm('Team list is large. The QR code might be dense. Continue?')) return
    }
    const payload = encodeURIComponent(rawPayload)
    setQrPayload(payload)
    setQrBaseUrl(`${window.location.origin}${window.location.pathname}`)
    setShowQRModal(true)
  }

  const handleAllianceSelect = (selection) => {
      setAllianceSelection(selection)
      setShowAllianceModal(false)
  }

  const deleteTeam = (index) => {
    setTeams(prev => prev.filter((_, i) => i !== index))
    setSelectedTeam(prevSel => {
      if (prevSel === null || prevSel === '') return null
      const si = Number(prevSel)
      if (si === index) return null
      if (si > index) return String(si - 1)
      return String(si)
    })
  }

  const handleTeleopSubmit = ({ level, comments }) => {
    // Validate team selection first
    if (selectedTeam === null || selectedTeam === '') {
        alert('Please select a team before submitting.');
        return;
    }
    if (!matchNumber) {
        alert('Please enter a match number.')
        return
    }

    const rec = {
      teamIndex: Number(selectedTeam),
      matchNumber: matchNumber || '',
      autoLevel,
      teleopLevel: level,
      teleopNote: comments,
      movedFromStart,
      autoScoredZeroFuel,
      teleopScoredZeroFuel,
      defense,
      needsAttention,
      discarded: false,
      bannerColor: allianceSelection.startsWith('Red') ? 'red' : allianceSelection.startsWith('Blue') ? 'blue' : '',
      themeAtSave: theme,
      timestamp: Date.now()
    }
    setRecords(prev => [...prev, rec])

    // Reset Form
    setMatchNumber(prev => {
        if (!prev) return ''
        const num = parseInt(prev, 10)
        return isNaN(num) ? prev : String(num + 1)
    })
    setAutoLevel(0)
    setMovedFromStart('no')
    setAutoScoredZeroFuel('no')
    setTeleopScoredZeroFuel('no')
    setDefense('no')
    setNeedsAttention('no')
    
    // Prepare for next match
    setSelectedTeam('')
    setShowNextMatchModal(true)
    setShowTeleopModal(false)
  }

  const createPackage = () => {
    if (records.length === 0) return
    if (!window.confirm('Create a package from current records? This will clear the current data view.')) return
    
    const session = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      data: [...records]
    }
    setArchives(prev => [session, ...prev])
    setRecords([])
    setShowPackageModal(true)
  }

  const deleteArchiveSession = (id) => {
      setPackageToDelete(id)
  }
  
  const confirmDeletePackage = () => {
    setArchives(prev => prev.filter(s => s.id !== packageToDelete))
    setPackageToDelete(null)
  }

  const exportArchiveJSON = (session) => {
    const payload = session.data.map(r => {
      const team = teams[r.teamIndex] || {}
      return {
        ...r,
        teamName: team.name || 'Unnamed',
        teamNumber: team.number || '-'
      }
    })
    const dataStr = JSON.stringify(payload, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `archive_${session.id}.json`; a.click(); URL.revokeObjectURL(url)
  }

  const exportArchiveCSV = (session) => {
    const csv = toCSV(session.data, teams)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `archive_${session.id}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className={`banner ${allianceSelection.startsWith('Red') ? 'red' : allianceSelection.startsWith('Blue') ? 'blue' : ''}`}>
        <div className="banner-inner" style={{ justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.5em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {allianceSelection || 'No Alliance Selected'}
          </div>
        </div>
      </div>
      <div className={`viewport-outline ${allianceSelection.startsWith('Red') ? 'red' : allianceSelection.startsWith('Blue') ? 'blue' : ''}`} />
      
      <div className={`app-root theme-${theme}`} style={{paddingTop:64}}>
        <div className="tabs">
          <div className={`tab ${active === 'setup' ? 'active' : ''}`} onClick={() => setActive('setup')}>Setup</div>
          <div className={`tab ${active === 'scout' ? 'active' : ''}`} onClick={() => setActive('scout')}>Scout</div>
          <div className={`tab ${active === 'sync' ? 'active' : ''}`} onClick={() => setActive('sync')}>Packages</div>
        </div>

        <div className={`panels ${active === 'setup' ? 'settings-two' : ''}`}>
          {active === 'scout' && (
            <ScoutingForm 
              teams={teams}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              matchNumber={matchNumber}
              setMatchNumber={setMatchNumber}
              movedFromStart={movedFromStart}
              setMovedFromStart={setMovedFromStart}
              autoScoredZeroFuel={autoScoredZeroFuel}
              setAutoScoredZeroFuel={setAutoScoredZeroFuel}
              autoLevel={autoLevel}
              setAutoLevel={setAutoLevel}
              teleopScoredZeroFuel={teleopScoredZeroFuel}
              setTeleopScoredZeroFuel={setTeleopScoredZeroFuel}
              defense={defense}
              setDefense={setDefense}
              needsAttention={needsAttention}
              setNeedsAttention={setNeedsAttention}
              onOpenTeleopModal={() => setShowTeleopModal(true)}
            />
          )}

          {active === 'sync' && (
            <DataManager 
              records={records}
              setRecords={setRecords}
              archives={archives}
              teams={teams}
              onCreatePackage={createPackage}
              onDeleteArchive={deleteArchiveSession}
              onExportArchiveJSON={exportArchiveJSON}
              onExportArchiveCSV={exportArchiveCSV}
            />
          )}

          {active === 'setup' && (
            <SetupPanel 
              teams={teams}
              setTeams={setTeams}
              allianceSelection={allianceSelection}
              setAllianceSelection={setAllianceSelection}
              onShare={handleShareTeams}
              onDeleteTeam={deleteTeam}
            />
          )}
        </div>

        {/* Modals */}
        <TeleopModal 
            show={showTeleopModal} 
            onCancel={() => setShowTeleopModal(false)}
            onSubmit={handleTeleopSubmit}
        />
        
        <QRCodeModal 
            show={showQRModal} 
            onClose={() => setShowQRModal(false)}
            payload={qrPayload}
            initialBaseUrl={qrBaseUrl}
        />

        <NextMatchModal 
            show={showNextMatchModal} 
            onClose={() => setShowNextMatchModal(false)}
            matchNumber={matchNumber}
            setMatchNumber={setMatchNumber}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            teams={teams}
        />

        <DeletePackageModal 
            show={packageToDelete !== null} 
            onCancel={() => setPackageToDelete(null)}
            onConfirm={confirmDeletePackage}
        />

        <PackageCreatedModal 
            show={showPackageModal} 
            onClose={() => setShowPackageModal(false)}
        />

        <AllianceSelectionModal 
            show={showAllianceModal} 
            onSelect={handleAllianceSelect} 
        />
      </div>
    </>
  )
}
