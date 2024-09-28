// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/VerificationEmail";
// import { ApiResponse } from '@/types/ApiResponse';

// export async function sendVerificationEmail(
//   email: string,
//   username: string,
//   verifyCode: string
// ): Promise<ApiResponse> {
//   try {
//     const {data, error} = await resend.emails.send({
//       from: 'admin@anonvoice.tech',
//       to: email,
//       subject: 'Mystery Message Verification Code',
//       react: VerificationEmail({ username, otp: verifyCode }),
//     });
//     if(error){
//       console.error('Error sending verification email:', error);
//       return { success: false, message: 'Failed to send verification email.' };
//     }
//     console.log('Email sent:', data);
//     return { success: true, message: 'Verification email sent successfully.' };
//   } catch (emailError) {
//     console.error('Error sending verification email:', emailError);
//     return { success: false, message: 'Failed to send verification email.' };
//   }
// }
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ApiResponse } from "@/types/ApiResponse";
import sgMail from "@sendgrid/mail";
export async function sendVerificationEmail(
    username: string,
    email?: string,
    verifyCode?: string
): Promise<ApiResponse> {

    try {
        console.log(email, verifyCode);
      sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
      if(!email || !verifyCode){
        await dbConnect();
        const user = await UserModel.findOne({ username });
        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }
        email = user.email;
        verifyCode = user.verifyCode;
      }


        const result = await sgMail.send({
            to: email || "amansirohi077@gmail.com",
            from: "admin@anonvoice.tech",
            subject: "AnonVoice Verification Code",
            text: `hi`,
            html: `Hey ${username}, your code is<strong> ${verifyCode || "abcdef"}</strong>`,
        });

        console.log("Email sent:", result);
        return {
            success: true,
            message: "Verification email sent successfully.",
        };
    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            success: false,
            message: "Failed to send verification email.",
        };
    }
}
