
import { Target } from "lucide-react";

interface RecommendationPanelProps {
  recommendation: string;
}

export function RecommendationPanel({ recommendation }: RecommendationPanelProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-3">
      <div className="flex items-start gap-2">
        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-blue-800">Recomendação Estratégica</div>
          <div className="text-sm text-blue-700 mt-1">{recommendation}</div>
        </div>
      </div>
    </div>
  );
}
