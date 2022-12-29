const urlModel=require('../models/urlModel')
const shortId=require('shortid')
const redis = require('redis')
const isValidUrl=require('url-validation')

const { promisify } = require("util");

const redisClient = redis.createClient(
  15440,
  "redis-15440.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("W8o9uSS8lhB9xUSCaER21ZsuPyrrCJ0l", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const shortenUrl=async function(req,res){
    try{
                                  //body validations
    if(Object.keys(req.body)==0){return res.status(400).send({Status:false, Message:"Body is empty!"})}
    if(!req.body.longUrl || req.body.longUrl.length==0){
        return res.status(400).send({Status:false, Message:"longUrl field is mandatory"})
    }
    
    let dataFromCache1= await GET_ASYNC(`${req.body.longUrl}`)
   
    if(dataFromCache1){
        let fetchedUrl=JSON.parse(dataFromCache1)
        return res.status(200).send({Message:"This doc has already been created", data:fetchedUrl})
    }
    let longUrl=req.body.longUrl.trim()
    let urlFound=await urlModel.findOne({longUrl}).select({_id:0, __v:0})
    if(urlFound){return res.status(200).send({Status:true, Data:urlFound})}

    if(!isValidUrl(longUrl)){
        return res.status(400).send({Status:false, Message:"Invalid longUrl!"})
    }else{
        let urlCode=shortId.generate().toLowerCase()
        let short2=`${req.protocol}://${req.headers.host}/` + urlCode
        let data={}
        data.longUrl=longUrl
        data.shortUrl=short2 
        data.urlCode=urlCode
        await urlModel.create(data)
        await SET_ASYNC(`${req.body.longUrl}`,6000, JSON.stringify(data))
        return res.status(201).send({Status:true, data:data})
    }
}
catch(error){
    return res.status(500).send({Status:false, Message:error.message})
}}


const getUrl=async function(req,res){
    try{
        urlCode=req.params.urlCode
        let dataFromCache2= await GET_ASYNC(`${req.params.urlCode}`)
        if(dataFromCache2){
            let fetchedUrl2=JSON.parse(dataFromCache2)
            return res.status(302).redirect(fetchedUrl2)
        }
        else{
            let urlFound=await urlModel.findOne({urlCode:urlCode})
            if(!urlFound){
                return res.status(404).send({Status:false, Message:"url not found"})
            }
            await SET_ASYNC(`${req.params.urlCode}`,6000,JSON.stringify(urlFound))
            return res.status(302).redirect(urlFound.longUrl)
        }
    }catch(error){
        return res.status(500).send({Status:false, Message:error.message})
    }
}



module.exports={shortenUrl,getUrl}