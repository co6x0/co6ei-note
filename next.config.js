const path = require('path')

module.exports = {
  images: {
    domains: [process.env.NEXT_PUBLIC_CMS_DOMAIN],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      include: [path.resolve(path.resolve(), 'src/assets')],
      use: [
        {
          loader: 'react-svg-loader',
          options: {
            svgo: {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          },
        },
      ],
    })

    return config
  },
}
