import {createRequire} from 'module'

const require = createRequire(import.meta.url)
require('esbuild').buildSync({
                                 entryPoints: ['src/index.ts'],
                                 banner: {
                                     js: 'import { createRequire } from \'module\';' + "\n"
                                         + 'const require = createRequire(import.meta.url);' + "\n"
                                         + 'const __filename = import.meta.url;' + "\n"
                                         + 'const __dirname = import.meta.url;\n' + "\n"
                                 },
                                 outdir: 'dist',
                             })
