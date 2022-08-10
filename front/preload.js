// const print = console.log
// const { contextBridge } = require('electron')
// const fs = require('fs')

// contextBridge.exposeInMainWorld('fs', {
// 	writeFile: (path, data) => { fs.writeFile(path, data, err => {print(err)}) }
// })

// contextBridge.exposeInMainWorld('Buffer', {
// 	from: (...args) => { return Buffer.from(...args) }
// })