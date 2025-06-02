const config = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}

if (process.env.WIND_BUILD_MODE === 'ce') {
  config.plugins['postcss-rem-to-responsive-pixel'] = {
    rootValue: 16,
    propList: ['*'],
    transformUnit: 'px',
  };
}

export default config;
