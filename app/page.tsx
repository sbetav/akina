"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@bprogress/next";
import { FC } from "react";

const Page: FC = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Button size="lg" onClick={() => router.push("/login")}>
        Click me
      </Button>
    </div>
  );
};

export default Page;
