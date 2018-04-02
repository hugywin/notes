// koa-better-router
'use strict'

const pathMatch = require('path-match')
const isGenerator = require('is-es6-generator-function')
const convert = require('koa-convert')
let utils = require('./utils')

let pathToRegexp = null
//const routes = Symbol('routes')

class KoaRouter {
  constructor(options) {
    // this 指向实例
    // if (!(this instanceof KoaRouter)) {
    //   return new KoaRouter(options)
    // }
    console.log('options', options)
    this.options = Object.assign({prefix: '/'}, options)
    pathToRegexp = pathMatch(this.options)
    this.routes = []
  }

  // 创建基础路由
  loadMethods () {
    utils.methods.forEach(method => {
      const METHOD = method.toUpperCase()
      // Object.getPrototypeOf(this) === this.__proto__
      this.__proto__[method] = this.__proto__[METHOD] = () => {
        return this.addRoute.apply(this, [METHOD].concat(args))
      }
    })
  }

  /*
   * 创建路由
   * method: 'get' or 'get /api'
   * route '/api/a' or 'function'
  */
  createRoute (method, route, fns) {
    let middlewares = utils.arrayify(fns)

    if (typeof method !== 'string') {
      throw new TypeError('method必须string')
    }
    let parts = method.split(' ')
    method = parts[0].toUpperCase()

    if (typeof route === 'function' || Array.isArray(route)) {
      route = parts[1]
      middlewares = utils.arrayify(route).concat(middlewares)
    }

    if (typeof route !== 'string') {
      throw new TypeError('route必须为string or function')
    }

    let prefixed = utils.createPrefix(this.options.prefix, route)
    middlewares = middlewares.map((fn) => {
      return isGenerator(fn) ? convert(fn) : fn
    })
    return {
      prefix: this.options.prefix,
      path: prefixed,
      route: route,
      match: pathToRegexp(prefixed),
      method: method,
      middlewares: middlewares
    }
  }

  // addRoute
  addRoute (...args) {
    let routeObject = this.createRoute.apply(this, args)
    this.routes.push(routeObject)
    return this
  }

  getRoute (name) {
    if (typeof name !== 'string') {
      throw new TypeError('参数必须为 string')
    }
    let res = null
    for (let route of this.routes) {
      name = name.charAt(0) === '/' ? name.slice(1) : name
      if (name === route.route.slice(1)) {
        res = route
        break
      }
    }
    return res
  }

  getRoutes () {
    return this.routes
  }

  // koa 中间件
  middleware () {
    return (ctx, next) => {
      for (let route of this.routes) {

        if (ctx.method !== route.method) {
          continue
        }

        // 如果匹配没参数返回空对象
        console.log('route', route, ctx.path, ctx.params)
        let match = route.match(ctx.path, ctx.params)
        if (!match) {
          continue
        }

        route.params = match
        // console.log('match', match)
        // 挂载koa ctx
        ctx.route = route
        ctx.params = route.params

        //return utils.compose(route.middlewares)(ctx).then(() => next())
        // 执行middlewares
        let index = -1
        return dispatch(0)

        function dispatch (i) {
          if (i <= index) return Promise.reject(new Error('next() called multiple times'))
          index = i
          let fn = route.middlewares[i]
          if (i === route.middlewares.length) fn = next
          if (!fn) return Promise.resolve()
          try {
            return Promise.resolve(fn(ctx, function next () {
              return dispatch(i + 1)
            }))
          } catch (err) {
            return Promise.reject(err)
          }
        }

      }

      if (!ctx.body) {
        return next()
      }

    }
  }

}

module.exports = KoaRouter
