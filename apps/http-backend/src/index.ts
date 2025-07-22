import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import { signUpSchema, signInSchema, createRoomSchema } from "@repo/common/schema"
import { prismaClient } from "@repo/db/prisma"
import bcrypt from "bcrypt"
import cors from "cors"
const app = express(); 

app.use(cors({
    origin: "http://localhost:3000"
}));

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

// Create a New Room
app.post('/room', authMiddleware, async (req: any, res: any) => {
    const { success } = createRoomSchema.safeParse(req.body)
    if(!success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return
    }
    const userId = req.userId

    const room = await prismaClient.room.create({
        data: {
            slug: req.body.slug,
            adminId: userId
        }
    })

    res.json({
        roomId: room.id
    })
})

// Get upto recent 50 message of a Room
app.get('/chats/:roomId', async (req, res) => {
    try {
        const roomId = Number(req.params.roomId)
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        })
        res.json({
            messages
        })
    } catch (e) {
        console.log(e)
    }
})

// Given slug => returns roomd
app.get('/room/:slug', async (req, res) => {
    try {
        const slug = req.params.slug
        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        })
        res.json({
            room
        })
    } catch(e) {
        console.log(e)
    }
})

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
