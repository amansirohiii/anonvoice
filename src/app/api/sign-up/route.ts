import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists.",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.random().toString(36).substring(2, 8);
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
              return Response.json({
                success: false,
                message: "User with this email already exists.",
            }, {status: 500})
            }
            else{
              const hashedPassword = await bcrypt.hash(password, 10);
              existingUserByEmail.password = hashedPassword;
              existingUserByEmail.verifyCode = verifyCode;
              const expiryDate = new Date(Date.now()+3600000);
              await existingUserByEmail.save();

            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                messages: [],
                isAcceptingMessages: true,
            });
            await newUser.save();

            // send emails
            const emailResponse = await sendVerificationEmail(
                email,
                username,
                verifyCode
            );
            if (!emailResponse.success) {
                return Response.json({
                    success: false,
                    message: emailResponse.message,
                }, {status: 500})}}

                return Response.json({
                  success: true,
                  message: "User Registered Successfully.",
              }, {status: 201})
    } catch (error) {
        console.error("Error signing up:", error);
        return Response.json(
            { success: false, message: "Failed to sign up." },
            {
                status: 500,
            }
        );
    }
}
