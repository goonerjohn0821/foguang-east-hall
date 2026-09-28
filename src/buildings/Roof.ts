import * as THREE from 'three';
import {Batch,boxGeometry,tube,v} from '../geometry';
import {random} from '../materials';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {ROOF} from './config';
export {ROOF} from './config';
export function roofPoint(face:number,u:number,t:number){
  const {halfX,halfZ,ridgeHalf,ridgeY,eaveY}=ROOF;
  const width=ridgeHalf+(halfX-ridgeHalf)*t;
  const y=ridgeY-(ridgeY-eaveY)*(1-Math.pow(1-t,1.45))+.06*Math.pow(t,9)+.20*Math.pow(Math.abs(u),7)*Math.pow(t,5);
  return face<2?v(u*width,y,(face===0?1:-1)*halfZ*t):v((face===2?1:-1)*width,y,u*halfZ*t);
}
// Keep tile / rafter lanes parallel. Outer lanes begin at the hip boundary.
export function roofLaneStart(face:number,lateral:number){return face<2?Math.max(0,(Math.abs(lateral)-ROOF.ridgeHalf)/(ROOF.halfX-ROOF.ridgeHalf)):Math.abs(lateral)/ROOF.halfZ;}
export function roofLanePoint(face:number,lateral:number,t:number){
  const span=face<2?ROOF.ridgeHalf+(ROOF.halfX-ROOF.ridgeHalf)*t:Math.max(.00001,ROOF.halfZ*t);
  return roofPoint(face,THREE.MathUtils.clamp(lateral/span,-1,1),t);
}
export function roofGeometry(face:number){
  const pos:number[]=[],uv:number[]=[],idx:number[]=[];const nu=48,nt=28;
  for(let j=0;j<=nt;j++)for(let i=0;i<=nu;i++){const p=roofPoint(face,-1+2*i/nu,j/nt);pos.push(p.x,p.y,p.z);uv.push(i/nu*9,j/nt*5);}
  for(let j=0;j<nt;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;const reverse=face===1||face===2;if(reverse)idx.push(a,b,c,b,d,c);else idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function tileGeometry(){const p:number[]=[],uv:number[]=[],idx:number[]=[];for(let j=0;j<=1;j++)for(let i=0;i<=6;i++){const a=i/6*Math.PI;p.push(Math.cos(a)*.105,Math.sin(a)*.085,j);uv.push(i/6,j);}for(let i=0;i<6;i++)idx.push(i,i+1,i+7,i+1,i+8,i+7);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function buildRoof(parent:THREE.Group,m:Materials,e:Explosion){
  const tiles=tileGeometry(),rng=random(100);m.tile.side=THREE.DoubleSide;
  const surfaces:THREE.MeshStandardMaterial[]=[m.tile,m.ridge];
  for(let face=0;face<4;face++){
    const group=new THREE.Group();parent.add(group);const material=m.tile.clone();surfaces.push(material);material.side=THREE.DoubleSide;
    const mesh=new THREE.Mesh(roofGeometry(face),material);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.kind='roof';group.add(mesh);
    const batch=new Batch(tiles,m.tile,'roof');const rows=35;const count=face<2?146:88;
    const extent=face<2?ROOF.halfX:ROOF.halfZ;
    for(let i=0;i<count;i++){
      const lateral=-extent+(i+.5)*2*extent/count,start=roofLaneStart(face,lateral);
      for(let row=0;row<rows;row++){
        const t0=Math.max(start,row/rows),t1=Math.min(1,(row+1)/rows+.001);if(t1-t0<.003)continue;
        const a=roofLanePoint(face,lateral,t0).add(v(0,.025,0)),b=roofLanePoint(face,lateral,t1);
        const axis=b.clone().sub(a),length=axis.length();axis.normalize();const x=v(0,1,0).cross(axis).normalize(),y=axis.clone().cross(x).normalize();
        const matrix=new THREE.Matrix4().makeBasis(x,y,axis);matrix.setPosition(a);matrix.scale(v(1,1,length+.025));const c=.8+rng()*.32;batch.matrix(matrix,new THREE.Color(c,c,c*.985));
      }
    }batch.finish(group);
    const direction=face===0?v(0,8,1.8):face===1?v(0,8,-1.8):face===2?v(1.8,8,0):v(-1.8,8,0);e.register(group,'roof',direction,1,face);
    // Fascia and round tile ends are distinct from the tile skin in exploded view.
    const eave=new THREE.Group();parent.add(eave);const edge=new Batch(boxGeometry,m.rafter,'rafter'),ends=new Batch(new THREE.CylinderGeometry(.105,.105,.07,8),m.tile,'roof');
    const pieces=face<2?88:52;
    for(let i=0;i<pieces;i++){
      const u0=-1+2*i/pieces,u1=-1+2*(i+1)/pieces;
      edge.beam(roofPoint(face,u0,1).add(v(0,-.14,0)),roofPoint(face,u1,1).add(v(0,-.14,0)),.18,.14);
      const p=roofPoint(face,(u0+u1)/2,1);ends.add(p,v(1,1,1),new THREE.Euler(face<2?Math.PI/2:0,0,face>=2?Math.PI/2:0));
    }edge.finish(eave);ends.finish(eave);e.register(eave,'rafter',direction.clone().multiplyScalar(.76),2,face);
  }
  const ridges=new THREE.Group();parent.add(ridges);
  const {ridgeHalf,ridgeY}=ROOF;
  ridges.add(tube(Array.from({length:33},(_,i)=>v(-ridgeHalf+i*ridgeHalf*2/32,ridgeY+.20+.07*Math.pow(Math.abs(i-16)/16,4),0)),.22,m.ridge,'ridge'));
  // Four hip ridges, sharing exactly the same edge curve as the adjoining roof slopes.
  for(let face of [0,1])for(let u of [-1,1])ridges.add(tube(Array.from({length:25},(_,i)=>roofPoint(face,u,i/24).add(v(0,.15,0))),.16,m.ridge,'ridge'));
  const shape=new THREE.Shape();shape.moveTo(-.5,0);shape.lineTo(.38,0);shape.quadraticCurveTo(1,.4,1.05,1.03);shape.quadraticCurveTo(1.04,1.68,.44,2.08);shape.quadraticCurveTo(.64,1.38,.14,1.17);shape.quadraticCurveTo(-.12,1.48,-.46,1.26);shape.quadraticCurveTo(-.35,.72,-.5,0);
  const chiwei=new THREE.ExtrudeGeometry(shape,{depth:.49,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.07,bevelThickness:.06});chiwei.translate(0,0,-.245);
  for(let sign of [-1,1]){const ornament=new THREE.Mesh(chiwei,m.ridge);ornament.position.set(sign*(ridgeHalf+.08),ridgeY+.28,0);ornament.scale.set(sign*.94,.94,1);ornament.castShadow=true;ornament.userData.kind='ridge';ridges.add(ornament);for(let j=0;j<6;j++)ridges.add(tube([v(sign*(ridgeHalf-.31+j*.055),ridgeY+.63+j*.17,-.28),v(sign*(ridgeHalf+.35+j*.022),ridgeY+.72+j*.16,-.28),v(sign*(ridgeHalf+.71-j*.015),ridgeY+.96+j*.11,-.2)],.027,m.ridge,'ridge'));}
  // Small central ridge finial visible in the supplied present-day elevations.
  const finial=new Batch(new THREE.CylinderGeometry(.16,.24,.36,8),m.ridge,'ridge');
  for(let i=0;i<3;i++)finial.add(v(0,ridgeY+.47+i*.25,0),v(1-i*.2,.7,1-i*.2));finial.finish(ridges);
  e.register(ridges,'ridge',v(0,10.2,0),0);
  return surfaces;
}
