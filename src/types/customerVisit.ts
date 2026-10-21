export type CustomerType =
  | 'Fabricator'
  | 'Distributor'
  | 'Wholesaler'
  | 'Retailer'
  | 'Direct OEM'
  | 'Dealer'
  | 'Contractor'
  | 'Builder / Developer'
  | 'Other';

export type LeadStatus = 'Hot' | 'Warm' | 'Cold' | 'Won / Closed' | 'Lost';

export type PISentStatus = 'Yes' | 'No' | 'Under Preparation';

export type UPVCBrand = 'S CRAFT' | 'SMART' | 'OTHERS' | string;

export interface CustomerVisit {
  id: string;
  salesExecutiveName: string;
  customerVisitDate: string; // YYYY-MM-DD
  customerName: string;
  mobileNumber: string;
  companyName: string;
  customerType: CustomerType;
  gstNumber?: string; // GSTIN e.g. 24AAAAA0000A1Z5
  state: string;
  district: string;
  city: string;
  customerAddress: string;

  // GPS Tagging & Location Link
  gpsLocationLink?: string; // e.g. https://www.google.com/maps?q=23.022505,72.571362
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number; // Accuracy in meters
  gpsCapturedAt?: string; // Timestamp when GPS was tagged

  // Brand & Series distinction
  brand?: UPVCBrand; // 'S CRAFT' | 'SMART' | 'OTHERS' (or custom name)
  interestedSeries?: string; // e.g. '60mm Casement Series (Windows & Doors)'
  interestedBrand: string; // Combined / Backward-compatible description

  currentBrand: string; // Competitor uPVC brand e.g. Kommerling, Prominance, Veka
  quantityPerMonth: string; // e.g. "5 MT / Month", "1,200 Bars", "25 Tons"
  piSent: PISentStatus;
  leadStatus: LeadStatus;
  followUpDate: string; // YYYY-MM-DD
  visitRemarks: string;
  profileColor?: string;
  executiveEmail?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface VisitFilterOptions {
  search: string;
  brand?: string;
  state: string;
  leadStatus: string;
  customerType: string;
  piSent: string;
  startDate: string;
  endDate: string;
}
