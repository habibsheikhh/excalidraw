import { z } from "zod"

export const signUpSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string()
})


export const signInSchema = z.object({
    username: z.string(),
    password: z.string()
})
