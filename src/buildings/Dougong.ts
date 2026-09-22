import * as THREE from 'three';
import {Batch,boxGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {X,Z,COLUMN_TOP,columns} from './config';
function gongGeometry(){
  const s=new THREE.Shape();s.moveTo(-.96,.17);s.lineTo(.96,.17);s.lineTo(.96,-.01);s.quadraticCurveTo(.65,-.02,.51,-.15);s.quadraticCurveTo(.24,-.28,0,-.28);s.quadraticCurveTo(-.24,-.28,-.51,-.15);s.quadraticCurveTo(-.65,-.02,-.96,-.01);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.27,bevelEnabled:false});g.translate(0,0,-.135);return g;
}
export function buildDougong(parent:THREE.Group,m:Materials,e:Explosion){
  const gong=gongGeometry(); const dou=new THREE.CylinderGeometry(.33,.24,.24,4,1);dou.rotateY(Math.PI/4);
  const sides=[{angle:0,locations:X.map(x=>v(x,0,8.85)),between:X.slice(0,-1).map((x,i)=>v((x+X[i+1])/2,0,8.85)),out:v(0,2.6,3)},
    {angle:Math.PI,locations:X.map(x=>v(x,0,-8.85)),between:X.slice(0,-1).map((x,i)=>v((x+X[i+1])/2,0,-8.85)),out:v(0,2.6,-3)},
    {angle:Math.PI/2,locations:Z.slice(1,-1).map(z=>v(17,0,z)),between:Z.slice(0,-1).map((z,i)=>v(17,0,(z+Z[i+1])/2)),out:v(3,2.6,0)},
    {angle:-Math.PI/2,locations:Z.slice(1,-1).map(z=>v(-17,0,z)),between:Z.slice(0,-1).map((z,i)=>v(-17,0,(z+Z[i+1])/2)),out:v(-3,2.6,0)}];
  sides.forEach((side,index)=>{
    const group=new THREE.Group();parent.add(group);const d=new Batch(dou,m.dougong,'dougong'),g=new Batch(gong,m.dougong,'dougong'),a=new Batch(boxGeometry,m.dougong,'dougong');
    const assembly=(center:THREE.Vector3,angle:number,scale=1)=>{
      const quaternion=new THREE.Quaternion().setFromAxisAngle(v(0,1,0),angle);
      const pos=(x:number,y:number,z:number)=>v(x*scale,y,z*scale).applyQuaternion(quaternion).add(center);
      const rot=new THREE.Euler(0,angle,0);
      d.add(pos(0,COLUMN_TOP+.13,0),v(1.45,1.3,1.45),rot);
      // Crossing gong arms, bearing blocks and two descending ang reproduce the large outward steps.
      for(let level=0;level<4;level++){
        const y=COLUMN_TOP+.36+level*.35,z=level*.49;
        g.add(pos(0,y,z),v(scale*(1+level*.13),1,scale),rot);
        a.add(pos(0,y-.02,z-.3),v(.24,.22,1.15*scale),rot);
        for(let x of [-.64,.64])d.add(pos(x*(1+level*.13),y+.25,z),v(.67,.78,.67),rot);
        if(level>0){g.add(pos(0,y,-.25),v(scale*.75,1,scale),new THREE.Euler(0,angle+Math.PI/2,0));d.add(pos(0,y+.2,z+.37),v(.72,.8,.72),rot);}
      }
      for(let j=0;j<2;j++)a.beam(pos(0,8.48+j*.38,-.8),pos(0,7.88+j*.38,1.2+j*.53),.22,.31);
      a.add(pos(0,9.15,1.56),v(2.68*scale,.22,.4),rot);
    };
    side.locations.forEach(p=>assembly(p,side.angle));side.between.forEach(p=>assembly(p,side.angle,.75));
    if(index<2)for(let x of [-17,17])assembly(v(x,0,index===0?8.85:-8.85),Math.atan2(Math.sign(x),index===0?1:-1),.88);
    d.finish(group);g.finish(group);a.finish(group);e.register(group,'dougong',side.out,4,index);
  });
  const inner=new THREE.Group();parent.add(inner);const blocks=new Batch(dou,m.dougong,'dougong'),arms=new Batch(gong,m.dougong,'dougong');
  for(const c of columns.filter(c=>c.interior)){
    blocks.add(v(c.x,7.72,c.z),v(1.4,1.4,1.4));
    for(let j=0;j<4;j++){arms.add(v(c.x,7.94+j*.3,c.z),v(1+j*.16,1,1));arms.add(v(c.x,7.94+j*.3,c.z),v(1+j*.16,1,1),new THREE.Euler(0,Math.PI/2,0));for(const s of [-1,1])blocks.add(v(c.x+s*(.6+j*.1),8.12+j*.3,c.z),v(.7,.7,.7));}
  }
  blocks.finish(inner);arms.finish(inner);e.register(inner,'dougong',v(0,2.7,0),4,2);
}
