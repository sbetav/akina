"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "better-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  LaptopIcon,
  LogOutIcon,
  MonitorIcon,
  SmartphoneIcon,
} from "lucide-react";
import { type FC, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/client";
import { SESSIONS_QUERY_KEY } from "@/lib/query-keys";
import { fetchLocation, parseUserAgent } from "@/lib/utils";

// ─── SessionsList ────────────────────────────────────────────────────────────

const SessionsList: FC = () => {
  const queryClient = useQueryClient();

  const { data: sessions = [], isPending } = useQuery({
    queryKey: [...SESSIONS_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw new Error(error.message ?? "Error al cargar sesiones");
      return data ?? [];
    },
  });

  const { data: currentSession } = authClient.useSession();
  const currentToken = currentSession?.session?.token;

  const { mutate: revokeOthers, isPending: isRevokingOthers } = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error)
        throw new Error(error.message ?? "Error al cerrar las sesiones");
    },
    onSuccess: () => {
      toast.success("Otras sesiones cerradas correctamente");
      queryClient.invalidateQueries({ queryKey: [...SESSIONS_QUERY_KEY] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const otherSessions = sessions.filter((s) => s.token !== currentToken);

  return (
    <FieldSet>
      <FieldLegend>Sesiones activas</FieldLegend>
      <div className="mt-2 flex flex-col gap-4">
        {isPending
          ? Array.from({ length: 2 }).map((_, i) => (
              <Fragment key={i}>
                <Skeleton className="h-[38px] w-full" />
                {i < 1 && <Separator />}
              </Fragment>
            ))
          : sessions.map((session, i) => (
              <Fragment key={session.id}>
                <SessionItem
                  session={session}
                  isCurrentSession={session.token === currentToken}
                />
                {i < sessions.length - 1 && <Separator />}
              </Fragment>
            ))}
      </div>

      {otherSessions.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="text-muted-foreground"
            onClick={() => revokeOthers()}
            disabled={isRevokingOthers}
          >
            {isRevokingOthers ? <Spinner /> : <LogOutIcon />}
            Cerrar todas las sesiones
          </Button>
        </div>
      )}
    </FieldSet>
  );
};

// ─── SessionItem ────────────────────────────────────────────────────────────

type SessionItemProps = {
  session: Session;
  isCurrentSession: boolean;
};

const SessionItem: FC<SessionItemProps> = ({ session, isCurrentSession }) => {
  const { device, icon } = parseUserAgent(session.userAgent);
  const DeviceIcon =
    icon === "mobile"
      ? SmartphoneIcon
      : icon === "laptop"
        ? LaptopIcon
        : MonitorIcon;

  const { data: location } = useQuery({
    queryKey: ["session-location", session.ipAddress],
    queryFn: () => fetchLocation(session.ipAddress),
    staleTime: Infinity,
    enabled: !!session.ipAddress,
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token });
      if (error) throw new Error(error.message ?? "Error al cerrar la sesión");
    },
    onSuccess: () => {
      toast.success("Sesión cerrada correctamente");
      queryClient.invalidateQueries({ queryKey: [...SESSIONS_QUERY_KEY] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3.5">
        <DeviceIcon className="text-muted-foreground size-5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="xs:text-sm truncate text-xs font-medium">{device}</p>
          <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
            <span>
              Activa{" "}
              {format(new Date(session.createdAt), "d MMM yyyy", {
                locale: es,
              })}
            </span>
            {location && (
              <>
                <span className="opacity-40">·</span>
                <span>{location}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {isCurrentSession ? (
        <span className="border-primary/20 bg-primary/10 text-primary flex h-6 items-center gap-2 border px-2 py-1 text-xs uppercase">
          <div className="bg-primary size-2" />
          Actual
        </span>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="text-muted-foreground"
          onClick={() => mutate(session.token)}
          disabled={isPending}
          aria-label="Cerrar sesión"
        >
          {isPending ? <Spinner /> : <LogOutIcon />}
          Cerrar
        </Button>
      )}
    </div>
  );
};

export default SessionsList;
