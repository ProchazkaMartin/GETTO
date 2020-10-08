const express = require("express")
const { ConnectionStates } = require("mongoose")
const router = express.Router()
const Bill = require("./../models/bill")


module.exports = router

const users = [
    {id:0, name:"Martin", account_number:"mar12746378467/4234234"},
    {id:1, name:"Jakub",account_number:"jak12746378467/4234234"},
    {id:2, name:"Dan",account_number:"dan12746378467/4234234"},
    {id:3, name:"Vojta",account_number:"voj12746378467/4234234"}
]


router.delete(`/delete_bill/:id/:bill_id`, async (req, res)=>{
    await Bill.findByIdAndRemove(req.params.bill_id)
    res.redirect(`/users/${req.params.id}`)
})

router.get(`/:id`, redirect_to_main)

async function redirect_to_main(req,res){
    let my_bills = await Bill.find({billFrom:Number(req.params.id)})
    let debt_list = []
    for(const i in users){
        if(users[i].id != req.params.id){
            let debts_to_target = await Bill.find({billFrom:Number(users[i].id),billTo:Number(req.params.id)})
            let debt_to_sum = 0
            debts_to_target.forEach(debt =>{
                debt_to_sum += debt.ammount
            })
            let debts_from_target = await Bill.find({billFrom:Number(req.params.id),billTo:Number(users[i].id)})
            let debt_from_sum = 0
            debts_from_target.forEach(debt =>{
                debt_from_sum += debt.ammount
            })

            debt_list.push({
                user:users[i],
                ammount:debt_to_sum-debt_from_sum,
                debt_to:debt_to_sum,
                debt_from:debt_from_sum
            })
        }
    }
    res.render("users/user-main",{
        current_user:users.find(usr => {return usr.id == req.params.id}), 
        debts:debt_list,
        my_bills:my_bills,
        users:users
    })
}

router.get(`/detail/:id/:target_id`, async (req,res)=>{
    let dluhoslavove = await Bill.find({billFrom:Number(req.params.target_id),billTo:Number(req.params.id)})

    res.render("users/user-detail",{
        current_user:users.find(usr => {return usr.id == req.params.id}),
        target_user:users.find(usr => {return usr.id == req.params.target_id}),

        users:users,
        debts:dluhoslavove
    })
})

router.get(`/new/:id`, async (req,res)=>{
    res.render("users/user-add-bill",{
        current_user:users[req.params.id],
        users:users
    })
})

router.post(`/:id`, async (req,res)=>{
    if(req.body.target==undefined){ console.log("target unspecified"); res.redirect(`/users/${req.params.id}`);return;}
    
    let each_share = Math.round(Math.abs(Number(req.body.total)) / req.body.target.length)
    let failed_cases = []
    let target_list = []
    if(typeof(req.body.target)==="string"){ target_list = [req.body.target]}
    else{target_list = req.body.target}

    target_list.forEach(async target_id =>{
        if(req.params.id != target_id){
            let bill = new Bill({
                billFrom:Number(req.params.id),
                billTo:Number(target_id),
                purpose:req.body.purpose.replace(/\W/g, ''),
                ammount:each_share,
                total:Number(req.body.total)
            })
            try{
                bill = await bill.save()
                console.log("saved for "+ target_id )
            }catch(e){
                failed_cases.push(target_id)
            }
        }
    })
    console.log(failed_cases)
    res.redirect(`/users/${req.params.id}`)    
})

router.get(`/pay/:user_id/:target_id`, async (req,res)=>{

    let debts_to_target = await Bill.find({billFrom:Number(req.params.target_id),billTo:Number(req.params.user_id)})
    let debt_to_sum = 0
    debts_to_target.forEach(debt =>{debt_to_sum += debt.ammount})

    let debts_from_target = await Bill.find({billFrom:Number(req.params.user_id),billTo:Number(req.params.target_id)})
    let debt_from_sum = 0
    debts_from_target.forEach(debt =>{debt_from_sum += debt.ammount})

    res.render("users/user-pay",{
        current_user:users.find(usr => {return usr.id == req.params.user_id}),
        target_user:users.find(usr => {return usr.id == req.params.target_id}),
        debt:debt_to_sum-debt_from_sum,
    })
})

router.post(`/pay-debt/:user_id/:target_id`, async (req,res)=>{
    //bills = await Bill.find({billFrom:Number(req.params.target_id),billTo:Number(req.params.user_id)})
    bills = await Bill.deleteMany({billFrom:Number(req.params.target_id),billTo:Number(req.params.user_id)})
    bills = await Bill.deleteMany({billFrom:Number(req.params.user_id),billTo:Number(req.params.target_id)})
    

    res.redirect(`/users/${req.params.user_id}`)
})

