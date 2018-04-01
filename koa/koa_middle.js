const Koa = require('koa');
const app = new Koa();

function pro (param) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(param)
    }, Math.random() * 1000 + 1000)
  })
}

let middleware = [
  async (ctx, next) => {
    let result = await pro(1)
    //return
    console.log(result)
    await next()
  },
  async (ctx, next) => {
    let result = await pro(2)
    console.log(result)
    await next()
  },
  (ctx, next) => {
    console.log(3)
    console.log(next)
    next()
  }
]

app.use(async (ctx, next) => {
  let result = await pro('start')
  console.log(result)
  await next()
  console.log('end')
})

app.use(function (ctx, next) {
  let index = -1
  return dispatch(0)

  function dispatch (i) {
    let fn = middleware[i]
    if (i === middleware.length) return
    try {
      //return Promise.resolve()
      return fn(ctx, function next () {
        return dispatch(i + 1)
      })
    } catch (err) {
      return Promise.reject(err)
    }
  }
})

app.use(async (ctx, next) => {
  let result = await pro('sßend')
  console.log(result)
  await next()
})


app.listen(3000);
