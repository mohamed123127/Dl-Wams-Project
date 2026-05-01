// =============================================================
// Centralized API Service
// =============================================================
// All backend endpoint URLs are defined here in one place.
// When the Django backend URLs are ready, update them below.
// =============================================================

const SERVICES_BASE_URL = 'http://localhost:8006';
const SERVICES_URL = `${SERVICES_BASE_URL}/api/services`;

// get all backend urls 
async function getServicesUrls(): Promise<Record<string, string>> {
  const res = await fetch(SERVICES_URL);
  if (!res.ok) throw new Error(`Failed to fetch backend URLs: ${res.status}`);
  const data = await res.json();
  return data.services;
}

let ENDPOINTS: Record<string, string> = {};

export async function fetchEndpoints() {
  ENDPOINTS = await getServicesUrls();
  AUTH_API_URL = ENDPOINTS['auth-service'].status === "available" ? ENDPOINTS['auth-service'].url : "";
  INVENTORY_API_URL = ENDPOINTS['product-service'].status === "available" ? ENDPOINTS['product-service'].url : "";
  SALES_API_URL = ENDPOINTS['sales-service'].status === "available" ? ENDPOINTS['sales-service'].url : "";
  STAFF_API_URL = ENDPOINTS['employee-service'].status === "available" ? ENDPOINTS['employee-service'].url : "";
  MODEL_API_URL = ENDPOINTS['model-worker-service'].status === "available" ? ENDPOINTS['model-worker-service'].url : "";
  SECURITY_API_URL = ENDPOINTS['security-service'].status === "available" ? ENDPOINTS['security-service'].url : "";
}


export let AUTH_API_URL = "";
export let INVENTORY_API_URL = "";
export let SALES_API_URL = "";
export let STAFF_API_URL = "";
export let MODEL_API_URL = "";
export let SECURITY_API_URL = "";

function ENDPOINTS_URLS() {
  return {
    // Auth (auth_service — port 8005)
    authLogin: `${AUTH_API_URL}/api/login/`,
    authRefresh: `${AUTH_API_URL}/api/login/refresh/`,
    authVerifyRole: `${AUTH_API_URL}/api/verify-role/`,

    // Inventory / Products  (product_service — port 8000)
    inventory: `${INVENTORY_API_URL}/api/products/`,
    inventoryItem: (id: string) => `${INVENTORY_API_URL}/api/products/${id}/`,

    // Staff
    staff: `${STAFF_API_URL}/api/employees/`,
    staffMember: (id: string) => `${STAFF_API_URL}/api/employees/${id}/`,

    // Sales (port 8002)
    sales: `${SALES_API_URL}/api/sales/`,
    saleById: (id: string | number) => `${SALES_API_URL}/api/sales/${id}/`,

    // POS Terminal
    posCart: `${SALES_API_URL}/api/pos/cart/`,
    posCartItem: (id: string) => `${SALES_API_URL}/api/pos/cart/${id}/`,
    posPayment: `${SALES_API_URL}/api/pos/payment/`,
    posSkuLookup: (sku: string) => `${SALES_API_URL}/api/pos/lookup/${sku}/`,
  };
}

// =============================================================
//  Generic helpers
// =============================================================

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch("https://" + url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? data;
}

async function post<T>(url: string, body: Record<string, unknown>): Promise<T> {
  console.log(url);
  const res = await fetch("https://" + url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

async function patch<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
  return res.json();
}

// =============================================================
//  Inventory API
// =============================================================
export const inventoryApi = {
  getAll: () => get<any[]>(ENDPOINTS_URLS().inventory),
  create: (item: Record<string, unknown>) => post<any>(ENDPOINTS_URLS().inventory, item),
  update: (id: string, data: Record<string, unknown>) => patch<any>(ENDPOINTS_URLS().inventoryItem(id), data),
};

// =============================================================
//  Staff API
// =============================================================
export const staffApi = {
  getAll: () => get<any[]>(ENDPOINTS_URLS().staff),
  create: (member: Record<string, unknown>) => post<any>(ENDPOINTS_URLS().staff, member),
  update: (id: string, data: Record<string, unknown>) => patch<any>(ENDPOINTS_URLS().staffMember(id), data),
};

// =============================================================
//  POS Terminal API
// =============================================================
export const posApi = {
  getCart: () => get<any[]>(ENDPOINTS_URLS().posCart),
  addToCart: (item: Record<string, unknown>) => post<any>(ENDPOINTS_URLS().posCart, item),
  lookupSku: (sku: string) => get<any>(ENDPOINTS_URLS().posSkuLookup(sku)),
  processPayment: (data: Record<string, unknown>) => post<any>(ENDPOINTS_URLS().posPayment, data),
};

// =============================================================
//  Sales API  (Django sales_service — port 8002)
// =============================================================
export interface SaleItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateSalePayload {
  employee_id: number;
  items_data: SaleItem[];
}

export const salesApi = {
  /** GET /api/sales/ — list all sales */
  getAll: () => get<any[]>(ENDPOINTS_URLS().sales),

  /** GET /api/sales/:id/ — retrieve one sale with full details */
  getById: (id: string | number) => get<any>(ENDPOINTS_URLS().saleById(id)),

  /** POST /api/sales/ — create a new sale */
  create: (payload: CreateSalePayload) =>
    post<any>(ENDPOINTS_URLS().sales, payload as unknown as Record<string, unknown>),
};


// =============================================================
//  Auth API
// =============================================================
export const authApi = {
  login: (data: Record<string, unknown>) => post<{ access: string, refresh: string }>(ENDPOINTS_URLS().authLogin, data),
  refresh: (refresh: string) => post<{ access: string }>(ENDPOINTS_URLS().authRefresh, { refresh }),
  verifyRole: () => get<{ username: string, role: string }>(ENDPOINTS_URLS().authVerifyRole),
};

