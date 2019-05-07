const cognitive = require('cognitive-services')
const concat = require('concat-stream')
const fs = require('fs')
const pump = require('pump')

const faceClient = new cognitive.face({
  apiKey: process.env.API_KEY,
  endpoint: 'brazilsouth.api.cognitive.microsoft.com'
})

async function routes (fastify, options) {
  fastify.post('/add-person', async function (request, reply) {
    function handler (field, file, filename, encoding, mimetype) {
      // to accumulate the file in memory! Be careful!
      //
      // file.pipe(concat(function (buf) {
      //   console.log('received', filename, 'size', buf.length)
      // }))
      //
      // or
      console.log('caraio')
    }

    const mp = request.multipart(handler, function (err) {
      if (err) {
        throw err
      }
      console.log('upload completed')
      reply.code(200).send('upload completed')
    })

    mp.on('field', async function (key, value) {
      try {
        console.log('form-data', key)
        let parameters = {
          'personGroupId': 'bett-test-group'
        }
        let body = {
          'name': 'Felipe Mietto',
          'userData': '37472906808'
        }
        let person = await faceClient.createAPerson({
          parameters,
          body
        })

        // let url = `https://brazilsouth.api.cognitive.microsoft.com/face/v1.0/persongroups/${personGroupId}/persons/${person.id}/persistedFaces`

        let face = value
        // persist on filesystem

        let i = key.split('_')[1]

        let base64Data = face.replace(/^data:image\/png;base64,/, '')

        fs.writeFileSync(`images/${person.personId}_${i}.png`, base64Data, 'base64')

        parameters = {
          'personGroupId': 'bett-test-group',
          'personId': person.personId
        }

        body = {
          'url': `${process.env.SERVER_URL}/pictures/${person.personId}_${i}`
        }
        // add person face
        let addedFace = await faceClient.addAPersonFace({
          parameters,
          body
        })
      } catch (err) {
        console.error(err)
      }
    })
  })

  fastify.get('/pictures/:picname', async (request, reply) => {
    let image = fs.readFileSync(`images/${request.params.picname}`)

    reply.type('image/png').send(image)

    fs.unlinkSync(`images/${request.params.picname}`)
  })

  fastify.post('/test', async (request, reply) => {
    return { message: 'face-api is up and running' }
  })
}

module.exports = routes
