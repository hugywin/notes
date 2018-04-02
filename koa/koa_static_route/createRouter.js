const Router = require('./Router')
const path = require('path')
const glob = require('glob')

class CreateRoute extends Router{
  constructor(options) {
    super({prefix: options.prefix})
    this.options = options;
    this.resouce = []
    // 生成路由资源
    this.getResouce()
  }

  getResouce () {
    const dirArray = glob.sync(path.join(this.options.ctrlPath, './*.js'))

    dirArray.forEach(dir => {
      let Factory = require(dir)
      let inter = new Factory()
      //let dirName = path.basename(dir, '.js')
      // controller 路由
      let middlewares = Object.getOwnPropertyNames(Factory.prototype).splice(1)
      // 静态方法
      let staticDecorate = Object.getOwnPropertyNames(Factory)

      this.resouce = middlewares.map(method => {
        if (staticDecorate.indexOf[method] === -1) {
          throw new TypeError('controller方法缺少静态方法')
          return
        }
        let opts = Factory[method].call(Factory)
        opts.middlewares.push(inter[method])
        opts.context = inter
        return opts
      })
    })
  }

  _getMethod (Obj, arr) {
    return arr.map(item => {
      return Obj[item]
    })
  }

  // 注入
  inject (opts) {
    this.resouce.forEach(route => {
      let context = route.context
      route.middlewares.forEach(middleware => {
        middleware = (ctx, next, opts) => {
          return middleware.apply(context, arguments)
        }
      })
    })
  }

  // 生成中间件
  middleware () {
    this.resouce.forEach(route => {
      this.addRoute(route.method, route.url, route.middlewares)
    })
    return super.middleware()
    // return () => {
    //
    // }
  }

}

module.exports = function(options) {
  return new CreateRoute(options)
}
