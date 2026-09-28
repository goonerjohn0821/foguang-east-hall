import * as THREE from 'three';
import {Batch,boxGeometry,cylinderGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {columns,X,Z,FLOOR,COLUMN_TOP,BASE_HEIGHT,HALF_WIDTH,HALF_DEPTH,ROOF} from './config';
import {roofPoint,roofLanePoint,roofLaneStart} from './Roof';

function moonBeamGeometry(){
  const s=new THREE.Shape();s.moveTo(-.5,.31);s.lineTo(.5,.31);s.lineTo(.5,-.035);s.lineTo(.44,-.035);
  s.quadraticCurveTo(.34,-.04,.27,-.24);s.quadraticCurveTo(0,-.42,-.27,-.24);s.quadraticCurveTo(-.34,-.04,-.44,-.035);s.lineTo(-.5,-.035);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.58,bevelEnabled:false,curveSegments:4});g.translate(0,0,-.29);return g;
}
export const PURLIN_LEVELS=[0,.235,.445,.6975,.88];
export function buildTimberFrame(parent:THREE.Group,m:Materials,e:Explosion){
  const columnGeometry=new THREE.CylinderGeometry(.38,.445,COLUMN_TOP-FLOOR-BASE_HEIGHT,14,1);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const group=new THREE.Group();group.name='内外槽柱网';parent.add(group);const batch=new Batch(columnGeometry,m.column,'column');
    columns.filter(c=>(c.x<0?-1:1)===sx&&(c.z<0?-1:1)===sz).forEach(c=>batch.add(v(c.x,(COLUMN_TOP+FLOOR+BASE_HEIGHT)/2,c.z),v(c.interior?1.04:1,1,c.interior?1.04:1)));
    batch.finish(group);e.register(group,'column',v(sx*1.7,.38,sz*1.1),6);
  }
  const fang=new THREE.Group();fang.name='阑额与柱列联系';parent.add(fang);const lintels=new Batch(boxGeometry,m.fang,'fang');
  for(const z of [-HALF_DEPTH,HALF_DEPTH])for(let i=0;i<7;i++)lintels.add(v((X[i]+X[i+1])/2,COLUMN_TOP-.27,z),v(X[i+1]-X[i]+.10,.46,.35));
  for(const x of [-HALF_WIDTH,HALF_WIDTH])for(let i=0;i<4;i++)lintels.add(v(x,COLUMN_TOP-.27,(Z[i]+Z[i+1])/2),v(.35,.46,Z[i+1]-Z[i]+.10));
  for(const z of [-HALF_DEPTH/2,HALF_DEPTH/2])lintels.add(v(0,COLUMN_TOP-.27,z),v(X[6]-X[1],.46,.40));
  for(const x of [X[1],X[6]])lintels.add(v(x,COLUMN_TOP-.27,0),v(.4,.46,HALF_DEPTH));
  lintels.finish(fang);e.register(fang,'frame',v(0,1.1,0),3,1);

  const beams=new THREE.Group();beams.name='明栿与屋顶草架';parent.add(beams);
  const b=new Batch(boxGeometry,m.beam,'beam'),moon=new Batch(moonBeamGeometry(),m.beam,'beam'),posts=new Batch(boxGeometry,m.beam,'frame');
  const bearingY=COLUMN_TOP+2.92;
  const lowTop=roofPoint(0,0,.445).y-.53,upperTop=roofPoint(0,0,.235).y-.53;
  // Only the four central frames reach the ridge. The two end frames stop below
  // their hip slopes; the previous full-height end frames protruded through them.
  for(const x of X.slice(1,-1)){
    moon.add(v(x,bearingY,0),v(HALF_DEPTH+.42,1,1),new THREE.Euler(0,Math.PI/2,0));
    for(const sign of [-1,1])moon.add(v(x,bearingY,sign*HALF_DEPTH*.75),v(HALF_DEPTH/2+.4,.88,.90),new THREE.Euler(0,Math.PI/2,0));
    if(Math.abs(x)<ROOF.ridgeHalf){
      b.add(v(x,lowTop-.31,0),v(.56,.62,ROOF.halfZ*.445*2+.42));
      b.add(v(x,upperTop-.28,0),v(.48,.56,ROOF.halfZ*.235*2+.42));
      for(const z of [-HALF_DEPTH/2,HALF_DEPTH/2]){
        const bottom=bearingY+.31,top=lowTop-.62;posts.add(v(x,(bottom+top)/2,z),v(.53,top-bottom,.57));
      }
      for(const z of [-ROOF.halfZ*.235,ROOF.halfZ*.235]){
        const bottom=lowTop,top=upperTop-.56;posts.add(v(x,(bottom+top)/2,z),v(.44,top-bottom,.47));
      }
      // Paired chashou hold the ridge, with open triangular space below.
      for(const sign of [-1,1])posts.beam(v(x,upperTop,sign*2.67),v(x,ROOF.ridgeY-.53,sign*.10),.24,.30);
    }else{
      const hipT=(Math.abs(x)-ROOF.ridgeHalf)/(ROOF.halfX-ROOF.ridgeHalf);
      const top=roofPoint(2,0,hipT).y-.61;
      b.add(v(x,top-.28,0),v(.52,.56,5.25));
      for(const z of [-2.13,2.13])posts.add(v(x,(bearingY+.31+top-.56)/2,z),v(.44,top-.56-(bearingY+.31),.48));
    }
  }
  // Longitudinal connections are continuous but kept below the roof envelope.
  for(const z of [-HALF_DEPTH,HALF_DEPTH,-HALF_DEPTH/2,HALF_DEPTH/2])b.add(v(0,bearingY-.17,z),v(HALF_WIDTH*2+.2,.38,.42));
  for(const x of [-HALF_WIDTH,HALF_WIDTH])b.add(v(x,bearingY-.17,0),v(.42,.38,HALF_DEPTH*2+.2));
  b.finish(beams);moon.finish(beams);posts.finish(beams);e.register(beams,'frame',v(0,3.3,0),3);

  const purlins=new THREE.Group();purlins.name='檩与角梁';parent.add(purlins);
  const p=new Batch(cylinderGeometry,m.purlin,'purlin'),hips=new Batch(boxGeometry,m.beam,'frame');
  for(const t of PURLIN_LEVELS){
    const half=ROOF.ridgeHalf+(ROOF.halfX-ROOF.ridgeHalf)*t,y=roofPoint(0,0,t).y-.33;
    for(const sign of t===0?[1]:[-1,1])p.beam(v(-half,y,sign*ROOF.halfZ*t),v(half,y,sign*ROOF.halfZ*t),.19,.19);
    if(t>0)for(const sign of [-1,1])p.beam(v(sign*half,y,-ROOF.halfZ*t),v(sign*half,y,ROOF.halfZ*t),.18,.18);
  }
  for(const face of [0,1])for(const u of [-1,1])for(let j=0;j<5;j++)hips.beam(roofPoint(face,u,j/5).add(v(0,-.32,0)),roofPoint(face,u,(j+1)/5).add(v(0,-.32,0)),.26,.34);
  p.finish(purlins);hips.finish(purlins);e.register(purlins,'purlin',v(0,4.9,0),2,1);
  for(let face=0;face<4;face++){
    const rafters=new THREE.Group();rafters.name='顺坡椽列';parent.add(rafters);const r=new Batch(cylinderGeometry,m.rafter,'rafter'),count=face<2?92:56,extent=face<2?ROOF.halfX:ROOF.halfZ;
    for(let j=0;j<=count;j++){
      const lateral=-extent+.12+(extent*2-.24)*j/count,start=roofLaneStart(face,lateral);
      for(let s=0;s<8;s++){
        const t0=Math.max(start,s/8),t1=(s+1)/8;if(t1-t0<.004)continue;
        r.beam(roofLanePoint(face,lateral,t0).add(v(0,-.115,0)),roofLanePoint(face,lateral,t1).add(v(0,-.115,0)),.075,.075);
      }
    }
    r.finish(rafters);const dir=face===0?v(0,6.3,1):face===1?v(0,6.3,-1):face===2?v(1,6.3,0):v(-1,6.3,0);e.register(rafters,'rafter',dir,2,face);
  }
}
