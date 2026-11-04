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
  designation: string;
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
  dataUrl: string;
  caption?: string;
  capturedAt?: string;
}

export interface CustomerVisit {
  id: string;
  salesExecutiveName: string;
  customerVisitDate: string;
  customerVisitTime?: string;
  submittedAt?: string;
  customerName: string;
  contactDesignation?: string;
  mobileNumber: string;
  additionalContacts?: AdditionalContact[];
  companyName: string;
  customerType: CustomerType;
  gstNumber?: string;
  state: string;
  district: string;
  city: string;
  customerAddress: string;
  gpsLocationLink?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  gpsCapturedAt?: string;
  brand?: UPVCBrand;
  interestedSeries?: string;
  interestedBrand: string;
  currentBrand: string;
  currentBrands?: string[];
  quantityPerMonth: string;
  piSent: PISentStatus;
  leadStatus: LeadStatus;
  followUpDate: string;
  followUpRequired?: 'Yes' | 'No';
  followUpDiscussion?: string;
  followUpStatus?: 'Pending' | 'Completed' | 'Rescheduled' | 'Cancelled';
  branchLocations?: Array<{ id: string; name: string; address: string; city: string; state: string }>;
  visitRemarks: string;
  conversationLogs?: ConversationLog[];
  otherOpinionCards?: OtherOpinionCard[];
  photos?: VisitPhoto[];
  profileColor?: string;
  executiveEmail?: string;
  userId?: string;
  customerId?: string;
  visitId?: string;
  visitingCardPhoto?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  pinCode?: string;

  // New specific cards from screenshots
  conversionCard?: {
    status: LeadStatus;
    targetBrand: UPVCBrand;
    expectedTonnage: string;
    dealValue: string;
    probability: string;
  };
  opinionCard?: {
    pricingOpinion: string;
    qualityChambers: string;
    competitorOpinion: string;
    customerInterestSeries: string;
    qualityWallThickness: string;
    priceCreditTerms: string;
  };

  conversionRemarks?: string;
  opinionRemarks?: string;

  assignedSalesperson?: string;
  createdAt: number;
  updatedAt?: number;
}
