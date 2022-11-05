const express = require('express')
const { FindCursor } = require('mongodb')
const app = express()
let port = process.env.port || 3000

const MongoClient = require("mongodb").MongoClient

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static("public"))

MongoClient.connect("mongodb://127.0.0.1:27017", {useNewUrlParser: true, useUnifiedTopology: true})
.then(client => {
    console.log("MongoDB se ha conectado")
    app.locals.db = client.db("clase")
})
.catch(err => {
    console.error(`MongoDB no responde. Error: ${err}`)
})

app.get("/api/series", (req, res) => {
    app.locals.db.collection("series").find().toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.get("/api/serie", (req, res) => {
    app.locals.db.collection("series").find({title: req.query.title}).toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else if (data.length < 1){
            res.send({message: `La serie ${req.query.title} no existe en la base de datos`, data})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.post("/api/nuevaSerie", (req, res) => {
    app.locals.db.collection("series").find({title: req.body.title}).toArray((err,data) =>{
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else if (data.length > 0){
            res.send({message: `La serie ${req.body.title} ya existe en la base de datos`, data})
        } else {
            app.locals.db.collection("series").insertOne({title: req.body.title, platform: req.body.platform, rating: parseInt(req.body.rating)}, (err, data) => {
                if (err) {
                    res.send({message: "Error al escribir en la base de datos", data: err})
                } else {
                    res.send({status: 200, message: "OK", data})
                }
            })
        }
    })
})

app.listen(port, err =>
    err 
    ? console.error("No se ha podido conectar")
    : console.log("Escuchando en puerto " + port)
)