# Tempero da Vovó Marly — v0.5.0

## Entrou nesta versão
- remoção total do link administrativo da página pública;
- `/admin` continua acessível apenas digitando a URL;
- produtos e categorias no Firestore;
- checkout público;
- pedido salvo em `orders`;
- envio do resumo para WhatsApp após salvar;
- painel administrativo com aba **Pedidos**;
- alteração de status do pedido;
- produtos, categorias, cardápio do dia e configurações;
- regras do Firestore incluídas em `firestore.rules`;
- bloqueio simples após tentativas repetidas de login no navegador.

## Depois do upload
1. Faça o deploy pela Vercel.
2. No Firebase, vá em Firestore > Rules.
3. Substitua as regras atuais pelo conteúdo de `firestore.rules`.
4. Publique as regras.

## Atenção sobre segurança
Esta versão já restringe o painel e valida minimamente pedidos no Firestore.
Para a V1.0 ainda recomendamos:
- Firebase App Check;
- rate limit real no backend;
- validação server-side dos preços;
- CAPTCHA/Turnstile quando necessário;
- armazenamento de imagens externo ou Firebase Storage futuramente.

O cálculo de preço ainda acontece no cliente e é registrado no pedido; portanto esta versão é boa para operação assistida por WhatsApp, mas ainda não é a etapa final para pagamentos automáticos.
