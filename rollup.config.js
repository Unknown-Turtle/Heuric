import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/heuric.esm.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    terser({
      compress: {
        drop_console: true,
        passes: 2,
      },
      mangle: true,
    }),
  ],
};
