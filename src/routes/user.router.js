import { Router } from "express"
import { GETMYUSER, GETUSERS, LOGIN, REGISTER } from "../controllers/user.controller.js"
import checkToken from "../middlewares/checkToken.js"

const userRouter = Router()

export function GETPAGES(app) {
    app.get("/", (req, res) => {
        try {
            res.render("index")
        } catch (error) {
            res.status(400).send("bad request")
        }
    })

    app.get("/login", (req, res) => {
        try {
            res.render("login")
        } catch (error) {
            res.status(400).send("bad request")
        }
    })

    app.get("/register", (req, res) => {
        try {
            res.render("register")
        } catch (error) {
            res.status(400).send("bad request")
        }
    })

}


userRouter.post("/register", REGISTER)
userRouter.post("/login", LOGIN)
userRouter.get("/users", GETUSERS)
userRouter.get("/users/:token", GETMYUSER)

export default userRouter