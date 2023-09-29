# ExternalPoliceComputer

A Police Computer Plugin and Server for LSPDFR.

## Citation and Arrest Options
- Files: `EPC/citationOptions.json` &  `EPC/arrestOptions.json`
- Example:
```json
[
  {
    "name": "Name of group",
    "charges": [
      "First Citation / Arrest charge",
      "Second Citation / Arrest charge"
    ]
  },
  {
    "name": "Name of second group",
    "charges": [
      "Third Citation / Arrest charge",
      "Fourth Citation / Arrest charge",
      "Fifth Citation / Arrest charge"
    ]
  },
]
```

## Map
- File: `EPC/map.jpeg`
- Preferred Dimensions: 3072 x 4608

## Styles
- File: `EPC/styles.css`
- For simple customization you may change colors and the header size in the `:root` selector
- Feel free to also change the rest to your likings

## Steam overlay
- In steam go to Steam<a>&rarr;</a>Settings<a>&rarr;</a>In Game
- Make sure _Enable the Steam Overlay while in-game_ is enabled
- Set _Overlay shortcut key(s)_ to whatever key you want to use to open ExternalPoliceComputer
- Set _Web browser home page_ to `http://localhost`
