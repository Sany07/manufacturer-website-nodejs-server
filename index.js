const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwx9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




// run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Genius Server');
});

app.get('/hero', (req, res) =>{
    res.send('Hero meets hero ku')
})

app.listen(port, () => {
    console.log('Listening to port', `http//localhost:${port}`);
})