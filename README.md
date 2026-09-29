# Tempero da Vovó Marly — v1.0.2

Correção do JSX da página pública após a remoção dos produtos demonstrativos. O catálogo continua sem fallback e mostra apenas produtos reais do Firestore.

# Tempero da Vovó Marly — v1.0.1

Correção pós-lançamento: removidos todos os produtos demonstrativos/fallback. A vitrine pública agora mostra somente produtos reais cadastrados e ativos no Firestore. Se não houver produtos, aparece a mensagem “Cardápio em atualização”.

# Tempero da Vovó Marly — v1.0.0

Versão 1.0 do MVP.

## Incluído
- catálogo, carrinho e checkout;
- pedidos no Firestore;
- painel administrativo;
- produtos, categorias e cardápio do dia;
- horários semanais;
- upload de imagens via Cloudinary;
- usuários administrativos;
- pedidos mais recentes primeiro;
- bloqueio de auto-desativação no painel;
- validações adicionais de nome, telefone, endereço e quantidade;
- cooldown local contra envios repetidos;
- regras Firestore mais restritivas;
- headers de segurança HTTP/CSP.

## Importante
Esta versão endurece o MVP, mas o checkout ainda grava diretamente no Firestore e o preço ainda é calculado no navegador. Para pagamentos automáticos ou um cenário de fraude mais alto, a próxima evolução deve mover a criação do pedido para um endpoint server-side que consulte os preços no Firestore como fonte da verdade.

## Publicação
1. Substitua integralmente os arquivos no GitHub.
2. Faça o deploy pela Vercel.
3. Publique o conteúdo atualizado de `firestore.rules`.
4. Teste login, upload de imagem, cadastro de produto, horário, pedido e status.

## Cloudinary
- Cloud name: `dh37kli1d`
- Upload preset: `tempero_vovo_marly_products`
