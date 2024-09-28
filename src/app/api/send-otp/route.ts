import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const { username } = await request.json();

    // Check if the user exists
    const user = await UserModel.findOne({ username });
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found.",
        }),
        { status: 404 }
      );
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "This account is already verified.",
        }),
        { status: 400 }
      );
    }

    // Generate a new OTP if not already present
    let verifyCode = user.verifyCode;
    if (!verifyCode) {
      verifyCode = Math.random().toString(36).substring(2, 8);
      user.verifyCode = verifyCode;
      user.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1-hour expiry
      await user.save();
    }

    // Send the verification email
    const emailResponse: ApiResponse = await sendVerificationEmail(
      user.email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: emailResponse.message,
        }),
        { status: 500 }
      );
    }

    // Respond with success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification email sent successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-otp POST route:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error sending OTP.",
      }),
      { status: 500 }
    );
  }
}
