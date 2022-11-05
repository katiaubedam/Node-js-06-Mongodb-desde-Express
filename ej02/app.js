const express = require('express')
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

app.get("/api/books", (req, res) => {
    app.locals.db.collection("libros").find().toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.get("/api/books/:title", (req, res) => {
    app.locals.db.collection("libros").find({title: req.params.title}).toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.post("/api/newBook/:title", (req, res) => {
    app.locals.db.collection("libros").find({title: req.params.title}).toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else if(data.length > 0) {
            res.send({message: "El libro ya se encuentra en la base de datos", data})
        } else {
            app.locals.db.collection("libros").insertOne({title: req.params.title, read: false}, (err, data) => {
                if (err) {
                    res.send({message: "Error al grabar en la base de datos", data: err})
                } else {
                    res.send({status: 200, message: "OK", data})
                }
            })
        }
    })
})

app.put("/api/editBook/:title", (req, res) => {
    app.locals.db.collection("libros").updateOne({title: req.params.title}, {$set: {read: true}}, (err, data) => {
        if (err) {
            res.send({message: "Error al modificar la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", data})
        }
    })
})

app.delete("/api/deleteBook/:title", (req, res) => {
    app.locals.db.collection("libros").deleteOne({title: req.params.title}, (err, data) => {
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