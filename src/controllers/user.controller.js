import crypto from "crypto"
import moment from "moment"
import { write, read } from "../utils/model.js"
import path from "path"
import jwt from "../utils/jwt.js"
moment.locale("uz-latn")


export let REGISTER = (req, res) => {
    try {
        let { username, password } = req.body
        let { avatar } = req.files

        if (!(username && password && avatar)) {
            throw Error("bad request")
        }

        let users = read("users")

        if (users.find(user => user.username == username)) {
            throw Error("username exist")
        }

        let fileName = Date.now() + avatar.name

        let newUser = {
            "username": username,
            "password": crypto.createHash("sha256").update(password).digest("hex"),
            "avatar": fileName,
            "userId": users.at(-1)?.userId + 1 || 1,
            "created_at": moment(Date.now()).format("LLL"),
            "socketId": null
        }

        users.push(newUser)

        write("users", users)
        avatar.mv(path.resolve("uploads", fileName))

        delete newUser.password

        let token = jwt.sign({ userId: newUser.userId })

        res.status(201).send({ status: 201, message: "new user created", data: newUser, token: token })
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message })
    }
}

export let LOGIN = (req, res) => {
    try {
        let { username, password } = req.body

        if (!(username && password)) {
            throw Error("bad request")
        }

        let users = read("users")

        if (users.find(user => user.username == username && user.password == crypto.createHash("sha256").update(password).digest("hex"))) {
            let findedUser = users.find(user => user.username == username && user.password == crypto.createHash("sha256").update(password).digest("hex"))

            delete findedUser.password

            return res.status(200).send({ status: 200, message: "Good", data: findedUser, token: jwt.sign({ userId: findedUser.userId }) })
        }

        res.status(404).send({ status: 404, message: "user not found" })
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message })
    }
}


export let GETUSERS = (req , res)=> {
    try {
        let users = read("users")
        users.map(user=> delete user.password)
        res.status(200).json({status:200 , data: users})
    } catch (error) {
        res.status(400).json({status:400 , message:error.message})
    }
}


export let GETMYUSER = (req , res)=> {
    try {
        let users = read("users")
        let { userId } = jwt.verify(req.params.token) 
        let myUser = users.find(user => user.userId == userId)
        delete myUser.password

        res.status(200).json({status:200 , message:"Good", data: myUser})
    } catch (error) {
        res.status(400).json({status:400 , message:error.message})
    }
}
