export interface StateDistrictMap {
  [state: string]: string[];
}

export const INDIAN_STATES: string[] = [
  'Gujarat',
  'Maharashtra',
  'Rajasthan',
  'Delhi',
  'Tamil Nadu',
  'Karnataka',
  'Uttar Pradesh',
  'Telangana',
  'West Bengal',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Andhra Pradesh',
  'Kerala',
  'Bihar',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Goa',
  'Assam',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Chandigarh',
];

export const POPULAR_DISTRICTS: { [key: string]: string[] } = {
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Morbi', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Vapi', 'Anand'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Bhiwandi', 'Jalgaon'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar'],
  Delhi: ['Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirupur', 'Erode', 'Vellore'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Shivamogga', 'Tumakuru'],
  'Uttar Pradesh': ['Noida', 'Ghaziabad', 'Kanpur', 'Lucknow', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Rangareddy', 'Medchal-Malkajgiri'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'North 24 Parganas'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal'],
};

export const CUSTOMER_TYPES = [
  'Fabricator',
  'Distributor',
  'Wholesaler',
  'Retailer',
  'Direct OEM',
  'Dealer',
  'Contractor',
  'Builder / Developer',
  'Other',
];

export const LEAD_STATUS_OPTIONS = [
  'Hot',
  'Warm',
  'Cold',
  'Won / Closed',
  'Lost',
];

/**
 * Primary uPVC Profile Brands: S CRAFT, SMART, OTHERS
 */
export const UPVC_BRANDS = [
  'S CRAFT',
  'SMART',
  'OTHERS',
] as const;

/**
 * uPVC Profile Series Options
 */
export const UPVC_SERIES_OPTIONS = [
  '60mm Casement Series (Windows & Doors)',
  '2.5 Track Sliding Series (With Mesh)',
  '3 Track Sliding Series (Heavy Duty)',
  '80mm Premium Sliding Profile',
  'Tilt & Turn Premium Systems',
  'Eco White Series (6m Bars)',
  'Laminated Woodgrain (Golden Oak / Walnut)',
  'Special Interlock & Reinforcement Sections',
  'All / Multiple Series',
  'Custom Profile Requirement',
];

/**
 * Backward compatibility alias
 */
export const DEFAULT_INTERESTED_BRANDS = UPVC_SERIES_OPTIONS;

export const UPVC_COMPETITOR_BRANDS = [
  'Kommerling',
  'Prominance',
  'NCL VEKA',
  'Deceuninck',
  'Aluplast',
  'Fenesta',
  'Simta Astrix',
  'Plastone',
  'Aparna Venster',
  'Dimex',
  'Local Extruder',
];

export const UPVC_COLOR_FINISHES = [
  'Classic White',
  'Golden Oak Laminated',
  'Walnut Laminated',
  'Dark Oak Laminated',
  'Anthracite Grey',
  'Mahogany',
];
