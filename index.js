require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb')
//const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const client = new MongoClient(process.env.MONGO_URI)
const dns = require('dns')
const urlparser = require('url')
const db = client.db("fcc1")
const urls = db.collection("urls")



// mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

// let urlSchema = new mongoose.Schema({
//   original:{type:String, required:true},
//   short: Number
// })

// let Url = mongoose.model('Url', urlSchema)
// let responseObject = {}
// app.post("/api/shorturl", bodyParser.urlencoded({extended:false}), (request, response) => {
//   let inputUrl = request.body['url']
//   responseObject['original_url'] = inputUrl

//   let inputShort = 1;

//   Url.findOne({})
//       .sort({short:'desc'})
//       .exec((error, result) => {
//         if(!error && result != undefined){
//           inputShort = result.short + 1
//         }
//         if(!error){
//           Url.findOneAndUpdate(
//             {original: inputUrl},
//             {original: inputUrl, short: inputShort},
//             {new: true, upsert: true},
//             (error, savedUrl) => {
//               if(!error){
//                 responseObject['short_url'] = savedUrl.short
//                 response.json(responseObject)
//               }
//             }
//           )
//         }
//       })
// })


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,
async(err, address) => {
  if(!address){
    res.json({error:"Invalid URL"})
  }else {

    const urlCount = await urls.countDocuments({})
    const urlDoc = {
      url,
      short_url: urlCount
    }

    const result = await urls.insertOne(urlDoc)
    console.log(result);
    res.json({ original_url: url, short_url: urlCount })
  }
})
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({short_url: +shorturl})
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
