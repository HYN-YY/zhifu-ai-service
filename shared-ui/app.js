const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const icons={
  home:'<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart:'<path d="M4 19V9M10 19V5M16 19v-8M22 19V3"/>',
  box:'<path d="m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM12 1v3M12 20v3M1 12h3M20 12h3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  spark:'<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  switch:'<path d="m16 3 4 4-4 4M20 7H8a4 4 0 0 0-4 4M8 21l-4-4 4-4M4 17h12a4 4 0 0 0 4-4"/>'
};
const svg=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[n]||icons.box}</svg>`;
const navIcon=i=>['home','list','users','box','chart','settings'][i%6];
const clone=x=>JSON.parse(JSON.stringify(x));

function app(config){
  document.documentElement.style.setProperty('--brand',config.color);
  document.documentElement.style.setProperty('--brand2',config.color2||config.color);
  document.title=config.name+' · 高保真原型';
  const roles=config.roles?.length?config.roles:[{name:config.role,user:config.user,scope:'全部数据',nav:config.nav.map((_,i)=>i),permissions:['create','edit','export','advance']}];
  const storageKey='prototype-data-'+config.en;
  const roleKey='prototype-role-'+config.en;
  let savedData;
  try{savedData=JSON.parse(localStorage.getItem(storageKey))}catch(e){}
  const state={page:0,query:'',roleIndex:Math.min(+(localStorage.getItem(roleKey)||0),roles.length-1),data:Array.isArray(savedData)?savedData:clone(config.rows)};
  const role=()=>roles[state.roleIndex];
  const allowed=i=>role().nav.includes(i);
  const can=p=>role().permissions.includes(p);
  const visibleRows=()=>{
    if(role().scope==='全部数据')return state.data;
    if(role().scope==='本部门数据')return state.data.filter((_,i)=>i%4!==3);
    if(role().scope==='质量相关数据')return state.data.filter((r,i)=>/质量|风险|资质|整改|检验/.test(r.name+r.status)||i%3===1);
    if(role().scope==='财务相关数据')return state.data.filter((r,i)=>/合同|回款|金额|报销|费用/.test(r.name+r.status)||i%3===0);
    if(role().scope==='本组数据')return state.data.filter((_,i)=>i%4!==2);
    return state.data.filter((_,i)=>i%2===0);
  };
  const persist=()=>localStorage.setItem(storageKey,JSON.stringify(state.data));

  document.body.innerHTML=`<div class="app"><aside class="sidebar"><div class="brand"><div class="brand-logo">${svg('spark')}</div><div>${config.name}<small>${config.en}</small></div></div><nav class="nav"></nav><button class="sidebar-foot role-switch" type="button"></button></aside><main class="main"><header class="topbar"><button class="icon-btn mobile-menu">${svg('list')}</button><div class="crumb">${config.name} <b id="crumb"></b></div><div class="top-actions"><div class="search">${svg('search')}<input id="globalSearch" placeholder="搜索业务数据…"></div><button class="role-pill role-switch" type="button">${svg('shield')}<span class="role-name"></span>${svg('switch')}</button><button class="icon-btn notify">${svg('bell')}<i class="dot"></i></button><div class="avatar top-avatar"></div></div></header><div class="content" id="content"></div></main></div><div class="drawer-back"><aside class="drawer"></aside></div><div class="modal-back"><div class="modal"></div></div><div class="toast"></div>`;

  function syncIdentity(){
    const r=role();
    $('.sidebar-foot').innerHTML=`<div class="user"><div class="avatar">${r.user[0]}</div><div><b>${r.user}</b><span>${r.name} · 点击切换</span></div>${svg('switch')}</div>`;
    $('.role-name').textContent=r.name;
    $('.top-avatar').textContent=r.user[0];
  }
  function renderNav(){
    if(!allowed(state.page))state.page=0;
    $('.nav').innerHTML=`<div class="nav-label">${role().scope}</div>`+config.nav.map((n,i)=>allowed(i)?`<button data-page="${i}" class="${i===state.page?'active':''}">${svg(navIcon(i))}<span>${n}</span>${i===1?`<em>${Math.max(1,visibleRows().length)}</em>`:''}</button>`:'').join('');
    $$('.nav button').forEach(b=>b.onclick=()=>{state.page=+b.dataset.page;state.query='';$('.sidebar').classList.remove('open');render()});
  }
  function viewConfig(){
    const r=role(), rows=visibleRows();
    const kpis=clone(config.kpis);
    if(r.scope!=='全部数据'){kpis[0]={label:`可见${config.entity}`,value:String(rows.length),trend:'权限范围内'};}
    return {...config,user:r.user,role:r.name,rows,kpis,subtitle:`${config.subtitle} · 当前为${r.name}，查看${r.scope}`};
  }
  function render(){
    syncIdentity();renderNav();
    const c=viewConfig();
    $('#crumb').textContent=config.nav[state.page];
    $('#content').innerHTML=(state.page===0?dashboard(c,can):listPage(c,state.page,state.query,can));
    bindContent(c);
  }
  function bindContent(c){
    $$('.open-detail').forEach(el=>el.onclick=()=>openDrawer(state.data.find(r=>r.code===el.dataset.code)||c.rows[0]));
    $$('.add-btn').forEach(b=>b.onclick=()=>can('create')?openCreate():deny('新建'));
    const q=$('#tableSearch');if(q)q.oninput=e=>{state.query=e.target.value;render()};
    $$('.quick-action').forEach(b=>b.onclick=()=>toast(b.dataset.msg));
    $$('.export').forEach(b=>b.onclick=()=>can('export')?toast(`已导出 ${visibleRows().length} 条${role().scope}记录`):deny('导出'));
    const reset=$('.reset-demo');if(reset)reset.onclick=()=>{state.data=clone(config.rows);persist();render();toast('演示数据已恢复')};
  }
  function deny(action){toast(`${role().name}无${action}权限，已按最小权限策略拦截`,'warn')}
  function openRoleModal(){
    $('.modal').innerHTML=`<h2>切换演示角色</h2><p>不同角色拥有独立的数据范围、菜单入口和操作权限。</p><div class="role-grid">${roles.map((r,i)=>`<button class="role-card ${i===state.roleIndex?'selected':''}" data-role="${i}"><span class="role-avatar">${r.user[0]}</span><span><b>${r.name}</b><small>${r.user} · ${r.scope}</small><em>${r.permissions.map(permissionName).join(' · ')}</em></span>${i===state.roleIndex?'<i>当前</i>':''}</button>`).join('')}</div><div class="modal-actions"><button class="btn cancel">取消</button></div>`;
    $('.modal-back').classList.add('open');
    $('.cancel').onclick=closeModal;
    $$('.role-card').forEach(b=>b.onclick=()=>{state.roleIndex=+b.dataset.role;localStorage.setItem(roleKey,state.roleIndex);state.page=0;state.query='';closeModal();render();toast(`已切换为${role().name}，权限与数据范围已更新`)});
  }
  function openDrawer(row){
    const editable=can('edit'), advance=can('advance');
    $('.drawer').innerHTML=`<div class="drawer-head"><div><h2>${row.name}</h2><p>${row.code} · ${config.entity}</p></div><button class="close">×</button></div><div class="detail-hero"><div class="mini">${row.name[0]}</div><div><b>${row.name}</b><p>${row.owner} 负责 · 当前角色：${role().name}</p></div><span class="tag info">${row.status}</span></div><div class="detail-grid"><div class="detail-box"><span>业务编号</span><b>${row.code}</b></div><div class="detail-box"><span>${config.metricLabel}</span><b>${row.value}</b></div><div class="detail-box"><span>当前负责人</span><b>${row.owner}</b></div><div class="detail-box"><span>完成进度</span><b>${row.progress}%</b></div></div><div class="permission-note">${svg('shield')} ${role().name}：${editable?'可编辑':'只读'} · ${advance?'可推进状态':'不可推进状态'}</div><div class="timeline"><h3>业务动态</h3>${(row.history||config.activities.slice(0,4)).map((a,i)=>`<div class="timeline-item">${a}<small>${i?i+' 小时前':'刚刚'} · ${role().user}</small></div>`).join('')}</div><div class="drawer-actions">${editable?`<button class="btn edit-record">编辑资料</button>`:''}${advance?`<button class="btn primary advance-record">推进状态</button>`:''}${!editable&&!advance?'<button class="btn" disabled>当前角色仅可查看</button>':''}</div>`;
    $('.drawer-back').classList.add('open');
    $('.drawer .close').onclick=closeDrawer;
    const edit=$('.edit-record');if(edit)edit.onclick=()=>{closeDrawer();openEdit(row)};
    const next=$('.advance-record');if(next)next.onclick=()=>{row.progress=Math.min(100,row.progress+12);row.status=row.progress>=100?'已完成':row.progress>=80?'审批/确认中':'处理中';row.history=[`${role().user} 将状态推进至「${row.status}」`,...(row.history||config.activities.slice(0,3))];persist();closeDrawer();render();toast(`${config.entity}状态已更新，相关指标同步刷新`)};
  }
  function openCreate(){
    $('.modal').innerHTML=`<h2>新建${config.entity}</h2><p>保存后将立即进入当前角色的数据列表并更新统计结果。</p><div class="form-grid"><div class="form-group"><label>${config.entity}名称</label><input id="recordName" placeholder="请输入名称"></div><div class="form-group"><label>负责人</label><select id="recordOwner"><option>${role().user}</option><option>陈予安</option><option>宋嘉禾</option></select></div><div class="form-group"><label>业务类型</label><select id="recordType">${config.categories.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="form-group"><label>${config.metricLabel}</label><input id="recordValue" placeholder="例如 ¥ 100,000"></div><div class="form-group full"><label>说明</label><textarea id="recordNote" placeholder="补充背景、目标或备注信息"></textarea></div></div><div class="modal-actions"><button class="btn cancel">取消</button><button class="btn primary save">保存并创建</button></div>`;
    $('.modal-back').classList.add('open');$('.cancel').onclick=closeModal;
    $('.save').onclick=()=>{const name=$('#recordName').value.trim();if(!name){$('#recordName').focus();toast('请先填写名称','warn');return}const now=Date.now().toString().slice(-6);state.data.unshift({name,code:`${config.en.slice(0,3)}-${now}`,status:'新建',value:$('#recordValue').value||'待评估',progress:12,owner:$('#recordOwner').value,history:[`${role().user} 创建了${config.entity}`,`业务类型：${$('#recordType').value}`,`备注：${$('#recordNote').value||'无'}`]});persist();closeModal();state.page=allowed(1)?1:0;render();toast(`${config.entity}已创建，列表与统计结果已更新`)};
  }
  function openEdit(row){
    $('.modal').innerHTML=`<h2>编辑${config.entity}</h2><p>${row.code} · 所有修改将记录在业务动态中。</p><div class="form-grid"><div class="form-group full"><label>名称</label><input id="editName" value="${escapeHtml(row.name)}"></div><div class="form-group"><label>负责人</label><input id="editOwner" value="${escapeHtml(row.owner)}"></div><div class="form-group"><label>${config.metricLabel}</label><input id="editValue" value="${escapeHtml(row.value)}"></div></div><div class="modal-actions"><button class="btn cancel">取消</button><button class="btn primary save">保存修改</button></div>`;
    $('.modal-back').classList.add('open');$('.cancel').onclick=closeModal;
    $('.save').onclick=()=>{if(!$('#editName').value.trim())return toast('名称不能为空','warn');row.name=$('#editName').value.trim();row.owner=$('#editOwner').value.trim();row.value=$('#editValue').value.trim();row.history=[`${role().user} 更新了业务资料`,...(row.history||config.activities.slice(0,3))];persist();closeModal();render();toast('修改已保存，详情和列表已同步')};
  }
  function closeModal(){$('.modal-back').classList.remove('open')}
  function closeDrawer(){$('.drawer-back').classList.remove('open')}
  function permissionName(p){return ({create:'新建',edit:'编辑',export:'导出',advance:'状态推进'})[p]||p}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  $$('.role-switch').forEach(b=>b.onclick=openRoleModal);
  $('.mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
  $('.notify').onclick=()=>toast(`${role().name}有 ${Math.max(1,visibleRows().length-1)} 条权限范围内提醒`);
  $('#globalSearch').onkeydown=e=>{if(e.key==='Enter'){state.page=allowed(1)?1:0;state.query=e.target.value;render()}};
  render();
}

function permissionBanner(c){return `<div class="permission-banner">${svg('shield')}<span><b>${c.role}视图</b><small>${c.subtitle.split(' · ').pop()}</small></span><button class="btn reset-demo">恢复演示数据</button></div>`}
function dashboard(c,can){return `${permissionBanner(c)}<div class="page-head"><div><h1>${c.greeting}</h1><p>${c.subtitle}</p></div><div>${can('export')?'<button class="btn export">导出数据</button>':''}${can('create')?` <button class="btn primary add-btn">${svg('plus')} 快速新建</button>`:''}</div></div><div class="grid-kpi">${c.kpis.map((k,i)=>`<div class="card kpi"><div class="kpi-top"><span>${k.label}</span><span class="kpi-icon">${svg(navIcon(i+2))}</span></div><strong>${k.value}</strong><span class="trend ${k.down?'down':''}">${k.trend}</span> <small>较上期</small></div>`).join('')}</div><div class="dashboard-grid"><section class="card panel"><div class="panel-title"><h3>${c.chartTitle}</h3><span>最近 6 个月 ▾</span></div><div class="chart">${[44,62,51,78,68,91].map((h,i)=>`<div class="bar-wrap"><i class="bar" style="height:${h}%"></i><i class="bar alt" style="height:${Math.max(20,h-17)}%"></i><label>${['2月','3月','4月','5月','6月','7月'][i]}</label></div>`).join('')}</div></section><section class="card panel"><div class="panel-title"><h3>${c.donutTitle}</h3><span>角色数据口径</span></div><div class="donut-row"><div class="donut"><b>${Math.min(99,72+c.rows.length)}%</b></div><div class="legend"><span><i style="background:var(--brand)"></i>${c.categories[0]} 42%</span><span><i style="background:#34b7a7"></i>${c.categories[1]} 28%</span><span><i style="background:#f3a641"></i>${c.categories[2]} 17%</span><span><i style="background:#e7eaf0"></i>其他 13%</span></div></div></section><section class="card panel"><div class="panel-title"><h3>${c.focusTitle}</h3><span>${c.rows.length} 条可见</span></div><table class="data-table">${c.rows.slice(0,4).map(r=>`<tr class="open-detail" data-code="${r.code}"><td><div class="entity"><div class="mini">${r.name[0]}</div><div><b>${r.name}</b><small>${r.code}</small></div></div></td><td><span class="tag ${r.progress<50?'warn':'info'}">${r.status}</span></td><td>${r.value}</td><td><div class="progress"><i style="width:${r.progress}%"></i></div></td></tr>`).join('')||'<tr><td class="empty">当前角色暂无可见数据</td></tr>'}</table></section><section class="card panel"><div class="panel-title"><h3>最新动态</h3><span>${c.role}</span></div><div class="activity">${c.activities.slice(0,4).map((a,i)=>`<div class="activity-item"><div class="avatar">${['林','陈','宋','周'][i]}</div><p>${a}<time>${i*17+5} 分钟前</time></p></div>`).join('')}</div></section></div>`}
function listPage(c,p,q,can){const title=c.nav[p],rows=c.rows.filter(r=>!q||r.name.includes(q)||r.code.includes(q));return `${permissionBanner(c)}<div class="page-head"><div><h1>${title}</h1><p>${c.role}可查看 ${rows.length} 条${c.subtitle.split(' · ').pop()}记录</p></div>${can('create')?`<button class="btn primary add-btn">${svg('plus')} 新建${c.entity}</button>`:''}</div><section class="card"><div class="toolbar"><div class="filters"><input class="field" id="tableSearch" value="${q}" placeholder="搜索名称或编号"><select class="field"><option>全部状态</option><option>处理中</option><option>已完成</option></select><select class="field"><option>权限范围：${c.role}</option></select></div><div>${can('export')?'<button class="btn export">导出</button> ':''}<button class="btn quick-action" data-msg="当前角色视图已保存">视图设置</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>${c.entity}</th><th>状态</th><th>${c.metricLabel}</th><th>进度</th><th>负责人</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows.length?rows.map((r,i)=>`<tr><td><div class="entity"><div class="mini">${r.name[0]}</div><div><b>${r.name}</b><small>${r.code}</small></div></div></td><td><span class="tag ${r.progress<40?'bad':r.progress<70?'warn':'info'}">${r.status}</span></td><td><b>${r.value}</b></td><td><div class="progress"><i style="width:${r.progress}%"></i></div></td><td>${r.owner}</td><td>${i+1}小时前</td><td><button class="btn ghost open-detail" data-code="${r.code}">查看</button></td></tr>`).join(''):`<tr><td colspan="7" class="empty">当前角色没有匹配数据，请调整条件或切换角色</td></tr>`}</tbody></table></div><div class="pagination"><span>共 ${rows.length} 条 · ${c.role}权限视图</span><div class="pages"><button>‹</button><button class="active">1</button><button>›</button></div></div></section>`}
let toastTimer;function toast(msg,type){const el=$('.toast');el.textContent=(type==='warn'?'⚠ ':'✓ ')+msg;el.classList.toggle('warning',type==='warn');el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
window.PrototypeApp=app;
