import React, { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useWebHaptics } from 'web-haptics/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useStore } from './store'

// Components
import SetupPanel from './components/SetupPanel'
import ScoutingForm from './components/ScoutingForm'
import DataManager from './components/DataManager'
import AllianceSelectionModal from './components/Modals/AllianceSelectionModal'
import QRCodeModal from './components/Modals/QRCodeModal'

export default function App() {
  const { trigger } = useWebHaptics({ debug: true });

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line no-console
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      toast.success("App is ready to work offline");
      setOfflineReady(false);
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', marginBottom: '8px' }}>New version available!</span>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              padding: "6px 12px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px",
              alignSelf: "flex-end",
              marginTop: "8px"
            }}
          >
            Update Now
          </button>
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          onClose: () => setNeedRefresh(false),
          icon: false // Remove default icon to save space if desired
        }
      );
    }
  }, [needRefresh]);

  // Global State from Zustand
  const teams = useStore(state => state.teams)
  const setTeams = useStore(state => state.setTeams)
  const allianceSelection = useStore(state => state.allianceSelection)
  const setAllianceSelection = useStore(state => state.setAllianceSelection)

  // Tabs
  const [active, setActive] = useState('setup')
  const [isScoutingDirty, setIsScoutingDirty] = useState(false)
  
  // Modals State
  const [showAllianceModal, setShowAllianceModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrBaseUrl, setQrBaseUrl] = useState('')
  const [qrPayload, setQrPayload] = useState('')
  const [qrSettings, setQrSettings] = useState({
    title: 'Share Team List',
    message: 'Scan this code with another device to import the team list.',
    includeUrl: true
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
        const decoded = JSON.parse(atob(importedData))
        if (Array.isArray(decoded) && decoded.length > 0) {
          if (window.confirm(`Found ${decoded.length} teams in URL. Do you want to IMPORT them? \n\nClick OK to Append to existing list, Cancel to Replace existing list.`)) {
             // We need to use functional update based on current state, 
             // but with Zustand we can just grab current state or pass a function to setTeams if it supported it.
             // Our setTeams is simple. We can use the store's current state.
             const currentTeams = useStore.getState().teams
             const existingNums = new Set(currentTeams.map(t => t.number))
             const newTeams = decoded.filter(t => !existingNums.has(t.number))
             const count = newTeams.length
             if (count === 0) alert('All teams in link already exist.')
             else alert(`Imported ${count} new teams.`)
             
             const combined = [...currentTeams, ...newTeams].sort((a, b) => {
                   const numA = parseInt(a.number, 10) || 0;
                   const numB = parseInt(b.number, 10) || 0;
                   return numA - numB;
             });
             setTeams(combined)

          } else {
             if (window.confirm("Do you want to REPLACE your current team list with these teams? This cannot be undone.")) {
                const sorted = decoded.sort((a, b) => {
                    const numA = parseInt(a.number, 10) || 0;
                    const numB = parseInt(b.number, 10) || 0;
                    return numA - numB;
                });
                setTeams(sorted)
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
    const payload = encodeURIComponent(btoa(rawPayload))
    setQrPayload(payload)
    setQrBaseUrl(`${window.location.origin}${window.location.pathname}`)
    setQrSettings({
      title: 'Share Team List',
      message: 'Scan this code with another device to import the team list.',
      includeUrl: true
    })
    setShowQRModal(true)
  }

  const handleAllianceSelect = (selection) => {
      setAllianceSelection(selection)
      setShowAllianceModal(false)
  }

  const handleTabChange = (newTab) => {
    if (active === 'scout' && newTab !== 'scout' && isScoutingDirty) {
      toast.warn(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Switching tabs will clear your current scouting data.</span>
          <button 
            onClick={() => {
              setActive(newTab);
              setIsScoutingDirty(false);
              toast.dismiss();
            }}
            style={{
              padding: '6px 12px',
              background: '#ff4d4d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              alignSelf: 'flex-end'
            }}
          >
            Clear and Continue
          </button>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
      trigger('warning');
    } else {
      setActive(newTab);
      trigger('selection');
    }
  }

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      <div className={`banner ${allianceSelection.startsWith('Red') ? 'red' : allianceSelection.startsWith('Blue') ? 'blue' : ''}`}>
        <div className="banner-inner" style={{ justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.5em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {allianceSelection || 'No Alliance Selected'}
          </div>
        </div>
      </div>
      <div className={`viewport-outline ${allianceSelection.startsWith('Red') ? 'red' : allianceSelection.startsWith('Blue') ? 'blue' : ''}`} />
      
      <div className={`app-root`} style={{paddingTop:48}}>
        <div className="tabs">
          <div className={`tab ${active === 'setup' ? 'active' : ''}`} onClick={() => handleTabChange('setup')}>Setup</div>
          <div className={`tab ${active === 'scout' ? 'active' : ''}`} onClick={() => handleTabChange('scout')}>Scout</div>
          <div className={`tab ${active === 'sync' ? 'active' : ''}`} onClick={() => handleTabChange('sync')}>Packages</div>
        </div>

        <div className={`panels ${active === 'setup' ? 'settings-two' : ''}`}>
          {active === 'scout' && (
            <ScoutingForm 
              trigger={trigger}
              setIsDirty={setIsScoutingDirty}
            />
          )}

          {active === 'sync' && (
            <DataManager />
          )}

          {active === 'setup' && (
            <SetupPanel 
              onShare={handleShareTeams}
            />
          )}
        </div>

        {/* Modals */}
        <QRCodeModal 
            show={showQRModal} 
            onClose={() => setShowQRModal(false)}
            payload={qrPayload}
            initialBaseUrl={qrBaseUrl}
            title={qrSettings.title}
            message={qrSettings.message}
            includeUrl={qrSettings.includeUrl}
        />

        <AllianceSelectionModal 
            show={showAllianceModal} 
            onSelect={handleAllianceSelect} 
        />
      </div>
    </>
  )
}
