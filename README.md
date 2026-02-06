# LUNA Scouter (Vite + React)

Quick minimal app matching the provided wireframe. Enter a team name and number, click "Add Team" to append to the list.

## Run locally

```bash
npm install
npm run dev
```

Open the dev server URL printed by Vite (usually http://localhost:5173).

## Data Schema

### JSON Export Format
```json
[
  {
    "team": "581",
    "matchNumber": 1,
    "position": "Red 1",
    "timestamp": 1738454400000,
    "discarded": false,
    "scoutName": "John Doe",
    "values": {
      "autoLevel": 2,
      "teleopLevel": 3,
      "teleopNote": "Great defense, fast cycles",
      "movedFromStart": true,
      "autoScoredZeroFuel": false,
      "teleopScoredZeroFuel": true,
      "defense": true,
      "needsAttention": false,
      "brokeDown": false,
      "relayedFuel": true
    },
    "teamName": "Blazing Bulldogs"
  }
]
```

### CSV Export Format
The CSV export flattens the structure:
```csv
team,matchNumber,position,timestamp,autoLevel,teleopLevel,teleopNote,movedFromStart,autoScoredZeroFuel,teleopScoredZeroFuel,defense,needsAttention,brokeDown,relayedFuel,discarded,scoutName
"581","1","Red 1","1738454400000","2","3","Great defense, fast cycles","true","false","true","true","false","false","true","false","John Doe"
```
