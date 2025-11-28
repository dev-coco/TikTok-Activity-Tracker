function doPost (request) {
  const json = JSON.parse(request.postData.contents)
  const type = json.action
  let output
  if (type === 'getList') {
    output = getTikTokList()
  } else if (type === 'writeData') {
    output = writeData(json.content)
  }
  return ContentService.createTextOutput(JSON.stringify(output))
}

// 填写记录
function writeData (param) {
  const {
    nickname,
    followingCount,
    followerCount,
    friendCount
  } = param
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('账号记录')
    const day = new Date(new Date().getTime() - 86400000).toLocaleString('zh-CN', { dateStyle: 'short' })
    sheet.appendRow([day, nickname, followingCount, followerCount, friendCount])
    return { status: 'success' }
  } catch {
    return { status: 'fail' }
  }
}

// 获取抖音链接列表
function getTikTokList () {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('账号')
    const data = sheet.getRange('A:A').getValues()
    const list = data.filter(x => x[0].includes('https://www.tiktok.com/@')).flat()
    excludeDuplicates()
    return {
      status: 'success',
      data: list
    }
  } catch {
    return { status: 'fail' }
  }
}

// 删除重复
function excludeDuplicates () {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('账号记录')
  sheet.getRange('A:E').removeDuplicates([1, 2])
}