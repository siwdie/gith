import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  config: './tsconfig.json',
  noExternal: Object.keys(pkg.dependencies),
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false,
  minify: true,
  outExtension () {
    return {
      js: '.cjs',
    }
  },
})