const mongoose = require("mongoose")
const bill_schema = mongoose.Schema({
    billFrom:{type:Number, required:true},
    billTo:{type:Number, required:true},
    purpose:{type:String, required:true},
    ammount:{type:Number, required:true},
    total:{type:Number, required:true},
    createdAt:{type:Date, default:Date.now}

})

module.exports = mongoose.model("Bill",bill_schema)