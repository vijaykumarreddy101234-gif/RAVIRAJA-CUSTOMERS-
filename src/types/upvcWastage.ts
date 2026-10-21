export interface UPVCCutItem {
  id: string;
  profileName: string; // e.g. "Outer Frame 60mm", "Sliding Track 2.5", "Sash 60mm"
  lengthMm: number; // Cut length in mm (e.g. 1450)
  quantity: number; // e.g. 4
  angle: '45/45' | '90/90' | '45/90';
  tag?: string; // e.g. "W1 Frame Top/Bottom", "W1 Sash Height"
}

export interface StockBarCut {
  cutId: string;
  profileName: string;
  lengthMm: number;
  tag?: string;
  angle: string;
}

export interface OptimizedBar {
  barIndex: number;
  stockLengthMm: number;
  cuts: StockBarCut[];
  usedMm: number;
  kerfLossMm: number;
  remnantMm: number;
  wastagePercentage: number;
  isReusableRemnant: boolean; // Remnant >= minimum reusable threshold (e.g. 800mm)
}

export interface WastageSummary {
  totalBarsRequired: number;
  stockBarLengthMm: number;
  totalStockLengthMeters: number;
  totalCutLengthMeters: number;
  totalWastageMeters: number;
  totalKerfLossMeters: number;
  wastagePercentage: number;
  totalPiecesCut: number;
  reusableRemnantsCount: number;
  reusableRemnantsMeters: number;
  pureScrapMeters: number;
  estimatedWeightKg: number;
  estimatedWastageKg: number;
  estimatedCostLossInr: number;
}

export interface UPVCWastageProject {
  id: string;
  projectName: string;
  customerName?: string;
  stockLengthMm: number; // default 6000
  kerfMm: number; // default 4
  weldingAllowanceMm: number; // default 3
  profileWeightKgPerM: number; // default 1.2
  costPerKgInr: number; // default 190
  reusableThresholdMm: number; // default 800
  cuts: UPVCCutItem[];
  optimizedBars: OptimizedBar[];
  summary: WastageSummary;
  createdAt: number;
  updatedAt: number;
  createdByEmail?: string;
}
