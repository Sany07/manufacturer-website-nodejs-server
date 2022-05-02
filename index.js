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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@wire-h-web.iyul3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


 
async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('wh-db').collection('products');
        // const orderCollection = client.db('geniusCar').collection('order');

        // AUTH
        // app.post('/login', async (req, res) => {
        //     const user = req.body;
        //     const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
        //         expiresIn: process.env.JwtExpiresIn
        //     });
        //     res.send({ accessToken });
        // })

        // Products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find();
            const products = await cursor.toArray();
            res.send(products);
        });

        // GET
        app.get('/product/:id', async (req, res,next) => {
            const id = req.params.id;
            try{
            const query = { _id: ObjectId(id) };
            if(query){
                const product = await productsCollection.findOne(query);
                res.send(product);
            }}catch{
                res.status(404).send({ message: 'Not Found' });  
            }

       

            next()
        });

        // POST
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        // DELETE
        app.delete('/product/:id', async (req, res,next) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
            console.log(query);
            next()
        });

        // // Order Collection API

        // app.get('/order', verifyJWT, async (req, res) => {
        //     const decodedEmail = req.decoded.email;
        //     const email = req.query.email;
        //     if (email === decodedEmail) {
        //         const query = { email: email };
        //         const cursor = orderCollection.find(query);
        //         const orders = await cursor.toArray();
        //         res.send(orders);
        //     }
        //     else{
        //         res.status(403).send({message: 'forbidden access'})
        //     }
        // })

        // app.post('/order', async (req, res) => {
        //     const order = req.body;
        //     const result = await orderCollection.insertOne(order);
        //     res.send(result);
        // })

    }
    finally {

    }
}

run().catch('s',console.dir);

app.get('/', (req, res) => {
    res.send('Running Genius Server');
});

app.get('/hi', (req, res) =>{
    res.send('Hero meets hero ku')
})

app.listen(port, () => {
    console.log('Listening to port', `http//localhost:${port}`);
})