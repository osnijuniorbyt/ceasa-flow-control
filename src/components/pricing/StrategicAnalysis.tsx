
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AnalysisCard } from "./AnalysisCard";
import { getStrategicAnalysisData } from "@/data/strategicAnalysisData";

export function StrategicAnalysis() {
  const analysisData = getStrategicAnalysisData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Estratégica de Precificação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análise detalhada considerando perecibilidade, concorrência e elasticidade de demanda
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analysisData.map((item) => (
              <AnalysisCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
