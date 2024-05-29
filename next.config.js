/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      ["fluentui-next-appdir-directive",{
         paths: [
          "@griffel",
          "@fluentui"
        ]
      }],
    ],
  },
  i18n: {
    locales: ['fr-CA'],
    defaultLocale: 'fr-CA',
  },
  webpack: (config, options) => {
    config.module.rules.push(
      {
        test: /\.(woff(2)?|ttf|eot|svg|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/fonts/',
            publicPath: '_next/static/fonts/',
          },
        },
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      }
    );
  
    return config;
  },
};

module.exports = nextConfig;