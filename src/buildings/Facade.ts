import * as THREE from 'three';
import {Batch,boxGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {X,FLOOR} from './config';
export function buildFacade(parent:THREE.Group,m:Materials,e:Explosion){
  for(let face=0;face<4;face++){
    const group=new THREE.Group();parent.add(group);const wall=new Batch(boxGeometry,m.plaster,'wall'),wood=new Batch(boxGeometry,m.door,'wall'),lattice=new Batch(boxGeometry,m.door,'window');
    if(face<2){const z=face===0?8.7:-8.7;
      for(let i=0;i<7;i++){
        const x=(X[i]+X[i+1])/2,w=X[i+1]-X[i]-.64,isDoor=face===0&&i>=2&&i<=4;
        if(face===1){wall.add(v(x,4.62,z),v(w,4.94,.38));continue;}
        wood.add(v(x,6.69,z),v(w,.41,.32));wood.add(v(x,2.53,z),v(w,.32,.32));
        for(let s of [-1,1])wood.add(v(x+s*(w/2-.08),4.5,z),v(.18,4.16,.32));
        if(isDoor){
          // The centre leaves stand slightly open; neighbouring door bays stay closed.
          for(let leaf=0;leaf<4;leaf++){
            const lx=x+(leaf-1.5)*w/4;wood.add(v(lx,4.33,z+(i===3&&(leaf===1||leaf===2)?-.35:0)),v(w/4-.04,3.25,.15),new THREE.Euler(0,i===3&&(leaf===1||leaf===2)?(leaf===1?-.36:.36):0));
            for(let k=0;k<3;k++)wood.add(v(lx,3.1+k*1.07,z+.1),v(w/4-.1,.07,.1));
          }
        }else{
          wall.add(v(x,2.99,z),v(w,1.36,.35));
          wood.add(v(x,3.71,z),v(w,.16,.28));
          for(let n=0;n<19;n++)lattice.add(v(x-w/2+.16+n*(w-.32)/18,5.06,z),v(.063,2.49,.095));
          for(let n=0;n<7;n++)lattice.add(v(x,3.92+n*.38,z+.035),v(w-.18,.049,.084));
        }
        // Tall horizontal transom under the lintel.
        for(let n=0;n<13;n++)lattice.add(v(x-w/2+.15+n*(w-.3)/12,6.2,z),v(.065,.55,.11));
      }
    }else{
      const x=face===2?16.83:-16.83;wall.add(v(x,4.58,0),v(.4,4.86,17.6));wood.add(v(x,6.88,0),v(.5,.28,17.7));
    }
    wall.finish(group);wood.finish(group);lattice.finish(group);e.register(group,'wall',face===0?v(0,.3,4.4):face===1?v(0,.3,-4.4):face===2?v(4.4,.3,0):v(-4.4,.3,0),5,face);
  }
  // A dark interior floor, without inventing sacred sculptures or mural imagery.
  const floor=new THREE.Group();parent.add(floor);const b=new Batch(boxGeometry,m.dark,'foundation');b.add(v(0,FLOOR+.012,0),v(33.7,.018,17.4));b.finish(floor);e.register(floor,'foundation',v(0,-.5,0),8);
}
