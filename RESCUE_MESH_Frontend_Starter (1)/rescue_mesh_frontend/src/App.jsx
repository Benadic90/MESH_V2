import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import {
  Activity, AlertTriangle, Map as MapIcon, Package, Users, ChartNoAxesColumn,
  Settings, RadioTower, Wifi, MapPin, CalendarDays, ChevronDown, ChevronRight,
  Siren, ShieldCheck, Search, Plus, Cross, Clock3, FileText, UserRound,
  Navigation, ZoomIn, ZoomOut, LocateFixed, Send, X, Menu, CheckCircle2,
  ClipboardList, Truck, RefreshCw
} from 'lucide-react';

const initialIncidents = [
  { id:'RM-2026-001', type:'Medical Emergency', location:'Rongli', people:2, status:'Active', time:'15 Oct 2026, 01:30', priority:'High', details:'Two people need urgent medical assistance.', lat:27.18, lng:88.61 },
  { id:'RM-2026-002', type:'Natural Disaster', location:'Deorali', people:1, status:'Responding', time:'15 Oct 2026, 03:20', priority:'Medium', details:'Landslide reported near the main road.', lat:27.33, lng:88.61 },
  { id:'RM-2026-003', type:'Fire Incident', location:'Ranipool', people:5, status:'Resolved', time:'15 Oct 2026, 03:45', priority:'High', details:'Injured in a fire accident.', lat:27.29, lng:88.59 },
];

const navItems = [
  {name:'Live Incident', icon:Activity},
  {name:'Map View', icon:MapIcon},
  {name:'Resources', icon:Package},
  {name:'Response Teams', icon:Users},
  {name:'Reports', icon:ChartNoAxesColumn},
  {name:'Settings', icon:Settings},
];

function MapResizer({ refresh }) {
  const map = useMap();
  React.useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 120); return () => clearTimeout(t); }, [map, refresh]);
  return null;
}

function IncidentMap({ incidents, expanded=false }) {
  const [refresh, setRefresh] = useState(0);
  return <div className={`map-frame ${expanded ? 'map-expanded' : ''}`}>
    <MapContainer center={[27.30,88.61]} zoom={10} scrollWheelZoom={true} className="leaflet-map">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents.filter(i=>i.status!=='Resolved').map((item)=><CircleMarker key={item.id} center={[item.lat,item.lng]} radius={9} pathOptions={{color:item.status==='Active'?'#dc3545':'#2563eb', fillColor:item.status==='Active'?'#dc3545':'#2563eb', fillOpacity:.9}}>
        <Popup><strong>{item.type}</strong><br/>{item.location}<br/>Status: {item.status}<br/>People affected: {item.people}</Popup>
      </CircleMarker>)}
      {incidents.filter(i=>i.status==='Resolved').map((item)=><CircleMarker key={item.id} center={[item.lat,item.lng]} radius={7} pathOptions={{color:'#16a36a', fillColor:'#16a36a', fillOpacity:.85}}>
        <Popup><strong>{item.type}</strong><br/>{item.location}<br/>Resolved</Popup>
      </CircleMarker>)}
      <MapResizer refresh={refresh}/>
    </MapContainer>
    <div className="map-tools">
      <button title="Zoom in" onClick={()=>{document.querySelector('.leaflet-control-zoom-in')?.click()}}><ZoomIn size={18}/></button>
      <button title="Zoom out" onClick={()=>{document.querySelector('.leaflet-control-zoom-out')?.click()}}><ZoomOut size={18}/></button>
      <button title="Refresh map" onClick={()=>setRefresh(v=>v+1)}><LocateFixed size={18}/></button>
    </div>
  </div>
}

function App() {
  const [page, setPage] = useState('Live Incident');
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selected, setSelected] = useState(initialIncidents[0]);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const [newIncident, setNewIncident] = useState({type:'Medical Emergency', location:'Gangtok', people:'1', priority:'High', details:''});
  const [team, setTeam] = useState('Team 1 — Medical Response Team');

  const counts = useMemo(()=>({
    active: incidents.filter(i=>i.status==='Active').length,
    danger: incidents.filter(i=>i.status!=='Resolved').reduce((n,i)=>n+Number(i.people),0),
    deployed: incidents.filter(i=>i.status==='Responding').length + 2,
    resolved: incidents.filter(i=>i.status==='Resolved').length + 6
  }),[incidents]);
  const filtered = incidents.filter(i => `${i.id} ${i.type} ${i.location} ${i.status}`.toLowerCase().includes(query.toLowerCase()));

  const flash = (msg) => { setNotice(msg); window.setTimeout(()=>setNotice(''), 2800); };
  const updateStatus = (id, status) => {
    setIncidents(old=>old.map(i=>i.id===id?{...i,status}:i));
    setSelected(old=>old?.id===id?{...old,status}:old);
  };
  const addIncident = (e) => {
    e.preventDefault();
    const item = { ...newIncident, id:`RM-2026-${String(incidents.length+1).padStart(3,'0')}`, people:Math.max(1,Number(newIncident.people)||1), status:'Active', time:new Date().toLocaleString(), lat:27.33 + Math.random()*.04, lng:88.59 + Math.random()*.04 };
    setIncidents(old=>[item,...old]); setSelected(item); setShowAdd(false);
    setNewIncident({type:'Medical Emergency',location:'Gangtok',people:'1',priority:'High',details:''});
    flash('New incident added successfully.');
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-icon"><RadioTower size={27}/></div><div><h1>RESCUE_MESH</h1><p>Command center</p></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X/></button></div>
      <nav>{navItems.map(({name,icon:Icon})=><button key={name} className={`nav-link ${page===name?'active':''}`} onClick={()=>{setPage(name);setMobileNav(false)}}><Icon size={20}/><span>{name}</span>{page===name&&<span className="nav-active-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><span className="online-dot"/><div><strong>System Online</strong><small>v1.0.0 | RESCUE_MESH</small></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="hamburger" onClick={()=>setMobileNav(true)}><Menu/></button>
        <div className="topbar-title"><span className="eyebrow">EMERGENCY OPERATIONS</span><h2>{page}</h2></div>
        <div className="topbar-right"><span className="connection"><Wifi size={17}/> <span>Mesh Network: <b>Connected</b></span></span><span className="top-divider"/><span className="base-station"><MapPin size={17}/> Base Station</span><span className="top-divider"/><span className="date-label"><CalendarDays size={17}/> {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><button className="avatar" title="User profile">A</button></div>
      </header>

      {notice&&<div className="toast"><CheckCircle2 size={18}/>{notice}</div>}

      {page==='Live Incident' && <section className="content">
        <div className="page-heading"><div><h2>Situation overview</h2><p>Monitor emergencies and coordinate response teams.</p></div><button className="primary-button" onClick={()=>setShowAdd(true)}><Plus size={17}/> New incident</button></div>
        <div className="stat-grid">
          <button className="stat-card pink" onClick={()=>setQuery('Active')}><div className="stat-icon"><Siren/></div><div><p>Live Emergencies</p><strong>{counts.active}</strong></div><ChevronRight className="stat-arrow"/></button>
          <button className="stat-card yellow" onClick={()=>setQuery('')}><div className="stat-icon"><Users/></div><div><p>People in Danger</p><strong>{counts.danger}</strong></div><ChevronRight className="stat-arrow"/></button>
          <button className="stat-card blue" onClick={()=>setQuery('Responding')}><div className="stat-icon"><UserRound/></div><div><p>Responders Deployed</p><strong>{counts.deployed}</strong></div><ChevronRight className="stat-arrow"/></button>
          <button className="stat-card green" onClick={()=>setQuery('Resolved')}><div className="stat-icon"><CheckCircle2/></div><div><p>Total Resolved</p><strong>{counts.resolved}</strong></div><ChevronRight className="stat-arrow"/></button>
        </div>

        <div className="dashboard-grid">
          <section className="panel map-panel">
            <div className="panel-heading"><div><h3>Live Map</h3><p className="subtext">Incident and responder locations</p></div><div className="map-legend"><span><i className="legend-dot red"/>Emergency</span><span><i className="legend-dot blue-dot"/>Responder</span><span><i className="legend-dot green-dot"/>Resolved</span></div></div>
            <IncidentMap incidents={incidents}/>
          </section>
          <aside className="panel incident-panel">
            <div className="alert-banner"><div className="alert-symbol"><Cross size={23}/></div><div className="alert-copy"><span>EMERGENCY ALERT</span><h3>{selected?.type || 'No incident selected'}</h3><p>{selected?.people || 0} people in danger</p></div><span className={`priority ${selected?.priority==='Medium'?'medium':''}`}>{selected?.priority || '—'}</span></div>
            <div className="incident-meta"><div><MapPin/><span>Location</span><strong>{selected?.location || '—'}</strong></div><div><Clock3/><span>Reported at</span><strong>{selected?.time || '—'}</strong></div><div><FileText/><span>Details</span><strong>{selected?.details || 'No details provided'}</strong></div></div>
            <button className="view-incident" onClick={()=>selected?flash(`Viewing ${selected.id}`):flash('Select an incident first')}>View Incident <ChevronRight size={19}/></button>
            <div className="team-section"><h3>Response Team</h3><div className="team-row"><div className="team-icon"><Users size={17}/></div><div><strong>Team 1</strong><small>Medical Response Team</small></div></div><div className="team-row"><div className="team-icon"><Users size={17}/></div><div><strong>Team 2</strong><small>Search &amp; Rescue Team</small></div></div><div className="team-actions"><button className="text-button" onClick={()=>{setPage('Response Teams');}}> <Users size={17}/> Assign team</button><button className="send-button" onClick={()=>{if(selected){updateStatus(selected.id,'Responding');flash(`${team} dispatched to ${selected.location}.`)}else flash('Select an incident first')}}><Send size={15}/> Send response</button></div></div>
          </aside>
        </div>

        <section className="panel table-panel">
          <div className="table-heading"><div><h3>Recent Emergencies</h3><p className="subtext">Latest reported incidents and response status</p></div><div className="table-tools"><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search incidents..."/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</label><button className="plain-button" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add</button></div></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>Type</th><th>Location</th><th>People</th><th>Response status</th><th>Reported</th><th>Action</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id} className={selected?.id===item.id?'selected-row':''} onClick={()=>setSelected(item)}><td className="id-cell">{item.id}</td><td>{item.type}</td><td><MapPin size={13} className="inline-icon"/>{item.location}</td><td>{item.people}</td><td><span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.time}</td><td><button className="row-action" onClick={e=>{e.stopPropagation();setSelected(item);flash(`Selected ${item.id}`)}}>View</button><button className="row-more" title="Mark resolved" onClick={e=>{e.stopPropagation();updateStatus(item.id,'Resolved');flash(`${item.id} marked resolved.`)}}>•••</button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state">No incidents match your search.</div>}</div>
        </section>
      </section>}

      {page==='Map View'&&<section className="content"><div className="page-heading"><div><h2>Incident map</h2><p>Select a marker to view its incident information.</p></div><button className="plain-button" onClick={()=>setPage('Live Incident')}>Back to dashboard</button></div><section className="panel full-map-panel"><IncidentMap incidents={incidents} expanded/><p className="map-help"><i className="legend-dot red"/> Active incident <i className="legend-dot blue-dot"/> Responding <i className="legend-dot green-dot"/> Resolved — click a map marker for details.</p></section></section>}

      {page==='Resources'&&<section className="content"><div className="page-heading"><div><h2>Resources</h2><p>Track equipment and supplies available to responders.</p></div><button className="primary-button" onClick={()=>flash('Resource form can be connected to your database next.')}><Plus size={17}/> Add resource</button></div><div className="resource-grid">{[{icon:Truck,name:'Rescue Vehicles',qty:'12',desc:'8 available · 4 deployed'},{icon:Package,name:'Medical Kits',qty:'46',desc:'38 available · 8 assigned'},{icon:RadioTower,name:'Communication Radios',qty:'32',desc:'28 available · 4 assigned'},{icon:ShieldCheck,name:'Safety Equipment',qty:'120',desc:'105 available · 15 assigned'}].map(r=><div className="panel resource-card" key={r.name}><div className="resource-icon"><r.icon/></div><span>{r.name}</span><strong>{r.qty}</strong><small>{r.desc}</small></div>)}</div></section>}

      {page==='Response Teams'&&<section className="content"><div className="page-heading"><div><h2>Response Teams</h2><p>Coordinate teams and dispatch support to incidents.</p></div><button className="primary-button" onClick={()=>flash('Team creation can be connected to a database next.')}><Plus size={17}/> Add team</button></div><div className="team-grid">{[{name:'Team 1',role:'Medical Response Team',members:6,state:'Available'},{name:'Team 2',role:'Search & Rescue Team',members:8,state:'Deployed'},{name:'Team 3',role:'Fire & Safety Team',members:5,state:'Available'}].map(t=><div className="panel response-card" key={t.name}><div className="response-card-top"><div className="resource-icon"><Users/></div><span className={`status status-${t.state.toLowerCase()}`}>{t.state}</span></div><h3>{t.name}</h3><p>{t.role}</p><div className="member-count"><Users size={16}/>{t.members} members</div><button className="plain-button" onClick={()=>{setTeam(`${t.name} — ${t.role}`);flash(`${t.name} selected for dispatch.`)}}>Select team</button></div>)}</div><div className="panel dispatch-panel"><h3>Dispatch selected team</h3><p>Choose an active incident and send a team.</p><div className="dispatch-controls"><select value={selected?.id||''} onChange={e=>setSelected(incidents.find(i=>i.id===e.target.value))}>{incidents.filter(i=>i.status!=='Resolved').map(i=><option value={i.id} key={i.id}>{i.id} — {i.location}</option>)}</select><select value={team} onChange={e=>setTeam(e.target.value)}><option>Team 1 — Medical Response Team</option><option>Team 2 — Search & Rescue Team</option><option>Team 3 — Fire & Safety Team</option></select><button className="primary-button" onClick={()=>{if(selected){updateStatus(selected.id,'Responding');flash(`${team} dispatched.`)}else flash('Choose an active incident first')}}><Send size={16}/> Send response</button></div></div></section>}

      {page==='Reports'&&<section className="content"><div className="page-heading"><div><h2>Reports</h2><p>A quick summary of incident activity.</p></div><button className="primary-button" onClick={()=>{const rows=[['ID','Type','Location','People','Status','Time'],...incidents.map(i=>[i.id,i.type,i.location,i.people,i.status,i.time])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='rescue-mesh-report.csv';a.click();URL.revokeObjectURL(a.href);flash('Report downloaded.') }}><ClipboardList size={17}/> Export CSV</button></div><div className="report-stats"><div className="panel report-number"><span>Total incidents</span><strong>{incidents.length}</strong></div><div className="panel report-number"><span>Active</span><strong>{incidents.filter(i=>i.status==='Active').length}</strong></div><div className="panel report-number"><span>Responding</span><strong>{incidents.filter(i=>i.status==='Responding').length}</strong></div><div className="panel report-number"><span>Resolved</span><strong>{incidents.filter(i=>i.status==='Resolved').length}</strong></div></div><div className="panel report-list"><h3>Incident report</h3>{incidents.map(i=><div className="report-row" key={i.id}><div><strong>{i.type}</strong><small>{i.id} · {i.location} · {i.people} people</small></div><span className={`status status-${i.status.toLowerCase()}`}>{i.status}</span></div>)}</div></section>}

      {page==='Settings'&&<section className="content"><div className="page-heading"><div><h2>Settings</h2><p>Configure basic dashboard preferences.</p></div></div><div className="panel settings-panel"><h3>Command center preferences</h3><label>Command center name<input defaultValue="RESCUE_MESH" /></label><label>Base station location<input defaultValue="Gangtok, Sikkim" /></label><label>Notification preference<select defaultValue="all"><option value="all">All incident alerts</option><option value="high">High-priority alerts only</option><option value="none">No demo notifications</option></select></label><button className="primary-button" onClick={()=>flash('Settings saved for this demo session.')}><CheckCircle2 size={17}/> Save settings</button><p className="settings-note">This starter stores demo changes in the current page session. A backend is needed for permanent shared data.</p></div></section>}
    </main>

    {mobileNav&&<button className="mobile-overlay" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}
    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">INCIDENT MANAGEMENT</span><h2>Report a new incident</h2></div><button className="icon-button" onClick={()=>setShowAdd(false)}><X/></button></div><form onSubmit={addIncident}><label>Incident type<select value={newIncident.type} onChange={e=>setNewIncident({...newIncident,type:e.target.value})}><option>Medical Emergency</option><option>Natural Disaster</option><option>Fire Incident</option><option>Road Accident</option><option>Missing Person</option></select></label><label>Location<input required value={newIncident.location} onChange={e=>setNewIncident({...newIncident,location:e.target.value})} placeholder="e.g. Gangtok"/></label><div className="form-two"><label>People affected<input type="number" min="1" required value={newIncident.people} onChange={e=>setNewIncident({...newIncident,people:e.target.value})}/></label><label>Priority<select value={newIncident.priority} onChange={e=>setNewIncident({...newIncident,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></label></div><label>Incident details<textarea value={newIncident.details} onChange={e=>setNewIncident({...newIncident,details:e.target.value})} placeholder="Describe what happened..." rows="3"/></label><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={17}/> Create incident</button></div></form></div></div>}
  </div>
}

export default App;