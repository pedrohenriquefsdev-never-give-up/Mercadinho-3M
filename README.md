# Tempero da Vovó Marly — v0.9.0

Release Candidate do MVP.

## Novidades
- Horários de funcionamento por dia da semana no painel.
- Possibilidade de marcar dias como fechados.
- Site público mostra automaticamente:
  - Aberto hoje até HH:MM
  - Abre hoje às HH:MM
  - Fechado hoje
  - Fechado • encerrou às HH:MM
- Carrinho impede checkout quando o estabelecimento está fechado.
- Mantém pedidos, produtos, categorias, cardápio do dia e configurações.
- Link administrativo continua oculto da página pública.

## Após subir no GitHub
A Vercel fará o deploy normalmente.

## Firebase
A estrutura `stores/tempero-da-vovo-marly` agora pode conter:

businessHours:
- monday: { enabled, open, close }
- tuesday: { enabled, open, close }
- wednesday: { enabled, open, close }
- thursday: { enabled, open, close }
- friday: { enabled, open, close }
- saturday: { enabled, open, close }
- sunday: { enabled, open, close }

O painel salva isso automaticamente.

## Antes da V1.0
Ainda faltam as camadas finais:
- App Check;
- rate limit real para pedidos;
- validação server-side de preços;
- estratégia definitiva para upload de imagens.
