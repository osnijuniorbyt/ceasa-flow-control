
export interface StockPrediction {
  productId: string;
  currentStock: number;
  depletionForecast: number; // days until depletion
  suggestedOrder: number;
  confidence: number; // 0-100
}

export interface AIOrderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  depletionDays: number;
  suggestedQuantity: number;
  reasoning: string[];
  historicalPattern: string;
  seasonalAlert?: string;
  priceAlert?: string;
  confidence: number;
}

export interface PricingSuggestion {
  productId: string;
  productName: string;
  realCostPerKg: number;
  suggestedSellingPrice: number;
  targetMargin: number;
  perishabilityFactor: number;
  marketConditions: string;
  competitorPrice?: number;
  profitProjection: number;
  marginAlert?: string;
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'market' | 'weather' | 'competition' | 'expiry' | 'opportunity';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  timestamp: string;
}

export interface PredictiveAnalytics {
  demandForecast: {
    date: string;
    expectedDemand: number;
    weatherFactor: number;
    confidence: number;
  }[];
  optimalOrderQuantities: {
    productId: string;
    quantity: number;
    timing: string;
  }[];
  bestSuppliers: {
    supplierId: string;
    product: string;
    reliability: number;
    priceCompetitiveness: number;
  }[];
}

export interface CommercialMetrics {
  dailyProfit: number;
  marginAnalysis: {
    productId: string;
    predictedMargin: number;
    actualMargin: number;
    variance: number;
  }[];
  salesPerformance: {
    productId: string;
    predicted: number;
    actual: number;
    accuracy: number;
  }[];
}
