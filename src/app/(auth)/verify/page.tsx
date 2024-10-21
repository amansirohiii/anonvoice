"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifyUsernameSchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const VerifyAccount = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof verifyUsernameSchema>>({
    resolver: zodResolver(verifyUsernameSchema),
  });

  const checkUserStatus = async (data: z.infer<typeof verifyUsernameSchema>) => {
    try {
      const response = await axios.get(`/api/check-user-exists`, {
        params: { username: data.username },
      });

      // Check if user is not found or already verified
      if (response.data.success === false) {
        if (response.status === 404) {
          toast({
            title: "User Not Found",
            description: "No user exists with the given username. Redirecting to sign-up...",
            variant: "destructive",
          });
          return { success: false, redirect: "/sign-up" }; // Redirect to sign-up
        } else if (response.status === 400) {
          toast({
            title: "Already Verified",
            description: "This account is already verified. Redirecting to sign-in...",
            variant: "default",
          });
          return { success: false, redirect: "/sign-in" }; // Redirect to sign-in
        }
      }

      return { success: true }; // User exists and is not verified
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.status === 404) {
        toast({
          title: "User Not Found",
          description: "No user exists with the given username. Redirecting to sign-up...",
          variant: "destructive",
        });
        return { success: false, redirect: "/sign-up" }; // Handle user not found
      } else if (axiosError.response?.status === 400) {
        toast({
          title: "Already Verified",
          description: "This account is already verified. Redirecting to sign-in...",
          variant: "default",
        });
        return { success: false, redirect: "/sign-in" }; // Handle user already verified
      } else {
        toast({
          title: "Error",
          description: axiosError.response?.data.message || "An error occurred",
          variant: "destructive",
        });
        return { success: false }; // Handle any other errors
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof verifyUsernameSchema>) => {
    try {
      // Check user status
      const userStatus = await checkUserStatus(data);

      // If userStatus is not successful, handle the redirection
      if (!userStatus.success) {
        if (userStatus.redirect) {
          router.replace(userStatus.redirect);
        }
        return; // Exit if there was an issue with user status
      }

      // Proceed to send OTP if user exists and is not verified
      const response = await axios.post(`/api/send-otp`, {
        username: data.username,
      });

      // Show success message and redirect to verify
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description: axiosError.response?.data.message || "Error verifying account",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter your username</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;
