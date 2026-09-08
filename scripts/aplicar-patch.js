const fs=require('fs');
function aplicar(arq, patches){
  let s=fs.readFileSync(arq,'utf8');
  const i=s.indexOf('const BLOCOS = [');
  const f=s.indexOf('\n];',i);
  const B=eval(s.slice(i+'const BLOCOS = '.length,f+2));
  let P={};
  patches.forEach(p=>Object.assign(P,JSON.parse(fs.readFileSync(p,'utf8'))));
  let ok=0, faltando=[];
  Object.entries(P).forEach(([ref,nv])=>{
    const [bId,nId,k]=ref.split('|');
    const b=B.find(x=>x.id===bId);
    if(!b){faltando.push(ref);return;}
    let alvo = nId==='BOSS' ? b.boss[+k] : (b.niveis.find(x=>x.id===nId)||{}).questoes?.[+k];
    if(!alvo){faltando.push(ref);return;}
    alvo.alts=nv.alts; alvo.c=nv.c; ok++;
  });
  const novo = s.slice(0,i) + 'const BLOCOS = ' + JSON.stringify(B,null,2) + s.slice(f+2);
  fs.writeFileSync(arq,novo);
  console.log(arq,'| aplicados:',ok,'| nao encontrados:',faltando.length, faltando.slice(0,5).join(' '));
}
aplicar(process.argv[2], process.argv.slice(3));
