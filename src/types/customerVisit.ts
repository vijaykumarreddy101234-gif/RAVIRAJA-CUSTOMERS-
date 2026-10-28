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

export interface AdditionalContact {
  id: string;
  name: string;
  designation: string; // e.g. Co-Director, Partner, Workshop Supervisor, Production Head, Purchase Manager, Site Supervisor, Accounts
  mobileNumber: string;
  notes?: string;
}

export interface ConversationLog {
  id: string;
  speakerName: string;
  speakerRole: 'Sales Executive' | 'Fabricator' | 'Dealer' | 'Distributor' | 'Director' | 'Supervisor' | 'Other';
  message: string;
  timestamp?: string;
}

export interface OtherOpinionCard {
  id: string;
  title: string;
  content: string;
}

export interface VisitPhoto {
  id: string;
  dataUrl: string; // Base64 compressed image data URL
  caption?: string; // Optional user label, e.g. "Workshop Front", "Sample Corner", "Visiting Card"
  capturedAt?: string;
}

export interface CustomerVisit {
  id: string;
  salesExecutiveName: string;
  customerVisitDate: string; // YYYY-MM-DD
  customerVisitTime?: string; // e.g. 10:45 AM
  submittedAt?: string; // Formatted date and time of submission
  customerName: string; // Primary Owner / Customer contact name
  contactDesignation?: string; // e.g. Owner / Proprietor, Managing Director (MD), Partner, Workshop Supervisor, etc.
  mobileNumber: string;
  additionalContacts?: AdditionalContact[]; // Additional directors, supervisors, partners running unit
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

  currentBrand: string; // Competitor uPVC brand e.g. Kommerling, Prominance, Veka (joined string)
  currentBrands?: string[]; // Multiple competitor brands used simultaneously (e.g. 3 to 5 brands)
  quantityPerMonth: string; // e.g. "5 MT / Month", "1,200 Bars", "25 Tons"
  piSent: PISentStatus;
  leadStatus: LeadStatus;
  followUpDate: string; // YYYY-MM-DD
  visitRemarks: string;

  // Conversation Dialogue Logs & Custom Opinion Cards
  conversationLogs?: ConversationLog[];
  otherOpinionCards?: OtherOpinionCard[];

  // Multiple Visit & Workshop Photos
  photos?: VisitPhoto[];

  profileColor?: string;
  executiveEmail?: string;
  userId?: string;
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
