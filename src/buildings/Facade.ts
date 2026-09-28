import * as THREE from 'three';
import {Batch,boxGeometry,v} from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {FRONT_BAYS,FLOOR,COLUMN_TOP,HALF_WIDTH,HALF_DEPTH} from './config';

/** Five entrance bays (the central bay is open), two end windows; infill meets the platform. */
export function buildFacade(parent:THREE.Group,m:Materials,e:Explosion){
  const sill=FLOOR+1.65,windowTop=COLUMN_TOP-.48,head=COLUMN_TOP-.55;
  for(let face=0;face<4;face++){
    const group=new THREE.Group();group.name=['正面五门两窗','后檐墙','右山墙','左山墙'][face];parent.add(group);
    const wall=new Batch(boxGeometry,m.plaster,'wall'),wood=new Batch(boxGeometry,m.door,'wall'),lattice=new Batch(boxGeometry,m.door,'window');
    const red=new Batch(boxGeometry,m.wallRed,'wall'),stone=new Batch(boxGeometry,m.plaster,'wall'),metal=new Batch(new THREE.TorusGeometry(.085,.018,5,10),m.metal,'wall');
    if(face===0){
      const z=HALF_DEPTH-.10;
      for(const bay of FRONT_BAYS){
        const x=bay.center,w=bay.width-.72;group.userData.frontBays=FRONT_BAYS;
        wood.add(v(x,head,z),v(w,.28,.34));
        for(const s of [-1,1])wood.add(v(x+s*(w/2-.075),(FLOOR+head)/2,z),v(.16,head-FLOOR,.34));
        if(bay.door){
          // The photo shows the central entrance open: retain its frame / sill only.
          // The four flanking door bays keep their existing closed plank leaves.
          const bottom=FLOOR+.10,top=head-.14;
          wood.add(v(x,FLOOR+.055,z),v(w,.11,.37));
          for(const side of bay.index===3?[]:[-1,1]){
            const cx=x+side*w/4,lw=w/2-.024;
            for(let plank=0;plank<6;plank++){
              const tone=.87+((plank*7+bay.index*3)%9)*.023;
              wood.add(v(cx-lw/2+(plank+.5)*lw/6,(bottom+top)/2,z-.025),v(lw/6-.009,top-bottom,.14),new THREE.Euler(),new THREE.Color(tone,tone,tone));
            }
            for(const h of [.22,.52,.83])wood.add(v(cx,bottom+(top-bottom)*h,z-.13),v(lw-.06,.11,.10));
            metal.add(v(x+side*.16,FLOOR+2.13,z+.074));
          }
        }else{
          stone.add(v(x,(FLOOR+sill)/2,z),v(w,sill-FLOOR,.39));
          wood.add(v(x,sill+.07,z),v(w,.14,.32));
          const count=Math.round(w/.17);
          for(let n=0;n<count;n++)lattice.add(v(x-w/2+.13+n*(w-.26)/(count-1),(sill+windowTop)/2,z),v(.065,windowTop-sill,.13));
          lattice.add(v(x,sill+(windowTop-sill)*.53,z-.04),v(w,.075,.15));
        }
        // Narrow plaster band above the door heads, not a tall lattice transom.
        wall.add(v(x,(head+.14+COLUMN_TOP-.16)/2,z-.015),v(w,COLUMN_TOP-.16-(head+.14),.28));
      }
    }else if(face===1){
      const z=-HALF_DEPTH+.10,h=COLUMN_TOP-FLOOR-.3;
      stone.add(v(0,FLOOR+.52,z),v(HALF_WIDTH*2,1.04,.44));
      wall.add(v(0,FLOOR+1.04+(h-1.04)/2,z),v(HALF_WIDTH*2,h-1.04,.40));
      wood.add(v(0,COLUMN_TOP-.38,z),v(HALF_WIDTH*2,.20,.47));
    }else{
      const x=(face===2?1:-1)*(HALF_WIDTH-.1),low=FLOOR+1.08,top=COLUMN_TOP-.32;
      const windowZ=-HALF_DEPTH+2.12,windowWidth=2.08,windowLow=COLUMN_TOP-1.90,windowHigh=COLUMN_TOP-.76;
      stone.add(v(x,(FLOOR+low)/2,0),v(.44,low-FLOOR,HALF_DEPTH*2));
      // Solid red side wall with a single rear-bay straight-lattice opening.
      red.add(v(x,(low+windowLow)/2,0),v(.41,windowLow-low,HALF_DEPTH*2));
      red.add(v(x,(windowHigh+top)/2,0),v(.41,top-windowHigh,HALF_DEPTH*2));
      for(const [a,b] of [[-HALF_DEPTH,windowZ-windowWidth/2],[windowZ+windowWidth/2,HALF_DEPTH]])red.add(v(x,(windowLow+windowHigh)/2,(a+b)/2),v(.41,windowHigh-windowLow,b-a));
      for(const z of [windowZ-windowWidth/2,windowZ+windowWidth/2])wood.add(v(x, (windowLow+windowHigh)/2,z),v(.47,windowHigh-windowLow+.12,.12));
      for(const y of [windowLow,windowHigh])wood.add(v(x,y,windowZ),v(.47,.12,windowWidth+.12));
      for(let n=0;n<13;n++)lattice.add(v(x,(windowLow+windowHigh)/2,windowZ-windowWidth/2+.12+n*(windowWidth-.24)/12),v(.12,windowHigh-windowLow,.056));
      wood.add(v(x,COLUMN_TOP-.34,0),v(.46,.18,HALF_DEPTH*2));
    }
    wall.finish(group);stone.finish(group);red.finish(group);wood.finish(group);lattice.finish(group);metal.finish(group);
    e.register(group,'wall',face===0?v(0,.3,4.4):face===1?v(0,.3,-4.4):face===2?v(4.4,.3,0):v(-4.4,.3,0),5,face);
  }
  const floor=new THREE.Group();parent.add(floor);
  const b=new Batch(boxGeometry,m.dark,'foundation');b.add(v(0,FLOOR+.018,0),v(HALF_WIDTH*2-.65,.024,HALF_DEPTH*2-.65));b.finish(floor);e.register(floor,'foundation',v(0,-.5,0),8);
}
