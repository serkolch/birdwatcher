// Package requirements
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoUrl = 'mongodb://localhost:27017/birdDB';
var geocoder = require('geocoder');
var Promise = require('promise');

// Set up app() usage
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
app.use(methodOverride('_method'));

// Connect and define database
var db;
MongoClient.connect(mongoUrl, function(err, database) {
  if (err) {
    console.log(err);
  }
  console.log("Connected correctly to server");
  db = database;

  process.on('exit', db.close);
});

// Begin Routes

app.get('/',function(req,res){
  geocoder.geocode("1600 Amphitheatre Parkway, Mountain View, CA 94043",function(err,data){
    console.log(data.results[0].geometry.location)
  })  
  res.render('landing');
})

app.get('/sightings/new',function(req,res){
  res.render('sighting_new');
})

app.post('/sightings',function(req,res){
  var sighting
  geocoder.geocode(req.body.location,function(err,data){
    sighting = {name: req.body.name, location: data.results[0].geometry.location, date: req.body.date}
    db.collection('sightings').insert(sighting)
    db.collection('sightings').findOne(sighting,function(err, result){
        res.redirect('/sightings/'+result._id)
    })
  })
  // var sighting = {name: req.body.name, location: latLong, date: req.body.date}
})

app.get('/sightings/:id', function(req,res){
  db.collection('sightings').findOne({_id: ObjectId(req.params.id)},function(err, result){
      if (err){
        res.redirect('/')
      } else {
        geocoder.reverseGeocode(result.location.lat,result.location.lng,function(err,data){
          result.location = data.results[0].formatted_address
          res.render('sighting_show', {sighting: result})
        })
      }      
  })
})

app.get('/sightings',function(req,res){
  db.collection('sightings').find().sort({date:-1}).limit(3).toArray(function(err,results){
    console.log(results);
    res.render('sighting_index',{sightings: results})
  })
})

app.get('/api/sightings',function(req, res){
  db.collection('sightings').find().toArray(function(err,results){
    res.json(results)
  })
})

app.get('/demo',function(req,res){
  res.render('demo')
})

app.get('/demo/birds',function(req,res){
  function callback(indexOfArray, results) {

  }
  db.collection('sightings').find().toArray(function(err,results){
    results.forEach(function(result,index){
      Promise.denodeify(geocoder.reverseGeocode)(result.location.lat,result.location.lng,function(err,data){
        result.location = data.results[0].formatted_address;
        console.log(index, result);
        if (index === results.length-1){
          console.log(results)
          res.json(results)
        }
      })
    })
  })
})

// End Routes

app.listen(process.env.PORT || 3000);