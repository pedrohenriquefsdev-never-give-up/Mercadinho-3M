# Tempero da Vovó Marly — v1.1.2

Correção específica para repositório atualizado por upload manual: `src/data/fallback.ts` volta a existir, porém vazio, apenas para sobrescrever qualquer versão antiga que ainda esteja no GitHub. Nenhum produto demonstrativo será exibido.

# Tempero da Vovó Marly — v1.1.1

Correção de build: removido o arquivo legado `src/data/fallback.ts`, que ainda continha produtos demonstrativos e causava erro de tipagem após a inclusão de `productType`.

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
