const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//---------------------------------------------------------------------

let mongoose = require('mongoose');

const mongoURI = process.env['MONGO_URI']; //fcc4
console.log(mongoURI);

mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,       
      //reconnectTries : Number.MAX_VALUE,
      //autoReconnect : true 
      }, 
      function(err, dbref) {
        if (!err) {
          console.log("**** Mongodb connected! *****");
          db = dbref;
        }else{
          console.log("@@@@ Error while connecting to mongoDB :: " + err);
        }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, '@@@@ MongoDB connection error:'));

//BEGIN @@@ Schema-Model---------------------------
let exerciseSchema = new mongoose.Schema({
  username:     String,
  description:  String,
  duration:     Number,
  date:         String
});

let Exercise = new mongoose.model('Exercise', exerciseSchema);

//--
let userSchema = new mongoose.Schema({
  username:     String,
});

let User = new mongoose.model('User', userSchema);

//--
/*
let logSchema = new mongoose.Schema({
  username:     String,
  count:        Number,
  log:          [{
                description:    String,
                duration:       Number,
                date:           Date
                }]
});

let Log = new mongoose.model('Log', logSchema);
*/
//END @@@ Schema-Model---------------------------

//Routes
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Users
app.post('/api/users', function(req, res) {
  let un = req.body.username;
  console.log('@ POST /api/users:: username='+un);

  let usr = new User({
    "username": un
  });

  console.log(usr);
  usr.save(function(err, data) {
    console.log("save Data : "+data);
    if (err) return console.error(err);
    //done(null , data);
    return res.send(data);
  });
});

app.get('/api/users', function(req, res){
  User.find({}, function (err, found) {
    if (err) return console.log(err);
    return res.send(found);
  });
});

app.get('/api/users/:_id', function(req, res){
  let id  = req.params._id; //route parameter for user
  
  User.find({"_id": id}, function (err, found) {
    if (err) return console.log(err);
    return res.send(found);
  });
});

//Exercises
app.post('/api/users/:_id/exercises', function(req, res) {
  let des = req.body.description;
  let dur = req.body.duration;
  let dt  = req.body.date; //optional
  let id  = req.params._id; //route parameter for user
  let un; //username

  if (dt==undefined || dt=='') dt=(new Date).toDateString();

  //resolving username from _id
    User.findOne( {"_id": id}, function (err, found) {
      console.log('--username: found='+found);
      if (err) {return console.log(err);}
      
        un = found["username"];

        console.log(' ');
        console.log('@ POST /api/users/:_id/exercises:: description='+des+", duration="+dur+", _id="+id+", username="+un+", (date)="+dt);
      
        if (un == undefined) {
          console.log('!! Usename NOT Found from _id='+id);
        //console.log(req);
        } else {
      
            let exe = new Exercise({
                username:     un,
                description:  des,
                duration:     Number(dur),
                date:         dt
            });
          
            console.log(exe);
            exe.save(function(err, data) {
              console.log("save Data : "+data);
              if (err) return console.error(err);
              //done(null , data);
              data._id = id;
              return res.send(data);
            });

        }
      
      return found;
    });
});

//Logs
app.get('/api/users/:_id/logs', function(req, res){
  let id  = req.params._id; //route parameter for user
  let rs  = {};

  console.log(' ');
  console.log('@GET /api/users/:_id/logs ~ _id='+id);
  
  User.find({"_id": id}, function (err, found) {
    if (err) {
      return console.log(err);
    } else {

      //console.log(found);
      rs = {
        "username" : found[0]["username"], 
        "_id": id 
      };
      console.log(rs);
      
      Exercise.find(
        {"username" : found[0]["username"]}, 
        {description:1, duration:1, date:1, _id:0},
        function(err, f) {
            if (err) return console.log(err);
            
            rs["count"] = f.length;
            rs["log"] = f;
    
            console.log(rs);
            return res.send(rs);
      });
      
    }
  });
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
