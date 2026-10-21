import { CustomerVisit } from '../types/customerVisit';

const STORAGE_KEY = 'scraft_upvc_customer_visits_v2';
const EXECUTIVE_KEY = 'scraft_upvc_sales_executive_v2';

export const INITIAL_VISITS: CustomerVisit[] = [
  {
    id: 'scraft-upvc-101',
    salesExecutiveName: 'Rajesh Patel',
    customerVisitDate: new Date().toISOString().split('T')[0],
    customerName: 'Suresh Shah',
    mobileNumber: '+91 98250 12345',
    companyName: 'Apex Window Fabricators & uPVC Systems',
    gstNumber: '24AAACA1234F1Z2',
    customerType: 'Fabricator',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ahmedabad GIDC',
    customerAddress: 'Plot 42, GIDC Phase IV, Vatva Industrial Estate',
    gpsLocationLink: 'https://www.google.com/maps?q=22.956600,72.632200',
    latitude: 22.9566,
    longitude: 72.6322,
    locationAccuracy: 12,
    gpsCapturedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    brand: 'S CRAFT',
    interestedSeries: '2.5 Track Sliding Series (With Mesh)',
    interestedBrand: 'S CRAFT - 2.5 Track Sliding Series (With Mesh)',
    currentBrand: 'Prominance uPVC',
    quantityPerMonth: '5 MT / Month (800 Bars)',
    piSent: 'Yes',
    leadStatus: 'Hot',
    followUpDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    visitRemarks: 'Active window fabricator with 4-head welding machine. Tested SCRAFT 2.5 track corner strength and chamber wall thickness. Very satisfied. PI sent for initial 5 MT consignment.',
    createdAt: Date.now() - 3600 * 1000,
  },
  {
    id: 'scraft-upvc-102',
    salesExecutiveName: 'Rajesh Patel',
    customerVisitDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    customerName: 'Amit Verma',
    mobileNumber: '+91 98920 44556',
    companyName: 'Maharshi Fenestrations & Doors',
    gstNumber: '27AABCM5678K1Z9',
    customerType: 'Fabricator',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Bhiwandi',
    customerAddress: 'Shed 12, Jai Matadi Industrial Complex, Kalher, Bhiwandi',
    gpsLocationLink: 'https://www.google.com/maps?q=19.264400,73.042500',
    latitude: 19.2644,
    longitude: 73.0425,
    locationAccuracy: 18,
    gpsCapturedAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    brand: 'S CRAFT',
    interestedSeries: '60mm Casement Series (Windows & Doors)',
    interestedBrand: 'S CRAFT - 60mm Casement Series (Windows & Doors)',
    currentBrand: 'Kommerling',
    quantityPerMonth: '8 MT / Month',
    piSent: 'Under Preparation',
    leadStatus: 'Warm',
    followUpDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    visitRemarks: 'Fabricator handles high-rise residential projects in Mumbai & Thane. Comparing SCRAFT 3-chamber casement pricing vs Kommerling. Preparing bulk container discount quote.',
    createdAt: Date.now() - 25 * 3600 * 1000,
  },
  {
    id: 'scraft-upvc-103',
    salesExecutiveName: 'Praveen Sharma',
    customerVisitDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    customerName: 'Deepak Joshi',
    mobileNumber: '+91 94140 78901',
    companyName: 'Shree Radhey uPVC Profile Fabricators',
    gstNumber: '08AAECS9876J1Z4',
    customerType: 'Fabricator',
    state: 'Rajasthan',
    district: 'Jaipur',
    city: 'VKIA Jaipur',
    customerAddress: 'Road No. 9, Vishwakarma Industrial Area',
    gpsLocationLink: 'https://www.google.com/maps?q=26.974400,75.768100',
    latitude: 26.9744,
    longitude: 75.7681,
    locationAccuracy: 15,
    gpsCapturedAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    brand: 'SMART',
    interestedSeries: 'Laminated Woodgrain (Golden Oak / Walnut)',
    interestedBrand: 'SMART - Laminated Woodgrain (Golden Oak / Walnut)',
    currentBrand: 'NCL VEKA',
    quantityPerMonth: '12 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Won / Closed',
    followUpDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    visitRemarks: 'Deal closed! Fabricator approved trial order of SMART laminated profiles and white 60mm casement. Advance token transferred to Raviraja Industries.',
    createdAt: Date.now() - 50 * 3600 * 1000,
  },
  {
    id: 'scraft-upvc-104',
    salesExecutiveName: 'Karthik Raman',
    customerVisitDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
    customerName: 'M. Senthil Kumar',
    mobileNumber: '+91 98400 99881',
    companyName: 'Southern uPVC Profile Distributors',
    gstNumber: '33AABCS4321D1ZO',
    customerType: 'Distributor',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Ambattur',
    customerAddress: 'Ambattur Industrial Estate, Chennai 600058',
    gpsLocationLink: 'https://www.google.com/maps?q=13.098800,80.162400',
    latitude: 13.0988,
    longitude: 80.1624,
    locationAccuracy: 22,
    gpsCapturedAt: new Date(Date.now() - 75 * 3600 * 1000).toISOString(),
    brand: 'S CRAFT',
    interestedSeries: '3 Track Sliding Series (Heavy Duty)',
    interestedBrand: 'S CRAFT - 3 Track Sliding Series (Heavy Duty)',
    currentBrand: 'Deceuninck',
    quantityPerMonth: '25 MT / Month',
    piSent: 'No',
    leadStatus: 'Warm',
    followUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    visitRemarks: 'Supplies to over 35 local window fabricators in Tamil Nadu. Requested sample corner displays for showroom. Follow-up meeting scheduled next week.',
    createdAt: Date.now() - 75 * 3600 * 1000,
  },
];

export class VisitStorageService {
  public static getVisits(): CustomerVisit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveVisits(INITIAL_VISITS);
        return INITIAL_VISITS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VISITS;
    }
  }

  public static saveVisits(visits: CustomerVisit[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch (e) {
      console.error('Failed to save visits:', e);
    }
  }

  public static addVisit(visit: CustomerVisit): CustomerVisit[] {
    const visits = this.getVisits();
    const updated = [visit, ...visits];
    this.saveVisits(updated);
    return updated;
  }

  public static updateVisit(updatedVisit: CustomerVisit): CustomerVisit[] {
    const visits = this.getVisits();
    const index = visits.findIndex((v) => v.id === updatedVisit.id);
    if (index !== -1) {
      visits[index] = updatedVisit;
      this.saveVisits(visits);
    }
    return [...visits];
  }

  public static deleteVisit(id: string): CustomerVisit[] {
    const visits = this.getVisits();
    const updated = visits.filter((v) => v.id !== id);
    this.saveVisits(updated);
    return updated;
  }

  public static batchImportVisits(newVisits: CustomerVisit[]): CustomerVisit[] {
    const visits = this.getVisits();
    const existingIds = new Set(visits.map((v) => v.id));
    const toAdd = newVisits.filter((v) => !existingIds.has(v.id));
    const combined = [...toAdd, ...visits];
    this.saveVisits(combined);
    return combined;
  }

  public static getSalesExecutiveName(): string {
    return localStorage.getItem(EXECUTIVE_KEY) || 'Raviraja uPVC Sales Executive';
  }

  public static setSalesExecutiveName(name: string): void {
    localStorage.setItem(EXECUTIVE_KEY, name);
  }

  public static resetToDemo(): CustomerVisit[] {
    this.saveVisits(INITIAL_VISITS);
    return INITIAL_VISITS;
  }
}
