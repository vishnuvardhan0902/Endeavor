const exp = require('express');
const app = exp();
app.use(exp.json());
require('dotenv').config({override : true});
port = process.env.PORT || 4000;
const cors = require("cors");

// Allow requests from your frontend
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

const mc = require('mongodb').MongoClient;

mongo_uri = process.env.MONGO_URI

mc.connect(mongo_uri)
.then(client => {
    const endeavordb = client.db('Endeavor');
    const userCollection = endeavordb.collection('userCollection');
    app.set('userCollection', userCollection);
    console.log('DB connection success');
    }
)
.catch(err => `Something went wrong while making connection with mongodb : ${err}`);

const userApp = require('./api/user-api')
app.use('/user-api',userApp)
const evalApp = require('./api/evaluate-api')
app.use('/evaluate', evalApp)

app.listen(port, ()=>{console.log(`server is running on ${port}`)});
