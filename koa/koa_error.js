const Koa = require('koa');
const app = new Koa();

const handler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log('aaa');
    // ctx.response.status = err.statusCode || err.status || 500;
    // ctx.response.body = {
    //   message: err.message
    // };
    ctx.status = 200
    ctx.body = 'err.message'

  }
};

const handler2 = async (ctx, next) => {
  await next();
  console.log(3)
}

const main = ctx => {
  try {
    throw('a');
  } catch (e) {
    console.log('a')
    throw(500)
    //ctx.app.emit('error', 'err.message', ctx);
  }

  //ctx.body = 'err.message'
};
app.on('error', (err, ctx) => {
  console.error('server error', err);
});

app.use(async (ctx, next) => {
  await next();
  console.log(new Date().getTime())
})
app.use(async (ctx, next) => {
  await next();
  console.log(4)
})
app.use(handler);
app.use(handler2);
app.use(main);

app.listen(3000);
