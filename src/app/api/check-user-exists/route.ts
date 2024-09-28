import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    const username = queryParam.username;

    // Check if the user exists and is verified
    const existingVerifiedUser = await UserModel.findOne({ username });

    if (!existingVerifiedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    if (existingVerifiedUser.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User is already verified",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User found and not verified",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in check-username-unique GET", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error checking username",
      }),
      { status: 500 }
    );
  }
}
