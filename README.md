# Tempero da Vovó Marly — v0.2.0 — v0.2.0

Versão com **visual reformulado**, inspirada nas referências enviadas:
- identidade mais quente e comercial;
- foco em delivery/cardápio;
- destaques para cardápio do dia;
- carrinho com envio do pedido por WhatsApp;
- estrutura pronta para integração com Supabase na próxima etapa.

## O que já funciona
- home com identidade visual nova;
- busca por produtos;
- filtro por categorias;
- destaques do cardápio do dia;
- carrinho lateral com quantidade;
- persistência do carrinho no navegador;
- link automático para enviar o pedido no WhatsApp;
- estrutura preparada para Supabase.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Observação
Nesta versão, os dados ainda estão em arquivo local (`src/data/menu.ts`).
No próximo passo, vamos substituir isso pelo banco no Supabase.

## Próximo passo
Depois de subir esta versão no GitHub:
1. criar o projeto no Supabase;
2. montar as tabelas;
3. configurar RLS;
4. conectar o frontend com o banco.
