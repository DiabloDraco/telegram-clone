import crypto from "crypto"
import moment from "moment"
import { write, read } from "../utils/model.js"
import path from "path"
import jwt from "../utils/jwt.js"




export let GETMESSAGES = (req, res)=> {
    try {
        let messages = read("messages")
        let users = read('users').filter(user => delete user.password)

        const { userId } = req.query
    
        messages = messages.filter(message => 
          (message.to == userId && message.from == req.userId) ||
            (message.to == req.userId && message.from == userId)
        )
    
        messages = messages.map(message => {
          message.to = users.find(user => user.userId == message.to)
          message.from = users.find((user) => user.userId == message.from);
          return message
        })


        res.status(200).json({ status: 200, message: "ok", data: messages });
    } catch (error) {
        res.status(400).json({status:400 , message:error.message})
    }
}


export let POSTMESSAGE = (req , res)=> {
  
}