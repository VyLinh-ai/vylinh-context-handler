const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/tx-handler'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  stats: 'errors-only',
  plugins: [
    new NxWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: process.env.NODE_ENV === 'production',
      sourceMap: true,
    }),
  ],
};
