chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const parser = new DOMParser()
  const element = parser.parseFromString(msg.html, 'text/html')
  const json = JSON.parse(element.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__').outerText)
  sendResponse({ data: json })
})
