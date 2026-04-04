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
import { useActiveCredentials } from "@/hooks/use-active-credentials";
import { AKINA_SANDBOX_ID } from "@/lib/constants";
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
  const { active, isLoading, isActivating, activate, credentials } =
    useActiveCredentials();

  const [open, onOpenChange] = useState(false);
  const activeBadge = getCredentialBadgeMeta({
    isValid: active?.isValid ?? true,
    environment: active?.environment,
  });

  if (isLoading) return <Skeleton className="h-[58px] w-full" />;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            disabled={isActivating}
            className="group data-popup-open:bg-accent hover:bg-accent focus-effect relative flex cursor-pointer items-center justify-between gap-3 border px-3 py-2.5 pl-4 transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="space-y-0.5 text-left text-xs">
              <div className="flex items-center gap-2">
                <p>{active?.name}</p>

                <Badge size="sm" variant={activeBadge.variant}>
                  {activeBadge.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {active?.id === AKINA_SANDBOX_ID
                  ? "Entorno por defecto"
                  : active?.username}
              </p>
            </div>
            <ChevronsUpDown className="text-muted-foreground size-3.5" />
          </button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={active?.id}
            onValueChange={(value) => {
              activate(value);
              onOpenChange(false);
            }}
          >
            {credentials.map((c) => {
              const badge = getCredentialBadgeMeta(c);
              return (
                <DropdownMenuRadioItem
                  key={c.id}
                  value={c.id}
                  disabled={isActivating || !c.isValid}
                >
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      <Badge size="sm" variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {c.id === AKINA_SANDBOX_ID
                        ? "Entorno por defecto"
                        : c.username}
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
