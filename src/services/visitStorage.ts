import { CustomerVisit } from '../types/customerVisit';

const BASE_STORAGE_KEY = 'scraft_upvc_customer_visits_v3';
const EXECUTIVE_KEY = 'scraft_upvc_sales_executive_v3';

export const INITIAL_VISITS: CustomerVisit[] = [
  // Nagarjuna's 7 Telangana/Hyderabad Customer Visits
  {
    id: 'scraft-nag-101',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-24',
    customerName: 'K. Venkat Reddy',
    contactDesignation: 'Managing Partner',
    mobileNumber: '+91 94401 23456',
    additionalContacts: [
      {
        id: 'nag-c1-1',
        name: 'M. Ramesh',
        designation: 'Production Head',
        mobileNumber: '+91 94401 88990',
        notes: 'In-charge of double-head cutting & 3-axis CNC corner cleaning line',
      },
    ],
    companyName: 'Sri Balaji uPVC Window Systems',
    gstNumber: '36AABCS1234F1Z1',
    customerType: 'Fabricator',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Kukatpally Industrial Estate',
    customerAddress: 'Plot 55, IDA Phase II, Kukatpally, Hyderabad 500072',
    gpsLocationLink: 'https://www.google.com/maps?q=17.4933,78.4011',
    latitude: 17.4933,
    longitude: 78.4011,
    locationAccuracy: 10,
    gpsCapturedAt: '2026-10-24T10:30:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '2.5 Track Sliding Series (With Mesh)',
    interestedBrand: 'S CRAFT - 2.5 Track Sliding Series (With Mesh)',
    currentBrand: 'Kommerling, Prominance',
    currentBrands: ['Kommerling', 'Prominance'],
    quantityPerMonth: '6 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Hot',
    followUpDate: '2026-10-31',
    visitRemarks: 'Supplies high-rise gated community projects in Hitec City and Gachibowli. Very impressed with SCRAFT chamber wall thickness and UV stability test report. PI sent for 6 MT initial order.',
    createdAt: 1761298200000,
  },
  {
    id: 'scraft-nag-102',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-25',
    customerName: 'C. Srinivas Rao',
    contactDesignation: 'Proprietor',
    mobileNumber: '+91 98480 33445',
    additionalContacts: [
      {
        id: 'nag-c2-1',
        name: 'P. Anji Reddy',
        designation: 'Works Manager',
        mobileNumber: '+91 98480 55667',
        notes: 'Oversees fabrication & on-site installation team',
      },
    ],
    companyName: 'Deccan Fenestration Solutions',
    gstNumber: '36AAACD5678K1Z5',
    customerType: 'Fabricator',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Cherlapally IDA',
    customerAddress: 'Shed 18, Phase IV, Cherlapally Industrial Area, Hyderabad',
    gpsLocationLink: 'https://www.google.com/maps?q=17.4644,78.6012',
    latitude: 17.4644,
    longitude: 78.6012,
    locationAccuracy: 12,
    gpsCapturedAt: '2026-10-25T14:15:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '60mm Casement Series (Windows & Doors)',
    interestedBrand: 'S CRAFT - 60mm Casement Series (Windows & Doors)',
    currentBrand: 'NCL VEKA, Plastone',
    currentBrands: ['NCL VEKA', 'Plastone'],
    quantityPerMonth: '8 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Won / Closed',
    followUpDate: '2026-11-05',
    visitRemarks: 'Deal closed! Sample corner weld test passed. Advance token of 25% received for container consignment. Dispatch scheduled from plant.',
    createdAt: 1761398100000,
  },
  {
    id: 'scraft-nag-103',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-26',
    customerName: 'T. Prabhakar Gupta',
    contactDesignation: 'Managing Director',
    mobileNumber: '+91 99080 77661',
    companyName: 'Kakatiya uPVC Profile & Hardware Mart',
    gstNumber: '36AABPK9988H1Z2',
    customerType: 'Distributor',
    state: 'Telangana',
    district: 'Warangal',
    city: 'Warangal Urban',
    customerAddress: 'Station Road, Beside Flyover, Warangal 506002',
    gpsLocationLink: 'https://www.google.com/maps?q=17.9689,79.5941',
    latitude: 17.9689,
    longitude: 79.5941,
    locationAccuracy: 18,
    gpsCapturedAt: '2026-10-26T11:45:00.000Z',
    brand: 'SMART',
    interestedSeries: 'Laminated Woodgrain (Golden Oak / Walnut)',
    interestedBrand: 'SMART - Laminated Woodgrain (Golden Oak / Walnut)',
    currentBrand: 'Deceuninck, Simta Astrix',
    currentBrands: ['Deceuninck', 'Simta Astrix'],
    quantityPerMonth: '15 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Hot',
    followUpDate: '2026-11-02',
    visitRemarks: 'Key distributor supplying to 22 local window fabricators across Warangal, Karimnagar, and Khammam. Requested dealership agreement and sample display tower for showroom.',
    createdAt: 1761476700000,
  },
  {
    id: 'scraft-nag-104',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-26',
    customerName: 'Mohammed Irfan',
    contactDesignation: 'Owner / Partner',
    mobileNumber: '+91 98490 22334',
    companyName: 'Charminar Window Tech & Glass',
    gstNumber: '36AAZCI7711M1Z8',
    customerType: 'Fabricator',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Katedan Industrial Area',
    customerAddress: 'Plot 104, Tata Nagar, Katedan, Hyderabad 500077',
    gpsLocationLink: 'https://www.google.com/maps?q=17.3211,78.4355',
    latitude: 17.3211,
    longitude: 78.4355,
    locationAccuracy: 15,
    gpsCapturedAt: '2026-10-26T16:20:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '3 Track Sliding Series (Heavy Duty)',
    interestedBrand: 'S CRAFT - 3 Track Sliding Series (Heavy Duty)',
    currentBrand: 'Prominance, Aluplast',
    currentBrands: ['Prominance', 'Aluplast'],
    quantityPerMonth: '4 MT / Month',
    piSent: 'Under Preparation',
    leadStatus: 'Warm',
    followUpDate: '2026-11-03',
    visitRemarks: 'Discussed heavy gauge reinforcement and multi-point hardware fitment. Calculating freight cost from factory to Hyderabad warehouse. Quote under preparation.',
    createdAt: 1761493200000,
  },
  {
    id: 'scraft-nag-105',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-27',
    customerName: 'G. Vamshi Krishna',
    contactDesignation: 'Proprietor',
    mobileNumber: '+91 97000 88991',
    companyName: 'Telangana Prime Fenestrations',
    gstNumber: '36AAGTP4455N1ZK',
    customerType: 'Fabricator',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Uppal',
    customerAddress: 'Survey 48, Industrial Area, Uppal, Hyderabad 500039',
    gpsLocationLink: 'https://www.google.com/maps?q=17.4022,78.5619',
    latitude: 17.4022,
    longitude: 78.5619,
    locationAccuracy: 8,
    gpsCapturedAt: '2026-10-27T10:10:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '2.5 Track Sliding Series (With Mesh)',
    interestedBrand: 'S CRAFT - 2.5 Track Sliding Series (With Mesh)',
    currentBrand: 'Kommerling, NCL VEKA',
    currentBrands: ['Kommerling', 'NCL VEKA'],
    quantityPerMonth: '5 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Hot',
    followUpDate: '2026-11-04',
    visitRemarks: 'Has running project of 120 flats near Pocharam IT corridor. Tested corner weld strength and gasket sealing. PI sent for 5 MT consignment.',
    createdAt: 1761557400000,
  },
  {
    id: 'scraft-nag-106',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-27',
    customerName: 'B. Satyanarayana',
    contactDesignation: 'Managing Director',
    mobileNumber: '+91 98850 44556',
    companyName: 'Sri Venkateshwara uPVC Doors & Windows',
    gstNumber: '36AAVSD9922P1Z0',
    customerType: 'Fabricator',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Secunderabad',
    customerAddress: 'Old Bowenpally, Near Diamond Point, Secunderabad 500011',
    gpsLocationLink: 'https://www.google.com/maps?q=17.4722,78.4833',
    latitude: 17.4722,
    longitude: 78.4833,
    locationAccuracy: 14,
    gpsCapturedAt: '2026-10-27T14:40:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '60mm Casement Series (Windows & Doors)',
    interestedBrand: 'S CRAFT - 60mm Casement Series (Windows & Doors)',
    currentBrand: 'Plastone, Eurocell',
    currentBrands: ['Plastone', 'Eurocell'],
    quantityPerMonth: '3.5 MT / Month',
    piSent: 'Under Preparation',
    leadStatus: 'Warm',
    followUpDate: '2026-11-06',
    visitRemarks: 'Interested in white casement section with EPDM co-extruded gaskets. Sent physical hand samples for architectural consultant review.',
    createdAt: 1761573600000,
  },
  {
    id: 'scraft-nag-107',
    salesExecutiveName: 'nagarjuna',
    executiveEmail: 'nagarjuna@scraft.in',
    customerVisitDate: '2026-10-28',
    customerName: 'Syed Mansoor Ahmed',
    contactDesignation: 'Partner',
    mobileNumber: '+91 99890 11223',
    companyName: 'Golconda Profile Mart & Hardware',
    gstNumber: '36AAMGP3311L1Z9',
    customerType: 'Dealer',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Balanagar GIDC',
    customerAddress: 'Main Road, Balanagar Industrial Area, Hyderabad 500037',
    gpsLocationLink: 'https://www.google.com/maps?q=17.4688,78.4411',
    latitude: 17.4688,
    longitude: 78.4411,
    locationAccuracy: 11,
    gpsCapturedAt: '2026-10-28T09:30:00.000Z',
    brand: 'SMART',
    interestedSeries: 'Laminated Woodgrain (Golden Oak / Walnut)',
    interestedBrand: 'SMART - Laminated Woodgrain (Golden Oak / Walnut)',
    currentBrand: 'Prominance, NCL VEKA',
    currentBrands: ['Prominance', 'NCL VEKA'],
    quantityPerMonth: '10 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Won / Closed',
    followUpDate: '2026-11-10',
    visitRemarks: 'Second deal closed in Hyderabad! Deal signed for SMART laminated series. Transferred advance to Raviraja Industries corporate account.',
    createdAt: 1761641400000,
  },

  // Other Executive Visits (Gujarat, Maharashtra, Rajasthan, Tamil Nadu)
  {
    id: 'scraft-upvc-101',
    salesExecutiveName: 'Rajesh Patel',
    customerVisitDate: '2026-10-20',
    customerName: 'Suresh Shah',
    contactDesignation: 'Owner / Proprietor',
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
    gpsCapturedAt: '2026-10-20T11:00:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '2.5 Track Sliding Series (With Mesh)',
    interestedBrand: 'S CRAFT - 2.5 Track Sliding Series (With Mesh)',
    currentBrand: 'Prominance, Kommerling, NCL VEKA',
    currentBrands: ['Prominance', 'Kommerling', 'NCL VEKA'],
    quantityPerMonth: '5 MT / Month (800 Bars)',
    piSent: 'Yes',
    leadStatus: 'Hot',
    followUpDate: '2026-10-30',
    visitRemarks: 'Active window fabricator with 4-head welding machine. Tested SCRAFT 2.5 track corner strength and chamber wall thickness. Very satisfied. PI sent for initial 5 MT consignment.',
    createdAt: 1760954400000,
  },
  {
    id: 'scraft-upvc-102',
    salesExecutiveName: 'Rajesh Patel',
    customerVisitDate: '2026-10-21',
    customerName: 'Amit Verma',
    contactDesignation: 'Managing Director (MD)',
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
    gpsCapturedAt: '2026-10-21T15:30:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '60mm Casement Series (Windows & Doors)',
    interestedBrand: 'S CRAFT - 60mm Casement Series (Windows & Doors)',
    currentBrand: 'Kommerling, Aluplast, Deceuninck',
    currentBrands: ['Kommerling', 'Aluplast', 'Deceuninck'],
    quantityPerMonth: '8 MT / Month',
    piSent: 'Under Preparation',
    leadStatus: 'Warm',
    followUpDate: '2026-11-01',
    visitRemarks: 'Fabricator handles high-rise residential projects in Mumbai & Thane. Comparing SCRAFT 3-chamber casement pricing vs Kommerling. Preparing bulk container discount quote.',
    createdAt: 1761040800000,
  },
  {
    id: 'scraft-upvc-103',
    salesExecutiveName: 'Praveen Sharma',
    customerVisitDate: '2026-10-22',
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
    gpsCapturedAt: '2026-10-22T12:00:00.000Z',
    brand: 'SMART',
    interestedSeries: 'Laminated Woodgrain (Golden Oak / Walnut)',
    interestedBrand: 'SMART - Laminated Woodgrain (Golden Oak / Walnut)',
    currentBrand: 'NCL VEKA, Prominance, Plastone',
    currentBrands: ['NCL VEKA', 'Prominance', 'Plastone'],
    quantityPerMonth: '12 MT / Month',
    piSent: 'Yes',
    leadStatus: 'Won / Closed',
    followUpDate: '2026-11-08',
    visitRemarks: 'Deal closed! Fabricator approved trial order of SMART laminated profiles and white 60mm casement. Advance token transferred to Raviraja Industries.',
    createdAt: 1761127200000,
  },
  {
    id: 'scraft-upvc-104',
    salesExecutiveName: 'Karthik Raman',
    customerVisitDate: '2026-10-23',
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
    gpsCapturedAt: '2026-10-23T14:30:00.000Z',
    brand: 'S CRAFT',
    interestedSeries: '3 Track Sliding Series (Heavy Duty)',
    interestedBrand: 'S CRAFT - 3 Track Sliding Series (Heavy Duty)',
    currentBrand: 'Deceuninck, Simta Astrix, Prominance, Kommerling',
    currentBrands: ['Deceuninck', 'Simta Astrix', 'Prominance', 'Kommerling'],
    quantityPerMonth: '25 MT / Month',
    piSent: 'No',
    leadStatus: 'Warm',
    followUpDate: '2026-11-09',
    visitRemarks: 'Supplies to over 35 local window fabricators in Tamil Nadu. Requested sample corner displays for showroom. Follow-up meeting scheduled next week.',
    createdAt: 1761213600000,
  },
];

export class VisitStorageService {
  private static getStorageKey(userId?: string, role?: 'admin' | 'sales'): string {
    if (role === 'sales' && userId) {
      return `${BASE_STORAGE_KEY}_user_${userId}`;
    }
    return `${BASE_STORAGE_KEY}_admin_all`;
  }

  public static getVisits(userId?: string, role?: 'admin' | 'sales', userName?: string): CustomerVisit[] {
    const key = this.getStorageKey(userId, role);
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading scoped localStorage visits:', e);
    }

    // Default bootstrap data:
    // If sales role: return ONLY records matching this sales person
    if (role === 'sales') {
      const matching = INITIAL_VISITS.filter((v) => {
        if (!userName) return false;
        const normUser = userName.toLowerCase().trim();
        const normExec = (v.salesExecutiveName || '').toLowerCase().trim();
        return normExec === normUser || normExec.includes(normUser) || normUser.includes(normExec);
      });
      this.saveVisits(matching, userId, role);
      return matching;
    }

    // If Admin: returns all company visits
    this.saveVisits(INITIAL_VISITS, userId, role);
    return INITIAL_VISITS;
  }

  public static saveVisits(visits: CustomerVisit[], userId?: string, role?: 'admin' | 'sales'): void {
    const key = this.getStorageKey(userId, role);
    try {
      localStorage.setItem(key, JSON.stringify(visits));
    } catch (e) {
      console.error('Failed to save visits:', e);
    }
  }

  public static addVisit(visit: CustomerVisit, userId?: string, role?: 'admin' | 'sales'): CustomerVisit[] {
    const visits = this.getVisits(userId, role, visit.salesExecutiveName);
    const updated = [visit, ...visits];
    this.saveVisits(updated, userId, role);
    return updated;
  }

  public static updateVisit(updatedVisit: CustomerVisit, userId?: string, role?: 'admin' | 'sales'): CustomerVisit[] {
    const visits = this.getVisits(userId, role, updatedVisit.salesExecutiveName);
    const index = visits.findIndex((v) => v.id === updatedVisit.id);
    if (index !== -1) {
      visits[index] = updatedVisit;
      this.saveVisits(visits, userId, role);
    }
    return [...visits];
  }

  public static deleteVisit(id: string, userId?: string, role?: 'admin' | 'sales', userName?: string): CustomerVisit[] {
    const visits = this.getVisits(userId, role, userName);
    const updated = visits.filter((v) => v.id !== id);
    this.saveVisits(updated, userId, role);
    return updated;
  }

  public static batchImportVisits(newVisits: CustomerVisit[], userId?: string, role?: 'admin' | 'sales'): CustomerVisit[] {
    const current = this.getVisits(userId, role);
    const updated = [...newVisits, ...current];
    this.saveVisits(updated, userId, role);
    return updated;
  }

  public static getSalesExecutiveName(): string {
    return localStorage.getItem(EXECUTIVE_KEY) || 'nagarjuna';
  }

  public static setSalesExecutiveName(name: string): void {
    localStorage.setItem(EXECUTIVE_KEY, name);
  }

  /**
   * Purge local cached visits to prevent any cross-account data leak
   */
  public static clearSessionData(userId?: string): void {
    try {
      if (userId) {
        localStorage.removeItem(`${BASE_STORAGE_KEY}_user_${userId}`);
      }
      localStorage.removeItem(EXECUTIVE_KEY);
    } catch (e) {
      console.warn('Error clearing session data:', e);
    }
  }
}
