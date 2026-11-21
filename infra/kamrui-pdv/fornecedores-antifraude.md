# Roteiro para fornecedores — PDV Kamrui e Sentinela antifraude

Texto pronto para enviar por e-mail ou WhatsApp. Cada bloco vai para um fornecedor.

## Titan Software (PDV)
1. Que banco de dados o PDV Offline usa localmente? Podemos ter acesso somente de leitura para monitorar eventos?
2. Quais eventos ficam gravados com data, hora e operador: cancelamento de item e de cupom, desconto, mudança de preço, gaveta aberta sem venda, sangria, suprimento, item digitado à mão, reimpressão?
3. O PDV grava log em arquivo? Onde fica e em qual formato?
4. Existe API, webhook ou exportação em tempo real desses eventos?
5. O Titan já tem integração com câmeras ou gravador (enviar o texto do cupom para Hikvision)?
6. Cancelamento e desconto podem exigir senha de supervisor? O login é individual por operador?
7. O Titan suporta fechamento cego do caixa?
8. O PDV lê o sensor da gaveta pela impressora, registra as aberturas e bloqueia a venda com a gaveta aberta?
9. Qual é a integração com a balança de checkout Toledo Prix (modelo, conexão, leitura do peso)?
10. O relatório de cancelamentos por operador e o de itens por cupom podem ser exportados automaticamente (CSV)?

## Toledo do Brasil (balança)
1. A Prix 7T funciona como balança de caixa ligada ao PDV, mandando código do item + peso para o sistema? Ou só como etiquetadora e autoatendimento? Por qual conexão? Já foi integrada ao Titan Software?
2. Quando a IA sugere um item e o operador escolhe outro, a balança registra essa divergência (horário, operador, item sugerido x escolhido, foto)? Dá para exportar?
3. Ela guarda a foto de cada pesagem? Por quanto tempo, e dá para exportar?
4. Qual a taxa de acerto em folhas, maços e variedades parecidas (banana prata x nanica, laranja pera x lima)? Podem fazer uma demonstração com os nossos produtos?
5. O reconhecimento facial gera registro de quem pesou? Onde ficam os dados biométricos (LGPD)?
6. Funciona sem internet? O treinamento da IA fica na balança?
7. Aceita o nosso padrão de código de balança (EAN-13 prefixo 2, PLU normal e PLU de lote PR)?
8. Bloqueia peso digitado à mão e faz tara automática?
9. Preço, mensalidade da IA, prazo, garantia e assistência na região de Piracema/MG.

## Instalador de câmeras Hikvision (orçamento)
- 1 câmera IP dome AcuSense de 4 MP, varifocal motorizada (2,8–12 mm), infravermelho, WDR, H.265+, PoE. No teto do caixa, enquadrando balcão, balança e gaveta.
- 1 gravador Hikvision série I, 4 ou 8 canais PoE, **com função POS** (texto do PDV gravado no vídeo e busca por texto). Confirmar a função na ficha técnica do modelo.
- HD de 2 TB (cerca de 30 dias de gravação contínua de uma câmera, com folga para uma segunda).
- Exigências: receber texto por rede (TCP) do computador do caixa; demonstrar o texto **gravado** no vídeo, não só ao vivo; relógio pela internet (NTP); áudio desligado; reconhecimento facial desligado.
- Orçamento opcional (fase de escala): olho de peixe com mapa de calor (linha DS-2CD63C5G1), câmera de duas lentes para contagem na entrada, dome com detecção de fila, câmera PoE ColorVu para o depósito.
- Placa de aviso de monitoramento (LGPD).

## Câmera da balança (compra direta)
Raspberry Pi AI Camera (RoboCore), Raspberry Pi 5 de 4 GB, fonte oficial de 27 W, microSD High Endurance de 64 GB, caixa oficial com ventoinha, cabo flat de 30–50 cm, suporte articulado, barra de LED branco neutro (4000–5000 K), switch pequeno e cabos de rede.
