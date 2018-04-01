'use strict'

utils.typeOf = function typeOf (val) {
  return Array.isArray(val) ? 'array' : typeof val
}

utils.isObject = function isObject (val) {
  return val && utils.typeOf(val) === 'object'
}

utils.arrayify = function arrayify (val) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}

// 合并路由
utils.createPrefix = function createPrefix (prefix, pathname) {
  let path = pathname.replace(/^\/|\/$/, '')
  let clean = prefix.replace(/^\/|\/$/, '')
  clean = clean.length > 0 ? `/${clean}` : clean
  return `${clean}/${path}`
}


module.exports = utils
