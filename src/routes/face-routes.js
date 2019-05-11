const cognitive = require("cognitive-services");
const concat = require("concat-stream");
const fs = require("fs");
const pump = require("pump");
let userId = "";
let user = {};
let person = {};
const users = require("../users.js");
let count = 0;
let countOriginal = 0;
const atob = require("atob");
const btoa = require("btoa");
let registeredUsers = require("../../registered.json");

const faceClient = new cognitive.face({
  apiKey: process.env.API_KEY,
  endpoint: "eastus2.api.cognitive.microsoft.com"
});

//https://eastus2.api.cognitive.microsoft.com/face/v1.0

async function routes(fastify, options) {
  fastify.post("/add-person", async function(request, reply) {
    function handler(field, file, filename, encoding, mimetype) {
      // to accumulate the file in memory! Be careful!
      //
      // file.pipe(concat(function (buf) {
      //   console.log('received', filename, 'size', buf.length)
      // }))
      //
      //
    }

    const mp = request.multipart(handler, function(err) {
      if (err) {
        throw err;
      }
      console.log("upload completed");
      reply.code(200).send("upload completed");
    });

    count = mp._eventsCount;
    countOriginal = mp._eventsCount;

    mp.on("field", async function(key, value) {
      try {
        console.log("form-data", key);

        if (key === "user") {
          user = JSON.parse(value);
          let filtered = registeredUsers.filter(el => el.email === user.email);
          if (filtered.length > 0) {
            console.error(
              "User " + JSON.stringify(user) + "already registered."
            );
          }
        } else {
          // let url = `https://brazilsouth.api.cognitive.microsoft.com/face/v1.0/persongroups/${personGroupId}/persons/${person.id}/persistedFaces`

          let face = value;
          // persist on filesystem

          let i = key.split("_")[1];

          let base64Data = face.replace(/^data:image\/png;base64,/, "");

          fs.writeFileSync(
            `images/${btoa(user.email + "_" + i)}.png`,
            base64Data,
            "base64"
          );

          count--;
          if (count === 0) {
            await processFiles(user, countOriginal);
          }
        }
      } catch (err) {
        console.log(err, userId);
        throw err;
      }
    });
  });

  async function processFiles(user, countOriginal) {
    let parameters = {
      personGroupId: "bett-2030-group"
    };
    let body = {
      name: user.name,
      userData: user.email
    };

    console.log(registeredUsers);

    person = await faceClient.createAPerson({
      parameters,
      body
    });

    user.personId = person.personId;
    registeredUsers.push(user);

    fs.writeFileSync(`registered.json`, JSON.stringify(registeredUsers));

    parameters = {
      personGroupId: "bett-2030-group",
      personId: person.personId
    };

    for (let i = 0; i < countOriginal; i++) {
      body = {
        url: `http://${process.env.SERVER_URL}/pictures/${btoa(
          user.email + "_" + i
        )}.png`
      };
      // add person face
      try {
        let addedFace = await faceClient.addAPersonFace({
          parameters,
          body
        });
      } catch (err) {
        console.log(err, person.personId);
      }
    }

    parameters = {
      personGroupId: "bett-2030-group"
    };

    let trainedResult = await faceClient.trainPersonGroup({
      parameters
    });
  }

  fastify.get("/pictures/:picname", async (request, reply) => {
    let image = fs.readFileSync(`images/${request.params.picname}`);

    reply.type("image/png").send(image);

    fs.unlinkSync(`images/${request.params.picname}`);
  });

  fastify.get("/users/:userId", async (request, reply) => {
    let filtered = users.filter(el => {
      return el.userId === request.params.userId;
    });
    let user = filtered[0];

    reply.send({ user });
  });

  fastify.get("/test", async (request, reply) => {
    return { message: "face-api is up and running" };
  });
}

module.exports = routes;
