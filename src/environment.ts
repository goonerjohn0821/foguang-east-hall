import * as THREE from 'three';
import {Batch,box,boxGeometry,cylinderGeometry,mergedBoxes,v} from './geometry';
import {random} from './materials';
import type {Materials} from './materials';
import {roofGeometry} from './buildings/Roof';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
function pineFoliage(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const context=canvas.getContext('2d')!,r=random(421);
  for(let branch=0;branch<19;branch++){
    const angle=branch/19*Math.PI*2+(r()-.5)*.3,length=55+r()*65;
    const ox=128+(r()-.5)*22,oy=128+(r()-.5)*12,dx=Math.cos(angle),dy=Math.sin(angle)*.68;
    context.strokeStyle='rgba(150,144,121,.95)';context.lineWidth=1.4;context.beginPath();context.moveTo(ox,oy);context.lineTo(ox+dx*length,oy+dy*length);context.stroke();
    for(let n=0;n<42;n++){
      const t=r(),x=ox+dx*length*t,y=oy+dy*length*t,needle=9+r()*17,spread=(r()-.5)*2.6,a=angle+spread;
      context.strokeStyle=`rgba(${155+Math.floor(r()*50)},${170+Math.floor(r()*65)},${137+Math.floor(r()*35)},${.6+r()*.4})`;context.lineWidth=.65+r()*.8;context.beginPath();context.moveTo(x,y);context.lineTo(x+Math.cos(a)*needle,y+Math.sin(a)*needle*.75);context.stroke();
    }
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const material=new THREE.MeshStandardMaterial({color:0x617750,map,alphaTest:.28,side:THREE.DoubleSide,roughness:1,depthWrite:true});
  const cards=[0,Math.PI/3,Math.PI*2/3].map(a=>{const g=new THREE.PlaneGeometry(2,2);g.rotateY(a);return g;});const geometry=mergeGeometries(cards);cards.forEach(g=>g.dispose());return {material,geometry};
}
export function createEnvironment(scene:THREE.Scene,m:Materials){
  m={...m,tile:m.tile.clone(),plaster:m.plaster.clone(),door:m.door.clone()};
  const group=new THREE.Group();group.name='山地寺院环境（意象化）';scene.add(group);const rng=random(343);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(550,550),m.earth);ground.rotation.x=-Math.PI/2;ground.position.y=-.2;ground.receiveShadow=true;group.add(ground);
  const courtyard=new THREE.Mesh(new THREE.PlaneGeometry(97,95),m.paving);courtyard.rotation.x=-Math.PI/2;courtyard.position.set(0,.013,15);courtyard.receiveShadow=true;group.add(courtyard);
  // Continuous smooth height field: hills rise behind the hall, the west-facing court stays open.
  const terrain=new THREE.PlaneGeometry(520,380,96,76);terrain.rotateX(-Math.PI/2);const positions=terrain.attributes.position;const colors:number[]=[];
  const height=(x:number,z:number)=>{
    const ridge=Math.exp(-Math.pow((z+100)/65,2))*(18+10*Math.sin(x*.014+1)+7*Math.cos(x*.05));
    const side=Math.pow(Math.min(1,Math.abs(x)/120),2)*16;const courtyardMask=THREE.MathUtils.smoothstep(Math.max(Math.abs(x)/48,-z/34),.9,1.7);
    return -.6+courtyardMask*(ridge+side+2.3*Math.sin(x*.087)*Math.sin(z*.06));
  };
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i)-91,y=height(x,z);positions.setXYZ(i,x,y,z);const c=new THREE.Color().setHSL(.22+.025*rng(),.12+rng()*.04,.27+y*.0014+rng()*.025).convertSRGBToLinear();colors.push(c.r,c.g,c.b);}
  terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const land=new THREE.Mesh(terrain,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));land.receiveShadow=true;group.add(land);
  for(let layer=0;layer<2;layer++){
    const mount=new THREE.PlaneGeometry(600,130,80,20);mount.rotateX(-Math.PI/2);const attr=mount.attributes.position;
    for(let i=0;i<attr.count;i++){const x=attr.getX(i),z=attr.getZ(i);attr.setXYZ(i,x,8+Math.pow(Math.cos(z/130*Math.PI),2)*(19+8*Math.sin(x*.031+layer*2)+11*Math.sin(x*.013)),z-205-layer*75);}mount.computeVertexNormals();group.add(new THREE.Mesh(mount,new THREE.MeshStandardMaterial({color:layer===0?0x778c83:0x93a8a1,roughness:1})));
  }
  // Courtyard walls are merged into one geometry, with a break at the main approach.
  const walls=mergedBoxes([{p:v(-43,1.05,2),s:v(.9,2.1,66)},{p:v(43,1.05,2),s:v(.9,2.1,66)},{p:v(0,1.05,-30),s:v(86,2.1,.9)}]);const wall=new THREE.Mesh(walls,m.plaster);wall.castShadow=wall.receiveShadow=true;group.add(wall);
  const caps=new Batch(boxGeometry,m.tile,'environment');caps.add(v(-43,2.18,2),v(1.15,.24,66)).add(v(43,2.18,2),v(1.15,.24,66)).add(v(0,2.18,-30),v(86,.24,1.15)).finish(group);
  // Recessive ancillary silhouettes, intentionally not a survey of the full monastery.
  for(let sign of [-1,1]){
    const aux=new THREE.Group();aux.position.set(sign*38,0,-9);aux.rotation.y=Math.PI/2;aux.scale.set(.34,.37,.3);group.add(aux);
    box(aux,m.plaster,v(0,4.7,0),v(34,8.5,17),'environment');
    for(let face=0;face<4;face++){const roof=new THREE.Mesh(roofGeometry(face),m.tile);roof.castShadow=true;aux.add(roof);}
    const col=new Batch(cylinderGeometry,m.door,'environment');for(let x=-15;x<=15;x+=5)col.add(v(x,4.7,8.7),v(.4,8,.4));col.finish(aux);
  }
  const needles=pineFoliage();const trunks=new Batch(cylinderGeometry,m.bark,'environment'),foliage=new Batch(needles.geometry,needles.material,'environment');
  function tree(x:number,z:number,h:number,wide=false){
    const base=Math.max(.025,height(x,z));const lean=(rng()-.5)*1.6;
    trunks.beam(v(x,base,z),v(x+lean,base+h*.86,z+.3),h*(wide?.043:.027),h*(wide?.035:.022));
    for(let level=0;level<6;level++){
      const y=base+h*(.4+level*.105),r=h*(wide?.29:.2)*(1-level*.105);
      for(let branch=0;branch<5;branch++){
        const a=branch*Math.PI*.4+level*1.3+rng()*.5,reach=r*(.62+rng()*.4),px=x+Math.cos(a)*reach,pz=z+Math.sin(a)*reach;
        trunks.beam(v(x+lean*.6,y-.4,z),v(px,y+.18,pz),h*.011,h*.011);
        for(let k=0;k<3;k++){const c=.68+rng()*.45;foliage.add(v(px+(rng()-.5)*r*.6,y+rng()*.6,pz+(rng()-.5)*r*.6),v(r*.55,.39+r*.16,r*.43),new THREE.Euler(rng()*.4,a,rng()*.25),new THREE.Color(c,c,c));}
      }
    }
  }
  tree(-29,1,16,true);tree(28,-10,14,true);tree(-31,-18,17);tree(-39,31,11);
  for(let i=0;i<110;i++){const x=(rng()-.5)*270,z=-37-rng()*130;if(Math.abs(x)<24&&z>-51)continue;tree(x,z,5+rng()*10);}
  for(let i=0;i<12;i++)tree((i%2?1:-1)*(48+rng()*20),-18+rng()*90,6+rng()*6);
  trunks.finish(group);const trees=foliage.finish(group);if(trees)trees.castShadow=false;
  const grasses=new Batch(new THREE.ConeGeometry(.11,.64,3),m.grass,'environment');
  for(let i=0;i<950;i++){const x=(rng()-.5)*115,z=(rng()-.5)*100;if(Math.abs(x)<24&&z<24&&z>-16||Math.abs(x)<7&&z>10||Math.abs(x)<36&&z>20)continue;grasses.add(v(x,.2,z),v(.6+rng(),.4+rng(),.6+rng()),new THREE.Euler(0,rng()*6.28,0));}const grass=grasses.finish(group);if(grass)grass.castShadow=false;
  const sky=new THREE.Mesh(new THREE.SphereGeometry(460,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x7cacc5)},bottom:{value:new THREE.Color(0xdde1d4)}},vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 vWorld;void main(){float h=pow(clamp(normalize(vWorld).y+.03,0.,1.),.6);gl_FragColor=vec4(mix(bottom,top,h),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));sky.material.fog=false;scene.add(sky);
  return group;
}
