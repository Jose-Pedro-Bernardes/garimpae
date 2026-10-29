# Garimpaê

Ferramenta de busca de estabelecimentos. Você pesquisa algo como **"restaurantes em Niterói"** e recebe uma lista com nome, endereço, telefone e site, que pode ser baixada em uma planilha XLSX.

## Funcionalidades

- Pesquisa por texto livre (tipo de negócio + cidade).
- Lista de resultados com nome, endereço, telefone e site.
- Carregamento incremental: cada clique em **Carregar mais resultados** traz a próxima página.
- Exportação dos resultados carregados para XLSX.
- Tema claro e escuro, com layout responsivo.
- Limite mensal de requisições à API (ativo em desenvolvimento local).

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) e [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) para busca e cache
- [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service) (Text Search)
- [ExcelJS](https://github.com/exceljs/exceljs) para gerar a planilha
- [lucide-react](https://lucide.dev/) para ícones
- [Jest](https://jestjs.io/) e [Testing Library](https://testing-library.com/) para testes

## Como rodar

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/Jose-Pedro-Bernardes/garimpae.git
   cd garimpae
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz do projeto:

   ```env
   GOOGLE_PLACES_API_KEY=sua-chave-aqui
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Chave da Google Places API (New). Usada apenas no servidor, na rota `/api/search`. Nunca use o prefixo `NEXT_PUBLIC_`. |

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Verifica o código com o ESLint |
| `npx tsc --noEmit` | Checa os tipos do TypeScript |
| `npx jest` | Roda os testes automatizados |

## Estrutura

```text
src/
├── app/
│   ├── api/search/route.ts      # Rota que consulta a Google Places API
│   ├── globals.css              # Paleta e tokens do tema
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── providers/               # Provider do TanStack Query
│   └── search/                  # Search e SearchResults
├── hooks/use-search.ts          # Busca paginada com cache
├── lib/
│   ├── query-client.ts          # Configuração do cache
│   └── usage-limit.ts           # Limite mensal de requisições
├── services/export/xlsx.ts      # Geração do arquivo XLSX
└── types/search.ts
```

## Consumo da API e limite mensal

Cada pesquisa e cada clique em **Carregar mais resultados** contam como uma requisição à Google Places API, e o uso é cobrado depois da franquia gratuita mensal. Para ficar abaixo dela, o projeto tem:

- **Cache** de resultados por 5 minutos, sem nova requisição ao voltar para a aba.
- **Sem tentativas automáticas** em caso de erro, para um erro não virar várias cobranças.
- **Contador mensal** (800 requisições): ao atingir o limite, a rota responde `429` sem chamar o Google. O contador grava em `.data/usage.json`, que fica fora do Git.

> **Nota:** o contador em arquivo funciona em ambiente local. A migração para um contador compartilhado, que também funcione em hospedagem serverless, está planejada.

## Deploy

O projeto é publicado na [Vercel](https://vercel.com/). Cadastre `GOOGLE_PLACES_API_KEY` em **Settings → Environment Variables**. Variáveis novas só valem em deploys feitos depois delas, então faça um **Redeploy** após alterá-las.

## Observações

- Projeto de uso pessoal. O site está com indexação desativada (`robots: noindex`).
- Os dados vêm da Google Places API. Antes de usar a ferramenta além do uso pessoal, leia os [termos do Google Maps Platform](https://cloud.google.com/maps-platform/terms), principalmente as regras sobre exportação e armazenamento de dados.
- A chave de demonstração do Google serve apenas para testes e prototipagem.

## Próximos passos

- [ ] Contador de requisições em Redis, com bloqueio em 800 por mês
- [ ] Página de consulta do consumo da API
- [ ] Página de apresentação
- [ ] Autenticação
