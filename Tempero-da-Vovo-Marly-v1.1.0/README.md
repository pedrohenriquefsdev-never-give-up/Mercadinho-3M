# Tempero da Vovó Marly — v1.1.0

Versão com separação entre **Almoços** e **Mercado**.

## Página pública
- `Almoços` é a área padrão e principal.
- `Mercado` fica em uma aba própria.
- Cardápio do dia aparece apenas em Almoços.
- Pesquisa e categorias são filtradas pela área selecionada.
- Produtos de mercado não ficam misturados com pratos.
- Produtos legados sem o novo campo `productType` são tratados como Mercado até serem editados no painel.

## Painel administrativo
No cadastro/edição do produto foi adicionado o campo:

- `Área: Almoços`
- `Área: Mercado`

O `Cardápio do dia` lista apenas produtos classificados como Almoços.

## Importante para produtos já cadastrados
Abra cada produto antigo no painel e confira a nova opção **Área**. Produtos existentes sem classificação entram provisoriamente em **Mercado**.

Não é necessário alterar as regras do Firestore apenas por essa mudança.
