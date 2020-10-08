const express = require("express")
const mongoose = require("mongoose")
const users_router = require("./routes/users")
const method_override = require("method-override")
const app = express()

mongoose.connect("mongodb://localhost/getto",{useNewUrlParser:true,useUnifiedTopology:true})

app.set("view engine","ejs")
app.use(express.urlencoded({extended:false}))
app.use(method_override("_method"))
app.use(express.static('public'))


const users = [
    {id:0, name:"Martin"},
    {id:1, name:"Jakub"},
    {id:2, name:"Dan"},
    {id:3, name:"Vojta"}
]

app.get("/", (req, res) =>{
    res.render("index", {users: users})
})

app.use("/users",users_router)
app.listen(5000)