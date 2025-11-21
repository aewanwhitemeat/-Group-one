import { MpesaTransaction, TransactionType } from "../types";

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safaricom Daraja API Simulation
 * Simulates interaction with M-PESA APIs for B2C and C2B transactions.
 */
export const DarajaAPI = {
  /**
   * B2C (Business to Customer) Payment
   * Used for disbursing loan funds to the farmer's M-PESA.
   */
  initiateB2CDisbursement: async (phoneNumber: string, amount: number): Promise<MpesaTransaction> => {
    console.log(`[Daraja API] Initiating B2C Disbursement of KES ${amount} to ${phoneNumber}`);
    await delay(2500); // Simulate network

    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (!isSuccess) {
      throw new Error("Daraja B2C Transaction Failed: Timeout or Insufficient Funds");
    }

    return {
      transactionId: `B2C-${Math.floor(Math.random() * 10000000)}`,
      type: TransactionType.DISBURSEMENT,
      status: 'COMPLETED',
      amount: amount,
      phoneNumber: phoneNumber,
      timestamp: new Date(),
      reference: 'AgriFlow Loan'
    };
  },

  /**
   * Lipa Na M-PESA Online (STK Push)
   * Used for "Lipa Mdogo Mdogo" repayments from the farmer.
   */
  triggerSTKPush: async (phoneNumber: string, amount: number): Promise<MpesaTransaction> => {
    console.log(`[Daraja API] Triggering STK Push for KES ${amount} to ${phoneNumber}`);
    await delay(3000); // Simulate user entering PIN

    // In a real app, this would return a CheckoutRequestID, and we would poll for status.
    // Here we simulate the callback directly.
    
    return {
      transactionId: `LNM-${Math.floor(Math.random() * 10000000)}`,
      type: TransactionType.REPAYMENT,
      status: 'COMPLETED',
      amount: amount,
      phoneNumber: phoneNumber,
      timestamp: new Date(),
      reference: 'Loan Repayment'
    };
  }
};

/**
 * Core Backend API Simulation
 * Simulates saving data to the database.
 */
export const BackendAPI = {
  loans: {
    // Simulate creating a loan record
    create: async (details: any) => {
      await delay(500);
      return { id: `LN-${Date.now()}`, status: 'CREATED' };
    },
    
    // Simulate updating loan balance
    updateBalance: async (loanId: string, payment: number) => {
      await delay(500);
      return { success: true, newBalance: 0 }; // Simplified
    }
  }
};
