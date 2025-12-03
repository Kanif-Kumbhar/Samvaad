"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const registerSchema = z
	.object({
		username: z.string().min(3, "Username must be at least 3 characters"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const setAuth = useAuthStore((state) => state.setAuth);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterForm) => {
		setIsLoading(true);
		setError("");

		try {
			const response = await api.register(
				data.username,
				data.email,
				data.password
			);

			if (response.error) {
				setError(response.error);
				setIsLoading(false);
				return;
			}

			if (!response.user || !response.token) {
				setError("Invalid response from server");
				setIsLoading(false);
				return;
			}

			setAuth(response.user, response.token);

			setTimeout(() => {
				router.push("/");
				router.refresh();
			}, 100);
		} catch (err) {
			console.error("Register error:", err);
			setError("An error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				<Card className="shadow-2xl border-0">
					<CardHeader className="space-y-4 text-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring" }}
							className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center"
						>
							<MessageCircle className="w-8 h-8 text-white" />
						</motion.div>
						<CardTitle className="text-3xl font-bold">Create Account</CardTitle>
						<CardDescription>Join and start messaging</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							{error && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
								>
									{error}
								</motion.div>
							)}

							<div className="space-y-2">
								<label htmlFor="username" className="text-sm font-medium">
									Username
								</label>
								<Input
									id="username"
									placeholder="johndoe"
									{...register("username")}
									className="h-11"
									disabled={isLoading}
								/>
								{errors.username && (
									<p className="text-sm text-destructive">
										{errors.username.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Email
								</label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									{...register("email")}
									className="h-11"
									disabled={isLoading}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									{...register("password")}
									className="h-11"
									disabled={isLoading}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">
										{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									htmlFor="confirmPassword"
									className="text-sm font-medium"
								>
									Confirm Password
								</label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="••••••••"
									{...register("confirmPassword")}
									className="h-11"
									disabled={isLoading}
								/>
								{errors.confirmPassword && (
									<p className="text-sm text-destructive">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating account...
									</>
								) : (
									"Sign Up"
								)}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								Already have an account?{" "}
							</span>
							<Link
								href="/login"
								className="text-primary font-medium hover:underline"
							>
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}