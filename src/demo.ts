import type {SceneController} from './scene';
import {v} from './geometry';
export const chapters=[{title:'观殿',caption:'完整建筑 · 让目光沿舒展的屋檐展开',duration:6},{title:'透顶',caption:'屋顶渐隐 · 看见瓦面之下的承托关系',duration:6},{title:'梁架',caption:'层层抬梁 · 檩与椽组织出屋面曲线',duration:6},{title:'铺作',caption:'斗拱分离 · 从柱头向深檐层层出挑',duration:6},{title:'拆解',caption:'结构全览 · 从石础、柱网到屋脊',duration:7},{title:'合拢',caption:'木石归位 · 回到完整的东大殿',duration:6}];
export class Demonstration{
  active=false;elapsed=0;chapter=-1;duration=37;onChapter:(index:number)=>void=()=>{};onEnd:()=>void=()=>{};
  constructor(private scene:SceneController){}
  start(){this.active=true;this.elapsed=0;this.chapter=-1;this.scene.setAuto(false);this.scene.temple.explosion.to(0);this.scene.temple.setStructure(false);this.update(0);}
  stop(){if(!this.active)return;this.active=false;this.onEnd();}
  update(dt:number){if(!this.active)return;this.elapsed+=dt;let i=0,t=this.elapsed;while(i<chapters.length&&t>=chapters[i].duration){t-=chapters[i].duration;i++;}if(i>=chapters.length){this.scene.temple.setStructure(false);this.scene.temple.explosion.to(0);this.stop();return;}
    if(i!==this.chapter){this.chapter=i;const s=this.scene;const mobile=s.camera.aspect<.85,wide=mobile?1.35:1;
      if(i===0){s.focus(v(42*wide,20*wide,57*wide),v(0,7,0));}
      if(i===1){s.temple.setStructure(true);s.focus(v(34*wide,29*wide,43*wide),v(0,8,0));}
      if(i===2){s.focus(v(26*wide,21*wide,35*wide),v(0,8,0));}
      if(i===3){s.temple.explosion.to(1,['dougong']);s.focus(v(31*wide,19*wide,42*wide),v(0,9,0));}
      if(i===4){s.temple.setStructure(false);s.temple.explosion.to(1);s.home(true);}
      if(i===5){s.temple.explosion.to(0);s.temple.setStructure(false);s.home();}this.onChapter(i);
    }
  }
}
