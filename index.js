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
  date:         Date
});

let Exercise = new mongoose.model('Exercise', exerciseSchema);

//--
let userSchema = new mongoose.Schema({
  username:     String,
});

let User = new mongoose.model('User', userSchema);

//--
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
//END @@@ Schema-Model---------------------------

//Routes
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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




//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
