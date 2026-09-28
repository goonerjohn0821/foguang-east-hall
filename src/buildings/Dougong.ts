import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Batch,boxGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {X,Z,COLUMN_TOP,columns,HALF_WIDTH,HALF_DEPTH} from './config';

function gongGeometry(){
  // Broad flat bearing face; stepped, concave juansha underside. Few profile segments.
  const s=new THREE.Shape();s.moveTo(-1.25,.18);s.lineTo(1.25,.18);s.lineTo(1.25,.015);
  s.lineTo(1.07,.015);s.lineTo(1.07,-.075);s.lineTo(.88,-.075);
  s.quadraticCurveTo(.65,-.08,.49,-.22);s.lineTo(-.49,-.22);
  s.quadraticCurveTo(-.65,-.08,-.88,-.075);s.lineTo(-1.07,-.075);s.lineTo(-1.07,.015);s.lineTo(-1.25,.015);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.34,bevelEnabled:false,curveSegments:3});g.translate(0,0,-.17);return g;
}
function angGeometry(){
  const s=new THREE.Shape();s.moveTo(0,-.5);s.lineTo(.15,-.43);s.lineTo(.15,.5);s.lineTo(-.15,.5);s.lineTo(-.15,-.43);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.30,bevelEnabled:false});g.translate(0,0,-.15);return g;
}
export const BRACKET_PROFILE={outwardJumps:[.66,1.32,1.98,2.62],courses:7};
export function buildDougong(parent:THREE.Group,m:Materials,e:Explosion){
  const gong=gongGeometry(),ang=angGeometry(),dou=new THREE.CylinderGeometry(.42,.29,.30,4,1);dou.rotateY(Math.PI/4);
  const prototypes=new Map<string,THREE.BufferGeometry>();
  function batchGroup(name:string,offset:THREE.Vector3,index:number){
    const root=new THREE.Group();root.name=name;root.userData.variant=name;parent.add(root);
    const d=new Batch(dou,m.dougong,'dougong'),g=new Batch(gong,m.dougong,'dougong'),a=new Batch(ang,m.dougong,'dougong'),b=new Batch(boxGeometry,m.dougong,'dougong');
    const finish=(placements:{position:THREE.Vector3;angle:number}[])=>{
      let prototype=prototypes.get(name);
      if(!prototype){
        const parts:THREE.BufferGeometry[]=[];
        for(const batch of [d,g,a,b])for(const matrix of batch.matrices){
          const geo=batch.geometry.index?batch.geometry.toNonIndexed():batch.geometry.clone();geo.applyMatrix4(matrix);parts.push(geo);
        }
        prototype=mergeGeometries(parts);parts.forEach(g=>g.dispose());prototypes.set(name,prototype);
      }
      // One merged prototype, genuinely instanced at each column/bay; one draw per group.
      const instances=new Batch(prototype,m.dougong,'dougong');
      for(const p of placements)instances.add(p.position,v(1,1,1),new THREE.Euler(0,p.angle,0));
      const mesh=instances.finish(root);if(mesh)mesh.userData.variant=name;
      root.userData.assemblies=placements.length;e.register(root,'dougong',offset,4,index);
    };
    return {root,d,g,a,b,finish};
  }
  function columnSet(batch:ReturnType<typeof batchGroup>,center:THREE.Vector3,angle:number,base=true,diagonal=false,corner=false){
    const q=new THREE.Quaternion().setFromAxisAngle(v(0,1,0),angle),rot=new THREE.Euler(0,angle,0);
    const pos=(x:number,y:number,z:number)=>v(x,COLUMN_TOP+y,z).applyQuaternion(q).add(center);
    const {d,g,a,b}=batch,reach=diagonal?1.15:1;
    if(base)d.add(pos(0,.225,0),v(1.32,1.5,1.32),rot);
    // Two true crossing hua-gong arms, with bearing blocks at each successive jump.
    for(let j=0;j<2;j++){
      const y=.63+j*.50,tip=BRACKET_PROFILE.outwardJumps[j]*reach;
      g.add(pos(0,y,tip*.33),v(.80+j*.26,1,1),new THREE.Euler(0,angle+Math.PI/2,0));
      g.add(pos(0,y,j===0?0:tip),v(1+j*.12,1,1),rot);
      for(const x of [-.83,0,.83])d.add(pos(x*(1+j*.12),y+.31,j===0?0:tip),v(.75,.88,.75),rot);
      d.add(pos(0,y+.31,tip),v(.86,.9,.86),rot);
      // Inward continuation is important in the transparent and exploded views.
      g.add(pos(0,y,-.6-j*.38),v(.75,1,1),rot);
    }
    // Two downward-projecting ang, each with a long rising rear tail.
    for(let j=0;j<2;j++){
      const tip=(1.97+j*.65)*reach,y=1.58+j*.50;
      a.beam(pos(0,y,tip),pos(0,2.99+j*.63-(corner?.50:0),-2.40-j*.78),1,1);
      g.add(pos(0,y+.12,tip-.25),v(1.13+j*.08,.88,1),rot);
      for(const x of [-.91,0,.91])d.add(pos(x,y+.39,tip-.25),v(.72,.78,.72),rot);
    }
    // Shuatou / upper bearing ties and the inner compression stack.
    b.add(pos(0,2.50,2.26*reach),v(3.0,.19,.40),rot);
    b.add(pos(0,2.68,.30),v(3.15,.22,.42),rot);
    b.add(pos(0,2.48,-.38),v(.46,.52,.56),rot);
    b.add(pos(0,2.78,-1.35),v(.36,.20,2.1),rot);
  }
  function intercolumn(batch:ReturnType<typeof batchGroup>,center:THREE.Vector3,angle:number){
    const q=new THREE.Quaternion().setFromAxisAngle(v(0,1,0),angle),rot=new THREE.Euler(0,angle,0);
    const p=(x:number,y:number,z:number)=>v(x,COLUMN_TOP+y,z).applyQuaternion(q).add(center);
    // Shallow intermediate support, not a scaled seven-course column-head set.
    batch.d.add(p(0,.16,0),v(.95,1,.95),rot);
    batch.g.add(p(0,.53,0),v(.78,.94,.90),rot);
    for(const x of [-.66,0,.66])batch.d.add(p(x,.82,0),v(.66,.72,.66),rot);
    batch.g.add(p(0,1.13,.32),v(.68,.84,.8),new THREE.Euler(0,angle+Math.PI/2,0));
    for(const sign of [-1,1])batch.b.beam(p(sign*.86,.52,-.12),p(0,1.20,-.12),.14,.20);
    batch.b.add(p(0,1.43,.40),v(1.7,.18,.3),rot);
  }
  const sides=[
    {angle:0,points:X.slice(1,-1).map(x=>v(x,0,HALF_DEPTH)),between:X.slice(0,-1).map((x,i)=>v((x+X[i+1])/2,0,HALF_DEPTH)),out:v(0,2.6,3)},
    {angle:Math.PI,points:X.slice(1,-1).map(x=>v(x,0,-HALF_DEPTH)),between:X.slice(0,-1).map((x,i)=>v((x+X[i+1])/2,0,-HALF_DEPTH)),out:v(0,2.6,-3)},
    {angle:Math.PI/2,points:Z.slice(1,-1).map(z=>v(HALF_WIDTH,0,z)),between:Z.slice(0,-1).map((z,i)=>v(HALF_WIDTH,0,(z+Z[i+1])/2)),out:v(3,2.6,0)},
    {angle:-Math.PI/2,points:Z.slice(1,-1).map(z=>v(-HALF_WIDTH,0,z)),between:Z.slice(0,-1).map((z,i)=>v(-HALF_WIDTH,0,(z+Z[i+1])/2)),out:v(-3,2.6,0)}
  ];
  sides.forEach((side,i)=>{
    const main=batchGroup('柱头铺作 · 双杪双下昂',side.out,i);columnSet(main,v(),0);main.finish(side.points.map(position=>({position,angle:side.angle})));
    const intermediate=batchGroup('补间铺作 · 浅出跳',side.out,i);intercolumn(intermediate,v(),0);intermediate.finish(side.between.map(position=>({position,angle:side.angle})));
  });
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const corner=batchGroup('转角铺作 · 三向承托',v(sx*2.6,2.6,sz*2.6),sx+sz);
    const p=v(sx*HALF_WIDTH,0,sz*HALF_DEPTH);
    columnSet(corner,v(),0,true,false,true);
    columnSet(corner,v(),Math.PI/2,false,false,true);
    columnSet(corner,v(),Math.PI/4,false,true,true);
    const angle=sx===1?(sz===1?0:Math.PI/2):(sz===1?-Math.PI/2:Math.PI);
    corner.finish([{position:p,angle}]);
  }
  const inner=batchGroup('内槽铺作 · 梁架承托',v(0,2.7,0),2);
  for(const c of [{x:0,z:0}]){
    inner.d.add(v(c.x,COLUMN_TOP+.225,c.z),v(1.32,1.5,1.32));
    for(let j=0;j<4;j++){
      const y=COLUMN_TOP+.65+j*.57,width=1+j*.13;
      for(const angle of [0,Math.PI/2])inner.g.add(v(c.x,y,c.z),v(width,1,1),new THREE.Euler(0,angle,0));
      for(const s of [-1,1])inner.d.add(v(c.x+s*.84*width,y+.31,c.z),v(.77,.88,.77));
      inner.d.add(v(c.x,y+.31,c.z),v(.90,.88,.90));
    }
  }inner.finish(columns.filter(c=>c.interior).map(c=>({position:v(c.x,0,c.z),angle:0})));
  gong.dispose();ang.dispose();dou.dispose();
  parent.userData.brackets={columnHead:18,corner:4,intercolumn:22,inner:14,courses:7};
}
