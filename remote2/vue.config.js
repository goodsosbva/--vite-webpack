const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  // 최상위에 publicPath 설정
  publicPath: 'auto',

  configureWebpack: {
    mode: 'production',
    output: {
      // ESM 대신 var 형식으로 변경
      library: {
        type: 'var',
        name: 'remote2',
      },
    },
    // experiments.outputModule: true 제거 또는 false로 설정
    experiments: {
      outputModule: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "remote2",
        filename: "remoteEntry.js",
        exposes: {
          "./ExposedComponent": "./src/components/ExposedComponent.vue",
        },
        shared: {
          vue: {
            singleton: true,
            strictVersion: true,
            eager: false,
            requiredVersion: "^3.2.0",
          },
        },
      }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
          },
          exclude: /node_modules/,
        },
      ],
    },

    devtool: 'source-map',
  },

  chainWebpack: (config) => {
    config.optimization.delete('splitChunks');
    config.module.rule("ts").uses.delete("thread-loader");
    config.module.rule("tsx").uses.delete("thread-loader");
  },

  devServer: {
    port: 5003,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
