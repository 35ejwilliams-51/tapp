import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
const dist=new URL('../dist',import.meta.url);
mkdirSync(dist,{recursive:true});
if(!existsSync(new URL('../dist/web/index.html',import.meta.url))) throw new Error('Vite web build missing: dist/web/index.html');
writeFileSync(new URL('../dist/build.json',import.meta.url),JSON.stringify({version:'0.0.3-m0-unified',builtAt:new Date().toISOString(),legacyFrontendIntegrated:true,marketDataPath:'browser -> TAPP API -> provider adapter'},null,2));
console.log('Unified M0 build metadata created in dist/build.json');
