
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";

const chartConfig = {
  verduras: { label: "Verduras", color: "#22c55e" },
  frutas: { label: "Frutas", color: "#f59e0b" },
  legumes: { label: "Legumes", color: "#ef4444" },
  temperos: { label: "Temperos", color: "#8b5cf6" },
  tuberculos: { label: "Tubérculos", color: "#06b6d4" }
};

export function CategoryBreakdown() {
  const categoryData = [
    { name: "Verduras", value: 35, revenue: 3250, products: 12 },
    { name: "Frutas", value: 25, revenue: 2180, products: 8 },
    { name: "Legumes", value: 20, revenue: 1950, products: 10 },
    { name: "Temperos", value: 12, revenue: 1420, products: 6 },
    { name: "Tubérculos", value: 8, revenue: 890, products: 4 }
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Resumo das Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {categoryData.map((category, index) => (
              <div key={category.name} className="text-center p-4 border rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <h4 className="font-semibold">{category.name}</h4>
                <p className="text-sm text-muted-foreground">{category.products} produtos</p>
                <p className="text-lg font-bold">R$ {category.revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{category.value}% do total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
