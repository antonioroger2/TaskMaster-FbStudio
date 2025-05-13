
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailLock, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account exists for this email, a password reset link has been sent.");
      toast({ title: "Check your email", description: "Password reset instructions sent." });
      setEmail(""); 
    } catch (err: any) {
      console.error("Firebase password reset error: ", err);
      setError(err.message || "Failed to send reset link. Please try again.");
      toast({ title: "Error", description: err.message || "Could not send reset link.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center">
            <MailLock className="mr-2 h-8 w-8" /> Reset Password
          </CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? (
            <div className="p-4 text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
              {message}
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                 <div className="relative">
                  <MailLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full shadow-md" disabled={isLoading}>
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
           <Link href="/login" passHref>
             <Button variant="link" className="text-xs p-0 h-auto font-normal text-muted-foreground hover:text-primary flex items-center">
                <Undo2 className="mr-1 h-3.5 w-3.5" /> Back to Login
             </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
