const cognitive = require('cognitive-services')

const faceClient = new cognitive.face({
  apiKey: process.env.API_KEY,
  endpoint: 'https://brazilsouth.api.cognitive.microsoft.com/face/v1.0'
})

async function routes (fastify, options) {
  fastify.post('/add-person', async (request, reply) => {
    const personGroupId = 'bett-test-group'
    let person = await faceClient.createAPerson({
      'name': request.body.person.name,
      'userData': request.body.person.cpf
    })

    let url = `https://brazilsouth.api.cognitive.microsoft.com/face/v1.0/persongroups/${personGroupId}/persons/${person.id}/persistedFaces`

    for (let i = 0; i < request.body.faces.length; i++) {
      let face = request.body.faces[i]
      // persist on filesystem

      let base64Data = face.replace(/^data:image\/png;base64,/, '')

      require('fs').writeFileSync(`images/${person.id}_${i}.png`, base64Data, 'base64')

      // add person face
      let addedFace = await faceClient.addAPersonFace({
        'url': `${process.env.SERVER_URL}/pictures/${person.id}_${i}`
      })

      // delete from filesystem
    }

    return { message: 'face-api is up and running' }
  })

  fastify.get('/pictures/:picname', async (request, reply) => {
    let image = require('fs').readFileSync(`images/${request.picname}.png`)

    return { message: 'face-api is up and running' }
  })

  fastify.post('/test', async (request, reply) => {
    return { message: 'face-api is up and running' }
  })
}

module.exports = routes
