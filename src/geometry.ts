import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const dummy = new THREE.Object3D();
export class Batch {
  matrices:THREE.Matrix4[]=[]; colors:THREE.Color[]=[];
  constructor(public geometry:THREE.BufferGeometry,public material:THREE.Material,public kind:string){}
  add(pos:THREE.Vector3,scale= v(1,1,1),rot=new THREE.Euler(),color?:THREE.Color){dummy.position.copy(pos);dummy.scale.copy(scale);dummy.rotation.copy(rot);dummy.updateMatrix();this.matrices.push(dummy.matrix.clone());this.colors.push(color?.clone()??new THREE.Color(1,1,1));return this;}
  matrix(m:THREE.Matrix4,color?:THREE.Color){this.matrices.push(m.clone());this.colors.push(color?.clone()??new THREE.Color(1,1,1));return this;}
  beam(a:THREE.Vector3,b:THREE.Vector3,width:number,depth=width){const direction=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(v(0,1,0),direction.clone().normalize());dummy.scale.set(width,direction.length(),depth);dummy.updateMatrix();return this.matrix(dummy.matrix);}
  finish(parent:THREE.Object3D){if(!this.matrices.length)return undefined;const mesh=new THREE.InstancedMesh(this.geometry,this.material,this.matrices.length);this.matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,this.colors[i]);});mesh.userData.kind=this.kind;mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=this.kind;mesh.computeBoundingSphere();parent.add(mesh);return mesh;}
}
export const boxGeometry=new THREE.BoxGeometry(1,1,1);
export const cylinderGeometry=new THREE.CylinderGeometry(1,1,1,10);
export function box(parent:THREE.Object3D,mat:THREE.Material,pos:THREE.Vector3,size:THREE.Vector3,kind:string){const mesh=new THREE.Mesh(boxGeometry,mat);mesh.position.copy(pos);mesh.scale.copy(size);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.kind=kind;parent.add(mesh);return mesh;}
export function mergedBoxes(parts:{p:THREE.Vector3;s:THREE.Vector3}[]){const geometries=parts.map(p=>{const g=boxGeometry.clone();g.scale(p.s.x,p.s.y,p.s.z);g.translate(p.p.x,p.p.y,p.p.z);return g;});const result=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());return result;}
export function tube(points:THREE.Vector3[],radius:number,material:THREE.Material,kind:string){const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(8,points.length*2),radius,7,false),material);mesh.userData.kind=kind;mesh.castShadow=mesh.receiveShadow=true;return mesh;}
