async function loadResume() {
  try {
    const res = await fetch('data.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Could not load data.json');
    const data = await res.json();
    renderHeader(data);
    renderTOC(data);
    renderSections(data);
  } catch (err) {
    document.getElementById('name').textContent = 'Error loading resume';
    console.error(err);
  }
}

function renderHeader(d) {
  document.getElementById('name').textContent = d.name || '';
  document.getElementById('tagline').textContent = d.tagline || '';
  const c = document.getElementById('contact');
  c.innerHTML = '';
  if (d.contact) {
    if (d.contact.phone) c.innerHTML += `<div>${escapeHtml(d.contact.phone)}</div>`;
    if (d.contact.email) c.innerHTML += `<div><a href="mailto:${escapeHtml(d.contact.email)}">${escapeHtml(d.contact.email)}</a></div>`;
    if (d.contact.github) c.innerHTML += `<div><a href="${escapeHtml(d.contact.github)}" target="_blank" rel="noopener">GitHub</a></div>`;
    if (d.contact.linkedin) c.innerHTML += `<div><a href="${escapeHtml(d.contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></div>`;
  }
}

function renderTOC(d) {
  const toc = document.getElementById('toc');
  toc.innerHTML = '';
  const order = d.order || Object.keys(d.sections || {});
  order.forEach(key => {
    const btn = document.createElement('button');
    btn.textContent = key;
    btn.onclick = () => {
      document.querySelector(`#section-${cssId(key)}`)?.scrollIntoView({behavior:'smooth', block:'start'});
    };
    toc.appendChild(btn);
  });
}

function renderSections(d) {
  const content = document.getElementById('content');
  content.innerHTML = '';
  const order = d.order || Object.keys(d.sections || {});
  order.forEach(key => {
    const sec = document.createElement('section');
    sec.className = 'section';
    sec.id = `section-${cssId(key)}`;
    const h = document.createElement('h2');
    h.textContent = key;
    sec.appendChild(h);

    const list = d.sections?.[key];
    if (Array.isArray(list)) {
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        const title = item.title || item.name || '';
        const meta = item.meta || '';
        const details = item.details || '';
        div.innerHTML = `<div style="font-weight:600">${escapeHtml(title)}</div>
                         ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}
                         ${details ? `<div style="margin-top:6px">${escapeHtml(details)}</div>` : ''}`;
        sec.appendChild(div);
      });
    } else if (typeof list === 'object') {
      Object.entries(list).forEach(([k,v])=>{
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<div style="font-weight:600">${escapeHtml(k)}</div><div class="meta">${escapeHtml(String(v))}</div>`;
        sec.appendChild(div);
      });
    } else if (key.toLowerCase().includes('skills') && Array.isArray(d.sections?.Skills || [])) {
      const skillWrap = document.createElement('div');
      skillWrap.className = 'skills';
      (d.sections.Skills || []).forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = s;
        skillWrap.appendChild(chip);
      });
      sec.appendChild(skillWrap);
    }

    content.appendChild(sec);
  });
}

/* small helpers */
function cssId(str){ return String(str || '').replace(/\s+/g,'-').toLowerCase(); }
function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
  });
}

/* Theme toggle */
function setupTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') root.classList.add('light');
  const btn = document.getElementById('themeBtn');
  btn.addEventListener('click', ()=>{
    if (root.classList.contains('light')) {
      root.classList.remove('light');
      localStorage.setItem('theme','dark');
    } else {
      root.classList.add('light');
      localStorage.setItem('theme','light');
    }
  });
}

/* Print button */
function setupPrint() {
  const p = document.getElementById('printBtn');
  p.addEventListener('click', ()=> window.print());
}

/* Init */
document.addEventListener('DOMContentLoaded', ()=>{
  setupTheme();
  setupPrint();
  loadResume();
});
