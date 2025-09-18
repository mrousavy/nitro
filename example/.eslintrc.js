module.exports = {
  root: true,
  extends: '../config/.eslintrc.js',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: true,
  },
  ignorePatterns: [
    'maestro/scripts/**/*.js'
  ],
}
