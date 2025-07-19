import { z } from "zod"

export const signUpSchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.email(),
    password: z.string()
})


export const signInSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const createRoomSchema = z.object({
    slug: z.string().min(3).max(20)
})