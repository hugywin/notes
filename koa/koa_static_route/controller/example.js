class example {

  static show () {
    async function required(ctx, next) {
      console.log(1)
      await next()
    }
    return {
      url: '/index/:id',
      method: "GET",
      middlewares: [required]
    }
  }

  async show (ctx, next) {
    ctx.body = ctx.params;
  }
}

module.exports = example
