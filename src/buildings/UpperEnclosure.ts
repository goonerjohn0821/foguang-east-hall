import * as THREE from 'three';
import {Batch,v} from '../geometry';
import {COLUMN_TOP,HALF_WIDTH,HALF_DEPTH,ROOF} from './config';
import {roofPoint} from './Roof';

/** At the column plane, behind projecting brackets. This closes the interior,
 * not the genuine open spaces among the dougong arms under the deep eaves.
 */
export function upperRoofHeight(x:number,z:number){
  const tz=Math.abs(z)/ROOF.halfZ,tx=(Math.abs(x)-ROOF.ridgeHalf)/(ROOF.halfX-ROOF.ridgeHalf);
  const t=Math.max(tz,tx),front=tz>=tx;
  const u=front?x/(ROOF.ridgeHalf+(ROOF.halfX-ROOF.ridgeHalf)*t):z/(ROOF.halfZ*t);
  return roofPoint(front?(z>=0?0:1):(x>=0?2:3),u,t).y-.07;
}
export function buildUpperEnclosure(parent:THREE.Group,face:number,wood:Batch,material:THREE.Material){
  const front=face<2,sign=face===0||face===2?1:-1;
  const extent=front?HALF_WIDTH:HALF_DEPTH;
  const fixed=sign*((front?HALF_DEPTH:HALF_WIDTH)-.16),base=COLUMN_TOP-.22;
  const pos:number[]=[],uv:number[]=[],index:number[]=[],segments=40;
  // A closed thin wall, its top follows the hip roof instead of crossing it.
  for(const offset of [-.12,.12])for(let i=0;i<=segments;i++){
    const a=-extent+2*extent*i/segments;
    const x=front?a:fixed+offset,z=front?fixed+offset:a,top=upperRoofHeight(x,z);
    pos.push(x,base,z,x,top,z);uv.push((a+extent)/3,0,(a+extent)/3,(top-base)/2);
  }
  const ring=(segments+1)*2;
  for(let i=0;i<segments;i++){
    const a=i*2,b=a+2;
    index.push(a,b,a+1,b,b+1,a+1,ring+a,ring+a+1,ring+b,ring+b,ring+a+1,ring+b+1);
    index.push(a+1,b+1,ring+a+1,b+1,ring+b+1,ring+a+1);
    index.push(a,ring+a,b,b,ring+a,ring+b);
  }
  for(const a of [0,segments*2])index.push(a,a+1,ring+a,a+1,ring+a+1,ring+a);
  if(front)for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(index);geometry.computeVertexNormals();
  // Faces have both winding orientations on different sides; no gaps from culling.
  const mesh=new THREE.Mesh(geometry,material);mesh.name='斗拱后方封闭木壁';mesh.userData.kind='wall';
  mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);
  // Continuous board courses add readable timber backing without tiny parts.
  const outside=fixed+sign*.135,cap=upperRoofHeight(front?0:fixed,front?fixed:0);
  for(let y=base+.27;y<cap-.12;y+=.27){
    wood.add(front?v(0,y,outside):v(outside,y,0),front?v(extent*2,.027,.018):v(.018,.027,extent*2),new THREE.Euler(),new THREE.Color(.58,.58,.58));
  }
}
