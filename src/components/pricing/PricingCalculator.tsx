
interface SimulationResult {
  newPrice: number;
  margin: number;
  revenueChange: number;
  unitsSoldChange: number;
  totalProfit: number;
  breakEvenUnits: number;
}

interface CalculationParams {
  currentPrice: number;
  cost: number;
  currentUnits: number;
  targetPrice: number;
  priceElasticity: number;
}

export const calculatePricingSimulation = ({
  currentPrice,
  cost,
  currentUnits,
  targetPrice,
  priceElasticity
}: CalculationParams): SimulationResult => {
  const newPrice = targetPrice;
  const priceChangePercent = (newPrice - currentPrice) / currentPrice;
  const demandChangePercent = -priceElasticity * priceChangePercent;
  const newUnits = Math.max(0, currentUnits * (1 + demandChangePercent));
  
  const margin = ((newPrice - cost) / newPrice) * 100;
  const currentRevenue = currentPrice * currentUnits;
  const newRevenue = newPrice * newUnits;
  const revenueChange = ((newRevenue - currentRevenue) / currentRevenue) * 100;
  
  const currentProfit = (currentPrice - cost) * currentUnits;
  const newProfit = (newPrice - cost) * newUnits;
  const totalProfit = newProfit - currentProfit;
  
  const breakEvenUnits = cost > 0 ? Math.ceil(currentUnits * currentPrice / newPrice) : 0;

  return {
    newPrice,
    margin,
    revenueChange,
    unitsSoldChange: ((newUnits - currentUnits) / currentUnits) * 100,
    totalProfit,
    breakEvenUnits
  };
};
