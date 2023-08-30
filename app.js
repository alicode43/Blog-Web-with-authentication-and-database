//jshint esversion:6

// require('dotenv').config();
const express = require("express");
const bodyParser=require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-find-or-create')


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(session({
  secret: 'our little secret',
  resave: false,
  saveUninitialized: false,
  
}));

mongoose.connect("mongodb://127.0.0.1:27017/blog");

app.use(passport.initialize());
  app.use(passport.session());



const postSchema =new mongoose.Schema({
  title:String,
  content:String
})


// postSchema.plugin(passportLocalMongoose);
// postSchema.plugin(findOrCreate);

const Post=mongoose.model('post', postSchema);




const userSchema=new mongoose.Schema({
  email:String,
  password:String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User" ,userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// const post1=new Post({
//   title:"DBMS",
//   content:"dbms is very usefull topic to learn"
// })
// post1.save();



let posts = [];

app.get("/", async function(req, res){
  const x = await Post.find();
  res.render("home", {posts:x});
});



app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

// app.get("/compose", function(req, res){
//   res.render("compose");
// });

app.get("/compose", (req, res) =>{
  if(req.isAuthenticated()){
      res.render("compose");
  }
  else{
      res.redirect("/login");
  }
});



app.post("/compose", function(req, res){

  var compose=new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  })

  compose.save();

  res.redirect("/");

});

app.get("/login", function(req, res){
  res.render("login");
});
app.post('/login', async (req, res) =>{
  const user = new User({
     username:req.body.username,
     passport:req.body.passport
  });
  req.logIn(user, function(err){
     if(err){
         console.log(err);
     }
     else{
         passport.authenticate("local")(req,res, function(){
             res.redirect("/compose");
         });
     }
  });
});


app.get("/register", function(req, res){
  res.render("register");
});


app.post('/register', async (req, res) =>{
    
  User.register({username:req.body.username}, req.body.password, function(err,user){
      if(err){
          console.log(err);
          res.redirect('/register');
      }
      else{
          passport.authenticate("local")(req,res, function(){
              res.redirect("/compose");
          });
      }
  });
  

})


app.get("/posts/:postName", async function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  
  // res.render("home", {posts:x});
  // res.render("post", {title:" x.title", content:" x.content"});
  
  const x = await Post.findOne({title: requestedTitle});
  console.log(x);
  console.log(x!=null);
    if(x!=null){
      res.render("post", {title: x.title, content: x.content});
    }
    else{
      res.redirect("/");
    }

  


    // login page


    




});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
