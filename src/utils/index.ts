import config from '@/config'

const singleQuoteRe = /'/g
const keysRe = /(?<key>[$a-zA-Z0-9]+):/g

export const getFiltersObject = (queryStr: string) => {
  let newStr = queryStr

  const bracersRe = /[()[\]{}]/g
  if (!bracersRe.test(newStr)) {
    const chunks = newStr
      .split(',')
      .map((x) => x.trim())
      .filter((x) => Boolean(x))
    const result = { categories: { $in: chunks } }

    return result
  }

  const keysMatches = newStr.match(keysRe)
  if (!keysMatches) {
    throw new Error('Invalid string')
  }

  const keysMap: Record<string, boolean> = {}

  keysMatches.forEach((key) => {
    if (keysMap[key]) {
      return
    }

    const keysRe = new RegExp(key.replace('$', '\\$'), 'g')
    const value = `"${key.slice(0, -1)}":`

    newStr = newStr.replace(keysRe, value)
    keysMap[key] = true
  })

  newStr = newStr.replace(singleQuoteRe, '"')

  try {
    const newQuery = JSON.parse(newStr)

    return newQuery
  } catch {
    throw new Error('Invalid string')
  }
}

export const getImageUrl = (fileName: string) => `${config.endpoints.images}/${fileName}`
