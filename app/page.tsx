"use client";

import { useRouter } from "@bprogress/next";
import type { FC } from "react";
import { Button } from "@/components/ui/button";

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
