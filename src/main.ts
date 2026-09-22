import './style.css';
import {createScene} from './scene';
import {createUI} from './ui';
import {registerViewerTools} from './webmcp';
const app=document.querySelector<HTMLElement>('#app')!;
const canvasHost=document.createElement('div');canvasHost.className='canvas-host';app.prepend(canvasHost);
let cleanup=()=>{};
async function start(){
  await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  try{
    const scene=createScene(canvasHost);const ui=createUI(app,scene);const unregisterTools=registerViewerTools(app,ui);let last=performance.now(),frame=0,alive=true;
    const render=(now:number)=>{if(!alive)return;const dt=Math.min((now-last)/1000,.1);last=now;ui.update(dt);scene.update(dt);frame=requestAnimationFrame(render);};
    render(last);app.querySelector('#loading')?.remove();app.dataset.loaded='true';
    const contextLost=(event:Event)=>{event.preventDefault();alive=false;cancelAnimationFrame(frame);const panel=document.createElement('div');panel.className='error-panel';panel.innerHTML='<h2>三维画面暂时中断</h2><p>请重新加载页面，恢复场景。</p><button onclick="location.reload()">重新加载</button>';app.appendChild(panel);};
    scene.renderer.domElement.addEventListener('webglcontextlost',contextLost);
    const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);
    cleanup=()=>{alive=false;cancelAnimationFrame(frame);unregisterTools();ui.dispose();scene.dispose();document.removeEventListener('visibilitychange',visibility);};
    window.addEventListener('pagehide',(event)=>{if(!event.persisted)cleanup();},{once:true});
  }catch(error){console.error(error);app.querySelector('#loading')?.remove();const panel=document.createElement('div');panel.className='error-panel';const h=document.createElement('h2');h.textContent='暂时无法显示三维场景';const p=document.createElement('p');p.textContent='请使用支持 WebGL 2 的现代浏览器，并开启硬件加速后重试。';const button=document.createElement('button');button.textContent='重新加载';button.onclick=()=>location.reload();panel.append(h,p,button);app.append(panel);}
}
start();
if(import.meta.hot)import.meta.hot.dispose(()=>cleanup());
