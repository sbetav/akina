"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="space-y-5">
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>This is a success alert.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>This is a info alert.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning alert.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>This is a destructive alert.</AlertDescription>
      </Alert>
      <Alert variant="default">
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>This is a default alert.</AlertDescription>
      </Alert>

      <Button
        variant="outline"
        onClick={() =>
          toast.success("Success", {
            description: "This is a success toast",
          })
        }
      >
        Success
      </Button>

      <Button
        onClick={() =>
          toast.info("Info", {
            description: "This is a info toast",
          })
        }
      >
        Info
      </Button>

      <Button
        onClick={() =>
          toast.warning("Warning", {
            description: "This is a warning toast",
          })
        }
      >
        Warning
      </Button>

      <Button
        onClick={() =>
          toast.error("Error", {
            description: "This is a error toast",
          })
        }
      >
        Error
      </Button>

      <Button
        onClick={() =>
          toast("Default", {
            description: "This is a default toast",
          })
        }
      >
        Default
      </Button>
    </div>
  );
};

export default Page;
