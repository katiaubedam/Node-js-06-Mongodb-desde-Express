const express = require('express')
const app = express()
let port = process.env.port || 3000

const MongoClient = require("mongodb").MongoClient

app.use(express.urlencoded({extended: false}))
app.use(express.json())

MongoClient.connect("mongodb://127.0.0.1:27017", {useNewUrlParser: true, useUnifiedTopology: true})
.then(client => {
    console.log("MongoDB se ha conectado")
    app.locals.db = client.db("clase")
})
.catch(err => {
    console.error(`MongoDB no responde. Error: ${err}`)
})

app.get("/api/mesas", (req, res) => {
    app.locals.db.collection("mesas").find().toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.post("/api/add", (req, res) => {
    app.locals.db.collection("mesas").insertOne(req.body, (err, data) => {
        if (err) {
            res.send({message: "Error al grabar en la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", data})
        }
    })
})

app.put("/api/modify/:color", (req, res) => {
    app.locals.db.collection("mesas").updateMany({color: req.params.color}, {$set: {color: "maroon"}}, (err, data) => {
        if (err) {
            res.send({message: "Error al modificar la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", data})
        }
    })
})

app.delete("/api/delete/:legs", (req, res) => {
    app.locals.db.collection("mesas").deleteMany({legs: parseInt(req.params.legs)}, (err, data) => {
        if (err) {
            res.send({message: "Error al borrar en la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", data})
        }
    })
})

app.listen(port, err =>
    err 
    ? console.error("No se ha podido conectar")
    : console.log("Escuchando en puerto " + port)
)