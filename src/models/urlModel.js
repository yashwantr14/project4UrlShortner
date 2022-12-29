const mongoose=require('mongoose')

const urlSchema=new mongoose.Schema({
    urlCode:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    longUrl:String,
    shortUrl:{
        type:String,
        required:true,
        unique:true
    }
})

module.exports=new mongoose.model('urlShortner', urlSchema)