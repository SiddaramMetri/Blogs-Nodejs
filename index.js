const DataBase = require("./db");
const http = require("http");

// define the server
const server = http.createServer();

// define api functions

/**
a blog should contain:
 - title,
 - description,
 - image_link,
 - created_date,
 - last_updated_date,
*/

const database = new DataBase();

// should be able to add blog             POST /blogs
server.on("request", (req, res) => {
  if (req.method === "POST" && req.url === "/blogs") {
    // get data from the request body
    let body = "";
    req
      .on("data", (chunk) => {
        body += chunk;
      })
      .on("end", () => {
        body = JSON.parse(body);

        if (!body.title) {
          res.statusCode = 400;
          res.end("Title is manadatory.");
          return;
        }

        database.create("blogs", {
          title: body.title,
          description: body.description,
          image_link: body.image_link,
          created_at: new Date(),
          last_updated_at: new Date(),
        });

        res.end("success");
      })
      .on("error", () => {
        res.end("error");
      });
  }
});

// should be able to read all blogs       GET  /blogs
server.on("request", (req, res) => {
  if (req.method === "GET" && req.url === "/blogs") {
    const blogs = database.read("blogs");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(blogs));
  }
});

// should be able to read a specific blog GET  /blogs/:id
server.on("request", (req, res) => {
  if (req.method === "GET" && /\/blogs\/\d+$/.test(req.url)) {
    const id = Number(req.url.split("/")[2]);
    const blog = database.read("blogs", id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(blog));
  }
});

// should be able to delete a blog        DELETE /blogs/:id
server.on("request", (req, res) => {
  if (req.method === "DELETE" && /\/blogs\/\d+$/.test(req.url)) {
    const id = Number(req.url.split("/")[2]);
    database.delete("blogs", id);
    res.end("success");
  }
});

// should be able to edit a blog          PATCH  /blogs/:id
server.on("request", (req, res) => {
  if (req.method === "PATCH" && /\/blogs\/\d+$/.test(req.url)) {
    const id = Number(req.url.split("/")[2]);

    // getting the data from body
    let body = "";
    req
      .on("data", (chunck) => {
        body += chunck;
      })
      .on("end", () => {
        body = JSON.parse(body);

        if (body.created_at || body.last_updated_at) {
          res.statusCode = 400;
          res.end("You can't change created_at and last_updated_at.");
          return;
        }

        database.update("blogs", id, { ...body, last_updated_at: new Date() });
        res.end("success");
      })
      .on("error", () => {
        res.end("error");
      });
  }
});

server.listen(3000);