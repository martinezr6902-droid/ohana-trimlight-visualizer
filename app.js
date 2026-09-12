const $ = s => document.querySelector(s);
const canvas = $('#canvas'), ctx = canvas.getContext('2d');
const input = $('#photoInput'), empty = $('#emptyState'), hint = $('#canvasHint');
const img = new Image();
let paths = [[]], colors = ['#fff1c7'], spacing = 18, glow = 70, darkness = 35;

function sizeImage(){
  const max = 1400, scale = Math.min(1, max / img.naturalWidth);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  draw();
}
function draw(){
  if(!img.src) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  ctx.fillStyle=`rgba(2,13,20,${darkness/100})`; ctx.fillRect(0,0,canvas.width,canvas.height);
  paths.forEach(path=>{
    if(path.length<2){
      path.forEach(p=>{ctx.fillStyle='#ffb33b';ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill()}); return;
    }
    let idx=0;
    for(let s=1;s<path.length;s++){
      const a=path[s-1],b=path[s],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),count=Math.max(1,Math.floor(len/spacing));
      for(let i=0;i<=count;i++){
        const t=i/count,x=a.x+dx*t,y=a.y+dy*t,c=colors[idx++%colors.length],r=Math.max(2.2,canvas.width/420);
        ctx.save();ctx.shadowColor=c;ctx.shadowBlur=5+(glow/100)*20;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    }
  });
}
input.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>{img.onload=()=>{paths=[[]];sizeImage();empty.style.display='none';canvas.style.display='block';hint.style.display='block'};img.src=ev.target.result};reader.readAsDataURL(f)});
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();paths[paths.length-1].push(point(e));draw()});
canvas.addEventListener('dblclick',e=>{e.preventDefault();finishLine()});
function finishLine(){if(paths.at(-1).length)paths.push([])}
$('#finishBtn').onclick=finishLine;
$('#undoBtn').onclick=()=>{if(!paths.at(-1).length&&paths.length>1)paths.pop();paths.at(-1).pop();draw()};
$('#resetBtn').onclick=()=>{paths=[[]];input.value='';img.removeAttribute('src');canvas.style.display='none';hint.style.display='none';empty.style.display='block'};
document.querySelectorAll('.preset').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.preset').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');colors=btn.dataset.colors.split(',');draw()});
function slider(id,out,suffix,set){$(id).addEventListener('input',e=>{set(+e.target.value);$(out).value=e.target.value+suffix;draw()})}
slider('#spacing','#spacingOut','px',v=>spacing=v);slider('#glow','#glowOut','%',v=>glow=v);slider('#darkness','#darkOut','%',v=>darkness=v);
$('#downloadBtn').onclick=()=>{if(!img.src){input.click();return}draw();const a=document.createElement('a');a.download='ohana-trimlight-home-preview.png';a.href=canvas.toDataURL('image/png',.95);a.click()};
$('#estimateForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target),body=`Aloha Ohana Trimlight!%0A%0AI'd like a free estimate.%0AName: ${encodeURIComponent(d.get('name'))}%0APhone: ${encodeURIComponent(d.get('phone'))}%0AEmail: ${encodeURIComponent(d.get('email')||'Not provided')}%0ANeighborhood: ${encodeURIComponent(d.get('area')||'Not provided')}%0ANotes: ${encodeURIComponent(d.get('notes')||'None')}`;$('#formStatus').textContent='Your request is ready. Attach your downloaded mockup when your email opens.';window.location.href=`mailto:?subject=Free Ohana Trimlight Estimate&body=${body}`});
window.addEventListener('resize',()=>{if(img.src)draw()});
