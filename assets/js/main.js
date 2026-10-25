// Meilenratgeber – main.js: Menü auf dem Handy
(function(){
  var b=document.querySelector('.nav-toggle'), n=document.getElementById('hauptmenue');
  if(!b||!n) return;
  b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.classList.contains('open')){n.classList.remove('open');b.setAttribute('aria-expanded','false');b.focus();}});
})();

// Aufklappmenüs in der Kopfzeile: Klick/Tipp öffnet, Escape und Klick daneben schließen
(function(){
  var items=[].slice.call(document.querySelectorAll('.nav .has-sub'));
  if(!items.length) return;
  function close(li){li.classList.remove('open');li.querySelector('.nav-link').setAttribute('aria-expanded','false');}
  items.forEach(function(li){
    var btn=li.querySelector('.nav-link');
    btn.addEventListener('click',function(){
      var o=!li.classList.contains('open');
      items.forEach(function(x){if(x!==li)close(x);});
      li.classList.toggle('open',o); btn.setAttribute('aria-expanded',o?'true':'false');
    });
  });
  // Handy: Gruppe der aktuellen Seite offen zeigen
  if(window.matchMedia('(max-width:899px)').matches){items.forEach(function(li){if(li.classList.contains('is-active')){li.classList.add('open');li.querySelector('.nav-link').setAttribute('aria-expanded','true');}});}
  document.addEventListener('click',function(e){if(window.matchMedia('(min-width:900px)').matches&&!e.target.closest('.nav .has-sub'))items.forEach(close);});
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;items.forEach(function(li){if(li.classList.contains('open')&&window.matchMedia('(min-width:900px)').matches){close(li);if(li.contains(document.activeElement))li.querySelector('.nav-link').focus();}});});
})();

// Angebotstabelle: Filter (alle gewählten müssen passen) und Sortierung
(function(){
  [].forEach.call(document.querySelectorAll('.offers-wrap'),function(w){
    var bar=w.querySelector('.offers-filter'), tb=w.querySelector('table.offers tbody'); if(!bar||!tb) return;
    bar.hidden=false;
    var rows=[].slice.call(tb.querySelectorAll('tr.offer')), orig=rows.slice();
    var chips=[].slice.call(bar.querySelectorAll('.of-chip')), sel=bar.querySelector('select');
    var count=w.querySelector('.of-count'), empty=w.querySelector('.of-empty');
    var test={gratis:function(r){return r.dataset.kosten==='0';},schutz:function(r){return r.dataset.schutz==='1';},
              bonus:function(r){return r.dataset.bonus==='1';},direkt:function(r){return r.dataset.direkt==='1';}};
    function apply(){
      var on=chips.filter(function(c){return c.getAttribute('aria-pressed')==='true';}).map(function(c){return c.dataset.f;});
      var n=0;
      rows.forEach(function(r){var ok=on.every(function(f){return test[f](r);}); r.hidden=!ok; if(ok)n++;});
      var list=orig.slice(), k=sel.value;
      if(k==='kosten') list.sort(function(a,b){return a.dataset.kosten-b.dataset.kosten;});
      if(k==='rate') list.sort(function(a,b){return b.dataset.rate-a.dataset.rate;});
      list.forEach(function(r){tb.appendChild(r);});
      count.textContent=on.length?(n+' von '+rows.length+' Karten'):'';
      empty.hidden=n>0;
    }
    chips.forEach(function(c){c.addEventListener('click',function(){c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');apply();});});
    sel.addEventListener('change',apply);
    var rs=w.querySelector('.of-reset'); if(rs) rs.addEventListener('click',function(){chips.forEach(function(c){c.setAttribute('aria-pressed','false');});apply();chips[0].focus();});
  });
})();

// Inhaltsverzeichnis: auf breiten Bildschirmen offen, auf dem Handy zugeklappt
(function(){var d=document.querySelector('.toc details');if(d&&window.matchMedia('(min-width:960px)').matches)d.open=true;})();

// Inhaltsverzeichnis: aktuellen Abschnitt markieren
(function(){
  var links=[].slice.call(document.querySelectorAll('.toc a'));
  if(!links.length||!('IntersectionObserver' in window)) return;
  var map={}; links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.remove('on')});var a=map[e.target.id];if(a)a.classList.add('on');}});},{rootMargin:'-20% 0px -70% 0px'});
  Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el);});
})();

// Kopfzeile: Schatten erst nach dem Scrollen
(function(){var h=document.querySelector('.site-head');if(!h)return;var f=function(){h.classList.toggle('scrolled',window.scrollY>8)};f();window.addEventListener('scroll',f,{passive:true});})();

// Bewegung beim Hineinscrollen: Abschnitte erscheinen, Zahlen zählen hoch, Streckenlinie zeichnet sich
(function(){
  if(!('IntersectionObserver' in window)) return;
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt=function(n,dec){return n.toLocaleString('de-DE',{minimumFractionDigits:dec,maximumFractionDigits:dec});};
  function countUp(el){
    var txt=el.textContent, m=txt.match(/\d[\d.]*(,\d+)?/); if(!m) return;
    var raw=m[0], dec=m[1]?m[1].length-1:0, target=parseFloat(raw.replace(/\./g,'').replace(',','.'));
    if(!(target>=10)) return;
    var t0=null, dur=1000;
    function step(t){ if(!t0)t0=t; var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3);
      el.textContent=txt.replace(raw,fmt(target*e,dec)); if(k<1)requestAnimationFrame(step); else el.textContent=txt; }
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting) return; var el=e.target; io.unobserve(el);
    if(el.classList.contains('rv')) el.classList.add('in');
    if(el.classList.contains('count')) countUp(el);
    if(el.classList.contains('route')){el.classList.remove('wait');el.classList.add('draw');}
  });},{rootMargin:'0px 0px -10% 0px'});
  if(!still){
    [].forEach.call(document.querySelectorAll('.prose>section:not(.summary),.section .wrap,.figures dl'),function(el){
      var r=el.getBoundingClientRect(); if(r.top<window.innerHeight) return; // schon sichtbar: nicht verstecken
      el.classList.add('rv'); io.observe(el);});
    [].forEach.call(document.querySelectorAll('.count'),function(el){io.observe(el);});
    [].forEach.call(document.querySelectorAll('.route'),function(el){el.classList.add('wait');io.observe(el);});
  }
})();

// Quiz: blendet ein, führt durch die Fragen und zeigt das passende Ergebnis. Regeln je Quiz in QUIZ_REGELN.
var QUIZ_REGELN={
  karte:function(val,vals){
    var a=val('airline'), pb=val('payback'), z=val('zeit'), b=val('budget'), ex=vals('extra');
    var card, also=null, notes=[];
    if(a==='afkl'){card='amexcard';}
    else if(a==='ew'){card='eurowings'; if(z==='lang') also='ew-blue';}
    else if(b==='bonus'){card='gold'; also='gold-blue';}
    else if(z==='lang'){card='blue'; if(b==='0') notes.push('blue-kosten');}
    else if(pb==='ja'&&b==='0'){card='paybackamex'; also='pb-myflex';}
    else {card='myflex'; if(pb==='ja') also='myflex-pb';}
    if(ex.indexOf('lounge')>-1) notes.push('lounge');
    if(ex.indexOf('fx')>-1) notes.push(card==='eurowings'?'fx-ew':'fx');
    if(ex.indexOf('zins')>-1) notes.push(card==='myflex'||also==='pb-myflex'?'zins-myflex':'zins');
    return {card:card,also:also,notes:notes};
  },
  einloesen:function(val,vals){
    var m=val('menge'), z=val('ziel'), v=val('verfall'), f=val('flex'), ex=vals('extra');
    var card, also=null, notes=['formel'];
    if(v==='ja'&&m==='u10'){card='sachpraemie'; also='sach-cm';}
    else if(z==='andere'){card='sachpraemie';}
    else if(z==='upgrade'){card=m==='u10'?'sammeln':'upgrade';}
    else if(z==='fern'){
      if(m==='ue50'){card='langstrecke'; if(f==='fest') also='cm-fest';}
      else if(m==='u10'){card='sammeln';}
      else {card='upgrade'; also='fern-sammeln';}
    }
    else { // Europa
      if(m==='u10'){card='cashmiles';}
      else if(f==='fest'){card='cashmiles'; also='europa-alt';}
      else {card='europa';}
    }
    if(v==='ja'&&card!=='sachpraemie') notes.push('verfall');
    if(v==='unklar') notes.push('unklar');
    if(ex.indexOf('karte')>-1) notes.push('karte');
    if(ex.indexOf('payback')>-1) notes.push('payback');
    if(ex.indexOf('familie')>-1&&['langstrecke','europa','sammeln'].indexOf(card)>-1) notes.push('familie');
    return {card:card,also:also,notes:notes};
  }
};
(function(){
  var root=document.querySelector('.quiz[data-quiz]'); if(!root) return;
  var QUIZ_ID=root.getAttribute('data-quiz'), regel=QUIZ_REGELN[QUIZ_ID]; if(!regel) return;
  var form=root.querySelector('.quiz-form'), res=root.querySelector('.quiz-result');
  var qs=[].slice.call(root.querySelectorAll('.q')), back=root.querySelector('.q-back'), next=root.querySelector('.q-next');
  var nEl=root.querySelector('.q-n'), bar=root.querySelector('.quiz-bar span'), i=0;
  // Anonyme Auswertung: zufällige Kennung nur für diesen Durchgang, nur im Arbeitsspeicher (kein Cookie, kein Speicher auf dem Gerät)
  var sid=neueSid();
  function neueSid(){var b=new Uint8Array(8);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(b);else for(var k=0;k<8;k++)b[k]=Math.floor(Math.random()*256);
    return [].map.call(b,function(x){return ('0'+x.toString(16)).slice(-2);}).join('');}
  function antworten(){var a={};qs.forEach(function(q){var n=q.getAttribute('data-q'),c=[].map.call(q.querySelectorAll('input:checked'),function(x){return x.value;});
    if(q.querySelector('input[type="checkbox"]'))a[n]=c;else if(c.length)a[n]=c[0];});return a;}
  function senden(d){if(!/^https?:$/.test(location.protocol)||!navigator.sendBeacon)return;d.q=QUIZ_ID;d.sid=sid;
    try{(()=>false)('/meilenratgeber-test-pages/t/quiz.php',new Blob([JSON.stringify(d)],{type:'text/plain'}));}catch(x){}}
  // Gold-Bonus nur bis zum Stichtag anbieten
  var bis=root.getAttribute('data-gold-bis');
  if(bis&&new Date()>new Date(bis+'T23:59:59')){[].forEach.call(root.querySelectorAll('[data-gold]'),function(li){li.parentNode.removeChild(li);});}
  root.hidden=false;
  function val(name){var c=form.querySelector('input[name="'+name+'"]:checked');return c?c.value:null;}
  function vals(name){return [].map.call(form.querySelectorAll('input[name="'+name+'"]:checked'),function(c){return c.value;});}
  function show(k){
    qs.forEach(function(q,j){q.hidden=j!==k;});
    nEl.textContent=k+1; bar.style.width=((k+1)/qs.length*100)+'%';
    back.hidden=k===0; next.textContent=k===qs.length-1?'Ergebnis zeigen':'Weiter';
    i=k;
  }
  function focusQ(){var l=qs[i].querySelector('input');if(l)l.focus();}
  function pick(){return regel(val,vals);}
  function result(){
    var r=pick();
    senden({n:qs.length,done:1,a:antworten(),r:r.card,al:r.also,nt:r.notes});
    [].forEach.call(res.querySelectorAll('[data-card]'),function(e){e.hidden=e.getAttribute('data-card')!==r.card;});
    [].forEach.call(res.querySelectorAll('[data-also]'),function(e){e.hidden=e.getAttribute('data-also')!==r.also;});
    [].forEach.call(res.querySelectorAll('[data-note]'),function(e){e.hidden=r.notes.indexOf(e.getAttribute('data-note'))<0;});
    res.querySelector('.quiz-notes').hidden=!r.notes.length;
    form.hidden=true; res.hidden=false;
    var h=res.querySelector('[data-card="'+r.card+'"] h3'); if(h) h.focus();
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var q=qs[i], multi=!!q.querySelector('input[type="checkbox"]'), err=q.querySelector('.q-error');
    if(!multi&&!q.querySelector('input:checked')){err.hidden=false;q.setAttribute('aria-invalid','true');focusQ();return;}
    err.hidden=true; q.removeAttribute('aria-invalid');
    if(i<qs.length-1){senden({n:i+1,a:antworten()});show(i+1);focusQ();} else result();
  });
  // Bei Einfachauswahl nach Klick oder Tippen gleich weiter; mit Tastatur-Pfeilen nicht
  var zeiger=null;
  form.addEventListener('pointerdown',function(e){var l=e.target.closest&&e.target.closest('label');zeiger=l?l.querySelector('input[type="radio"]'):null;});
  form.addEventListener('keydown',function(){zeiger=null;});
  form.addEventListener('change',function(e){
    var t=e.target; if(t.type!=='radio'||t!==zeiger) return; zeiger=null;
    setTimeout(function(){ if(typeof form.requestSubmit==='function') form.requestSubmit(next); else next.click(); },180);
  });
  back.addEventListener('click',function(){if(i>0){show(i-1);focusQ();}});
  root.querySelector('.q-restart').addEventListener('click',function(){
    sid=neueSid(); form.reset(); [].forEach.call(root.querySelectorAll('.q-error'),function(e){e.hidden=true;});
    res.hidden=true; form.hidden=false; show(0); focusQ();
  });
  res.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var p=a.getAttribute('href')||'';
    try{p=new URL(a.href,location.href).pathname;}catch(x){}senden({c:p});});
  show(0);
})();

// Wissensquiz „Mythen über Meilen“: macht aus der Liste ein Quiz mit Auflösung je Aussage und Punktestand
(function(){
  var root=document.querySelector('.mythen[data-quiz]'); if(!root) return;
  var liste=root.querySelector('.mythen-list'), quiz=root.querySelector('.mythen-quiz');
  var items=[].slice.call(liste.querySelectorAll('.mythos'));
  var frage=quiz.querySelector('.m-frage'), knoepfe=quiz.querySelector('.m-knoepfe'), fb=quiz.querySelector('.m-feedback');
  var fbT=fb.querySelector('.m-fb-titel'), fbX=fb.querySelector('.m-fb-text'), weiter=fb.querySelector('.m-weiter');
  var ende=quiz.querySelector('.m-ende'), nEl=quiz.querySelector('.q-n'), bar=quiz.querySelector('.quiz-bar span');
  var i=0, antw={}, richtig=0;
  function neueSid(){var b=new Uint8Array(8);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(b);else for(var k=0;k<8;k++)b[k]=Math.floor(Math.random()*256);
    return [].map.call(b,function(x){return ('0'+x.toString(16)).slice(-2);}).join('');}
  var sid=neueSid();
  function senden(d){if(!/^https?:$/.test(location.protocol)||!navigator.sendBeacon)return;d.q='mythen';d.sid=sid;
    try{(()=>false)('/meilenratgeber-test-pages/t/quiz.php',new Blob([JSON.stringify(d)],{type:'text/plain'}));}catch(x){}}
  function zeige(k){
    i=k; var it=items[k];
    frage.textContent=it.querySelector('.m-satz').textContent;
    nEl.textContent=k+1; bar.style.width=((k+1)/items.length*100)+'%';
    knoepfe.hidden=false; fb.hidden=true;
  }
  function antworte(sagtStimmt){
    var it=items[i], stimmt=it.getAttribute('data-stimmt')==='ja', ok=(sagtStimmt===stimmt);
    antw[it.getAttribute('data-m')]=sagtStimmt?'stimmt':'nicht'; if(ok) richtig++;
    knoepfe.hidden=true;
    fbT.textContent=(ok?'Richtig! ':'Leider nicht. ')+(stimmt?'Die Aussage stimmt.':'Die Aussage stimmt nicht.'); fbT.className='m-fb-titel '+(ok?'ok':'falsch');
    fbX.innerHTML=''; var kl=it.querySelector('.m-antwort').cloneNode(true), u=kl.querySelector('.m-urteil'); if(u) u.parentNode.removeChild(u); fbX.appendChild(kl);
    weiter.textContent=i===items.length-1?'Ergebnis zeigen':'Nächste Aussage';
    fb.hidden=false; weiter.focus();
    if(i<items.length-1) senden({n:i+1,a:antw});
  }
  function fazit(r,n){
    if(r===n) return 'Alles richtig. Sie kennen Miles & More besser als die meisten.';
    if(r>=n-2) return 'Fast alles richtig. Die Details zu den übrigen Punkten stehen in der Auflösung unten.';
    if(r>=n/2) return 'Ein guter Anfang. Ein paar Regeln von Miles & More sind weniger bekannt, als man denkt.';
    return 'Die meisten dieser Irrtümer sind weit verbreitet. Die Auflösung unten erklärt jeden Punkt.';
  }
  function abschluss(){
    var n=items.length;
    senden({n:n,done:1,a:antw,r:'s'+richtig});
    knoepfe.hidden=true; fb.hidden=true; frage.hidden=true; quiz.querySelector('.quiz-progress').hidden=true; quiz.querySelector('.quiz-kicker').hidden=true;
    quiz.querySelector('.m-score').textContent=richtig+' von '+n+' richtig';
    quiz.querySelector('.m-fazit').textContent=fazit(richtig,n);
    var rv=quiz.querySelector('.m-review'); rv.innerHTML='';
    items.forEach(function(it){
      var li=it.cloneNode(true), stimmt=it.getAttribute('data-stimmt')==='ja', gesagt=antw[it.getAttribute('data-m')], ok=(gesagt==='stimmt')===stimmt;
      li.classList.add(ok?'ok':'falsch');
      var m=document.createElement('span'); m.className='m-marke'; m.textContent=ok?'✓ richtig beantwortet':'✗ Ihre Antwort: '+(gesagt==='stimmt'?'Stimmt':'Stimmt nicht');
      li.insertBefore(m,li.firstChild); rv.appendChild(li);
    });
    ende.hidden=false; quiz.querySelector('.m-score').focus();
  }
  quiz.querySelector('.m-ja').addEventListener('click',function(){antworte(true);});
  quiz.querySelector('.m-nein').addEventListener('click',function(){antworte(false);});
  weiter.addEventListener('click',function(){ if(i<items.length-1){zeige(i+1);frage.focus();} else abschluss(); });
  quiz.querySelector('.m-neu').addEventListener('click',function(){
    sid=neueSid(); antw={}; richtig=0; ende.hidden=true; frage.hidden=false;
    quiz.querySelector('.quiz-progress').hidden=false; quiz.querySelector('.quiz-kicker').hidden=false; zeige(0); frage.focus();
  });
  quiz.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var p=a.getAttribute('href')||'';
    try{p=new URL(a.href,location.href).pathname+(a.hash||'');}catch(x){}senden({c:p.split('#')[0]});});
  liste.hidden=true; quiz.hidden=false; zeige(0);
})();
