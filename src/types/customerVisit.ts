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

export type UPVCProfileSeries =
  | 'SCRAFT 60mm Casement Series'
  | 'SCRAFT 2.5 Track Sliding Series'
  | 'SCRAFT 3 Track Sliding Series'
  | 'SCRAFT 80mm Heavy Sliding Series'
  | 'SCRAFT Laminated Wooden Profiles'
  | 'SCRAFT Tilt & Turn Series'
  | 'SCRAFT Eco Series (White)'
  | 'Custom uPVC Extrusions';

export interface CustomerVisit {
  id: string;
  salesExecutiveName: string;
  customerVisitDate: string; // YYYY-MM-DD
  customerName: string;
  mobileNumber: string;
  companyName: string;
  customerType: CustomerType;
  state: string;
  district: string;
  city: string;
  customerAddress: string;
  interestedBrand: string; // e.g. SCRAFT 60mm Casement Series
  currentBrand: string; // e.g. Kommerling, Prominance, Veka
  quantityPerMonth: string; // e.g. "5 MT / Month", "1,200 Bars", "25 Tons"
  piSent: PISentStatus;
  leadStatus: LeadStatus;
  followUpDate: string; // YYYY-MM-DD
  visitRemarks: string;
  profileColor?: 'White' | 'Golden Oak' | 'Walnut' | 'Dark Oak' | 'Anthracite Grey';
  executiveEmail?: string;
  createdAt: number;
}

export interface VisitFilterOptions {
  search: string;
  state: string;
  leadStatus: string;
  customerType: string;
  piSent: string;
  startDate: string;
  endDate: string;
}
