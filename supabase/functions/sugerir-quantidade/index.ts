import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { produtoId } = await req.json();

    if (!produtoId) {
      return new Response(
        JSON.stringify({ error: "produtoId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do produto
    const { data: produto, error: produtoError } = await supabase
      .from("produtos")
      .select("codigo, descricao, unidade_venda")
      .eq("id", produtoId)
      .single();

    if (produtoError || !produto) {
      return new Response(
        JSON.stringify({ error: "Produto não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar histórico de compras deste produto (últimas 20 listas)
    const { data: historico, error: historicoError } = await supabase
      .from("itens_lista_compras")
      .select(`
        quantidade,
        quantidade_real,
        comprado,
        created_at,
        listas_compras!inner(data_compra, status)
      `)
      .eq("produto_id", produtoId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (historicoError) {
      console.error("Erro ao buscar histórico:", historicoError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar histórico" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se não há histórico, retornar sugestão padrão
    if (!historico || historico.length === 0) {
      return new Response(
        JSON.stringify({
          quantidade_sugerida: null,
          confianca: "baixa",
          explicacao: "Sem histórico de compras para este produto. Sugira uma quantidade baseada na sua experiência.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chamar Lovable AI para análise inteligente
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const historicoFormatado = historico.map((item: any) => ({
      quantidade_prevista: item.quantidade,
      quantidade_real: item.quantidade_real || item.quantidade,
      foi_comprado: item.comprado,
      data_compra: item.listas_compras?.data_compra,
      status_lista: item.listas_compras?.status,
    }));

    const prompt = `Analise o histórico de compras do produto "${produto.descricao}" (unidade: ${produto.unidade_venda}) e sugira a quantidade ideal para a próxima compra.

Histórico das últimas compras:
${JSON.stringify(historicoFormatado, null, 2)}

Considere:
1. Média das quantidades reais compradas
2. Tendência (está aumentando ou diminuindo?)
3. Sazonalidade (datas das compras)
4. Itens que não foram comprados (demanda baixa)

Retorne APENAS um JSON com esta estrutura exata:
{
  "quantidade_sugerida": número,
  "confianca": "alta" | "media" | "baixa",
  "explicacao": "breve explicação do cálculo em português, máximo 100 caracteres"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em análise de padrões de compra e sugestões de quantidades. Sempre retorne JSON válido.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "sugerir_quantidade",
              description: "Retorna sugestão de quantidade baseada em histórico",
              parameters: {
                type: "object",
                properties: {
                  quantidade_sugerida: { type: "number", description: "Quantidade sugerida" },
                  confianca: { type: "string", enum: ["alta", "media", "baixa"] },
                  explicacao: { type: "string", description: "Breve explicação" },
                },
                required: ["quantidade_sugerida", "confianca", "explicacao"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "sugerir_quantidade" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await aiResponse.text();
      console.error("Erro AI Gateway:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("Resposta da IA inválida");
    }

    const sugestao = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(sugestao),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
