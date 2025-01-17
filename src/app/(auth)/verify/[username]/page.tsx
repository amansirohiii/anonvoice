"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
   const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timer, setTimer] = useState(30);
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  // Check if user exists and is verified
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await axios.get(`/api/check-user-exists`, {
          params: { username: params.username },
        });
        console.log(response.data)
        if (response.data.success === false) {
          if (response.status === 404) {
            toast({
              title: "User Not Found",
              description: "No user exists with the given username. Redirecting to sign-up...",
              variant: "destructive",
            });
            router.replace("/sign-up");
          } else if (response.status === 400) {
            toast({
              title: "Already Verified",
              description: "This account is already verified. Redirecting to sign-in...",
              variant: "default",
            });
            router.replace("/sign-in");
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        if (axiosError.status === 404) {
          toast({
            title: "User Not Found",
            description: "No user exists with the given username. Redirecting to sign-up...",
            variant: "destructive",
          });
          router.replace("/sign-up");
        }
         else if (axiosError.status === 400) {
          toast({
            title: "Already Verified",
            description: "This account is already verified. Redirecting to sign-in...",
            variant: "default",
          });
          router.replace("/sign-in");
        }
        else {
          toast({
          title: "Error",
          description: axiosError.response?.data.message || "An error occurred",
          variant: "destructive",
        });
      }
      }
    };

    checkUserStatus();
  }, [params.username, router, toast]);

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-account`, {
        username: params.username,
        code: data.code,
      });
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description: axiosError.response?.data.message || "Error verifying account",
        variant: "destructive",
      });
    }
  };



  // Handle OTP resend logic
  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`/api/send-otp`, {
        username: params.username,
      });
      toast({
        title: "OTP Resent",
        description: response.data.message,
      });

      setIsResendDisabled(true); // Disable button for 1 minute
      setTimer(30); // Reset timer to 60 seconds

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error Resending OTP",
        description: axiosError.response?.data.message || "Could not resend OTP",
        variant: "destructive",
      });
    }
  };

  // Timer effect to enable button after 1 minute
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isResendDisabled && timer > 0) {
      countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }

    return () => clearTimeout(countdown); // Clear the timeout on unmount
  }, [isResendDisabled, timer]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <Button
            onClick={handleResendOTP}
            disabled={isResendDisabled}>
              Resend OTP {isResendDisabled && `(${timer}s)`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
