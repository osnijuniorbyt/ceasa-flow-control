# Plano Mestre — PDV Kamrui + Sentinela Antifraude (Mapa Axial OPE)

## Contexto
**Propósito:** transformar o caixa da Hortii Campos (Mini PC Kamrui + Titan PDV + balança de checkout embutida) num PDV blindado, com antifraude inteligente. O Claude faz todo o TI e o Osni não executa comandos.
**Decisão que este mapa informa:** o que fazer, em que ordem, quem faz e o que depende do quê, da instalação até a escala para franquias.
**Base já pronta:** os scripts de setup do Kamrui estão em `infra/kamrui-pdv/` (PR #2, sintaxe validada) e o documento de passagem em `PASSAGEM.md`. As pesquisas de antifraude e câmeras foram feitas nesta conversa.
**Decisões tomadas:** Titan no PDV. Pesagem sempre no caixa. Claude no Kamrui pelo Remote Control. Câmeras Hikvision (profissionais, com cabo de rede). **Raspberry Pi AI Camera sobre a balança.** Gatilho da foto pelo teclado em tempo real. Áudio desligado.

---

## 1. Mapa axial (espaço OPE)

```
NÍVEL (Z)
  ▲
  │ 3 ESCALA      E1 IA treinada na câmera · E2 IA mista · E3 BI de câmeras
  │               E4 Depósito com IA · E5 Padrão para multi-caixa e franquia
  │
  │ 2 OTIMIZAÇÃO  O1 Montar câmera IA · O2 Captura pelo teclado · O3 IA na nuvem + regras + relatório
  │               O4 Leitura do Titan · O5 CFTV Hikvision · O6 Indicadores de exceção
  │
  │ 1 FUNDAÇÃO    F1 Acesso remoto · F2 Blindagem (touch) · F3 Usuários e pastas
  │               F4 Titan + periféricos · F5 Prevenção no Titan · F6 LGPD/termo · F7 Fornecedores
  └────────────────────────────────────────────────► CAMADA (X)
        O Organizar        P Planejar          E Executar
       (o que existe)     (como fazer)        (fazer e verificar)

DIMENSÃO (Y): Macro = o projeto · Micro = setor/processo/procedimento · Execução = cada tarefa
Setores (Micro O): Frente de Caixa · Antifraude (Sentinela) · CFTV · Depósito · TI/Acesso
```

### Inventário classificado (coordenada · quem faz · depende de)
| ID | Item | Coordenada | Quem | Depende de |
|---|---|---|---|---|
| F1 | Acesso: Claude Desktop + Remote Control, AnyDesk como serviço, Tailscale, SSH | [Micro TI, E, Fundação] | Osni (15 min) → Claude | — |
| F2 | Blindagem: tela touch, energia, USB, Windows Update (`04-blindagem.ps1`) | [Micro Caixa, E, Fundação] | Claude | F1 |
| F3 | Usuários TI_Admin/Caixa_01, pastas e permissões (`02`, `03`) | [Micro TI, E, Fundação] | Claude (Osni digita as senhas) | F1 |
| F4 | Titan PDV + balança Prix de checkout, leitor, impressora USB, gaveta Elgin, teclado Smart 44 mapeado, teclado virtual (`05`) | [Micro Caixa, E, Fundação] | Suporte Titan + Claude | F3 |
| F5 | Prevenção no Titan: login individual, senha de supervisor para cancelar e dar desconto, fechamento cego, sangria, gaveta só com venda | [Micro Caixa, P→E, Fundação] | Suporte Titan (checklist do Claude) | F4, F7 |
| F6 | Termo de ciência assinado (câmeras e teclado), placas LGPD, áudio desligado | [Micro Antifraude, P, Fundação] | Osni | — |
| F7 | Roteiro de perguntas enviado a Titan, Toledo e instalador | [Macro, O, Fundação] | Osni envia (texto pronto) | — |
| O1 | Comprar e ligar Raspberry Pi 5 + AI Camera + luz + suporte + switch | [Micro Antifraude, E, Otimização] | Osni compra e liga · Claude configura | F1, F6 |
| O2 | Captura: gatilho pelo teclado (tecla Smart, PLU+Enter, nome, leitor, cancelar), memória de 5 s, foto + print no cancelamento, origem do item | [Micro Antifraude, E, Otimização] | Claude | F4, O1 |
| O3 | Piloto com IA na nuvem + regras (certeza, prejuízo) + relatório às 7h + alerta silencioso ao gerente | [Micro Antifraude, E, Otimização] | Claude | O2 |
| O4 | Leitura do Titan (banco → log → texto da tela → OCR) para confirmar o item cobrado | [Micro Antifraude, O→E, Otimização] | Claude | F4, F7 |
| O5 | CFTV: dome AcuSense no teto do caixa + gravador série I com função POS + HD 2 TB. Script manda os eventos ao gravador | [Micro CFTV, E, Otimização] | Instalador + Claude | F6 |
| O6 | Indicadores diários por operador: cancelamentos, itens/cupom, digitados à mão, gaveta sem venda, quebra de caixa | [Micro Antifraude, E, Otimização] | Claude | O2, O4 |
| E1 | Modelo treinado com as fotos etiquetadas, rodando dentro da AI Camera, com aviso em tempo real na tela | [Micro Antifraude, E, Escala] | Claude | O3 (semanas de fotos) |
| E2 | IA mista: modelo local decide, nuvem dá a segunda opinião antes do alerta | [Micro Antifraude, P, Escala] | Claude | E1 |
| E3 | BI de câmeras: olho de peixe com mapa de calor, contagem na entrada (conversão), fila | [Micro CFTV, E, Escala] | Instalador + Claude | O5 |
| E4 | Depósito: câmera Hikvision PoE ColorVu + IA (recebimento, alerta fora de horário) | [Micro Depósito, E, Escala] | Instalador + Claude | O5 |
| E5 | Padrão replicável: imagem do Kamrui (scripts), kit de câmera, painel central. Visão 3D/volume avaliada aqui | [Macro, P, Escala] | Claude | E1, E3 |

### Dependências (onde trava)
```
F1 ─┬─► F2
    └─► F3 ─► F4 ─┬─► F5 ◄── F7
                  ├─► O4 ◄── F7
                  └─► O2 ◄── O1 ◄── F6
                       └─► O3 ─┬─► O6 ◄── O4
                               └─► E1 ─► E2 ─► E5
F6 ─► O5 ─┬─► E3 ─► E5
          └─► E4
```
**Gargalo único da Fundação: F1.** Sem acesso ao Kamrui, nada anda.

---

## 2. Passo a passo (instalação → configuração)

### Fase 0 — Acesso (Osni, ~15 min, pelo AnyDesk de fora) · F1
1. Escolher **uma conta Claude** para ser o TI (a pessoal ou a corporativa) e usar sempre ela.
2. No Kamrui: instalar o Claude Desktop (`claude.ai/download`) e entrar nessa conta.
3. Botão direito no Claude Desktop → **Executar como administrador**.
4. **Settings → Claude Code → Remote Control**: ligar e adicionar a pasta `C:\Hortii`.
5. Avisar o Claude e tocar em **Permitir**. Plano B, se o Remote Control não aparecer: colar 1 comando no PowerShell como administrador (está no README).
**Verificação:** o Claude lista e conecta a pasta do Kamrui.

### Fase 1 — Blindagem e acessos permanentes (Claude, ~1 dia) · F2, F1, F3
1. `04-blindagem.ps1` **primeiro** (corrige a tela touch).
2. `01-acessos.ps1`: AnyDesk como serviço, Tailscale, SSH, Git. **Osni:** aprova o link do Tailscale e digita a senha do AnyDesk.
3. `02-usuarios.ps1` + `03-pastas-acl.ps1`. **Osni:** digita a senha nova do TI_Admin.
4. `06-claude-code-ti.ps1`: Claude Code no TI_Admin (caminho que sobrevive a reinícios).
**Verificação:** `verificar.ps1` todo OK, e 30 min parado sem a tela apagar.

### Fase 2 — Titan e periféricos (suporte Titan + Claude, 1–3 dias) · F4, F7
1. **Osni:** envia o roteiro de perguntas à Titan, à Toledo e ao instalador (F7).
2. O suporte Titan instala o PDV em `C:\Titan_PDV` pelo AnyDesk e homologa balança, leitor, impressora e gaveta.
3. **Claude:** atalho de inicialização do Caixa_01, auto-logon e teclado virtual (`05`). Testa o sensor da gaveta Elgin pela impressora.
4. **Teclado Smart 44:** o Osni informa o modelo, e o Claude programa as teclas (código Titan + Enter) e preenche `mapa-teclado.csv`.
**Verificação:** venda de teste completa. Reinício: o Caixa_01 entra sozinho e o Titan abre.

### Fase 3 — Prevenção e LGPD (Osni + suporte Titan, ~1 semana) · F5, F6
1. Com o suporte Titan, seguindo o checklist do Claude: login individual, senha de supervisor (cancelar, desconto, preço), fechamento cego, sangria acima de um valor, gaveta só com venda.
2. **Osni:** termo de ciência assinado pelos funcionários (câmeras, foto da balança, teclado) e placas visíveis.
**Verificação:** um operador tenta cancelar sem supervisor e o Titan bloqueia.

### Fase 4 — Compras (Osni) · O1
Raspberry Pi AI Camera (RoboCore), Raspberry Pi 5 de 4 GB, fonte oficial de 27 W, microSD High Endurance de 64 GB, caixa com ventoinha, cabo flat de 30–50 cm, suporte articulado + barra de LED neutra, switch pequeno + cabos de rede. Câmeras Hikvision: orçamento com o instalador (O5).
**Osni:** só liga a Raspberry na tomada e no cabo de rede.

### Fase 5 — Sentinela piloto (Claude, 2–4 semanas de coleta) · O1, O2, O3, O4, O6
1. Raspberry no Tailscale. Calibrar foco, luz e enquadramento do prato. Teste de nitidez e cor com produtos reais.
2. Script de gatilho no Kamrui, na sessão do Caixa_01, com vigia que religa, liberado no Defender. Ignora campos de senha.
3. Cada item gera foto + origem (Smart, PLU, leitor, à mão) + hora. O cancelamento gera foto + print da tela.
4. IA na nuvem confere foto x item. Regras de certeza e prejuízo. Relatório às 7h. Alerta silencioso ao gerente para valor alto.
5. Ler o Titan (O4) assim que a Titan responder, para confirmar o item cobrado.
**Verificação:** 1 semana de relatórios com taxa de alarme falso aceitável. As fotos ficam etiquetadas para o treino.

### Fase 6 — CFTV Hikvision (instalador + Claude) · O5
O instalador coloca a dome AcuSense no teto do caixa e o gravador série I com POS. O Claude acerta o relógio (NTP), integra o script ao gravador e testa a busca por "CANCEL".
**Verificação:** um cancelamento aparece escrito no vídeo gravado (não só ao vivo).

### Fase 7 — Escala · E1–E5
O Claude treina o modelo com as fotos, carrega na AI Camera e liga o aviso em tempo real. Depois vêm a IA mista e as câmeras de BI (mapa de calor, conversão, fila), o depósito e o pacote padrão para novos caixas e franquias.

---

## 3. A VERIFICAR (não inventar)
- Remote Control liberado na conta escolhida.
- Qual banco, log ou tela do Titan é legível. Se a Titan libera leitura.
- Modelo e software do teclado Smart 44. Modelo da gaveta Elgin e se ela tem sensor.
- Portas USB livres no Kamrui. Rede e internet da loja (roteador, onde fica o switch).
- Modelos Hikvision à venda no Brasil. Preço dos itens além da câmera RoboCore.

## 4. Execução após a aprovação (nesta sessão)
1. Publicar o **mapa axial visual** (página interativa com as 3 dimensões, os itens por nível, as dependências e o passo a passo).
2. Salvar este plano em `infra/kamrui-pdv/PLANO-MESTRE.md` e o roteiro de fornecedores em `infra/kamrui-pdv/fornecedores-antifraude.md`. Atualizar o `PASSAGEM.md`. Commit + push no PR #2.
3. Aguardar a Fase 0 do Osni para começar a Fase 1.

## 5. Verificação do plano
- Cada fase termina com uma verificação objetiva (acima).
- `verificar.ps1` cobre a Fundação do Kamrui. O relatório das 7h cobre a Otimização.
- Regra OPE: não subir de nível sem a Fundação consistente (F1–F6 OK antes de O2/O3).
