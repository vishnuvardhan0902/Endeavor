const exp = require('express');
const app = exp();
app.use(exp.json());
require('dotenv').config({override : true});
const port = process.env.PORT || 4000;
const cors = require("cors");

// Allow requests from any origin. Using `origin: true` causes the CORS
// middleware to reflect the request origin, which works even when
// `credentials: true` is required (wildcard '*' cannot be used with credentials).
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
// Ensure preflight requests are handled for all routes
app.options('*', cors({ origin: true, credentials: true }));

const mc = require('mongodb').MongoClient;

const mongo_uri = process.env.MONGO_URI

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
