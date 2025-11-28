// 获取 API 脚本链接
const api = async () => {
  return new Promise(resolve => {
    chrome.storage.local.get('scriptUrl', result => {
      resolve(result.scriptUrl || '')
    })
  })
}

let isRunning = false

// 图标文本
const iconText = str => chrome.action.setBadgeText({ text: str || '' })

chrome.windows.onCreated.addListener(async () => {
  // 未设置 API 链接
  if (!await api()) return
  if (isRunning) {
    console.log('任务已在运行，跳过新窗口触发')
    return
  }
  isRunning = false
  iconText('开始')
  // 获取抖音账号列表
  const urls = await getTikTokList()
  console.log(urls)
  // 今天日期
  const today = getTodayKey()
  let index = 0
  for (const url of urls) {
    index++
    iconText(`${index} / ${urls.length}`)
    // 获取账号状态
    const status = await getAccountStatus(url, today)
    console.log(url, status)

    // 如果已经获取过了，就跳过
    if (status) continue

    // 获取账号信息
    const result = await getTiktokData(url)
    if (result) {
      // 获取成功的时候才保存
      await saveAccountStatus(url, today)
    }
  }
  iconText('')
  console.log('完成')
  isRunning = false
})

// 获取今天日期字符串
function getTodayKey () {
  const today = new Date()
  return today.toLocaleDateString()
}

/**
 * @description 保存账号信息
 * @param {string} url - 账号链接
 * @param {string} date - 日期
 * @returns {Promise<void>} - Promise 在状态保存完成后 resolve
 */
async function saveAccountStatus (url, date) {
  const key = `tiktok_status_${url}_${date}`
  return new Promise(resolve => {
    const data = {}
    data[key] = true
    chrome.storage.local.set(data, () => resolve())
  })
}

/**
 * @description 获取账号信息
 * @param {string} url - 账号链接
 * @param {string} date - 日期
 * @returns {Promise<void>} - Promise 在状态保存完成后 resolve
 */
async function getAccountStatus (url, date) {
  const key = `tiktok_status_${url}_${date}`
  return new Promise(resolve => {
    chrome.storage.local.get(key, result => {
      resolve(result[key] || null)
    })
  })
}

// 创建 offscreen
async function createOffscreen () {
  if (await chrome.offscreen.hasDocument()) return

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['DOM_PARSER'],
    justification: 'Need DOMParser to parse HTML from TikTok'
  })
}

/**
 * @description 获取抖音数据填表
 * @param {string} url - 抖音链接
 * @returns {boolean} 填表结果
 */
async function getTiktokData (url) {
  await createOffscreen()
  const html = await fetch(url).then(response => response.text())
  const result = await chrome.runtime.sendMessage({
    html
  })
  const json = result.data.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo
  const { followingCount, followerCount, friendCount } = json.statsV2
  const { nickname } = json.user

  const params = {
    action: 'writeData',
    content: {
      nickname, // 账号名
      followingCount, // 关注数
      followerCount, // 粉丝数
      friendCount // 好友数
    }
  }
  const response = await fetch(await api(), {
    body: JSON.stringify(params),
    method: 'POST'
  }).then(response => response.json())
  return response.status === 'success'
}

// 获取抖音账号列表
async function getTikTokList () {
  const params = {
    action: 'getList'
  }
  const json = await fetch(await api(), {
    body: JSON.stringify(params),
    method: 'POST'
  }).then(response => response.json())
  if (json.status === 'success') {
    return json.data
  } else {
    return []
  }
}
