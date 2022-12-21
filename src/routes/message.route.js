import { Router } from "express"
import { GETMESSAGES } from "../controllers/message.controller.js"
import checkToken from "../middlewares/checkToken.js"

const route = Router()

route.get("/messages" , checkToken, GETMESSAGES)


export default route