"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import { FC } from "react";

const Page: FC = () => {
  const { logout, isPending } = useLogout();
  return (
    <Button onClick={logout} disabled={isPending}>
      Logout
    </Button>
  );
};

export default Page;
