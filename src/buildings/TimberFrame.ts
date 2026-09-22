import * as THREE from 'three';
import {Batch,boxGeometry,cylinderGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {columns,X,Z,FLOOR,COLUMN_TOP} from './config';
import {roofPoint} from './Roof';
export function buildTimberFrame(parent:THREE.Group,m:Materials,e:Explosion){
  for(let sx of [-1,1])for(let sz of [-1,1]){
    const group=new THREE.Group();parent.add(group);const batch=new Batch(new THREE.CylinderGeometry(.34,.415,COLUMN_TOP-FLOOR-.28,14,1),m.column,'column');
    columns.filter(c=>(c.x<0?-1:1)===sx&&(c.z<0?-1:1)===sz).forEach(c=>batch.add(v(c.x,(COLUMN_TOP+FLOOR+.28)/2,c.z),v(c.interior?.98:1,1,c.interior?.98:1)));batch.finish(group);e.register(group,'column',v(sx*1.7,.38,sz*1.1),6);
  }
  const fang=new THREE.Group();parent.add(fang);const lintels=new Batch(boxGeometry,m.fang,'fang');
  for(let z of [-8.85,8.85])for(let i=0;i<7;i++)lintels.add(v((X[i]+X[i+1])/2,7.15,z),v(X[i+1]-X[i]+.12,.53,.36));
  for(let x of [-17,17])for(let i=0;i<4;i++)lintels.add(v(x,7.15,(Z[i]+Z[i+1])/2),v(.36,.53,Z[i+1]-Z[i]+.12));
  for(let z of [-4.425,4.425])lintels.add(v(0,7.25,z),v(25.3,.5,.46));lintels.finish(fang);e.register(fang,'frame',v(0,1.1,0),3,1);
  const beams=new THREE.Group();parent.add(beams);const b=new Batch(boxGeometry,m.beam,'beam'),posts=new Batch(boxGeometry,m.beam,'frame');
  // Transverse stepped beam frames; mortise-and-tenon joints are visually simplified.
  for(let x of X.slice(1,-1)){
    b.add(v(x,9.08,0),v(.56,.72,19.1));
    b.add(v(x,10.22,0),v(.48,.64,14.2));
    b.add(v(x,11.57,0),v(.45,.61,8.4));
    b.add(v(x,12.76,0),v(.41,.54,3.8));
    for(let z of [-6.1,6.1])posts.add(v(x,9.66,z),v(.42,.5,.46));
    for(let z of [-3.6,3.6])posts.add(v(x,10.9,z),v(.42,.74,.46));
    for(let z of [-1.4,1.4])posts.add(v(x,12.18,z),v(.37,.62,.4));
    posts.add(v(x,13.49,0),v(.36,.93,.4));
  }
  // Outer and inner connecting rings keep the frame legible in section.
  for(let z of [-9.4,9.4,-4.425,4.425])b.add(v(0,8.92,z),v(35.5,.5,.5));
  for(let x of [-17.45,17.45])b.add(v(x,8.92,0),v(.5,.5,19.3));
  b.finish(beams);posts.finish(beams);e.register(beams,'frame',v(0,3.3,0),3);
  const purlins=new THREE.Group();parent.add(purlins);const p=new Batch(cylinderGeometry,m.purlin,'purlin');
  for(let t of [.035,.21,.41,.63,.81,.96])for(let sign of [-1,1]){
    const a=roofPoint(sign===1?0:1,-1,t).add(v(0,-.29,0)),b=roofPoint(sign===1?0:1,1,t).add(v(0,-.29,0));p.beam(a,b,.18,.18);
  }
  for(let face of [2,3])for(let t of [.35,.63,.9])p.beam(roofPoint(face,-1,t).add(v(0,-.29,0)),roofPoint(face,1,t).add(v(0,-.29,0)),.18,.18);
  p.finish(purlins);e.register(purlins,'purlin',v(0,4.9,0),2,1);
  for(let face=0;face<4;face++){
    const rafters=new THREE.Group();parent.add(rafters);const r=new Batch(cylinderGeometry,m.rafter,'rafter');const count=face<2?78:46;
    for(let j=0;j<=count;j++){
      const u=-1+2*j/count;
      for(let s=0;s<12;s++){const t0=face<2?s/12:Math.max(.12,s/12),t1=(s+1)/12;if(t1<=t0)continue;r.beam(roofPoint(face,u,t0).add(v(0,-.135,0)),roofPoint(face,u,t1).add(v(0,-.135,0)),.08,.08);}
    }r.finish(rafters);const dir=face===0?v(0,6.3,1):face===1?v(0,6.3,-1):face===2?v(1,6.3,0):v(-1,6.3,0);e.register(rafters,'rafter',dir,2,face);
  }
}
