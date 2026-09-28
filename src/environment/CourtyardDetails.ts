import * as THREE from 'three';
import {Batch,box,boxGeometry,cylinderGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import {random} from '../materials';
import {AUXILIARY,ERLIANG_GATE,COURT} from './layout';

function oldGateMaterial(){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
  const ctx=canvas.getContext('2d')!,rng=random(1937);ctx.fillStyle='#986452';ctx.fillRect(0,0,256,512);
  for(let i=0;i<80;i++){
    ctx.fillStyle='rgba(181,158,120,.17)';ctx.beginPath();ctx.ellipse(rng()*256,250+rng()*260,1+rng()*6,5+rng()*24,0,0,Math.PI*2);ctx.fill();
  }
  for(let i=0;i<4500;i++){
    const x=rng()*256,y=rng()*512;ctx.fillStyle=i%4===0?'rgba(194,164,121,.30)':'rgba(87,43,29,.16)';
    ctx.fillRect(x,y,.4+rng()*2,3+rng()*24);
  }
  for(let i=0;i<80;i++){
    ctx.strokeStyle='rgba(193,169,133,.25)';ctx.lineWidth=.3+rng()*2;const x=rng()*256,y=rng()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rng()*5,y+15+rng()*80);ctx.stroke();
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  return new THREE.MeshStandardMaterial({color:0xb5907c,map,roughness:.98});
}
function roofStrip(length:number,depth:number,eave:number,rise:number){
  const positions:number[]=[],uv:number[]=[],indices:number[]=[];
  for(let side=0;side<2;side++)for(let j=0;j<=8;j++)for(let i=0;i<=1;i++){
    const t=j/8;positions.push((i-.5)*length,eave+rise*Math.pow(1-t,1.2), (side? -1:1)*depth*t);uv.push(i*6,t*2);
  }
  for(let side=0;side<2;side++)for(let j=0;j<8;j++){
    const a=side*18+j*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function buildAuxiliary(parent:THREE.Object3D,m:Materials){
  const a=AUXILIARY,group=new THREE.Group();group.name='主殿旁小建筑 · 红圈位置';group.position.set(a.x,0,a.z);group.rotation.y=a.rotation;parent.add(group);
  box(group,m.stone,v(0,a.floor/2,0),v(a.halfWidth*2+.5,a.floor,a.halfDepth*2+.45),'environment');
  const wood=new Batch(boxGeometry,m.door,'environment'),walls=new Batch(boxGeometry,m.wallRed,'environment'),plinth=new Batch(boxGeometry,m.plaster,'environment');
  walls.add(v(0,2.48,-a.halfDepth+.15),v(a.halfWidth*2,3.2,.3));
  for(const s of [-1,1])walls.add(v(s*a.halfWidth,2.48,0),v(.28,3.2,a.halfDepth*2));
  const columns=new Batch(cylinderGeometry,m.door,'environment');
  for(const x of [-7.05,-2.35,2.35,7.05])columns.add(v(x,2.37,a.halfDepth),v(.16,2.98,.16));
  wood.add(v(0,3.81,a.halfDepth),v(14.5,.22,.27));
  for(let bay=0;bay<3;bay++){
    const x=(bay-1)*4.7,w=4.3,z=a.halfDepth-.23;
    if(bay===1){
      for(const s of [-1,1])wood.add(v(x+s*1.05,2.1,z),v(2.04,2.4,.12));
    }else{
      plinth.add(v(x,1.36,z),v(w,.96,.25));walls.add(v(x,3.32,z),v(w,.52,.25));
      for(let j=0;j<17;j++)wood.add(v(x-w/2+.13+j*(w-.26)/16,2.46,z),v(.052,1.32,.09));
      for(let j=0;j<4;j++)wood.add(v(x,1.86+j*.40,z+.03),v(w,.045,.08));
    }
    for(const s of [-1,1])wood.add(v(x+s*w/2,2.39,z),v(.12,3.03,.22));
  }
  columns.finish(group);walls.finish(group);plinth.finish(group);wood.finish(group);
  const tile=m.tile.clone();tile.side=THREE.DoubleSide;
  const roof=new THREE.Mesh(roofStrip(15.5,3.72,3.95,1.62),tile);roof.castShadow=roof.receiveShadow=true;group.add(roof);
  const gableShape=new THREE.Shape();gableShape.moveTo(-a.halfDepth,4.02);
  for(let j=0;j<=16;j++){const z=-a.halfDepth+j*a.halfDepth/8;gableShape.lineTo(z,3.95+1.62*Math.pow(1-Math.abs(z)/3.72,1.2)-.055);}
  gableShape.lineTo(a.halfDepth,4.02);gableShape.closePath();
  const gableGeo=new THREE.ExtrudeGeometry(gableShape,{depth:.24,bevelEnabled:false});gableGeo.translate(0,0,-.12);
  const gables=new Batch(gableGeo,m.plaster,'environment');for(const s of [-1,1])gables.add(v(s*a.halfWidth,0,0),v(1,1,1),new THREE.Euler(0,Math.PI/2,0));gables.finish(group);
  const ridges=new Batch(cylinderGeometry,tile,'environment');ridges.beam(v(-7.77,5.62,0),v(7.77,5.62,0),.09,.09);
  // Coarse continuous tile rolls suffice on the supporting building.
  for(let x=-7.6;x<=7.6;x+=.24)for(const s of [-1,1])for(let j=0;j<5;j++){
    const point=(t:number)=>v(x,4.00+1.62*Math.pow(1-t,1.2),s*3.72*t);
    ridges.beam(point(j/5),point((j+1)/5),.045,.045);
  }ridges.finish(group);
  const stairs=new Batch(boxGeometry,m.stone,'environment');for(let i=0;i<5;i++){const h=a.floor*(i+1)/5;stairs.add(v(0,h/2,a.halfDepth+.25+(4.5-i)*.32),v(2.8,h,.33));}stairs.finish(group);
  return group;
}
export function buildErliangGate(parent:THREE.Object3D,m:Materials){
  const g=ERLIANG_GATE,group=new THREE.Group();group.name='二亮的门 · 围墙绿圈位置';group.position.set(g.x,0,g.z);group.rotation.y=g.rotation;parent.add(group);
  const wood=oldGateMaterial(),frame=new Batch(boxGeometry,wood,'environment');
  for(const s of [-1,1])frame.add(v(s*(g.width/2+.09),g.height/2,0),v(.18,g.height,.25));
  frame.add(v(0,g.height+.08,0),v(g.width+.35,.18,.28));frame.add(v(0,.075,0),v(g.width,.15,.24));frame.finish(group);
  const bottom=.14,top=g.height-.045,w=g.width/2-.024;
  // Each leaf is a real extruded polygon with a ragged notch at the central seam.
  // No black decal: the aperture remains open for depth, shadows and the dog.
  const left=new THREE.Shape();left.moveTo(-w,bottom);left.lineTo(-.03,bottom);left.lineTo(-.065,.30);left.lineTo(-.018,.44);left.lineTo(-.052,.61);left.lineTo(-.018,.81);left.lineTo(-.014,top);left.lineTo(-w,top);left.closePath();
  const right=new THREE.Shape();right.moveTo(.014,top);right.lineTo(w,top);right.lineTo(w,bottom);right.lineTo(.13,bottom);right.lineTo(.09,.24);right.lineTo(.21,.34);right.lineTo(.32,.39);right.lineTo(.34,.54);right.lineTo(.28,.64);right.lineTo(.09,.71);right.lineTo(.025,.81);right.closePath();
  for(const shape of [left,right]){
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:false});geometry.translate(0,0,-.0425);
    // Map the tall weathering grain into the leaf rather than arbitrary world UVs.
    const pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+g.width/2)/g.width,pos.getY(i)/g.height);
    const leaf=new THREE.Mesh(geometry,wood);leaf.castShadow=leaf.receiveShadow=true;leaf.name='风化木门与真实狗洞';group.add(leaf);
  }
  const grooves=new Batch(boxGeometry,m.bark,'environment');
  for(const x of [-.66,-.44,-.22,.44,.66])grooves.add(v(x,(bottom+top)/2,.044),v(.009,top-bottom,.006));grooves.finish(group);
  const hardware=new Batch(boxGeometry,m.metal,'environment');hardware.add(v(0,top-.13,.067),v(.25,.035,.045)).add(v(-.03,top-.08,.06),v(.04,.21,.04));hardware.finish(group);
  // A shaded space beyond the gate; this never fills the aperture plane itself.
  const cavity=new THREE.MeshStandardMaterial({color:0x302a23,roughness:1});
  box(group,cavity,v(0,1.1,-1.22),v(2.4,2.2,.25),'environment');
  for(const s of [-1,1])box(group,cavity,v(s*1.17,1.1,-.62),v(.18,2.2,1.25),'environment');
  const bowl=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.10,0),new THREE.Vector2(.18,.025),new THREE.Vector2(.23,.11),new THREE.Vector2(.21,.12),new THREE.Vector2(.14,.04)],14),m.metal);bowl.position.set(.15,.035,.46);bowl.castShadow=true;group.add(bowl);
  const dogAnchor=new THREE.Group();dogAnchor.name='二亮 · 探头节点';dogAnchor.position.set(.14,.03,-.39);dogAnchor.userData.aperture={width:g.holeWidth,height:g.holeHeight};group.add(dogAnchor);
  group.userData.wallOpening={width:g.width+.36,height:COURT.wallHeight};
  return {group,dogAnchor};
}
