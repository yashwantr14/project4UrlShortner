const express=require('express')
const router=express.Router()
const urlController=require('../controller/urlController')

router.post('/url/shorten',urlController.shortenUrl)
router.get('/:urlCode', urlController.getUrl)

router.all('/*', function(req,res){return res.status(404).send({Status:false, Message:"Path not found"})})


module.exports=router