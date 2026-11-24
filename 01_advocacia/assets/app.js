/* V3 — componentes locais, sem dependências de rede. */
(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const key='collection-v4-'+SITE.slug;
let channels={whatsapp:CONFIG.whatsapp||'',instagram:CONFIG.instagram||''};
try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored&&typeof stored==='object'){channels.whatsapp=typeof stored.whatsapp==='string'?stored.whatsapp:channels.whatsapp;channels.instagram=typeof stored.instagram==='string'?stored.instagram:channels.instagram}}catch{}
const validPhone=v=>/^55\d{10,11}$/.test(v);
const validInstagram=v=>/^https:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(v);
function channelsUI(){
 const ready=validPhone(channels.whatsapp);$('#sendMessage').disabled=!ready;
 $('#channelNote').textContent=ready?'O WhatsApp abrirá com o texto preparado. O envio depende de você.':'WhatsApp ainda não configurado nesta demonstração. Você pode copiar o texto ou configurar o contato no rodapé.';
 const link=$('#socialLink');link.hidden=!validInstagram(channels.instagram);if(!link.hidden)link.href=channels.instagram;else link.removeAttribute('href');
}
channelsUI();
function closeOpen(){ $$('dialog[open]').forEach(d=>d.close()); }
function openDialog(id){closeOpen();const d=$(id);if(!d.open)d.showModal();}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}));
const menu=$('#mobileMenu');$('#menuButton').addEventListener('click',()=>{openDialog('#mobileMenu');$('#menuButton').setAttribute('aria-expanded','true')});menu.addEventListener('close',()=>$('#menuButton').setAttribute('aria-expanded','false'));
$$('#mobileMenu nav a').forEach(a=>a.addEventListener('click',()=>{menu.close();const target=a.hash?$(a.hash):null;if(target){target.setAttribute('tabindex','-1');setTimeout(()=>target.focus({preventScroll:true}),0)}}));
matchMedia('(min-width: 901px)').addEventListener('change',e=>{if(e.matches&&menu.open)menu.close()});
$('#aboutDemo').addEventListener('click',()=>openDialog('#infoDialog'));
function settings(){ $('#phone').value=channels.whatsapp;$('#instagram').value=channels.instagram;$('#settingsStatus').textContent='';openDialog('#settingsDialog'); }
$('#settingsButton').addEventListener('click',settings);$('#openSettings').addEventListener('click',settings);
$('#settingsForm').addEventListener('submit',e=>{
 e.preventDefault();const raw=$('#phone').value.trim(),phone=raw.replace(/\D/g,''),instagram=$('#instagram').value.trim();
 if(raw&&!validPhone(phone)){ $('#settingsStatus').textContent='Use 55 + DDD + número, com 12 ou 13 dígitos no total.';$('#phone').focus();return; }
 if(instagram&&!validInstagram(instagram)){ $('#settingsStatus').textContent='Informe o endereço de um perfil: https://instagram.com/seu_perfil';$('#instagram').focus();return; }
 channels={whatsapp:phone,instagram};let persisted=true;try{localStorage.setItem(key,JSON.stringify(channels))}catch{persisted=false}
 channelsUI();$('#settingsStatus').textContent=persisted?'Contatos salvos neste navegador.':'Contatos aplicados nesta sessão. O navegador não permitiu salvá-los.';
});
$('#resetSettings').addEventListener('click',()=>{ channels={whatsapp:CONFIG.whatsapp||'',instagram:CONFIG.instagram||''};try{localStorage.removeItem(key)}catch{}$('#phone').value=channels.whatsapp;$('#instagram').value=channels.instagram;channelsUI();$('#settingsStatus').textContent='Configuração padrão restaurada.'; });
function showStep(n){$('#contactStep1').hidden=n!==1;$('#contactStep2').hidden=n!==2;$$('.contact-progress>span').forEach((e,i)=>e.classList.toggle('active',i<n));$('#contactStatus').textContent='';}
function openContact(choice){
 if(choice!==undefined&&SITE.services[Number(choice)])$('#interest').value=String(choice);
 showStep(1);channelsUI();openDialog('#contactDialog');
}
$$('[data-contact]').forEach(b=>b.addEventListener('click',()=>openContact(b.dataset.choice)));
const dateInput=$('#briefForm input[type=date]');if(dateInput){const n=new Date();dateInput.min=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');}
$('#briefForm').addEventListener('submit',e=>{
 e.preventDefault();const idx=Number($('#interest').value);let message='Olá! Gostaria de informações sobre '+SITE.services[idx]+'.';
 $$('#briefForm [data-label]').forEach(input=>{let value=input.value.trim();if(!value)return;if(input.type==='date')value=value.split('-').reverse().join('/');message+='\n'+input.dataset.label+': '+value;});
 message+='\nPodemos conversar sobre disponibilidade e condições?';$('#preparedText').value=message;showStep(2);$('#preparedText').focus();$('#contactStatus').textContent='Mensagem preparada. Nada foi enviado.';
});
$('#backStep').addEventListener('click',()=>{showStep(1);$('#interest').focus()});
$('#copyMessage').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#preparedText').value);$('#contactStatus').textContent='Mensagem copiada.'}catch{$('#preparedText').focus();$('#preparedText').select();$('#contactStatus').textContent='Texto selecionado. Use a opção Copiar do navegador ou Ctrl+C.'}});
$('#sendMessage').addEventListener('click',()=>{if(validPhone(channels.whatsapp)){window.open('https://wa.me/'+channels.whatsapp+'?text='+encodeURIComponent($('#preparedText').value),'_blank','noopener,noreferrer');$('#contactStatus').textContent='Conversa aberta. O envio da mensagem depende de você.'}});
let detailChoice=0;
$$('[data-details]').forEach(b=>b.addEventListener('click',()=>{detailChoice=Number(b.dataset.details);const article=$('[data-service="'+detailChoice+'"]');$('#detailTitle').textContent=article.querySelector('.service-title').textContent;$('#detailBody').textContent=(article.querySelector('.service-extra')||article.querySelector('.service-desc')).textContent;openDialog('#detailDialog')}));
$('#detailContact').addEventListener('click',()=>openContact(detailChoice));
$$('.service-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)$$('.service-list details').forEach(other=>{if(other!==detail)other.open=false})}));
let galleryIndex=0;
function displayImage(index){galleryIndex=(index+SITE.gallery.length)%SITE.gallery.length;$('#lightboxImage').src=SITE.gallery[galleryIndex];$('#lightboxImage').alt='Referência visual '+(galleryIndex+1)+' de '+SITE.gallery.length+' — Unsplash; não representa trabalho da marca.';$('#imageCount').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(SITE.gallery.length).padStart(2,'0');}
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{displayImage(Number(b.dataset.gallery));openDialog('#lightbox')}));
$('#previousImage').addEventListener('click',()=>displayImage(galleryIndex-1));$('#nextImage').addEventListener('click',()=>displayImage(galleryIndex+1));
$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();displayImage(galleryIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();displayImage(galleryIndex-1)}});
$$('[data-select-service]').forEach(button=>button.addEventListener('click',()=>{const idx=Number(button.dataset.selectService);$$('[data-select-service]').forEach(b=>{b.classList.toggle('chosen',b===button);b.setAttribute('aria-pressed',String(b===button))});$('#routeText').textContent=SITE.descriptions[idx];$('#routeContact').href='contato.html?servico='+idx;}));
let slide=0,timer=null,playing=false;
function showSlide(index){const slides=$$('[data-slide]');if(!slides.length)return;slide=(index+slides.length)%slides.length;slides.forEach((el,i)=>el.classList.toggle('current',i===slide));$('#slideCount').textContent=String(slide+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function playback(){stopTimer();if(playing&&!document.hidden&&!reduced.matches)timer=setInterval(()=>showSlide(slide+1),6000);const b=$('#autoplay');if(b){b.setAttribute('aria-pressed',String(playing));b.textContent=playing?'Pausar sequência':'Reproduzir sequência';b.disabled=reduced.matches;if(reduced.matches)b.textContent='Movimento reduzido';}}
if($('#autoplay')){$('[data-slide-prev]').addEventListener('click',()=>{showSlide(slide-1);playback()});$('[data-slide-next]').addEventListener('click',()=>{showSlide(slide+1);playback()});$('#autoplay').addEventListener('click',()=>{playing=!playing;playback()});document.addEventListener('visibilitychange',playback);playback();}
// Animação progressiva: se o navegador não suportar, todo o conteúdo fica visível.
let observer;
if('IntersectionObserver' in window&&!reduced.matches){document.body.classList.add('js-motion');observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target)}}),{threshold:.09,rootMargin:'0px 0px 20px 0px'});$$('.reveal').forEach((el,i)=>{el.classList.add('pending');el.style.setProperty('--delay',(i%3)*65+'ms');observer.observe(el)})}
document.addEventListener('focusin',e=>{const parent=e.target.closest('.pending');if(parent)parent.classList.remove('pending')});
reduced.addEventListener('change',()=>{if(reduced.matches){$$('.pending').forEach(el=>el.classList.remove('pending'));document.body.classList.remove('js-motion');playing=false;playback();$$('.parallax img').forEach(img=>img.style.transform='')}playback();});
let framePending=false;const progress=$('.reading-progress'),header=$('.site-header');
function onScroll(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,scrollY/max)):0)+')';header.classList.toggle('scrolled',scrollY>25);if(!reduced.matches&&innerWidth>900&&matchMedia('(pointer:fine)').matches){$$('.parallax').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const y=Math.max(-18,Math.min(18,(innerHeight/2-r.top-r.height/2)*.06));el.querySelector('img').style.transform='translateY('+y+'px)'}})}framePending=false;}
addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(onScroll)}},{passive:true});addEventListener('resize',()=>{if(!framePending){framePending=true;requestAnimationFrame(onScroll)}});onScroll();
// Pesquisa e filtros combinados, sem alterar a navegação entre páginas.
const norm=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let category='all';
function filterServices(){const term=norm($('#serviceSearch')?.value||'');let count=0;$$('.service-item').forEach(item=>{const visible=(category==='all'||item.dataset.category===category)&&norm(item.textContent).includes(term);item.hidden=!visible;if(visible){count++;item.classList.remove('pending')}});const status=$('.filter-status')||$('#serviceCount');if(status)status.textContent=count+' '+(count===1?'opção encontrada':'opções encontradas');if($('#serviceEmpty'))$('#serviceEmpty').hidden=count>0;}
$('#serviceSearch')?.addEventListener('input',filterServices);
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterServices()}));
$('#faqSearch')?.addEventListener('input',e=>{let count=0;$$('.faq').forEach(item=>{item.hidden=!norm(item.textContent).includes(norm(e.target.value));if(!item.hidden){count++;item.classList.remove('pending')}});$('#faqCount').textContent=count+' perguntas encontradas';$('#faqEmpty').hidden=count>0});
if(document.body.dataset.page==='contato.html'){
 const param=new URLSearchParams(location.search).get('servico');
 if(param!==null&&/^\d+$/.test(param)&&SITE.services[Number(param)])$('#interest').value=param;
 $('#interest').addEventListener('change',()=>{try{const url=new URL(location.href);url.searchParams.set('servico',$('#interest').value);history.replaceState(null,'',url)}catch{}});
 $('#configureContact')?.addEventListener('click',settings);
}
})();
