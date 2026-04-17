"use client";

import { type DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

const TOUR_STORAGE_KEY = "akina.dashboardTourCompleted";

const isVisible = (element: Element) => {
  if (!(element instanceof HTMLElement)) return false;

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    rect.width > 0 &&
    rect.height > 0
  );
};

const BASE_STEPS: DriveStep[] = [
  {
    element: '[data-tour="credentials-selector"]',
    popover: {
      title: "Selector de credenciales",
      description:
        "Cambia rapidamente entre sandbox y produccion, y define con que credencial operas en todo el panel.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-products"]',
    popover: {
      title: "Productos",
      description:
        "Administra tu catalogo para reutilizar items al crear facturas y documentos soporte.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-customers"]',
    popover: {
      title: "Clientes",
      description:
        "Gestiona tus clientes para facturar mas rapido, sin volver a diligenciar sus datos en cada emision.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-invoices"]',
    popover: {
      title: "Facturas",
      description:
        "Desde aqui emites, consultas y haces seguimiento al estado de tus facturas electronicas.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-support-documents"]',
    popover: {
      title: "Documentos soporte",
      description:
        "Crea y controla documentos soporte para respaldar operaciones con proveedores cuando aplica.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="general-dashboard"]',
    popover: {
      title: "Dashboard general",
      description:
        "Aqui tienes una vista general del rendimiento: KPIs, graficos y actividad reciente para decidir rapido.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-quick-actions"]',
    popover: {
      title: "Acciones rapidas",
      description:
        "Crea facturas, clientes, productos o documentos soporte en un solo clic desde aqui.",
      side: "bottom",
      align: "start",
    },
  },
];

const DashboardTour = () => {
  const pathname = usePathname();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [showMvpDialog, setShowMvpDialog] = useState(false);

  useEffect(() => {
    if (pathname !== "/dashboard") return;

    const hasCompleted = window.localStorage.getItem(TOUR_STORAGE_KEY) === "1";

    if (hasCompleted) return;

    const timer = window.setTimeout(() => {
      const steps = BASE_STEPS.filter((step) => {
        if (!step.element) return false;
        const element = document.querySelector(String(step.element));
        if (!element) return false;
        return isVisible(element);
      });

      if (steps.length === 0) return;

      const tour = driver({
        allowClose: true,
        showProgress: true,
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Listo",
        overlayClickBehavior: "close",
        smoothScroll: true,
        animate: true,
        stagePadding: 8,
        stageRadius: 0,
        popoverClass: "akina-tour-popover",
        onDestroyed: (_, __, { driver: tourDriver }) => {
          const completedAll = tourDriver.getActiveIndex() === steps.length - 1;
          if (!completedAll) return;

          window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
          setShowMvpDialog(true);
          toast.success("Tour completado", {
            description:
              "No se mostrara automaticamente de nuevo en este navegador.",
          });
        },
        steps,
      });

      driverRef.current = tour;
      tour.drive();
    }, 250);

    return () => {
      window.clearTimeout(timer);
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [pathname]);

  return (
    <Dialog open={showMvpDialog} onOpenChange={setShowMvpDialog}>
      <DialogContent className="border-border max-w-md border-2 text-center">
        <DialogHeader className="items-center">
          <DialogTitle className="font-mono text-sm tracking-[0.08em] uppercase">
            Recordatorio MVP / Demo
          </DialogTitle>
          <DialogDescription className="text-center text-xs leading-relaxed">
            Akina esta en etapa MVP/demo y se ofrece para validacion de flujo y
            pruebas. No esta pensado para uso productivo en este momento.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center sm:justify-center">
          <Button onClick={() => setShowMvpDialog(false)} variant="default">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardTour;
