import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(process.cwd(),'node_modules/.foguang-verify-'));
try {
  for(const name of ['geometry','interactions']) {
    const output=join(dir,name+'.mjs');
    await build({entryPoints:[`scripts/verify-${name}.ts`],bundle:true,packages:'external',platform:'node',format:'esm',outfile:output});
    await import(pathToFileURL(output).href);
  }
} finally { await rm(dir,{recursive:true,force:true}); }
