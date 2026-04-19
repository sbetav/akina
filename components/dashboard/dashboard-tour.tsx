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
import { DEMO_DISCLAIMER } from "@/lib/constants";

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
        "Cambia rápidamente entre sandbox y producción, y define con que credencial operas en todo el panel.",
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
        "Gestiona tus clientes para facturar mas rápido, sin volver a diligenciar sus datos en cada emisión.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-invoices"]',
    popover: {
      title: "Facturas",
      description:
        "Desde aquí emites, consultas y haces seguimiento al estado de tus facturas electrónicas.",
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
        "Aquí tienes una vista general del rendimiento: KPIs, gráficos y actividad reciente para decidir rápido.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-quick-actions"]',
    popover: {
      title: "Acciones rápidas",
      description:
        "Crea facturas, clientes, productos o documentos soporte en un solo clic desde aquí.",
      side: "bottom",
      align: "start",
    },
  },
];

const DashboardTour = () => {
  const pathname = usePathname();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    if (pathname !== "/dashboard") return;

    const hasCompleted = window.localStorage.getItem(TOUR_STORAGE_KEY) === "1";
    if (hasCompleted) return;

    const timer = window.setTimeout(() => setShowDisclaimer(true), 250);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (!disclaimerAccepted) return;

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

          window.localStorage.setItem(TOUR_STORAGE_KEY, "1");

          if (!completedAll) return;

          toast.success("Tour completado", {
            description:
              "No se mostrará automáticamente de nuevo en este navegador.",
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
  }, [pathname, disclaimerAccepted]);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setDisclaimerAccepted(true);
  };

  return (
    <Dialog
      open={showDisclaimer}
      onOpenChange={(open) => {
        if (open) setShowDisclaimer(true);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg">Aviso importante</DialogTitle>
          <DialogDescription>{DEMO_DISCLAIMER}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-1 justify-center sm:justify-center">
          <Button onClick={handleAcceptDisclaimer} variant="default">
            Entendido, continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardTour;
