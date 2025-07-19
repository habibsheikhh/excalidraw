// types/express/index.d.ts

declare global {
  namespace Express {
    interface Request {
      userId: String // or `any` if you're not using a specific type
    }
  }
}
