class example {

  static user () {
    async function required(ctx, next) {
      console.log(1)
      await next()
    }
    return {
      url: '/user/:id',
      method: "GET",
      middlewares: [required]
    }
  }

  async user (ctx, next) {
    ctx.body = ctx.params;
  }
}

module.exports = example
