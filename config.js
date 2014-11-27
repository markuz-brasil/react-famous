module.exports = {
  standalone: 'ReactFamousRuntime',
  sourcemaps: true,
  entry:'./index.js',
  basename: 'runtime-namespace',
  dest: './build',
  title: 'runtime',
  js: {
    src:  [
      './index.{js,jsx}',
      './src/**/*.{js,jsx}',
    ],
    opt: {},
  },
}
