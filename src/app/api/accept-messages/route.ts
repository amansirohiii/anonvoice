import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if(!session || !user){
    return Response.json(
      {
        success: false,
        message: "Unauthorized user",
      },
      {status: 401}
    )
  }

  const userId = user._id;
  const {acceptMessages} = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages}, {new: true});

    if(!updatedUser){
      return Response.json(
        {
          success: false,
          message: "Updated User not found",
        },
        {status: 404}
      )
    }
    return Response.json(
      {
        success: true,
        message: `User is ${acceptMessages ? "accepting" : "not accepting"} messages`,
        updatedUser,
      },
      {status: 200}
    )
  } catch (error) {
    console.error("Error in accept-messages POST", error);
    return Response.json(
      {
        success: false,
        message: "Error accepting messages",
      },
      {status: 500}
    )
  }


}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if(!session || !user){
    return Response.json(
      {
        success: false,
        message: "Unauthorized user",
      },
      {status: 401}
    )
  }

  const userId = user._id;
try {
  const foundUser = await UserModel.findById(userId);
  if(!foundUser){
    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      {status: 404}
    )
  }
  return Response.json(
    {
      success: true,
      message: `User is ${foundUser.isAcceptingMessages ? "accepting" : "not accepting"} messages`,
      isAcceptingMessages: foundUser.isAcceptingMessages,
    },
    {status: 200}
  )

} catch (error) {
  console.error("Error in accept-messages GET", error);
  return Response.json(
    {
      success: false,
      message: "Error getting user",
    },
    {status: 500}
  )
}
}