const scriptUrl = document.getElementById('scriptUrl')

scriptUrl.addEventListener('change', () => {
  chrome.storage.local.set({ scriptUrl: scriptUrl.value })
})

chrome.storage.local.get('scriptUrl', result => {
  scriptUrl.value = result.scriptUrl || ''
})
