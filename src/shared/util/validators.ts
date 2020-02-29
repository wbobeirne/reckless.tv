const hexRegex = /^[0-9A-Fa-f]+$/
export const isHex = (s: string) => hexRegex.test(s)

const base64Regex = /^[0-9A-Za-z+/]+$/
export const isBase64 = (s: string) => base64Regex.test(s)
