// let activeTab = null
// let lastActiveTab = null

// chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
//   if (activeTab === tabId) return
//   chrome.tabs.query({ active: true }, tabs => {
//     const filtedtabs = tabs.filter(tab => tab.id === tabId)
//     const tab = filtedtabs[0]
//     if (tab && tab.url.indexOf('sellularapp.com:3000') !== -1) return
//     if (tab) {
//       activeTab = tabId
//       chrome.tabs.executeScript(activeTab, {
//         file: 'inject-icon.js',
//       })
//     }
//   })
// })
