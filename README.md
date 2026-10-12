# Serena — plataforma de alojamentos (protótipo local)

Projeto Next.js em português de Portugal, com preços em EUR, pesquisa dos 308 municípios portugueses e painel administrativo para gerir alojamentos, fotografias e preços.

## Requisitos
- Node.js 20.9 ou superior
- VS Code

## Instalar no Windows
Abra esta pasta no VS Code e execute no terminal:

```powershell
npm.cmd install
Copy-Item .env.example .env.local
```

Edite `.env.local` e defina `ADMIN_PASSWORD` com uma palavra-passe privada de pelo menos 12 caracteres. Para ativar checkout Stripe de teste, defina também `STRIPE_SECRET_KEY` com uma chave `sk_test_...`. Nunca publique chaves secretas.

Depois execute:

```powershell
npm.cmd run dev
```

Abra http://localhost:3000.

## Painel administrativo
Aceda a http://localhost:3000/admin e entre com a palavra-passe configurada em `ADMIN_PASSWORD`. Pode adicionar, editar e apagar alojamentos, selecionar qualquer um dos 308 municípios de Portugal, alterar preços e enviar fotografia JPG/PNG/WebP até 5 MB.

No desenvolvimento local, os dados ficam em `data/stays.json` e as imagens em `public/uploads`. Faça cópia de segurança destes ficheiros. Este mecanismo de ficheiros locais não é apropriado para publicação em plataformas serverless/cloud. Antes de produção, migre para PostgreSQL/Supabase e armazenamento de imagens persistente, implemente disponibilidade e reservas transacionais e valide os webhooks Stripe.

## Pesquisa de destinos
O campo de destino tem sugestões de todos os 308 municípios, com base no diretório público do Portal Mais Transparência: https://transparencia.gov.pt/pt/municipios/bi-municipios/municipios/ . Poderá pesquisar qualquer município; só aparecerão resultados quando existirem alojamentos cadastrados nessa localidade.

## Limitações importantes
- Os alojamentos iniciais são dados demonstrativos.
- O checkout Stripe permanece em modo de teste e ainda não cria nem confirma reservas persistentes.
- As fotografias carregadas e os alojamentos são guardados no disco local.
- A palavra-passe administrativa protege o painel no protótipo local; antes de produção, implemente autenticação com gestão de utilizadores, proteção contra tentativas repetidas, armazenamento persistente e auditoria.


### Link Stripe por alojamento

No painel `/admin`, cada alojamento tem o campo opcional **Link de pagamento Stripe**. Crie um Payment Link no Dashboard do Stripe para o produto/preço pretendido e cole o URL `https://buy.stripe.com/...`. Quando esse campo estiver preenchido, o botão da página pública abre esse link; quando estiver vazio, é usado o checkout dinâmico de demonstração da aplicação. O Payment Link tem o seu próprio preço definido no Stripe, pelo que deve manter o preço apresentado no site alinhado com o preço do link. As datas e hóspedes selecionados no site não são automaticamente enviados para o Payment Link.


## Dados dos hóspedes e confirmação por e-mail

O fluxo agora passa por `/checkout` antes de abrir o Stripe. A pessoa responsável informa nome completo, e-mail e os nomes de todos os hóspedes. O e-mail é enviado apenas após um evento `checkout.session.completed` assinado e com `payment_status=paid`.

Para ativar a confirmação por e-mail:
1. Crie uma conta em https://resend.com/ e verifique um domínio/remetente autorizado.
2. Defina `RESEND_API_KEY` e `BOOKING_FROM_EMAIL` no `.env.local` e no ambiente de produção.
3. No Stripe, crie um endpoint webhook para `https://SEU-DOMINIO/api/stripe/webhook`, selecionando `checkout.session.completed`. Copie o segredo `whsec_...` para `STRIPE_WEBHOOK_SECRET`. Em desenvolvimento, use Stripe CLI para encaminhar webhooks ao `http://localhost:3000/api/stripe/webhook`.
4. Reinicie a aplicação após alterar variáveis.

**Importante:** isto envia um e-mail após o pagamento confirmado, mas esta versão ainda não persiste a reserva num banco de dados nem verifica/bloqueia inventário real. Antes de vender estadias reais, implemente armazenamento persistente, prevenção de reservas duplicadas, política de privacidade/RGPD e tratamento idempotente dos eventos e reenvios de e-mail. Os dados dos hóspedes são guardados nos metadados Stripe para este fluxo de demonstração; para produção, prefira guardar dados pessoais minimizados numa base de dados com acesso controlado.
