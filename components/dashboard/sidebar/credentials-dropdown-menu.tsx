"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredentialActivation } from "@/hooks/use-credential-activation";
import { ArrowRightIcon, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

interface CredentialsDropdownMenuProps {
  onNavigate: () => void;
}

type CredentialBadgeMeta = {
  variant: "destructive" | "warning" | "info";
  label: "Inválida" | "Sandbox" | "Producción";
};

function getCredentialBadgeMeta({
  isValid,
  environment,
}: {
  isValid: boolean;
  environment?: string;
}): CredentialBadgeMeta {
  if (!isValid) return { variant: "destructive", label: "Inválida" };
  if (environment === "sandbox")
    return { variant: "warning", label: "Sandbox" };
  return { variant: "info", label: "Producción" };
}

const CredentialsDropdownMenu: FC<CredentialsDropdownMenuProps> = ({
  onNavigate,
}) => {
  const {
    items,
    activeItem,
    selectedCredential,
    activate,
    isPending,
    isLoading,
  } = useCredentialActivation();

  const [open, onOpenChange] = useState(false);
  const activeBadge = getCredentialBadgeMeta({
    isValid: activeItem?.isValid ?? true,
    environment: activeItem?.environment,
  });

  if (isLoading) return <Skeleton className="h-[58px] w-full" />;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            disabled={isPending}
            className="group data-popup-open:bg-accent hover:bg-accent focus-effect relative flex cursor-pointer items-center justify-between gap-3 border px-3 py-2.5 pl-4 transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="space-y-0.5 text-left text-xs">
              <div className="flex items-center gap-2">
                <p>{activeItem?.name}</p>

                <Badge size="sm" variant={activeBadge.variant}>
                  {activeBadge.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {activeItem?.id === "akina-sandbox"
                  ? "Entorno por defecto"
                  : activeItem?.username}
              </p>
            </div>
            <ChevronsUpDown className="text-muted-foreground size-3.5" />
          </button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={selectedCredential}
            onValueChange={(value) => {
              activate(value);
              onOpenChange(false);
            }}
          >
            {items.map((item) => {
              const badge = getCredentialBadgeMeta(item);
              return (
                <DropdownMenuRadioItem
                  key={item.id}
                  value={item.id}
                  disabled={isPending || !item.isValid}
                >
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      <Badge size="sm" variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {item.id === "akina-sandbox"
                        ? "Entorno por defecto"
                        : item.username}
                    </p>
                  </div>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                href="/dashboard/settings/factus"
                className="text-muted-foreground! flex w-full items-center justify-between"
                onClick={onNavigate}
              >
                Gestionar credenciales
                <ArrowRightIcon className="text-muted-foreground! size-3.5" />
              </Link>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CredentialsDropdownMenu;
