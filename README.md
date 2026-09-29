# Tempero da Vovó Marly — v0.9.1

## Novidades
- Upload de imagem do produto direto para o Cloudinary.
- Prévia da imagem e opção de remover antes de salvar.
- Limite de 5 MB e formatos JPG, PNG e WEBP.
- Nova aba `Usuários` visível somente para administradores.
- Perfis `admin` e `manager`.
- Administrador pode criar e ativar/desativar usuários.
- Gerentes podem operar pedidos, produtos, categorias, cardápio do dia e configurações, mas não gerenciam usuários.
- Horários semanais da v0.9.0 permanecem.

## Cloudinary
Cloud name:
`dh37kli1d`

Upload preset:
`tempero_vovo_marly_products`

## Firebase
Depois de publicar a versão, publique também o conteúdo atualizado de `firestore.rules`.

## Marly Moura e Marina Moura
Crie as duas pela nova aba:
`Admin > Usuários > Novo usuário`

Use o perfil `Gerente`.

Para criar as contas é necessário informar:
- nome;
- e-mail;
- senha inicial.

## Variáveis recomendadas na Vercel
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dh37kli1d`
`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tempero_vovo_marly_products`
