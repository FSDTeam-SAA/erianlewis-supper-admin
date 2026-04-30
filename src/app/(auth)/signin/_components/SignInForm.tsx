/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const adminDashboardGradient =
  "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)";

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: formData?.email,
        password: formData?.password,
        redirect: false,
      });
      if (res?.error) throw new Error(res?.error);
      toast.success("Login Successfully !");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef0f4] px-4">
      {/* Card */}
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* ── Brand header ── */}
        <div
          className="px-8 pt-8 pb-7"
          style={{ background: adminDashboardGradient }}
        >
          <div className="flex items-center gap-3 mb-1">
            {/* Icon */}
            <Shield className="w-8 h-8 text-white" strokeWidth={1.8} />

            {/* Texts */}
            <div className="flex flex-col">
              <p className="text-white text-[18px] font-medium leading-[120%]">
                Sign in to continue
              </p>
              <p className="text-white text-[24px] font-semibold leading-[160%]">
                Superadmin
              </p>
            </div>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="px-8 pt-7 pb-8">
          {/* Sign In label */}
          <p className="text-[18px] font-semibold text-[#111] mb-5">Sign In</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="User name"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-[51px] border border-[#D1D5DB] rounded-lg bg-white placeholder:text-[#9CA3AF] text-[15px] focus-visible:ring-[#4F46E5] focus-visible:border-[#4F46E5]"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-[51px] border border-[#D1D5DB] rounded-lg bg-white placeholder:text-[#9CA3AF] text-[15px] pr-11 focus-visible:ring-[#4F46E5] focus-visible:border-[#4F46E5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  className="w-4 h-4 rounded border-gray-300"
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: checked === true,
                    }))
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember Me
                </Label>
              </div>
              {/* <Link
                href="/forgot-password"
                className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                Forgot Password?
              </Link> */}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[51px] mt-2 cursor-pointer rounded-lg bg-[#5C6370] hover:bg-[#4a5060] active:scale-[0.99] transition-all duration-150 text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
