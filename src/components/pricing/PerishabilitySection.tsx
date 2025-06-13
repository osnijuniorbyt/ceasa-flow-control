
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar } from "lucide-react";

interface PerishabilityProps {
  score: number;
  daysToExpiry: number;
}

export function PerishabilitySection({ score, daysToExpiry }: PerishabilityProps) {
  const getPerishabilityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Perecibilidade
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Score:</span>
          <span className={`font-medium ${getPerishabilityColor(score)}`}>
            {score}%
          </span>
        </div>
        <Progress value={score} className="h-2" />
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">{daysToExpiry} dias para vencer</span>
        </div>
      </div>
    </div>
  );
}
