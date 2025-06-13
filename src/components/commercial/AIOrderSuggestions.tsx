
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, CloudRain, TrendingUp, Users, CheckCircle } from "lucide-react";

export function AIOrderSuggestions() {
  const aiSuggestions = [
    {
      productId: "P002",
      productName: "Tomate grape",
      currentStock: 3,
      depletionDays: 0.8,
      suggestedQuantity: 50,
      reasoning: [
        "Estoque crítico - apenas 0.8 dias restantes",
        "Final de semana se aproximando (+40% demanda)",
        "Clima quente previsto (+25% consumo)",
        "Fornecedor confiável disponível"
      ],
      historicalPattern: "Sextas vendem 40% mais que outros dias",
      seasonalAlert: "Verão = pico de consumo de tomates",
      priceAlert: "Preço CEASA subiu 15% esta semana",
      confidence: 95
    },
    {
      productId: "P001",
      productName: "Alface hidroponica",
      currentStock: 15,
      depletionDays: 2.3,
      suggestedQuantity: 25,
      reasoning: [
        "Estoque para 2.3 dias baseado na tendência",
        "Segunda-feira próxima = demanda alta",
        "Produto perecível - renovação constante",
        "Margem boa mantida"
      ],
      historicalPattern: "Segundas e terças: +30% vendas",
      seasonalAlert: "Janeiro = dietas pós-festas ↑",
      confidence: 92
    },
    {
      productId: "P006",
      productName: "Batata doce branca",
      currentStock: 2,
      depletionDays: 1.2,
      suggestedQuantity: 35,
      reasoning: [
        "Estoque muito baixo - risco de ruptura",
        "Produto de alta rotação",
        "Concorrente sem estoque = oportunidade",
        "Preço estável no mercado"
      ],
      historicalPattern: "Fins de semana: demanda familiar +50%",
      priceAlert: "Concorrente A sem estoque - aproveitar",
      confidence: 91
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "bg-red-100 text-red-800";
    if (days <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sugestões Inteligentes de Pedidos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            IA analisou padrões, clima, concorrência e sazonalidade
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.productId} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{suggestion.productName}</h3>
                    <Badge className={getUrgencyColor(suggestion.depletionDays)}>
                      {suggestion.depletionDays.toFixed(1)} dias restantes
                    </Badge>
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {suggestion.confidence}% confiança
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Sugestão IA:</div>
                    <div className="text-2xl font-bold text-primary">
                      {suggestion.suggestedQuantity} kg
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Análise IA
                    </h4>
                    <ul className="space-y-1">
                      {suggestion.reasoning.map((reason, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Padrão Histórico</div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.historicalPattern}
                        </div>
                      </div>
                    </div>

                    {suggestion.seasonalAlert && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Alerta Sazonal</div>
                          <div className="text-sm text-muted-foreground">
                            {suggestion.seasonalAlert}
                          </div>
                        </div>
                      </div>
                    )}

                    {suggestion.priceAlert && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Alerta de Preço</div>
                          <div className="text-sm text-muted-foreground">
                            {suggestion.priceAlert}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">
                    Criar Pedido - {suggestion.suggestedQuantity} kg
                  </Button>
                  <Button variant="outline">
                    Ajustar Quantidade
                  </Button>
                  <Button variant="ghost">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
