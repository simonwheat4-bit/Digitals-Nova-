// Business Sector Constants
export const SECTOR_RETAIL_MART = 'RETAIL_MART';
export const SECTOR_PHARMACY = 'PHARMACY';
export const SECTOR_CLINIC_HMS = 'CLINIC_HMS';
export const SECTOR_RESTAURANT = 'RESTAURANT';

// Helper to determine the exact business sector of a tenant
export const getBusinessSector = (tenant) => {
  if (!tenant) return SECTOR_RETAIL_MART;

  const rawType = String(
    tenant.businessType ||
    tenant.business_type ||
    tenant.vertical ||
    tenant.industryVertical ||
    tenant.storeType ||
    ''
  ).toLowerCase();

  // 1. Restaurant / Food Outlets / Cafes
  if (
    rawType.includes('restaurant') ||
    rawType.includes('cafe') ||
    rawType.includes('food') ||
    rawType.includes('dining') ||
    rawType.includes('pizza') ||
    rawType.includes('burger') ||
    rawType.includes('coffee') ||
    rawType.includes('bbq') ||
    rawType.includes('bistro') ||
    rawType.includes('diner') ||
    rawType.includes('fast food') ||
    rawType.includes('catering')
  ) {
    return SECTOR_RESTAURANT;
  }

  // 2. Pharmacy / Medical Stores
  if (
    rawType.includes('pharmacy') ||
    rawType.includes('medical store') ||
    rawType.includes('chemist') ||
    rawType.includes('drug') ||
    rawType.includes('pharma') ||
    rawType.includes('dispensary')
  ) {
    return SECTOR_PHARMACY;
  }

  // 3. Clinic / Hospital / HMS Healthcare
  if (
    rawType.includes('clinic') ||
    rawType.includes('hospital') ||
    rawType.includes('hms') ||
    rawType.includes('dental') ||
    rawType.includes('doctor') ||
    rawType.includes('health') ||
    rawType.includes('derma') ||
    rawType.includes('medical centre') ||
    rawType.includes('opd')
  ) {
    return SECTOR_CLINIC_HMS;
  }

  // 4. Retail Mart / General Store
  if (
    rawType.includes('retail') ||
    rawType.includes('mart') ||
    rawType.includes('general store') ||
    rawType.includes('store') ||
    rawType.includes('shop') ||
    rawType.includes('supermarket') ||
    rawType.includes('grocery')
  ) {
    return SECTOR_RETAIL_MART;
  }

  // Name / Subdomain / Receipt Title Fallback Analysis
  const name = String(
    tenant.name ||
    tenant.clinicName ||
    tenant.receiptHeader ||
    tenant.subdomain ||
    ''
  ).toLowerCase();

  if (
    name.includes('restaurant') ||
    name.includes('cafe') ||
    name.includes('food') ||
    name.includes('pizza') ||
    name.includes('burger') ||
    name.includes('bbq') ||
    name.includes('diner') ||
    name.includes('coffee') ||
    name.includes('bistro')
  ) {
    return SECTOR_RESTAURANT;
  }

  if (
    name.includes('pharmacy') ||
    name.includes('chemist') ||
    name.includes('medicos') ||
    name.includes('pharma')
  ) {
    return SECTOR_PHARMACY;
  }

  if (
    name.includes('clinic') ||
    name.includes('hospital') ||
    name.includes('care') ||
    name.includes('health') ||
    name.includes('dental') ||
    name.includes('derma')
  ) {
    return SECTOR_CLINIC_HMS;
  }

  // Default to Retail Mart for modern point-of-sale commerce
  return SECTOR_RETAIL_MART;
};

// Convenience Sector Check Helpers
export const isRestaurantBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_RESTAURANT;
export const isPharmacyBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_PHARMACY;
export const isClinicBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_CLINIC_HMS;
export const isRetailMartBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_RETAIL_MART;

// Helper to verify Super Admin role
export const isSuperAdminUser = (user) => {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();
  return (
    role === 'SUPER_ADMIN' ||
    role === 'SUPERADMIN' ||
    user.is_admin === true ||
    user.username === 'superadmin' ||
    user.username === 'ubaid'
  );
};

// Helper to detect Dedicated Super Admin routes (/admin, /super-admin, /portal/super-admin, ?view=super-admin)
export const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '').toLowerCase();
  const search = (window.location.search || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  return (
    path.includes('super-admin') ||
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.endsWith('/admin') ||
    path.includes('/portal/super-admin') ||
    path.includes('/portal/admin') ||
    search.includes('super-admin') ||
    search.includes('view=admin') ||
    search.includes('route=admin') ||
    hash.includes('super-admin') ||
    hash.includes('admin')
  );
};
