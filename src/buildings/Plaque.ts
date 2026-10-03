import * as THREE from 'three';
import type {Materials} from '../materials';
import {random} from '../materials';
import {HALF_DEPTH} from './config';
import {plaqueGlyph} from './PlaqueGlyphs';

/** Present-day vertical plaque: right 佛光眞, left 容禪寺.
 * Shallow carved silhouette and painted relief approximate the supplied photos.
 */
function plaqueTexture(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1280;
  const c=canvas.getContext('2d')!,rng=random(1438);
  c.fillStyle='#947155';c.fillRect(0,0,1024,1280);
  // Old wood, two field boards, worn ochre rather than fresh gilding.
  c.fillStyle='#886049';c.fillRect(195,200,634,870);
  for(let i=0;i<1700;i++){
    const x=rng()*1024,y=rng()*1280;
    c.fillStyle=rng()<.5?'rgba(44,26,17,.09)':'rgba(231,203,160,.09)';
    c.fillRect(x,y,1+rng()*2,15+rng()*135);
  }
  c.strokeStyle='#50392b';c.lineWidth=5;c.strokeRect(195,200,634,870);
  c.strokeStyle='#bb9975';c.lineWidth=9;c.strokeRect(211,213,602,844);
  c.fillStyle='#654634';c.fillRect(506,209,7,852);
  // Low relief cloud / flower curls along the historic frame, deliberately sparse.
  const curls=(x:number,y:number,r:number)=>{
    c.strokeStyle='#5e4436';c.lineWidth=12;c.beginPath();
    c.arc(x,y,r,.3,Math.PI*1.95);c.stroke();
    c.strokeStyle='#c19b78';c.lineWidth=7;c.beginPath();
    c.arc(x-3,y-3,r,.3,Math.PI*1.95);c.stroke();
    c.strokeStyle='#a78370';c.lineWidth=5;c.beginPath();
    c.arc(x,y,r*.52,.1,Math.PI*1.8);c.stroke();
  };
  for(let j=0;j<12;j++){
    curls(147+Math.sin(j)*13,250+j*65,25);
    curls(875-Math.sin(j)*13,250+j*65,25);
  }
  for(let j=0;j<10;j++){
    curls(110+j*90,117+Math.sin(j*.9)*20,29);
    curls(230+j*61,1115+Math.sin(j)*15,23);
  }
  for(const [x,chars] of [[367,'容禪寺'],[651,'佛光眞']] as const){
    [...chars].forEach((char,i)=>{
      const y=347+i*276;
      c.fillStyle='#594332';plaqueGlyph(c,char,x+3,y+5,233);
      c.fillStyle='#c0aa78';plaqueGlyph(c,char,x,y,233);
    });
  }
  // Small paint losses are opaque: the real board is not a transparent decal.
  for(let i=0;i<2100;i++){
    const x=rng()*1024,y=rng()*1280;
    c.fillStyle=rng()<.5?'rgba(114,74,46,.17)':'rgba(208,175,129,.15)';
    c.fillRect(x,y,1+rng()*6,1+rng()*12);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;return texture;
}
export function buildPlaque(parent:THREE.Group,m:Materials){
  const group=new THREE.Group();group.name='佛光眞容禪寺匾额';
  group.position.set(0,7.32,HALF_DEPTH+.68);parent.add(group);
  const s=new THREE.Shape();
  s.moveTo(-1.08,-1.31);s.quadraticCurveTo(-1.39,-1.64,-1.24,-1.67);
  s.quadraticCurveTo(-.99,-1.66,-.86,-1.43);s.quadraticCurveTo(-.35,-1.62,0,-1.46);
  s.quadraticCurveTo(.35,-1.62,.86,-1.43);s.quadraticCurveTo(.99,-1.66,1.24,-1.67);
  s.quadraticCurveTo(1.39,-1.64,1.08,-1.31);
  s.quadraticCurveTo(1.34,-.87,1.12,-.54);s.quadraticCurveTo(1.3,-.17,1.1,.19);
  s.quadraticCurveTo(1.29,.61,1.05,.96);s.lineTo(1.25,1.37);
  s.quadraticCurveTo(1.73,1.3,1.60,1.61);s.quadraticCurveTo(1.36,1.92,1.10,1.61);
  s.quadraticCurveTo(.82,1.83,.63,1.62);s.quadraticCurveTo(.22,1.99,0,1.80);
  s.quadraticCurveTo(-.22,1.99,-.63,1.62);s.quadraticCurveTo(-.82,1.83,-1.10,1.61);
  s.quadraticCurveTo(-1.36,1.92,-1.60,1.61);s.quadraticCurveTo(-1.73,1.3,-1.25,1.37);
  s.lineTo(-1.05,.96);s.quadraticCurveTo(-1.29,.61,-1.1,.19);
  s.quadraticCurveTo(-1.3,-.17,-1.12,-.54);s.quadraticCurveTo(-1.34,-.87,-1.08,-1.31);s.closePath();
  const frameGeometry=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:1,curveSegments:5});
  frameGeometry.translate(0,0,-.08);
  const frame=new THREE.Mesh(frameGeometry,m.door);frame.name='匾额雕花木边';frame.userData.kind='wall';
  frame.castShadow=frame.receiveShadow=true;group.add(frame);
  const faceGeometry=new THREE.ShapeGeometry(s,5),p=faceGeometry.getAttribute('position');
  const uv=[];for(let i=0;i<p.count;i++)uv.push((p.getX(i)+1.75)/3.5,(p.getY(i)+1.8)/3.85);
  faceGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const material=new THREE.MeshStandardMaterial({map:plaqueTexture(),roughness:1,color:0xffffff});
  const face=new THREE.Mesh(faceGeometry,material);face.position.z=.104;face.name='竖书六字与风化浅浮雕';
  face.userData.kind='wall';face.receiveShadow=true;group.add(face);
  return material;
}
