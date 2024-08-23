import {z} from "zod";

export const usernameValidation = z.string().min(3, "Username is too small").max(20, "Username is too long").regex(/^[a-zA-Z0-9_]*$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({message: "Please provide a valid email"}),
  password: z.string().min(6, {message: "Password is too small"}),
})
