
interface ImpactSectionProps {
  potentialRevenue: number;
}

export function ImpactSection({ potentialRevenue }: ImpactSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Impacto</h4>
      <div className="text-sm">
        <div className="flex justify-between">
          <span>Receita potencial:</span>
          <span className={`font-medium ${
            potentialRevenue >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {potentialRevenue >= 0 ? '+' : ''}R$ {potentialRevenue}
          </span>
        </div>
      </div>
    </div>
  );
}
