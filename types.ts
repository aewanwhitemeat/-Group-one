import { SchemaType } from "@google/genai";

export interface FarmerProfile {
  farmerName: string;
  mpesaNumber: string;
  location: string;
  farmType: 'Crops' | 'Livestock' | 'Mixed';
  specificProduce: string; // e.g., "Irish Potatoes", "Chicken", "Maize"
  farmSize: number; // Acres or Head count
  cycleStage: 'Planting' | 'Growth' | 'Harvesting';
  requestedAmount: number; // KES
  previousYieldHistory: string; // Self-reported previous harvest
}

export interface LoanAssessmentResult {
  approved: boolean;
  creditScore: number; // 0-1000
  approvedAmount: number;
  interestRate: number;
  repaymentDate: string; // Estimated harvest date
  riskAnalysis: {
    weatherRisk: string;
    marketRisk: string;
    pestDiseaseRisk: string;
  };
  projectedRevenue: number;
  recommendation: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingResult {
  verificationText: string;
  sources: GroundingSource[];
  confidence: 'Verified' | 'Contradicted' | 'Unverified';
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LOAN_APPLICATION = 'LOAN_APPLICATION',
  MARKET_INTEL = 'MARKET_INTEL',
}

export enum TransactionType {
  DISBURSEMENT = 'DISBURSEMENT', // B2C: Business paying Farmer
  REPAYMENT = 'REPAYMENT'        // C2B: Farmer paying Business (Lipa Mdogo Mdogo)
}

export enum LoanStage {
  APPLICATION = 'APPLICATION',
  ASSESSING = 'ASSESSING',
  REVIEW = 'REVIEW',
  DISBURSING = 'DISBURSING',
  ACTIVE = 'ACTIVE',
  REPAYING = 'REPAYING',
  COMPLETED = 'COMPLETED'
}

export interface MpesaTransaction {
  transactionId: string;
  type: TransactionType;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  phoneNumber: string;
  timestamp: Date;
  reference: string;
}
