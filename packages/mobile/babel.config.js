module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@healthcare/shared': '../../packages/shared/dist',
          },
          extensions: ['.ts', '.tsx', '.js', '.json'],
        },
      ],
    ],
  };
};


