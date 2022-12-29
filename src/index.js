const express=require('express')
const mongoose=require('mongoose')
const route=require('./routes/route.js')
const app=express()

app.use(express.json())
mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://yashwantr_14:Yashu_1410@cluster0.uic9809.mongodb.net/Group21Database', {useNewUrlParser:true})
.then(()=>{
    console.log('MongoDB is connected')
})
.catch((error)=>{
    console.log({error:error.message})
})

app.use('/',route)

app.listen(3000,()=>{
    console.log('Express port is running on '+ 3000)
})