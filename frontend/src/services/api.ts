// =============================================================
// Centralized API Service
// =============================================================
// All backend endpoint URLs are defined here in one place.
// When the Django backend URLs are ready, update them below.
// =============================================================

const API_BASE_URL = 'http://127.0.0.1:8000';
const SALES_API_URL = 'http://127.0.0.1:8002';
const AUTH_API_URL = 'http://127.0.0.1:8005';

// ------ Endpoint URLs (TODO: Replace with actual Django URLs) ------
const ENDPOINTS = {
  // Auth (auth_service — port 8005)
  authLogin: `${AUTH_API_URL}/api/login/`,
  authRefresh: `${AUTH_API_URL}/api/login/refresh/`,
  authVerifyRole: `${AUTH_API_URL}/api/verify-role/`,

  // Inventory / Products  (product_service — port 8000)
  inventory: `${API_BASE_URL}/api/products/`,
  inventoryItem: (id: string) => `${API_BASE_URL}/api/products/${id}/`,

  // Staff
  staff: `http://127.0.0.1:8001/api/employees/`,
  staffMember: (id: string) => `http://127.0.0.1:8001/api/employees/${id}/`,

  // Sales (port 8002)
  sales: `${SALES_API_URL}/api/sales/`,
  saleById: (id: string | number) => `${SALES_API_URL}/api/sales/${id}/`,

  // Analytics
  analyticsTrends: `${API_BASE_URL}/api/analytics/trends/`,      // TODO: update URL
  analyticsCategories: `${API_BASE_URL}/api/analytics/categories/`,  // TODO: update URL
  analyticsRecoveries: `${API_BASE_URL}/api/analytics/recoveries/`,  // TODO: update URL

  // POS Terminal
  posCart: `${API_BASE_URL}/api/pos/cart/`,          // TODO: update URL
  posCartItem: (id: string) => `${API_BASE_URL}/api/pos/cart/${id}/`,   // TODO: update URL
  posPayment: `${API_BASE_URL}/api/pos/payment/`,      // TODO: update URL
  posSkuLookup: (sku: string) => `${API_BASE_URL}/api/pos/lookup/${sku}/`, // TODO: update URL

  // Settings
  settings: `${API_BASE_URL}/api/settings/`,         // TODO: update URL
};

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
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? data;
}

async function post<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
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
  getAll: () => get<any[]>(ENDPOINTS.inventory),
  create: (item: Record<string, unknown>) => post<any>(ENDPOINTS.inventory, item),
  update: (id: string, data: Record<string, unknown>) => patch<any>(ENDPOINTS.inventoryItem(id), data),
};

// =============================================================
//  Staff API
// =============================================================
export const staffApi = {
  getAll: () => get<any[]>(ENDPOINTS.staff),
  create: (member: Record<string, unknown>) => post<any>(ENDPOINTS.staff, member),
  update: (id: string, data: Record<string, unknown>) => patch<any>(ENDPOINTS.staffMember(id), data),
};

// =============================================================
//  Analytics API
// =============================================================
export const analyticsApi = {
  getTrends: () => get<any[]>(ENDPOINTS.analyticsTrends),
  getCategories: () => get<any[]>(ENDPOINTS.analyticsCategories),
  getRecoveries: () => get<any[]>(ENDPOINTS.analyticsRecoveries),
};

// =============================================================
//  POS Terminal API
// =============================================================
export const posApi = {
  getCart: () => get<any[]>(ENDPOINTS.posCart),
  addToCart: (item: Record<string, unknown>) => post<any>(ENDPOINTS.posCart, item),
  lookupSku: (sku: string) => get<any>(ENDPOINTS.posSkuLookup(sku)),
  processPayment: (data: Record<string, unknown>) => post<any>(ENDPOINTS.posPayment, data),
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
  getAll: () => get<any[]>(ENDPOINTS.sales),

  /** GET /api/sales/:id/ — retrieve one sale with full details */
  getById: (id: string | number) => get<any>(ENDPOINTS.saleById(id)),

  /** POST /api/sales/ — create a new sale */
  create: (payload: CreateSalePayload) =>
    post<any>(ENDPOINTS.sales, payload as unknown as Record<string, unknown>),
};

// =============================================================
//  Settings API
// =============================================================
export const settingsApi = {
  getAll: () => get<any[]>(ENDPOINTS.settings),
};

// =============================================================
//  Auth API
// =============================================================
export const authApi = {
  login: (data: Record<string, unknown>) => post<{ access: string, refresh: string }>(ENDPOINTS.authLogin, data),
  refresh: (refresh: string) => post<{ access: string }>(ENDPOINTS.authRefresh, { refresh }),
  verifyRole: () => get<{ username: string, role: string }>(ENDPOINTS.authVerifyRole),
};

