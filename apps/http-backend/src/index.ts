import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import { signUpSchema, signInSchema } from "@repo/common/schema"
import { prismaClient } from "@repo/db/prisma"
import bcrypt from "bcrypt"

const app = express(); 

app.use(express.json())

app.post('/signup', async (req: any, res: any) => {
    const { name, username, email, password} = req.body
    const { success } = signUpSchema.safeParse({
        name,
        username,
        email,
        password
    })
    if(!success) {
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return
    }
    const userFound = await prismaClient.user.findFirst({
        where: {
            email
        }
    })
    if(userFound) {
        res.status(409).json({
            message: "Account with this email already exists"
        })
        return
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prismaClient.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
            }
        })
        const userId = user.id
        const token = jwt.sign({
            userId
        }, JWT_SECRET,
        { expiresIn: '7d' }
    );

        res.status(200).json({
            token
        })

    } catch(e) {
        console.log(e)
        res.status(500).json({
            message: "Error while Signing you up!!"
        })
    }
    // Do db logic here
    // Check wheater the email is unique.
    // If yes, add user to db
    // If no, responnd with some nice error message
    
})


app.post('/signin', async (req: any, res: any) => {
    const { username, password} = req.body
    const { success } = signInSchema.safeParse({
        username,
        password
    })
    if(!success) {
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return
    }
    const userFound = await prismaClient.user.findFirst({
        where: {
            username
        }
    })
    if(!userFound) {
        res.status(401).json({
            message: "Invalid Credentials"
        })
        return
    }
    const verify = await bcrypt.compare(password, userFound.password);
    if(!verify) {
        res.status(401).json({
            message: "Check your password!!"
        })
        return
    }

    // Check in db , if a user with this credentials exists
    // If no, send a nice error message
    // If yes, send them below token
    const userId = userFound.id
    const token = jwt.sign({
        userId
    },JWT_SECRET,
    { expiresIn: '7d' }
  );
    res.status(200).json({
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