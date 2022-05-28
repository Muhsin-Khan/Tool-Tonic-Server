const express = require("express");
const cors = require("cors");
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const { query } = require("express");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i2ey8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("tool-tonic").collection("products");
    const orderCollection = client.db("tool-tonic").collection("orders");
    const userCollection = client.db("tool-tonic").collection("users");

    // Loading all product....
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    
    // Adding New Product.....
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Finding an specific product to purchase.........
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

     // Managing All Products the product.....
     app.delete('/product/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // My Orders....
    app.get("/order", async (req, res) => {
      const customerEmail = req.query.customerEmail;
      const query = { customerEmail: customerEmail };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // Updating User's information from backend....
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      // const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res.send(result);
    });

    // Making Admin from User's ....
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      // const requester = req.email;
      // console.log("asdfdasfaaaaaadsf",requester)
      // requesterAccount = await userCollection.findOne({email: requester});

      const filter = { email: email };

      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

      // if (requesterAccount?.role === "admin") {} else {
      //   res.status(403).send({ message: "Sorry! this is restrictred" });
      // }
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });

    // Loading All user on admin's page......
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("broh is Tool Tonic.... working??....  yes it is.. ");
});

app.listen(port, () => {
  console.log("liten is working...", port);
});
