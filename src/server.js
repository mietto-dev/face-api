require('dotenv').config()
const routes = require('./routes/index')
const fastify = require('fastify')({ logger: true })

const port = process.env.SERVER_PORT || 80

for (const r in routes) {
  fastify.register(routes[r])
}

const start = async () => {
  try {
    await fastify.listen(port, '0.0.0.0')

    fastify.log.info(`server listening on ${fastify.server.address().port}`)

    console.log(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    console.error(err)
    process.exit(1)
  }
}
start()
