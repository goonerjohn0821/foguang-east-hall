export interface Knowledge {title:string;english:string;category:string;text:string;detail:string;}
export const knowledge:Record<string,Knowledge>={
  column:{title:'柱',english:'COLUMN',category:'01 · 竖向承重',text:'柱把上部梁架与屋顶的重量传向柱础。外檐柱界定立面开间，内柱组织殿内空间，形成清晰的内外柱网。',detail:'本模型以轻微收分的圆木柱表现木构体量；柱网保留内外两圈，局部尺寸为参数化近似。'},
  beam:{title:'梁',english:'BEAM',category:'02 · 跨越空间',text:'梁跨于柱或其他承托构件之间，支承上方木构。逐层抬升的梁架与短柱共同构成屋顶内部的承重骨架。',detail:'模型用分层梁架解释承重关系，未逐榀复原真实测绘中的月梁、叉手及各类特殊节点。'},
  frame:{title:'屋架',english:'ROOF FRAME',category:'02 · 层层承托',text:'梁、短柱与檩等构件共同组织屋顶空间。逐层抬高的构架，为低缓而有曲度的庑殿屋面提供承托。',detail:'这里展示的是结构关系的简化表达，可结合「结构模式」与「爆炸结构」观察。'},
  fang:{title:'阑额 · 枋',english:'LINTEL & TIE',category:'03 · 连接柱列',text:'阑额位于柱头附近，沿开间方向连接柱列。横向的枋材与柱、梁共同联系木构架，使立面形成连贯的水平层次。',detail:'不同位置的枋材在构造和称谓上有差异；模型用统一类别帮助识别横向联系构件。'},
  dougong:{title:'斗拱',english:'DOUGONG · BRACKET SET',category:'04 · 层叠出挑',text:'斗是承托的小木块，拱是横向伸展的木臂，昂参与向外出挑。构件层层叠置，把柱头与深远的屋檐联系起来。',detail:'东大殿以雄大的铺作著称。模型表现柱头、补间和转角的出跳关系；榫卯及铺作细节经过简化，不作为修缮依据。'},
  purlin:{title:'檩',english:'PURLIN',category:'05 · 承接椽列',text:'檩沿屋顶横向布置，将一榀榀屋架联系起来，并承托椽子。它们在不同高度形成一系列水平支承线。',detail:'结构模式下以偏青绿色区分檩与相邻梁架；配色用于识别构件，并非历史彩绘复原。'},
  rafter:{title:'椽',english:'RAFTER',category:'06 · 铺展屋面',text:'椽子沿屋面坡向密集排列，承接望板和瓦面荷载。檐部伸出的椽头形成细密的节奏，也让深出檐更容易辨认。',detail:'模型采用分段曲线椽列表达屋面曲率，转角与椽头的精细做法为程序化简化。'},
  base:{title:'柱础',english:'COLUMN BASE',category:'07 · 木石相接',text:'石质柱础承托木柱，使柱脚与地面分开。它位于石质台基和木构柱网之间，是从地面向上观察结构的起点。',detail:'模型用朴素的石础表达承托位置，未复制实物全部轮廓和风化痕迹。'},
  roof:{title:'单檐庑殿顶',english:'HIPPED ROOF',category:'08 · 四坡舒展',text:'一条正脊与四条垂脊组织四面坡。宽阔的屋面、低缓的曲线和深出檐共同塑造东大殿雄浑而舒展的轮廓。',detail:'屋面由连续参数曲面生成，筒瓦以重复构件铺设；本模型的瓦面风化与曲率是视觉近似。'},
  ridge:{title:'屋脊 · 鸱尾',english:'RIDGE & CHIWEI',category:'09 · 屋顶轮廓',text:'正脊位于屋顶最高处，四条垂脊沿四坡交线下行。正脊两端的鸱尾构成鲜明的轮廓，收束整座大屋顶。',detail:'本模型以简化曲线塑造鸱尾，并不将现存屋脊细部全部认定为唐代原物。'},
  wall:{title:'墙体与木门',english:'ENCLOSURE',category:'10 · 殿堂围护',text:'柱间的墙体、木门与格栅共同形成围护界面。它们与上方连续的木构柱列、深檐阴影一起构成殿堂立面。',detail:'门窗按简洁木作表达，格栅与门扇分隔未逐项对照测绘图。'},
  window:{title:'格栅窗',english:'LATTICE WINDOW',category:'10 · 光与界面',text:'细密木格栅在柱间围护上形成有节奏的透光面。它使厚重的殿堂立面保留细部尺度。',detail:'本模型的格栅纹样由几何程序生成，采用简化的直棂关系。'},
  foundation:{title:'台基与石阶',english:'PLATFORM',category:'11 · 因地成殿',text:'台基承托殿堂，石阶联系院落与建筑。东大殿所在的山地环境与高处台地，使建筑拥有庄重的到达感。',detail:'模型重点表现殿前台基与中央石阶；整座寺院的高差、院落及辅助建筑为意象化场景。'}
};
