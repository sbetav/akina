import { redirect } from "next/navigation";
import type { FC } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

interface PageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

const Page: FC<PageProps> = async ({ searchParams }) => {
  const { token, error } = await searchParams;

  if (!token || error === "INVALID_TOKEN") {
    redirect("/invalid-url");
  }

  return <ResetPasswordForm token={token} />;
};

export default Page;
