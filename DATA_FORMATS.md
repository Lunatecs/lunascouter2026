# Lunascouter Data Formats

This document defines the data structures and serialization formats used by Lunascouter V2 for data storage, export, and QR code sharing.

## 1. QR Code Payload Format

To maximize data density in QR codes, the application uses a compressed binary format encoded in Base64.

### Serialization Steps
1.  **JSON Serialization**: The data object (Session or Package) is converted to a minified JSON string.
2.  **Compression**: The JSON string is compressed using the **Deflate** algorithm (zlib format).
    *   *Implementation*: Uses `pako.deflate()` in the web app.
3.  **Encoding**: The compressed binary data is encoded into a **Base64** string.
4.  **QR Generation**: The Base64 string is rendered as the QR code content.

### Deserialization Steps (for scanning/importing)
1.  **Scan**: Read the Base64 string from the QR code.
2.  **Decode**: Decode the Base64 string back to binary data.
3.  **Decompress**: Inflate the binary data using zlib/inflate.
    *   *Implementation*: `pako.inflate()` (to string).
4.  **Parse**: Parse the resulting JSON string into a JavaScript object.

### Comparison
| Method | Description | Size Efficiency |
| :--- | :--- | :--- |
| **Raw JSON** | Standard text-based JSON | Low (High character count) |
| **Base64 JSON** | Base64 encoded JSON string | Medium (~33% larger than Raw) |
| **Compressed (Deflate)** | **Zlib Compressed + Base64** | **High (~70-90% smaller than Raw)** |

---

## 2. Match Data Schema

The core data unit is a **Match Record**, representing one robot's performance in a single match.

### Root Object

| Field | Type | Description |
| :--- | :--- | :--- |
| `team` | `string` | Team number (e.g. "254") |
| `matchNumber` | `number` | Current match number |
| `scoutName` | `string` | Name of the scout |
| `timestamp` | `number` | Unix Timestamp (ms) |
| `values` | `object` | Container for all match metrics |

### Values Object (`values`)

#### Autonomous Period
| Field | Type | Possible Values | Description |
| :--- | :--- | :--- | :--- |
| `autoPosition` | `number` | `0` (None), `1`, `2`, `3`, `4` | Starting Position |
| `autoFuelCollected`| `string` | `"Center Area"`, `"Human Player"`, `"Depot"`, `"None"` | Fuel Source |
| `autoLevel` | `number` | `0` (None), `1` (L1) | Tower Level Scored |
| `movedFromStart` | `boolean` | `true`, `false` | Left starting zone? |
| `autoScoredZeroFuel`| `boolean`| `true` (Zero Fuel), `false` (Scored) | Did they score 0 Fuel? |

#### Teleoperated Period
| Field | Type | Possible Values | Description |
| :--- | :--- | :--- | :--- |
| `defense` | `boolean` | `true`, `false` | Played defense? |
| `teleopScoredZeroFuel`| `boolean`| `true` (Scored), `false` (Zero) | Note: Logic inverted in UI labels |
| `brokeDown` | `boolean` | `true`, `false` | Robot broke down? |
| `relayedFuel` | `boolean` | `true`, `false` | Transported fuel? |
| `mobilityIssues` | `number` | `0`, `1`, `2`... | Count of issues |
| `fieldCrossing` | `string` | `"Trench"`, `"Bump"`, `"Both"`, `"None"` | Crossing type |
| `needsAttention` | `boolean` | `true`, `false` | Flag for review |

#### Endgame
| Field | Type | Possible Values | Description |
| :--- | :--- | :--- | :--- |
| `teleopLevel` | `number` | `0` (None), `1`, `2`, `3` | Tower Level Scored |
| `endgameScoredZeroFuel`| `boolean`| `true` (Zero), `false` (Scored) | Did they score 0 Fuel? |
| `teleopNote` | `string` | *Text* | Qualitative notes |

---

## 3. Session / Package Format

When exporting data (JSON file or QR code), records are wrapped in a **Session** object.

```jsonc
{
  "id": "uuid-string",           // Unique session ID (UUID v4)
  "timestamp": "ISO-8601-Date-String", // Creation Time
  "data": [                      // Array of Match Records
    {
      "id": "uuid-record-1",
      "team": "254",
      "matchNumber": 42,
      "values": { ... }
    }
  ]
}
```

## Example JSON Blob (Single Record)

```jsonc
{
  "team": "254", // Team number (string)
  "matchNumber": 42, // Current match number
  "scoutName": "John Doe", // Name of the scout
  "timestamp": 1709300000000, // Unix Timestamp (number)
  "values": {
    // --- Auto Metrics ---
    "autoPosition": 1, // 0=None, 1-4=Field zones
    "autoFuelCollected": "Center Area", // "Center Area", "Human Player", "Depot", "None"
    "autoLevel": 1, // 0=None, 1=L1
    "movedFromStart": true, // Whether robot left starting zone
    "autoScoredZeroFuel": true, // true=Zero Fuel (Default), false=Scored Fuel

    // --- Teleop Metrics ---
    "defense": false, // Whether robot played defense
    "teleopScoredZeroFuel": false, // true=Scored Fuel, false=Zero Fuel
    "brokeDown": false, // Mechanical failure flag
    "relayedFuel": true, // Whether robot transported fuel across field
    "mobilityIssues": 0, // Count of movement/stalling issues
    "fieldCrossing": "Trench", // "Trench", "Bump", "Both", "None"
    "needsAttention": false, // Manual review flag
    
    // --- Endgame Metrics ---
    "teleopLevel": 3, // 0=None, 1=L1, 2=L2, 3=L3
    "endgameScoredZeroFuel": false, // true=Zero Fuel (Default), false=Scored Fuel
    "teleopNote": "Great robot performance!" // Scout's text comments
  }
}
```
