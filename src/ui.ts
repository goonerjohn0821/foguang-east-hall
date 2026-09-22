import * as THREE from 'three';
import type {SceneController} from './scene';
import {Demonstration,chapters} from './demo';
import {knowledge} from './knowledge';
import {Walkthrough} from './walk';
import {v} from './geometry';
const paths:Record<string,string>={orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/>',explode:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',assemble:'<path d="m12 7 7 4-7 4-7-4 7-4ZM5 15l7 4 7-4M12 1v4M9 3l3 3 3-3"/>',structure:'<path d="M4 21V8l8-5 8 5v13M4 9h16M4 15h16M8 9v12M16 9v12M2 21h20"/>',fullscreen:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',play:'<path d="m8 4 12 8-12 8V4Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',home:'<path d="m3 10 9-7 9 7M6 9v11h12V9M10 20v-7h4v7"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v1"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',walk:'<circle cx="14" cy="4" r="2"/><path d="m7 11 4-3 4 1 3 4m-6-5-1 6-4 7m4-7 5 2 1 5"/>'};
function icon(name:string){return `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]??paths.info}</svg>`;}
const legendItems=[['column','柱','#c47b5c'],['beam','梁','#e0ad69'],['fang','枋','#c99c77'],['dougong','斗拱','#d8c291'],['purlin','檩','#7ea998'],['rafter','椽','#9db7ba']];
export function createUI(app:HTMLElement,s:SceneController){
  const overlay=document.createElement('div');overlay.className='overlay';
  overlay.innerHTML=`
    <header class="masthead"><div class="eyebrow"><span class="seal">唐</span>木构之间<span class="fine-rule"></span><span class="eyebrow-en">TIMBER & TIME</span></div><h1>佛光寺东大殿</h1><p class="english">Foguang Temple — East Hall</p><div class="date"><span>唐 · 公元 857 年</span><i></i><span>中国现存重要唐代木构建筑</span></div></header>
    <div class="top-right"><div class="place">山西 · 五台山<span>FOGUANG TEMPLE</span></div><button class="icon-button" id="about" aria-label="模型说明">${icon('info')}</button><button class="icon-button" id="home" aria-label="回到初始视角">${icon('home')}</button></div>
    <div class="view-tools"><button id="walk" class="pill-button" aria-pressed="false">${icon('walk')}<span>步行漫游</span></button><span class="orientation">殿前朝西 · 山地寺院</span></div>
    <aside class="legend glass" id="legend" hidden><span class="legend-title">木构图例</span><div>${legendItems.map(([key,label,color])=>`<button data-kind="${key}" aria-label="查看${label}的知识卡片"><i style="background:${color}"></i>${label}</button>`).join('')}</div><p>点击构件，了解承托关系</p></aside>
    <aside class="knowledge glass" id="knowledge" aria-label="构件知识卡片" hidden><button class="icon-button close-card" id="close-card" aria-label="关闭知识卡片">${icon('close')}</button><div class="card-category" id="card-category"></div><h2 id="card-title"></h2><span class="card-en" id="card-en"></span><p id="card-text"></p><div class="card-detail" id="card-detail"></div><button class="text-button" id="focus-part">靠近观察 ${icon('structure')}</button></aside>
    <div class="walk-pad" id="walk-pad" hidden><span>拖动环顾 · W A S D 移动</span><div><button data-step="w" aria-label="向前行走">↑</button><button data-step="a" aria-label="向左行走">←</button><button data-step="s" aria-label="向后行走">↓</button><button data-step="d" aria-label="向右行走">→</button></div></div>
    <div class="bottom-zone"><div class="scene-caption"><span class="caption-index" id="caption-index">01</span><div><h2 id="caption-title">千年木构，近在眼前</h2><p id="caption-text">拖动旋转 · 滚轮缩放 · 点击构件探索</p></div><span class="caption-right">七开间 · 四间进深<span>单檐庑殿 · 深檐巨拱</span></span></div>
    <section class="demo-panel glass" id="demo-panel" hidden aria-label="自动演示进度"><div class="demo-chapters">${chapters.map((c,i)=>`<span data-chapter="${i}"><em>${String(i+1).padStart(2,'0')}</em>${c.title}</span>`).join('')}</div><div class="demo-track"><div id="demo-progress"></div></div></section>
    <nav class="toolbar glass" aria-label="三维展示控制"><button id="orbit" aria-pressed="false">${icon('orbit')}<span>自动环绕</span></button><button id="explode" aria-pressed="false">${icon('explode')}<span>爆炸结构</span></button><button id="assemble">${icon('assemble')}<span>重新组装</span></button><span class="toolbar-divider"></span><button id="structure" aria-pressed="false">${icon('structure')}<span>结构模式</span></button><button id="demo" class="demo-button" aria-pressed="false">${icon('play')}<span>自动演示</span></button><button id="fullscreen" aria-label="全屏">${icon('fullscreen')}<span>全屏</span></button></nav>
    <footer><span>数字遗产 · 建筑结构探索</span><span>程序化近似模型 <button id="note">模型与史实</button></span></footer></div>
    <div id="tooltip" role="tooltip" hidden></div><div id="toast" role="status" aria-live="polite"></div>
    <dialog id="about-dialog"><button class="icon-button dialog-close" id="close-about" aria-label="关闭模型说明">${icon('close')}</button><span class="card-category">关于这座数字模型</span><h2>看见唐代木构的层次</h2><p>佛光寺东大殿建于唐大中十一年（857年），以宽阔的单檐庑殿顶、深出檐和雄大的斗拱著称。五台山世界遗产说明也强调了东大殿及其山地环境的价值。</p><p>本项目是面向结构理解的程序化三维近似模型。保留七开间、四间进深、内外柱网、四坡屋面及大型铺作等识别特征。</p><p class="scope-note">梁架节点、榫卯、屋脊装饰、门窗、台地高差及寺院环境均有简化；未复原佛像、壁画与平棊。结构模式的颜色用于区分构件。拆解路径为展示设计，并非实际施工拆卸顺序。</p><a href="https://whc.unesco.org/en/list/1279/" target="_blank" rel="noopener noreferrer">查阅 UNESCO 五台山遗产说明 ↗</a><div class="interaction-help"><span>鼠标：左键旋转 / 右键平移 / 滚轮缩放</span><span>触屏：单指旋转 / 双指缩放与平移</span><span>漫游：拖动环顾 / WASD 或屏幕方向键移动</span><span>Esc：退出演示、漫游或关闭说明</span></div></dialog>`;
  app.appendChild(overlay);
  const get=<T extends HTMLElement=HTMLElement>(id:string)=>overlay.querySelector<T>('#'+id)!;
  let structured=false,exploded=false,selected='dougong';let elapsed=0,toastUntil=0;
  const demo=new Demonstration(s),walk=new Walkthrough(s);const dialog=get<HTMLDialogElement>('about-dialog');
  const pressed=(id:string,on:boolean)=>get(id).setAttribute('aria-pressed',String(on));
  const showToast=(message:string)=>{get('toast').textContent=message;get('toast').classList.add('show');toastUntil=elapsed+3.6;};
  function caption(index:string,title:string,text:string){get('caption-index').textContent=index;get('caption-title').textContent=title;get('caption-text').textContent=text;}
  function structure(on:boolean){structured=on;s.temple.setStructure(on);pressed('structure',on);get('legend').hidden=!on;}
  function stopDemo(){demo.stop();}
  function leaveWalk(){if(walk.active){walk.toggle(false);pressed('walk',false);get('walk-pad').hidden=true;overlay.classList.remove('walking');caption('01','千年木构，近在眼前','拖动旋转 · 滚轮缩放 · 点击构件探索');}}
  function showCard(kind:string){const k=knowledge[kind];if(!k)return;selected=kind;get('card-category').textContent=k.category;get('card-title').textContent=k.title;get('card-en').textContent=k.english;get('card-text').textContent=k.text;get('card-detail').textContent=k.detail;get('knowledge').hidden=false;}
  function assemble(){stopDemo();leaveWalk();exploded=false;s.temple.explosion.to(0);structure(false);pressed('explode',false);s.home();caption('01','千年木构，近在眼前','拖动旋转 · 滚轮缩放 · 点击构件探索');}
  get('orbit').onclick=()=>{stopDemo();leaveWalk();s.setAuto(!s.auto);pressed('orbit',s.auto);showToast(s.auto?'已开启缓慢环绕，拖动后暂停，松手 4 秒后继续':'已暂停自动环绕');};
  get('explode').onclick=()=>{stopDemo();leaveWalk();exploded=!exploded;s.temple.explosion.to(exploded?1:0);pressed('explode',exploded);s.home(exploded);caption(exploded?'03':'01',exploded?'从屋脊到柱础，层层展开':'千年木构，近在眼前',exploded?'拖动查看各层 · 点击构件了解结构':'拖动旋转 · 滚轮缩放 · 点击构件探索');};
  get('assemble').onclick=assemble;
  get('structure').onclick=()=>{stopDemo();leaveWalk();structure(!structured);caption(structured?'02':'01',structured?'瓦面之下，梁架显现':'千年木构，近在眼前',structured?'图例对应结构颜色 · 点击构件查看知识卡片':'拖动旋转 · 滚轮缩放 · 点击构件探索');};
  get('home').onclick=()=>{stopDemo();leaveWalk();s.home(exploded);};
  get('walk').onclick=()=>{stopDemo();if(walk.active){leaveWalk();caption('01','千年木构，近在眼前','拖动旋转 · 滚轮缩放 · 点击构件探索');return;}structure(false);s.temple.explosion.to(0);exploded=false;pressed('explode',false);walk.toggle(true);pressed('orbit',false);pressed('walk',true);get('walk-pad').hidden=false;overlay.classList.add('walking');caption('04','步入殿前，仰望深檐','拖动环顾 · WASD 或屏幕方向键移动');};
  get('demo').onclick=()=>{if(demo.active){stopDemo();return;}leaveWalk();get('knowledge').hidden=true;s.setAuto(false);pressed('orbit',false);demo.start();pressed('demo',true);get('demo').innerHTML=`${icon('pause')}<span>停止演示</span>`;get('demo-panel').hidden=false;};
  demo.onChapter=(i)=>{const c=chapters[i];caption(String(i+1).padStart(2,'0'),c.title,c.caption);structured=i>=1&&i<=3;exploded=i===3||i===4;pressed('structure',structured);pressed('explode',exploded);get('legend').hidden=!structured;overlay.querySelectorAll('[data-chapter]').forEach(el=>el.classList.toggle('active',Number((el as HTMLElement).dataset.chapter)===i));};
  demo.onEnd=()=>{pressed('demo',false);get('demo').innerHTML=`${icon('play')}<span>自动演示</span>`;get('demo-panel').hidden=true;if(demo.elapsed>=demo.duration){exploded=false;structure(false);pressed('explode',false);caption('01','千年木构，近在眼前','演示结束 · 可继续自由探索');}else caption('—','演示已停止，自由探索','拖动旋转 · 点击构件查看知识卡片');};
  s.setInteractionHandler(()=>{if(demo.active)stopDemo();});
  get('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else showToast('当前浏览器不支持全屏，可旋转手机横屏观看');}catch{showToast('当前浏览器限制了全屏，可使用横屏观看');}};
  const openAbout=()=>{if(demo.active)stopDemo();walk.clearInput();dialog.showModal();};get('about').onclick=openAbout;get('note').onclick=openAbout;get('close-about').onclick=()=>dialog.close();get('close-card').onclick=()=>{get('knowledge').hidden=true;};
  overlay.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(button=>button.onclick=()=>showCard(button.dataset.kind!));
  get('focus-part').onclick=()=>{stopDemo();leaveWalk();if(['column','base','wall','window','foundation'].includes(selected))s.focus(v(20,8,26),v(8,4,8));else if(selected==='dougong')s.focus(v(12,12,23),v(6,8.6,9));else {structure(true);s.focus(v(25,23,33),v(0,10,0));}};
  overlay.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(button=>{button.onpointerdown=(event)=>{button.setPointerCapture(event.pointerId);walk.keys.add(button.dataset.step!);};button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>walk.keys.delete(button.dataset.step!);});
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){if(demo.active)stopDemo();if(walk.active)leaveWalk();get('knowledge').hidden=true;}};window.addEventListener('keydown',onKey);
  // Screen-space raycasting skips dense tile instances; the curved roof skin provides its hit target.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let lastHover=0;
  let gesture:{id:number;x:number;y:number;moved:boolean}|null=null;
  const activePointers=new Set<number>();
  const candidates=s.temple.pickables.filter(o=>!(o instanceof THREE.InstancedMesh&&o.userData.kind==='roof'));
  const pick=(event:PointerEvent)=>{const rect=s.renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,s.camera);const hits=raycaster.intersectObjects(candidates.filter(o=>!structured||!['roof','ridge','wall','window'].includes(o.userData.kind)),false);return hits[0];};
  const pointerDown=(event:PointerEvent)=>{
    activePointers.add(event.pointerId);
    gesture=event.button===0&&event.isPrimary!==false&&activePointers.size===1?{id:event.pointerId,x:event.clientX,y:event.clientY,moved:false}:null;
    get('tooltip').hidden=true;
  };
  const pointerUp=(event:PointerEvent)=>{
    const start=gesture;gesture=null;activePointers.delete(event.pointerId);
    if(!start||start.id!==event.pointerId||event.button!==0||start.moved||Math.hypot(event.clientX-start.x,event.clientY-start.y)>6)return;
    const hit=pick(event);if(hit)showCard(hit.object.userData.kind);
  };
  const pointerCancel=(event:PointerEvent)=>{activePointers.delete(event.pointerId);gesture=null;get('tooltip').hidden=true;};
  const pointerLeave=()=>{get('tooltip').hidden=true;};
  const pointerMove=(event:PointerEvent)=>{if(gesture&&gesture.id===event.pointerId&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>6)gesture.moved=true;if(event.buttons||event.pointerType==='touch'||demo.active||elapsed-lastHover<.12)return;lastHover=elapsed;const hit=pick(event);const k=hit&&knowledge[hit.object.userData.kind];get('tooltip').hidden=!k;if(k){get('tooltip').textContent=k.title+' · 点击了解';get('tooltip').style.left=Math.min(event.clientX+16,window.innerWidth-170)+'px';get('tooltip').style.top=Math.min(event.clientY+18,window.innerHeight-80)+'px';}s.renderer.domElement.style.cursor=k?'pointer':walk.active?'crosshair':'grab';};
  s.renderer.domElement.addEventListener('pointerdown',pointerDown);s.renderer.domElement.addEventListener('pointerup',pointerUp);s.renderer.domElement.addEventListener('pointermove',pointerMove);s.renderer.domElement.addEventListener('pointerleave',pointerLeave);s.renderer.domElement.addEventListener('pointercancel',pointerCancel);
  const getState=()=>({mode:walk.active?'walk':demo.active?'demo':structured?'structure':exploded?'exploded':'complete',restored:s.temple.explosion.restored,explosion:s.temple.explosion.progress,camera:s.camera.position.toArray(),auto:s.auto,orbiting:s.orbiting,demoChapter:demo.chapter});
  let metricClock=0;
  return {demo,walk,showCard,structure,assemble,getState,update(dt:number){elapsed+=dt;demo.update(dt);walk.update(dt);if(demo.active)get('demo-progress').style.width=Math.min(100,demo.elapsed/demo.duration*100)+'%';if(elapsed>toastUntil)get('toast').classList.remove('show');metricClock+=dt;if(metricClock>.5){metricClock=0;app.dataset.mode=walk.active?'walk':demo.active?'demo':structured?'structure':exploded?'exploded':'complete';app.dataset.restored=String(s.temple.explosion.restored);app.dataset.explosion=s.temple.explosion.progress.toFixed(3);app.dataset.orbiting=String(s.orbiting);app.dataset.camera=s.camera.position.toArray().map(x=>x.toFixed(2)).join(',');app.dataset.drawCalls=String(s.renderer.info.render.calls);app.dataset.triangles=String(s.renderer.info.render.triangles);app.dataset.demoChapter=String(demo.chapter);app.dataset.ao=String(s.ao.enabled);}},dispose(){walk.dispose();window.removeEventListener('keydown',onKey);s.setInteractionHandler(()=>{});const canvas=s.renderer.domElement;canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerleave',pointerLeave);canvas.removeEventListener('pointercancel',pointerCancel);overlay.remove();}};
}
