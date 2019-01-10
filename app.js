const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const { PORT, DATABASE_URL } = require("./config");

// //App Config
// //mongoose.connect("mongodb://localhost/restful_blog_app");
// mongoose.connect(
//   "mongodb://jordan:jordan123@ds131151.mlab.com:31151/restful_blog_app"
// );
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose/ Model Config
let blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});
let Blog = mongoose.model("Blog", blogSchema);

// RESTful ROUTES
app.get("/", function(req, res) {
  res.redirect("/blogs");
});
//INDEX Route
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log("ERRORR");
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});
//OSU HUMOR 
app.get("/blogs/osuHumor", function(req, res) {
  res.render("osuHumor");
})
//NEW Route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});
//CREATE Route
app.post("/blogs", function(req, res) {
  //create blogs
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      //then, redirect to the index
      res.redirect("/blogs");
    }
  });
});
// SHOW Route
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

//UPDATE Route
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE Route
app.delete("/blogs/:id", function(req, res) {
  //Destroy Blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
  //Redirect Somewhere
});

// app.listen(3000, function() {
//   console.log("Restful Blog Server has started");
// });

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if app.js is called directly (aka, with `node app.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}
