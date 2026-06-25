export function getItem(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error(`读取 ${key} 失败`, e)
    return defaultValue
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`保存 ${key} 失败`, e)
    throw e
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`删除 ${key} 失败`, e)
  }
}
