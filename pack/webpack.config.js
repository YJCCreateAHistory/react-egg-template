const isProductionEnv = process.env.NODE_ENV === 'production';
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UnusedWebpackPlugin = require('unused-webpack-plugin');
module.exports = {
  mode: isProductionEnv ? 'production' : 'development',
  profile: true,
  resolve: {
    extensions: [ '.js', '.ts', '.tsx', '.jsx', '.json' ],
    alias: {

    },
  },
  entry: './client/src/index.tsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true,
  },
  // cache: {
  //   type: 'filesystem',
  // },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              cacheDirectory: true,
              plugins: [
                isProductionEnv ? '' : 'react-refresh/babel', // only development environment
                '@babel/plugin-transform-runtime',
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(css|less)$/,
        use: [
          isProductionEnv ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name].[ext]',
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 8 * 1024,
                },
              },
            },
          },
        ],
      },
    ],
  },
  // eslint-disable-next-line no-trailing-spaces
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html', filename: 'index.html' }),
    !isProductionEnv && new ReactRefreshWebpackPlugin(),
    new EslintWebpackPlugin({
      context: '../client',
      files: [ 'src' ],
    }),
    new WebpackBar(),
    isProductionEnv && new MiniCssExtractPlugin({
      filename: 'style/[name].[contenthash:8].css',
      chunkFilename: 'style/[name].[contenthash:8].chunk.css',
    }),
    new BundleAnalyzerPlugin(),
    new UnusedWebpackPlugin({
      directories: [ path.join(__dirname, '../client/src') ],
      root: path.join(__dirname, '../'),
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
      new CssMinimizerPlugin({}),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
      cacheGroups: {
        reactBase: {
          name: 'react-code',
          test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router)[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        antdBase: {
          name: 'antd-base',
          test: /[\\/]node_modules[\\/](antd|@antd-design)[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
    usedExports: true,
  },
  devServer: {
    historyApiFallback: true,
    compress: true,
    host: '0.0.0.0',
    port: 9100,
    hot: !isProductionEnv,
  },
  devtool: isProductionEnv ? 'source-map' : 'eval-cheap-module-source-map',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
