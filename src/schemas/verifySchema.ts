import {z} from "zod";

export const verifySchema = z.object({
  code: z.string().length(6, {message: "Verification code must be 6"}),
})
export const verifyUsernameSchema = z.object({
  username: z.string().min(3, "Username is too small").max(20, "Username is too long").regex(/^[a-zA-Z0-9_]*$/, "Username must not contain special characters")
})