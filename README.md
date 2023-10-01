# ExternalPoliceComputer 1.1.1

A Police Computer Plugin and Server for LSPDFR.

## Citation and Arrest Options
- Files: `EPC/citationOptions.json` &  `EPC/arrestOptions.json`
- `minFine`: Minimum fine in $ for charge
- `maxFine`: Maximum fine in $ for charge
- `minMonth`: Minimum jail time in month for charge (arrests only)
- `maxMonth`: Maximum jail time in month for charge (arrests only)
- `probation`: Chance of probation 0-1 (arrests only)

## Map
- File: `EPC/map.jpeg`
- Preferred Dimensions: 3072 x 4608
- Source: https://forum.cfx.re/uploads/default/original/4X/c/6/7/c67d156aaba53758e345a6cf72110044048f3e3e.jpeg

## Styles
- File: `EPC/custom.css`
- For simple customization you may change colors and the header size in the `:root` selector
- Feel free to also add more css. `EPC/custom.css` will overwrite `EPC/styles.css`

## Steam overlay
- In steam go to Steam<a>&rarr;</a>Settings<a>&rarr;</a>In Game
- Make sure _Enable the Steam Overlay while in-game_ is enabled
- Set _Overlay shortcut key(s)_ to whatever key you want to use to open ExternalPoliceComputer
- Set _Web browser home page_ to `http://localhost`
