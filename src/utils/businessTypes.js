// Business Sector Constants
export const SECTOR_RETAIL_MART = 'RETAIL_MART';
export const SECTOR_PHARMACY = 'PHARMACY';
export const SECTOR_CLINIC_HMS = 'CLINIC_HMS';
export const SECTOR_RESTAURANT = 'RESTAURANT';

// Helper to determine the exact business sector of a tenant
export const getBusinessSector = (tenant) => {
  if (!tenant) return SECTOR_RETAIL_MART;

  // 1. Explicit sector/vertical fields set by backend or registration
  const explicitSector = String(
    tenant.sector ||
    tenant.vertical ||
    tenant.storeType ||
    tenant.industryVertical ||
    ''
  ).toUpperCase();

  if (explicitSector === SECTOR_RESTAURANT) return SECTOR_RESTAURANT;
  if (explicitSector === SECTOR_PHARMACY) return SECTOR_PHARMACY;
  if (explicitSector === SECTOR_CLINIC_HMS) return SECTOR_CLINIC_HMS;
  if (explicitSector === SECTOR_RETAIL_MART) return SECTOR_RETAIL_MART;

  // 2. Name & Subdomain matching FIRST to prevent wrong fallback from legacy defaults
  const name = String(
    tenant.name ||
    tenant.clinicName ||
    tenant.receiptHeader ||
    tenant.subdomain ||
    ''
  ).toLowerCase();

  if (
    name.includes('restaurant') ||
    name.includes('resturent') ||
    name.includes('resturant') ||
    name.includes('cafe') ||
    name.includes('kafe') ||
    name.includes('food') ||
    name.includes('pizza') ||
    name.includes('burger') ||
    name.includes('bbq') ||
    name.includes('diner') ||
    name.includes('dhaba') ||
    name.includes('hotel') ||
    name.includes('biryani') ||
    name.includes('karahi') ||
    name.includes('kitchen') ||
    name.includes('bakery') ||
    name.includes('chai') ||
    name.includes('tea') ||
    name.includes('coffee') ||
    name.includes('bistro') ||
    name.includes('shawarma') ||
    name.includes('sweets')
  ) {
    return SECTOR_RESTAURANT;
  }

  if (
    name.includes('pharmacy') ||
    name.includes('chemist') ||
    name.includes('medicos') ||
    name.includes('pharma') ||
    name.includes('drug') ||
    name.includes('dispensary')
  ) {
    return SECTOR_PHARMACY;
  }

  if (
    name === 'clinic' ||
    name.includes('clinic') ||
    name.includes('hospital') ||
    name.includes('dental') ||
    name.includes('derma') ||
    name.includes('hms') ||
    name.includes('healthcare')
  ) {
    return SECTOR_CLINIC_HMS;
  }

  // 3. rawType check as secondary indicator
  const rawType = String(
    tenant.businessType ||
    tenant.business_type ||
    ''
  ).toLowerCase();

  if (
    rawType.includes('restaurant') ||
    rawType.includes('resturent') ||
    rawType.includes('cafe') ||
    rawType.includes('food') ||
    rawType.includes('dining') ||
    rawType.includes('bbq') ||
    rawType.includes('pizza') ||
    rawType.includes('burger') ||
    rawType.includes('fast food') ||
    rawType.includes('catering')
  ) {
    return SECTOR_RESTAURANT;
  }

  if (
    rawType.includes('pharmacy') ||
    rawType.includes('medical store') ||
    rawType.includes('chemist') ||
    rawType.includes('drug') ||
    rawType.includes('pharma')
  ) {
    return SECTOR_PHARMACY;
  }

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

  // 4. Default to Retail Mart for modern point-of-sale commerce
  return SECTOR_RETAIL_MART;
};

// Convenience Sector Check Helpers
export const isRestaurantBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_RESTAURANT;
export const isPharmacyBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_PHARMACY;
export const isClinicBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_CLINIC_HMS;
export const isRetailMartBusiness = (tenant) => getBusinessSector(tenant) === SECTOR_RETAIL_MART;

// Sector Label & Emoji Helper
export const getSectorLabel = (tenantOrSector) => {
  const sector = typeof tenantOrSector === 'object' ? getBusinessSector(tenantOrSector) : tenantOrSector;
  switch (sector) {
    case SECTOR_RESTAURANT:
      return '🍽️ Restaurant / Cafe POS';
    case SECTOR_PHARMACY:
      return '💊 Pharmacy & Medical Store';
    case SECTOR_CLINIC_HMS:
      return '🏥 Clinic & HMS Healthcare';
    case SECTOR_RETAIL_MART:
    default:
      return '🛒 Retail Mart / POS';
  }
};

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
