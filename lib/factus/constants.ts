export type FactusOption = {
  id: string;
  name: string;
};

export type FactusCustomerTribute = {
  id: string;
  name: string;
  tributeCode: string;
};

const toIdNameMap = <T extends { id: string; name: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item.name]));

export const FACTUS_INVOICE_DOCUMENT_TYPES: FactusOption[] = [
  { id: "01", name: "Factura electronica de venta" },
  { id: "03", name: "Instrumento electrónico de transmisión - tipo 03" },
];
export const FACTUS_INVOICE_DOCUMENT_TYPES_BY_ID = toIdNameMap(
  FACTUS_INVOICE_DOCUMENT_TYPES,
);

export const FACTUS_OPERATION_TYPES: FactusOption[] = [
  { id: "10", name: "Estándar" },
  { id: "11", name: "Mandatos" },
  { id: "12", name: "Transporte" },
];
export const FACTUS_OPERATION_TYPES_BY_ID = toIdNameMap(FACTUS_OPERATION_TYPES);

export const FACTUS_CORRECTION_CODES: FactusOption[] = [
  {
    id: "1",
    name: "Devolución parcial de los bienes y/o no aceptación parcial del servicio",
  },
  { id: "2", name: "Anulación de factura electronica" },
  { id: "3", name: "Rebaja o descuento parcial o total" },
  { id: "4", name: "Ajuste de precio" },
  { id: "5", name: "Descuento comercial por pronto pago" },
  { id: "6", name: "Descuento comercial por volumen de ventas" },
];
export const FACTUS_CORRECTION_CODES_BY_ID = toIdNameMap(
  FACTUS_CORRECTION_CODES,
);

export const FACTUS_CREDIT_NOTE_OPERATION_TYPES: FactusOption[] = [
  { id: "20", name: "Nota crédito que referencia una factura electronica" },
  { id: "22", name: "Nota crédito sin referencia a una factura electronica" },
];
export const FACTUS_CREDIT_NOTE_OPERATION_TYPES_BY_ID = toIdNameMap(
  FACTUS_CREDIT_NOTE_OPERATION_TYPES,
);

export const FACTUS_PRODUCT_IDENTIFICATION_STANDARDS: FactusOption[] = [
  { id: "1", name: "Estándar de adopción del contribuyente" },
  { id: "2", name: "UNSPSC" },
  { id: "3", name: "Partida arancelaria" },
  { id: "4", name: "GTIN" },
];
export const FACTUS_PRODUCT_IDENTIFICATION_STANDARDS_BY_ID = toIdNameMap(
  FACTUS_PRODUCT_IDENTIFICATION_STANDARDS,
);

export const FACTUS_CLAIM_CONCEPT_CODES: FactusOption[] = [
  { id: "01", name: "Documento con inconsistencias" },
  { id: "02", name: "Mercancía no entregada totalmente" },
  { id: "03", name: "Mercancía no entregada parcialmente" },
  { id: "04", name: "Servicio no prestado" },
];
export const FACTUS_CLAIM_CONCEPT_CODES_BY_ID = toIdNameMap(
  FACTUS_CLAIM_CONCEPT_CODES,
);

export const FACTUS_EVENT_CODES: FactusOption[] = [
  { id: "030", name: "Acuse de recibo de Factura Electronica de Venta" },
  { id: "031", name: "Reclamo de la Factura Electronica de Venta" },
  { id: "032", name: "Recibo del bien y/o prestación del servicio" },
  { id: "033", name: "Aceptación expresa" },
  { id: "034", name: "Aceptación tacita" },
];
export const FACTUS_EVENT_CODES_BY_ID = toIdNameMap(FACTUS_EVENT_CODES);

export const FACTUS_IDENTITY_DOCUMENT_TYPES: FactusOption[] = [
  { id: "1", name: "Registro civil" },
  { id: "2", name: "Tarjeta de identidad" },
  { id: "3", name: "Cédula de ciudadanía" },
  { id: "4", name: "Tarjeta de extranjería" },
  { id: "5", name: "Cédula de extranjería" },
  { id: "6", name: "NIT" },
  { id: "7", name: "Pasaporte" },
  { id: "8", name: "Documento de identificación extranjero" },
  { id: "9", name: "PEP" },
  { id: "10", name: "NIT otro país" },
  { id: "11", name: "NUIP" },
];
export const FACTUS_IDENTITY_DOCUMENT_TYPES_BY_ID = toIdNameMap(
  FACTUS_IDENTITY_DOCUMENT_TYPES,
);

export const FACTUS_CUSTOMER_TRIBUTE_IDS: FactusCustomerTribute[] = [
  { id: "18", tributeCode: "01", name: "IVA" },
  { id: "21", tributeCode: "ZZ", name: "No aplica" },
];
export const FACTUS_CUSTOMER_TRIBUTE_IDS_BY_ID = toIdNameMap(
  FACTUS_CUSTOMER_TRIBUTE_IDS,
);

export const FACTUS_ORGANIZATION_TYPES: FactusOption[] = [
  { id: "1", name: "Persona jurídica" },
  { id: "2", name: "Persona natural" },
];
export const FACTUS_ORGANIZATION_TYPES_BY_ID = toIdNameMap(
  FACTUS_ORGANIZATION_TYPES,
);

export const FACTUS_PAYMENT_METHOD_CODES: FactusOption[] = [
  { id: "10", name: "Efectivo" },
  { id: "42", name: "Consignación" },
  { id: "20", name: "Cheque" },
  { id: "47", name: "Transferencia" },
  { id: "71", name: "Bonos" },
  { id: "72", name: "Vales" },
  { id: "1", name: "Medio de pago no definido" },
  { id: "49", name: "Tarjeta débito" },
  { id: "48", name: "Tarjeta crédito" },
  { id: "ZZZ", name: "Otro" },
];
export const FACTUS_PAYMENT_METHOD_CODES_BY_ID = toIdNameMap(
  FACTUS_PAYMENT_METHOD_CODES,
);

export const FACTUS_PAYMENT_FORM_CODES: FactusOption[] = [
  { id: "1", name: "Pago de contado" },
  { id: "2", name: "Pago a crédito" },
];
export const FACTUS_PAYMENT_FORM_CODES_BY_ID = toIdNameMap(
  FACTUS_PAYMENT_FORM_CODES,
);

export const FACTUS_NUMBERING_RANGE_DOCUMENT_TYPES: FactusOption[] = [
  { id: "21", name: "Factura de venta" },
  { id: "22", name: "Nota crédito" },
  { id: "23", name: "Nota débito" },
  { id: "24", name: "Documento soporte" },
  { id: "25", name: "Nota de ajuste documento soporte" },
  { id: "26", name: "Nomina" },
  { id: "27", name: "Nota de ajuste nomina" },
  { id: "28", name: "Nota de eliminación de nomina" },
  { id: "30", name: "Factura de talonario y de papel" },
];
export const FACTUS_NUMBERING_RANGE_DOCUMENT_TYPES_BY_ID = toIdNameMap(
  FACTUS_NUMBERING_RANGE_DOCUMENT_TYPES,
);

export const FACTUS_SUPPORT_DOC_IDENTITY_DOCUMENT_TYPES: FactusOption[] = [
  { id: "4", name: "Tarjeta de extranjería" },
  { id: "5", name: "Cédula de extranjería" },
  { id: "6", name: "NIT" },
  { id: "7", name: "Pasaporte" },
  { id: "8", name: "Documento de identificación extranjero" },
  { id: "9", name: "PEP" },
  { id: "10", name: "NIT otro país" },
];
export const FACTUS_SUPPORT_DOC_IDENTITY_DOCUMENT_TYPES_BY_ID = toIdNameMap(
  FACTUS_SUPPORT_DOC_IDENTITY_DOCUMENT_TYPES,
);

export const FACTUS_ADJUSTMENT_NOTE_REASONS: FactusOption[] = [
  {
    id: "1",
    name: "Devolución parcial de los bienes y/o no aceptación parcial del servicio",
  },
  {
    id: "2",
    name: "Anulación del documento soporte en adquisiciones efectuadas a sujetos no obligados a expedir factura de venta o documento equivalente",
  },
  { id: "3", name: "Rebaja o descuento parcial o total" },
  { id: "4", name: "Ajuste de precio" },
  { id: "5", name: "Otros" },
];
export const FACTUS_ADJUSTMENT_NOTE_REASONS_BY_ID = toIdNameMap(
  FACTUS_ADJUSTMENT_NOTE_REASONS,
);

export const FACTUS_CHARGE_DISCOUNT_CODES: FactusOption[] = [
  { id: "03", name: "Recargo condicionado" },
];
export const FACTUS_CHARGE_DISCOUNT_CODES_BY_ID = toIdNameMap(
  FACTUS_CHARGE_DISCOUNT_CODES,
);

export const FACTUS_FISCAL_RESPONSIBILITIES: FactusOption[] = [
  { id: "O-13", name: "Gran contribuyente" },
  { id: "O-15", name: "Autorretenedor" },
  { id: "O-23", name: "Agente de retención de IVA" },
  { id: "O-47", name: "Regimen simple de tributación" },
  { id: "R-99-PN", name: "No responsable" },
];
export const FACTUS_FISCAL_RESPONSIBILITIES_BY_ID = toIdNameMap(
  FACTUS_FISCAL_RESPONSIBILITIES,
);
