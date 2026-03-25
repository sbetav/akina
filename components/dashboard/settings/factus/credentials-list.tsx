"use client";

import EllipsisIcon from "@/components/icons/ellipsis-icon";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { CredentialListItem } from "@/lib/elysia/modules/factus";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyIcon, PlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { FC, useRef, useState } from "react";
import DeleteCredentialsDialog from "./delete-credentials-dialog";

interface CredentialsListProps {
  initialActiveId: string;
}

const CredentialsList: FC<CredentialsListProps> = ({ initialActiveId }) => {
  const queryClient = useQueryClient();

  const [selectedCredential, setSelectedCredential] =
    useState<string>(initialActiveId);
  const initializedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["factus", "credentials"],
    queryFn: async () => {
      const res = await api.factus.credentials.get();
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al obtener las credenciales",
        );

      if (!initializedRef.current) {
        setSelectedCredential(
          res.data.items.find((c) => c.isActive)?.id ?? "akina-sandbox",
        );
        initializedRef.current = true;
      }

      return res.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      await api.factus.credentials({ id }).activate.patch();
    },
    onSuccess: () => {
      toast.success("Credencial seleccionada correctamente");
      queryClient.invalidateQueries({ queryKey: ["factus", "credentials"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      // revert to the active one from cache
      const cached = queryClient.getQueryData<{ items: CredentialListItem[] }>([
        "factus",
        "credentials",
      ]);
      setSelectedCredential(
        cached?.items.find((c) => c.isActive)?.id ?? "akina-sandbox",
      );
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full flex-1" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {!data?.items?.length ? (
        <Empty fillSpace className="bg-background/30 flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyIcon />
            </EmptyMedia>
            <EmptyTitle>Sin credenciales propias</EmptyTitle>
            <EmptyDescription className="max-w-[300px]">
              Configura tus propias credenciales y emite documentos con ellas.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/dashboard/settings/factus/new-credential"
              className={buttonVariants({ size: "lg" })}
            >
              <PlusIcon />
              Nueva credencial
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex-1">
          <RadioGroup
            value={selectedCredential}
            onValueChange={(value) => {
              setSelectedCredential(value as string | "akina-sandbox");
              mutate(value as string | "akina-sandbox");
            }}
            disabled={isPending}
            className="sm:grid-cols-2"
          >
            {data?.items?.map((credential) => (
              <CredentialsItem
                key={credential.id}
                credential={credential}
                isPending={isPending}
              />
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="flex justify-center">
        <p className="text-muted-foreground text-center text-xs">
          ¿Donde obtener mis credenciales?{" "}
          <span className="text-foreground">Visita la</span>{" "}
          <Link
            href="https://www.factus.com.co/"
            target="_blank"
            className="text-primary/90 hover:text-primary transition-all hover:underline"
          >
            Página oficial de Factus
          </Link>
        </p>
      </div>
    </div>
  );
};

interface CredentialsItemProps {
  credential: CredentialListItem;
  isPending: boolean;
}

const CredentialsItem: FC<CredentialsItemProps> = ({
  credential,
  isPending,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();
  return (
    <div className="relative h-full">
      <FieldLabel
        htmlFor={credential.id}
        className={cn("h-full", {
          "animate-pulse cursor-not-allowed opacity-75 grayscale-50 transition-all":
            isPending,
        })}
      >
        <Field orientation="horizontal" className="h-full">
          <FieldContent>
            <div className="mb-0.5 flex items-center gap-2.5">
              <RadioGroupItem
                value={credential.id}
                id={credential.id}
                disabled={isPending}
              />
              <FieldTitle className="mt-0.5">{credential.name}</FieldTitle>
              {credential.id != "akina-sandbox" && (
                <Badge
                  size="sm"
                  variant={
                    credential.environment == "sandbox" ? "warning" : "info"
                  }
                >
                  {credential.environment == "sandbox"
                    ? "Sandbox"
                    : "Producción"}
                </Badge>
              )}
            </div>
            <FieldDescription>{credential.description}</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
      {credential.id != "akina-sandbox" && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-foreground/80 active:text-foreground absolute top-2.5 right-2.5 size-auto!"
              >
                <EllipsisIcon />
              </Button>
            }
          />
          <DropdownMenuContent side="left">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/settings/factus/edit-credential/${credential.id}`,
                  )
                }
              >
                <SquarePenIcon className="mt-px" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2Icon className="mt-px" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DeleteCredentialsDialog
        open={showDelete}
        onOpenChange={(open) => setShowDelete(open)}
        credential={credential}
      />
    </div>
  );
};

export default CredentialsList;
