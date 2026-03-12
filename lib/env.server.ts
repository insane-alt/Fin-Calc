import { z } from "zod"

const envSchema = z.object({
    NEWS_API: z.string(),
})

export const appEnv = envSchema.parse(process.env)