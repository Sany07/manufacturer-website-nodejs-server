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
    console.log('authHeader',authHeader);
    if (!authHeader) {

        return res.status(401).send({ message: 'unauthorized access' });
    }
    console.log('token');

    const token = authHeader.split(' ')[1];
    console.log('token',token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqtpi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


 
async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('ss-manu').collection('products');
        const orderCollection = client.db('ss-manu').collection('orders');
        const reviewCollection = client.db('ss-manu').collection('review');
        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: process.env.JwtExpiresIn
            });
            res.send({ accessToken });
        })

        // Products API
        app.get('/products', async (req, res) => {
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
        app.put('/product/:id', async (req, res,next) => {
            const id = req.params.id;
            const quantity =req.body.quantity
            const sold =req.body.sold
         
            try{
                const resp =await productsCollection.updateOne({
                    _id: ObjectId(id)
                }, {
                    $set: {
                        quantity: quantity,
                        sold:sold
                    }
                })
                if(resp.acknowledged==true){
                    const product = await productsCollection.findOne(ObjectId(id));
                    res.status(200).send({status:201, message: 'Item Delevered',product });
                }else{
                    res.status(404).send({ message: 'Not Found' });  
                }
            }
            catch{
                res.status(404).send({ message: 'Something Went Wrong' });  
                   
                }
    
            next()
        });
        // POST
        app.post('/product', verifyJWT, async (req, res) => {
            const newProduct = req.body;
            const email =req.decoded.email
            if(!email){
                return res.status(401).send({ message: 'unauthorized access' }); 
            }
            const data = {
                sold:0,
                email:email,
                ...newProduct
            }
            
            const result = await productsCollection.insertOne(data);
            if(result.acknowledged === true){
                res.status(201).send({status:201, message: 'Item Added',result });
            }
        });

        // DELETE
        app.delete('/order/:id', async (req, res,next) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
            console.log('query',query,result);
            next()
        });

        // My Order Collection API  verifyJWT
        app.get('/myorder',verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            console.log('decodedEmail',decodedEmail);
            
            if (decodedEmail) {
                const query = { email: decodedEmail };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            if(result){

                return res.send({ success: true, result });
            }else{
                return res.send({ message: "Not Found" });
            }
        });

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            if(result){
                return res.send({ success: true, result });
            }else{
                return res.send({ message: "Error" });
            }
        });

    }
    finally {

    }
}

run().catch('s',console.dir);

app.get('/', (req, res) => {
    res.send('Running OutDoorGadget Server');
});

app.listen(port, () => {
    console.log('Listening to port', `http//localhost:${port}`);
})