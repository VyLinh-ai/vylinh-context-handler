import type { CodegenConfig } from '@graphql-codegen/cli';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const gql_url =
  (process.env.SUBGRAPH_URL as string) ||
  'https://api.studio.thegraph.com/query/51530/usdt-deposit/v0.03';
// const gql_url = process.env.SUBGRAPH_URL as string
console.log('gql_url:::', process.env.SUBGRAPH_URL);

const config: CodegenConfig = {
  overwrite: true,
  schema: [gql_url, process.env.AVATAR_SUBGRAPH as string],
  documents: 'shared/src/**/*.graphql',
  generates: {
    'shared/src/graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
        'typescript-graphql-request',
        'typescript-operations',
      ],
    },
  },
};

export default config;
