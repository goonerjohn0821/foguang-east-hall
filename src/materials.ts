import * as THREE from 'three';

export function random(seed = 857) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function surface(kind: 'wood' | 'stone' | 'tile' | 'paving', seed: number) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const ctx = c.getContext('2d')!; const rng = random(seed);
  ctx.fillStyle = kind === 'wood' ? '#c2a88e' : kind === 'tile' ? '#9f9f97' : '#c2bdb0'; ctx.fillRect(0,0,512,512);
  const data=ctx.getImageData(0,0,512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const i=(y*512+x)*4;
    const n=(rng()-.5)*(kind==='wood'?17:32)+(kind==='wood'?Math.sin(x*.7+Math.sin(y*.022)*3)*13:Math.sin(x*.035)*Math.sin(y*.06)*7);
    for(let k=0;k<3;k++)data.data[i+k]+=n;
  } ctx.putImageData(data,0,0);
  if(kind==='wood')for(let i=0;i<95;i++){ctx.strokeStyle=`rgba(47,29,17,${.03+rng()*.13})`;ctx.lineWidth=.3+rng()*1.2;const x=rng()*512;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+7,170,x-7,340,x,512);ctx.stroke();}
  if(kind==='stone'||kind==='paving'){
    const h=kind==='paving'?128:85;
    for(let y=0;y<512;y+=h){ctx.strokeStyle='rgba(50,45,37,.27)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();for(let x=(Math.round(y/h)%2)*128;x<512;x+=256){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.stroke();}}
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
export function createMaterials(){
  const wood=surface('wood',17),stone=surface('stone',29),tile=surface('tile',31),paving=surface('paving',19);
  paving.repeat.set(24,24);stone.repeat.set(3,1);
  const mat=(color:number,map?:THREE.Texture,roughness=.88)=>new THREE.MeshStandardMaterial({color,map:map??null,roughness,metalness:0});
  return {
    column:mat(0x71352a,wood),beam:mat(0x63412d,wood),fang:mat(0x855438,wood),dougong:mat(0x704536,wood),purlin:mat(0x8b6741,wood),rafter:mat(0x92764c,wood),door:mat(0x513529,wood),
    tile:mat(0x575950,tile,.94),ridge:mat(0x646458,tile),stone:mat(0xaaa393,stone),plaster:mat(0xbab1a0,stone),paving:mat(0xc0b6a1,paving),earth:mat(0x747b57),bark:mat(0x4b4331,wood),leaves:mat(0x344d30),grass:mat(0x69764a),dark:mat(0x211e19),metal:mat(0x61513c,undefined,.65)
  };
}
export type Materials = ReturnType<typeof createMaterials>;
export const structureColors: Record<string,number> = {column:0xc47b5c,beam:0xe0ad69,fang:0xc99c77,dougong:0xd8c291,purlin:0x7ea998,rafter:0x9db7ba};
