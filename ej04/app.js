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

app.get("/api/menus", (req, res) => {
    app.locals.db.collection("menus").find().toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else {
            res.send({status: 200, message: "OK", results: data})
        }
    })
})

app.post("/api/nuevoMenu/", (req, res) => {
    app.locals.db.collection("menus").find({numero: parseInt(req.body.numero)}).toArray((err, data) => {
        if (err) {
            res.send({message: "Error al leer la base de datos", data: err})
        } else if(data.length > 0) {
            res.send({message: "El menú ya se encuentra en la base de datos", data})
        } else {
            app.locals.db.collection("menus").insertOne({
                numero: parseInt(req.body.numero),
                pp: req.body.pp,
                pos: req.body.pos,
                sp: req.body.sp,
                precio: parseFloat(req.body.precio)
            }, (err, data) => {
                if (err) {
                    res.send({message: "Error al grabar en la base de datos", data: err})
                } else {
                    res.send({status: 200, message: "OK", data})
                }
            })
        }
    })
})

app.put("/api/editarMenu", (req, res) => {
    app.locals.db.collection("menus").updateOne({numero: parseInt(req.body.numero)}, {$set: {
        pp: req.body.pp,
        pos: req.body.pos,
        sp: req.body.sp,
        precio: parseFloat(req.body.precio)
    }}, (err, data) => {
        if (err) {
            res.send({message: "Error al modificar la base de datos", data: err})
        } else if (data.matchedCount < 1) {
            res.send({message: "Menú no encontrado", data})
        } else if (data.modifiedCount < 1) {
            res.send({message: "No ha podido modificarse el menú", data})
        } else {
            res.send({status: 200, message: "OK", data})
        }
    })
})

app.delete("/api/borrarMenu", (req, res) => {
    app.locals.db.collection("menus").deleteOne({numero: parseInt(req.body.numero)}, (err, data) => {
        if (err) {
            res.send({message: "Error al borrar en la base de datos", data: err})
        } else if (data.deletedCount < 1) {
            res.send({message: "No se encuentra el menú", data})
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