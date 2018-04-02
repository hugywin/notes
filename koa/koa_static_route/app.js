const http = require('http')
const URL = require('url')
const PATH = require('path')
const Koa = require('koa')
const koaBodyParser = require('koa-better-body')
const Router = require('./createRouter')
let router = Router({
  prefix: '/api',
  ctrlPath: PATH.join(__dirname, './controller')
})
console.log('router.prototype', router)

let app = new Koa();
let service = http.createServer(app.callback())

app.use(koaBodyParser({
    formLimit: "5000000",
    textLimit: "5000000",
    jsonLimit: "5000000",
    maxFieldsSize: "5000000"
}))

app.use(router.middleware())

service.listen(8090, () => {
    console.log('listen on 8090')
})
