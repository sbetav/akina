"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Clock,
  FileText,
  Package,
  ReceiptIcon,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, FC, ReactNode } from "react";
import RevenueChart from "@/components/dashboard/charts/revenue-chart";
import StatusChart from "@/components/dashboard/charts/status-chart";
import KpiCard from "@/components/dashboard/kpi-card";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/api/use-dashboard-metrics";
import { cn } from "@/lib/utils";

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatCOP(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString("es-CO")}`;
}

function formatFullCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  className,
  style,
  children,
  action,
  ...rest
}: {
  title: string;
  subtitle?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  action?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-card flex flex-col gap-5 border p-5 lg:p-6", className)}
      style={style}
      {...rest}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-base font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/dashboard/invoices/new-invoice",
    icon: <ReceiptIcon className="size-4" />,
    label: "Nueva factura",
  },
  {
    href: "/dashboard/customers/new",
    icon: <UserPlus className="size-4" />,
    label: "Nuevo cliente",
  },
  {
    href: "/dashboard/products/new",
    icon: <Package className="size-4" />,
    label: "Nuevo producto",
  },
  {
    href: "/dashboard/support-documents/new",
    icon: <FileText className="size-4" />,
    label: "Doc. soporte",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardPage: FC = () => {
  const { data, isPending, error } = useDashboardMetrics();

  const today = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ───────────────────────────────────── */}
      <div data-tour="general-dashboard">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Dashboard</PageHeaderTitle>
            <PageHeaderDescription className="capitalize">
              {today}
            </PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>
      </div>

      {/* ── Error banner ──────────────────────────────────── */}
      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive border px-5 py-3.5 text-sm">
          No se pudieron cargar las métricas — {error.message}
        </div>
      )}

      {/* ── Quick actions (inline row) ─────────────────────── */}
      <div className="flex flex-wrap gap-3" data-tour="dashboard-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={buttonVariants({
              variant: "default-subtle",
              size: "sm",
            })}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>

      {/* ── KPI cards ─────────────────────────────────────── */}
      {isPending ? (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-tour="dashboard-kpi-cards"
        >
          <KpiCard
            label="Facturas totales"
            value={data?.summary.totalInvoices ?? 0}
            icon={<ReceiptIcon />}
            accentClass="border-l-primary"
            subLabel={`${data?.summary.validatedInvoices ?? 0} validadas`}
          />
          <KpiCard
            label="Ingresos facturados"
            value={formatCOP(data?.summary.totalRevenue ?? 0)}
            icon={<Wallet />}
            accentClass="border-l-warning"
            subLabel={formatFullCOP(data?.summary.totalRevenue ?? 0)}
          />
          <KpiCard
            label="Facturas pendientes"
            value={data?.summary.pendingInvoices ?? 0}
            icon={<Clock />}
            accentClass="border-l-info"
            subLabel={
              (data?.summary.totalInvoices ?? 0) === 0
                ? "Sin facturas aún"
                : (data?.summary.pendingInvoices ?? 0) === 0
                  ? "Todas validadas"
                  : `${Math.round(
                      ((data?.summary.pendingInvoices ?? 0) /
                        (data?.summary.totalInvoices ?? 1)) *
                        100,
                    )}% del total`
            }
          />
        </div>
      )}

      {/* ── Charts ────────────────────────────────────────── */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[280px] lg:col-span-2" />
          <Skeleton className="h-[280px]" />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          data-tour="dashboard-charts"
        >
          {/* Monthly revenue bar chart (2/3 width) */}
          <SectionCard
            title="Ingresos mensuales"
            subtitle="Últimos 6 meses"
            className="lg:col-span-2"
            action={
              data ? (
                <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
                  {data.monthlyRevenue.reduce((s, m) => s + m.count, 0)}{" "}
                  facturas
                </span>
              ) : undefined
            }
          >
            <RevenueChart data={data?.monthlyRevenue ?? []} />
          </SectionCard>

          {/* Invoice status donut (1/3 width) */}
          <SectionCard title="Estado de facturas" subtitle="Por estado DIAN">
            <StatusChart
              validated={data?.summary.validatedInvoices ?? 0}
              pending={data?.summary.pendingInvoices ?? 0}
            />

            {/* Legend */}
            <div className="flex flex-col gap-2.5 border-t pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-chart-1 size-2 shrink-0" />
                  <span className="text-muted-foreground text-xs">
                    Validadas
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {data?.summary.validatedInvoices ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-chart-3 size-2 shrink-0" />
                  <span className="text-muted-foreground text-xs">
                    Pendientes
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {data?.summary.pendingInvoices ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t pt-2.5">
                <span className="text-muted-foreground text-xs">
                  Tasa aprobación
                </span>
                <span className="text-primary font-mono text-xs font-semibold tabular-nums">
                  {(data?.summary.totalInvoices ?? 0) > 0
                    ? `${Math.round(
                        ((data?.summary.validatedInvoices ?? 0) /
                          (data?.summary.totalInvoices ?? 1)) *
                          100,
                      )}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Bottom row ────────────────────────────────────── */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[320px] lg:col-span-2" />
          <Skeleton className="h-[320px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent invoices (2/3 width) */}
          <div
            className="bg-card flex flex-col border lg:col-span-2"
            data-tour="dashboard-recent-invoices"
          >
            {/* Card header */}
            <div className="flex items-center justify-between border-b px-5 py-4 lg:px-6">
              <div>
                <h3 className="font-sans text-base font-semibold">
                  Facturas recientes
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Últimas 5 emitidas
                </p>
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
              >
                Ver todas
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Content */}
            {!data?.recentInvoices.length ? (
              <div className="flex flex-1 items-center justify-center px-5 py-12 text-center">
                <div>
                  <ReceiptIcon className="text-muted-foreground mx-auto mb-3 size-8 opacity-30" />
                  <p className="text-muted-foreground text-sm">
                    Aún no hay facturas registradas.
                  </p>
                  <Link
                    href="/dashboard/invoices/new-invoice"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "mt-4 inline-flex",
                    )}
                  >
                    Crear primera factura
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y">
                {data.recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="group hover:bg-secondary/60 flex items-center gap-3 px-5 py-3.5 transition-colors lg:gap-4 lg:px-6"
                  >
                    {/* Status indicator + invoice number */}
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span
                        className={cn(
                          "size-1.5 shrink-0",
                          invoice.status === 1
                            ? "bg-primary"
                            : "bg-muted-foreground/50",
                        )}
                      />
                      <span className="font-mono text-xs font-medium tabular-nums">
                        {invoice.number}
                      </span>
                    </div>

                    {/* Customer */}
                    <span className="text-muted-foreground hidden min-w-0 flex-1 truncate text-xs sm:block">
                      {invoice.customerName}
                    </span>

                    {/* Total */}
                    <span className="shrink-0 font-mono text-xs tabular-nums">
                      {invoice.total
                        ? `$${Number(invoice.total).toLocaleString("es-CO")}`
                        : "—"}
                    </span>

                    {/* Status badge */}
                    <span
                      className={cn(
                        "hidden shrink-0 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase sm:inline",
                        invoice.status === 1
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {invoice.status === 1 ? "Validada" : "Pendiente"}
                    </span>

                    <ArrowRight className="text-muted-foreground size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column: General summary + Top customers */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <SectionCard
              title="Resumen general"
              className="flex-1"
              data-tour="dashboard-disclaimer"
            >
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: <Package className="size-3.5" />,
                    label: "Productos",
                    value: data?.summary.totalProducts ?? 0,
                  },
                  {
                    icon: <FileText className="size-3.5" />,
                    label: "Docs. de soporte",
                    value: data?.summary.totalSupportDocuments ?? 0,
                  },
                  {
                    icon: <TrendingUp className="size-3.5" />,
                    label: "Tasa de aprobación",
                    value:
                      (data?.summary.totalInvoices ?? 0) > 0
                        ? `${Math.round(
                            ((data?.summary.validatedInvoices ?? 0) /
                              (data?.summary.totalInvoices ?? 1)) *
                              100,
                          )}%`
                        : "0%",
                    highlight: true,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="text-muted-foreground flex items-center gap-2">
                      {stat.icon}
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold tabular-nums",
                        stat.highlight && "text-primary",
                      )}
                    >
                      {String(stat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Top customers (only when there's data) */}
            {(data?.topCustomers.length ?? 0) > 0 && (
              <div className="bg-card flex flex-col gap-4 border p-5 lg:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans text-base font-semibold">
                      Top clientes
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Por ingresos facturados
                    </p>
                  </div>
                  <Link
                    href="/dashboard/customers"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {data?.topCustomers.map((customer, i) => (
                    <div
                      key={`${customer.customerIdentification}-${i}`}
                      className="flex items-center gap-2.5"
                    >
                      <span className="text-muted-foreground w-3.5 shrink-0 font-mono text-[10px] tabular-nums">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {customer.customerName}
                        </p>
                        <p className="text-muted-foreground font-mono text-[10px] tabular-nums">
                          {customer.invoiceCount} factura
                          {customer.invoiceCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-primary shrink-0 font-mono text-xs font-semibold tabular-nums">
                        {formatCOP(customer.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
