import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import { signUpSchema, signInSchema } from "@repo/common/schema"
import { prismaClient } from "@repo/db/prisma"

const app = express(); 

app.use(express.json())

app.post('/signup', (req: any, res: any) => {
    const { username, email, password} = req.body
    const { success } = signUpSchema.safeParse({
        username,
        email,
        password
    })
    if(!success) {
        res.json({
            message: "Invalid Inputs"
        })
        return
    }
    // Do db logic here
    // Check wheater the email is unique.
    // If yes, add user to db
    // If no, responnd with some nice error message
    const userId = 1
    const token = jwt.sign({
        userId
    }, JWT_SECRET)
    res.json({
        token
    })
})


app.post('/signin', (req: any, res: any) => {
    const { username, password} = req.body
    const { success } = signInSchema.safeParse({
        username,
        password
    })
    if(!success) res.json({
        message: "Invalid Inputs"
    })
    // Check in db , if a user with this credentials exists
    // If no, send a nice error message
    // If yes, send them below token
    const userId = 1
    const token = jwt.sign({
        userId
    },JWT_SECRET)
    res.json({
        token
    })
})

app.post('/room', authMiddleware, (req: any, res: any) => {
    res.json({
        roomId: 123
    })
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});