// ══════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════
const MOCK_VIN_API = {
  "WBA3A5G59DNP26082": {
    make:"BMW", model:"3 Series", year:2021, colour:"Mineral White",
    image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80",
    recall:{ id:"R/2023/054", active:true, description:"Brake fluid contamination may reduce braking effectiveness under extreme conditions.", risk:"HIGH", type:"Safety", issued:"14 March 2023", remedy:"Free brake fluid flush and sensor replacement" }
  },
  "1HGCM82633A123456": {
    make:"Ford", model:"Focus", year:2020, colour:"Magnetic Grey",
    image:"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80",
    recall:{ id:"R/2023/102", active:true, description:"Fuel pump may fail without warning, causing engine stall at speed.", risk:"HIGH", type:"Safety", issued:"2 June 2023", remedy:"Free fuel pump replacement" }
  },
  "WVWZZZ1JZ3W386752": {
    make:"Volkswagen", model:"Golf", year:2019, colour:"Deep Black",
    image:"https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=400&q=80",
    recall:{ id:"R/2022/211", active:true, description:"Emission control software does not meet UK post-Brexit compliance thresholds.", risk:"LOW", type:"Environmental", issued:"19 September 2022", remedy:"Free software update at any authorised dealer" }
  },
  "SAJWA0ES5DMS50268": {
    make:"Jaguar", model:"XF", year:2018, colour:"Loire Blue",
    image:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80",
    recall:{ id:"R/2023/089", active:true, description:"Rear seatbelt pretensioner may not deploy correctly in a collision.", risk:"MEDIUM", type:"Safety", issued:"5 August 2023", remedy:"Free seatbelt assembly replacement" }
  }
};

const MOCK_USER_API = {
  "WBA3A5G59DNP26082": { name:"Jonathan Hartley",    email:"j.hartley@email.co.uk",  phone:"07712 345 678" },
  "1HGCM82633A123456": { name:"Sarah Pemberton",     email:"sarah.p@outlook.com",     phone:"07845 678 901" },
  "WVWZZZ1JZ3W386752": { name:"Michael Okafor",      email:"m.okafor@gmail.com",      phone:"07923 112 334" },
  "SAJWA0ES5DMS50268": { name:"Catherine Llewellyn", email:"c.llewellyn@icloud.com",  phone:"07600 221 443" }
};

const V5C_RECORDS = {
  "V5C-BMW-001":  "WBA3A5G59DNP26082",
  "V5C-FORD-002": "1HGCM82633A123456",
  "V5C-VW-003":   "WVWZZZ1JZ3W386752",
  "V5C-JAG-004":  "SAJWA0ES5DMS50268"
};

const MOCK_DEALERS = [
  { name:"Jardine BMW London",   address:"45 Western Ave, London W3 0TQ",       phone:"020 8992 1000", distance:"1.2 mi", rating:4.8, slots:"Tomorrow 09:00, 11:30",         lat:51.5123, lng:-0.2756 },
  { name:"Arnold Clark Ford",    address:"12 Park Royal Rd, London NW10 7LQ",   phone:"020 8965 4400", distance:"2.1 mi", rating:4.5, slots:"Today 15:00, Tomorrow 08:30",   lat:51.5278, lng:-0.2630 },
  { name:"Volkswagen Approved",  address:"88 Great West Rd, Brentford TW8 9BB", phone:"020 8568 3000", distance:"3.4 mi", rating:4.6, slots:"Thursday 10:00, Friday 14:00",  lat:51.4862, lng:-0.3049 }
];

const TIME_SLOTS = [
  { t:'08:30', avail:true  },{ t:'09:00', avail:true  },{ t:'09:30', avail:false },
  { t:'10:00', avail:true  },{ t:'10:30', avail:true  },{ t:'11:00', avail:false },
  { t:'11:30', avail:true  },{ t:'13:00', avail:true  },{ t:'13:30', avail:true  },
  { t:'14:00', avail:false },{ t:'14:30', avail:true  },{ t:'15:00', avail:true  },
  { t:'15:30', avail:true  },{ t:'16:00', avail:false },{ t:'16:30', avail:true  }
];

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let step = 'welcome', vinData = null, currentVIN = null, bsModal = null;
let bookingUser = null, bookingEmail = null, bookingDealer = null;
let selectedBookingDate = null, selectedBookingTime = null;
let generatedOTP = null, calMonth = null, calYear = null;
let dealerMapInstance = null;

// ══════════════════════════════════════
//  THEME SWITCHER
// ══════════════════════════════════════
function toggleThemeMenu() {
  document.getElementById('themeMenu').classList.toggle('open');
}

function applyTheme(cls) {
  const themes = ['theme-light','theme-purple','theme-green','theme-orange'];
  document.body.classList.remove(...themes);
  if (cls) document.body.classList.add(cls);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === cls);
  });
  document.getElementById('themeMenu').classList.remove('open');
  if (dealerMapInstance) {
    dealerMapInstance.eachLayer(l => { if (l instanceof L.TileLayer) dealerMapInstance.removeLayer(l); });
    const tileUrl = cls === 'theme-light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, { attribution: '© OpenStreetMap © CartoDB', maxZoom: 19 }).addTo(dealerMapInstance);
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.theme-switcher')) {
    document.getElementById('themeMenu').classList.remove('open');
  }
});

// ══════════════════════════════════════
//  MODAL CONTROL
// ══════════════════════════════════════
function toggleChat() {
  if (!bsModal) bsModal = new bootstrap.Modal(document.getElementById('chatModal'));
  document.getElementById('fabBadge').style.display = 'none';
  bsModal.show();
  if (document.getElementById('chatBody').children.length === 0) startChat();
  setTimeout(() => document.getElementById('chatInput').focus(), 420);
}
function openChat() { toggleChat(); }

// ══════════════════════════════════════
//  MESSAGING HELPERS
// ══════════════════════════════════════
function scrollChat() {
  const b = document.getElementById('chatBody');
  b.scrollTop = b.scrollHeight;
}

function appendMsg(text, sender, html, fullWidth = false) {
  const body = document.getElementById('chatBody');
  const wrap = document.createElement('div');
  wrap.className = `msg ${sender}${fullWidth ? ' full-width' : ''}`;
  if (sender === 'bot') {
    wrap.innerHTML = `<div class="bot-icon"><i class="fa fa-robot"></i></div><div class="bubble">${html || escHtml(text)}</div>`;
  } else {
    wrap.innerHTML = `<div class="bubble">${escHtml(text)}</div>`;
  }
  body.appendChild(wrap);
  scrollChat();
}

function showTyping() {
  const body = document.getElementById('chatBody');
  const t = document.createElement('div');
  t.className = 'msg bot'; t.id = 'typingIndicator';
  t.innerHTML = `<div class="bot-icon"><i class="fa fa-robot"></i></div><div class="typing-bubble"><span></span><span></span><span></span></div>`;
  body.appendChild(t);
  scrollChat();
}
function removeTyping() { const t = document.getElementById('typingIndicator'); if (t) t.remove(); }

function botReply(html, delay = 850, fullWidth = false) {
  showTyping();
  return new Promise(r => setTimeout(() => { removeTyping(); appendMsg('', 'bot', html, fullWidth); r(); }, delay));
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function addChips(chips) {
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = 'quick-chips'; div.id = 'quickChips';
  chips.forEach(c => {
    const btn = document.createElement('span');
    btn.className = 'chip'; btn.textContent = c;
    btn.onclick = () => { removeChips(); appendMsg(c, 'user'); processInput(c); };
    div.appendChild(btn);
  });
  body.appendChild(div);
  scrollChat();
}
function removeChips() { const c = document.getElementById('quickChips'); if (c) c.remove(); }
function setPlaceholder(p) { document.getElementById('chatInput').placeholder = p; }

// ══════════════════════════════════════
//  FLOW START
// ══════════════════════════════════════
async function startChat() {
  step = 'welcome';
  await botReply(`👋 <strong>Welcome to the DVSA Vehicle Recall Checker!</strong><br><br>
    I can instantly check whether your vehicle has any <strong>active safety recalls</strong> in the UK.<br><br>
    This service is free — all recall repairs are carried out at no cost to you.`, 600);
  await botReply(`To get started, please enter your <strong>VIN number</strong>.<br>
    <span style="color:var(--text-muted);font-size:.78rem">Your 17-character Vehicle Identification Number is on your V5C logbook, door sill, or visible through the windscreen.</span>`);
  step = 'awaitVIN';
  setPlaceholder('Enter your 17-character VIN…');
}

function handleKey(e) { if (e.key === 'Enter') handleSend(); }
function handleSend() {
  const inp = document.getElementById('chatInput');
  const val = inp.value.trim(); if (!val) return;
  inp.value = ''; removeChips();
  appendMsg(val, 'user'); processInput(val);
}

// ══════════════════════════════════════
//  PROCESS INPUT
// ══════════════════════════════════════
async function processInput(input) {
  const val = input.trim();

  if (step === 'awaitVIN') {
    const err = validateVIN(val);
    if (err) { await botReply(`❌ <strong>Invalid VIN:</strong> ${err}<br>Please try again.`); return; }
    currentVIN = val.toUpperCase();
    await botReply(`✅ VIN format valid — checking DVSA database…`, 500);
    await mockAPICall(currentVIN);
    return;
  }

  if (step === 'awaitV5C') {
    const v5c = val.toUpperCase();
    const matchedVIN = V5C_RECORDS[v5c];
    if (!matchedVIN) {
      await botReply(`❌ <strong>V5C number not found</strong>, or it doesn't match the VIN provided.<br>Please double-check your V5C document and try again.`);
      return;
    }
    if (matchedVIN !== currentVIN) {
      await botReply(`⚠️ This V5C reference belongs to a <strong>different vehicle</strong>.<br>Please ensure your V5C matches VIN: <code style="background:rgba(255,255,255,.08);padding:1px 5px;border-radius:4px">${currentVIN}</code>`);
      return;
    }
    vinData = MOCK_VIN_API[currentVIN];
    await botReply(`✅ V5C verified. Retrieving recall details…`, 700);
    await showRecallResult();
    return;
  }

  if (step === 'awaitPostcode') {
    const err = validatePostcode(val);
    if (err) { await botReply(`❌ ${err} Please enter a valid UK postcode, e.g. <strong>SW1A 1AA</strong>`); return; }
    await botReply(`📍 Searching for authorised dealers near <strong>${val.toUpperCase()}</strong>…`, 700);
    await showDealers(val);
    return;
  }

  if (step === 'awaitBookingChoice') {
    if (/book|appointment|yes|sure|ok/i.test(val)) {
      await encourageBooking(MOCK_DEALERS[0].name);
    } else if (/restart|new|another|check/i.test(val)) {
      document.getElementById('chatBody').innerHTML = ''; await startChat();
    } else {
      await botReply(`Click <strong>Book Appointment</strong> on any dealer card above to get started, or say <strong>"check another vehicle"</strong>.`);
    }
  }

  if (step === 'awaitOTPChoice') { /* handled via buttons */ }
  if (step === 'awaitOTP')       { /* handled via OTP input */ }
  if (step === 'awaitCalendar')  { /* handled via calendar clicks */ }

  if (step === 'done') {
    if (/restart|new|another|check/i.test(val)) {
      document.getElementById('chatBody').innerHTML = ''; await startChat();
    } else {
      await botReply(`You can say <strong>"check another vehicle"</strong> to start over. 🔧`);
    }
  }
}

// ══════════════════════════════════════
//  VALIDATION
// ══════════════════════════════════════
function validateVIN(vin) {
  if (!vin) return 'VIN cannot be empty.';
  const c = vin.replace(/\s/g,'');
  if (c.length !== 17) return `Must be exactly 17 characters (you entered ${c.length}).`;
  if (/[IOQ]/i.test(c)) return 'VIN cannot contain I, O or Q.';
  if (/[^A-HJ-NPR-Z0-9]/i.test(c)) return 'Only letters and digits allowed.';
  return null;
}
function validatePostcode(pc) {
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(pc.trim())
    ? null : "That doesn't look like a valid UK postcode.";
}

// ══════════════════════════════════════
//  MOCK API — VIN LOOKUP
// ══════════════════════════════════════
async function mockAPICall(vin) {
  await new Promise(r => setTimeout(r, 1100));
  const found = MOCK_VIN_API[vin];
  if (found) {
    window._apiResponse = found;
    await botReply(`🚗 Vehicle found in DVSA records:<br>
      <strong>${found.make} ${found.model} (${found.year})</strong> — ${found.colour}<br><br>
      Now I need to verify ownership. Please enter your <strong>V5C document reference number</strong>.<br>
      <span style="color:var(--text-muted);font-size:.77rem">Found on your V5C logbook (e.g. V5C-BMW-001)</span>`);
    step = 'awaitV5C';
    setPlaceholder('Enter your V5C reference…');
    addChips(['V5C-BMW-001','V5C-FORD-002','V5C-VW-003','V5C-JAG-004']);
  } else {
    await botReply(`ℹ️ No vehicle found for VIN <code style="background:rgba(255,255,255,.08);padding:1px 5px;border-radius:4px">${vin}</code> in the current DVSA database.<br><br>
      Your vehicle may have no active recalls, or the VIN may be incorrect. Try one of these sample VINs:`);
    addChips(['WBA3A5G59DNP26082','1HGCM82633A123456','WVWZZZ1JZ3W386752','SAJWA0ES5DMS50268']);
  }
}

// ══════════════════════════════════════
//  RECALL RESULT
// ══════════════════════════════════════
async function showRecallResult() {
  const d = vinData, rc = d.recall;
  const riskLabel = rc.risk === 'HIGH' ? '🔴 High Risk' : rc.risk === 'MEDIUM' ? '🟠 Medium Risk' : '🟢 Low Risk';
  const html = `
    <strong style="color:var(--danger)">⚠ Active Recall Found</strong><br><br>
    <div class="recall-card">
      <img src="${d.image}" alt="${d.make} ${d.model}" onerror="this.src='https://placehold.co/400x110/1a2235/94a3b8?text=${d.make}+${d.model}'">
      <div class="recall-card-body">
        <div class="d-flex justify-content-between align-items-start mb-1 flex-wrap gap-1">
          <strong>${d.make} ${d.model} ${d.year}</strong>
          <span class="badge-risk risk-${rc.risk}">${riskLabel}</span>
        </div>
        <div style="color:var(--text-muted);font-size:.74rem;margin-bottom:6px">
          Recall ID: ${rc.id} &bull; Issued: ${rc.issued}
        </div>
        <span style="background:rgba(79,142,247,.1);color:var(--primary);font-size:.7rem;padding:2px 8px;border-radius:10px;border:1px solid rgba(79,142,247,.2)">${rc.type}</span>
        <p style="font-size:.8rem;margin:8px 0;color:var(--text)">${rc.description}</p>
        <div class="remedy-box"><strong>Remedy:</strong> ${rc.remedy}</div>
      </div>
    </div>`;
  await botReply(html, 500);
  await botReply(`Your vehicle has an active <strong>${rc.type}</strong> recall.<br><br>
    The repair is <strong>completely free</strong> at any authorised ${d.make} dealer.<br><br>
    Shall I find your nearest available dealer? Enter your postcode below.`);
  step = 'awaitPostcode';
  setPlaceholder('Enter your UK postcode…');
  addChips(['SW1A 1AA','M1 1AE','EH1 1YZ','B1 1BB']);
}

// ══════════════════════════════════════
//  DEALERS + LEAFLET MAP
// ══════════════════════════════════════
async function showDealers(postcode) {
  const cards = MOCK_DEALERS.map((d, i) => `
    <div class="dealer-card" id="dcard-${i}" onclick="highlightMarker(${i})" style="cursor:pointer">
      <div class="d-flex justify-content-between align-items-start">
        <div class="d-name">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:.68rem;font-weight:700;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;margin-right:6px;flex-shrink:0">${i+1}</span>${d.name}
        </div>
        <span class="avail-badge">Slots Open</span>
      </div>
      <div class="d-addr mt-1"><i class="fa fa-location-dot me-1" style="color:var(--primary);font-size:.7rem"></i>${d.address}</div>
      <div class="d-flex justify-content-between align-items-center mt-2">
        <div class="stars">${'★'.repeat(Math.floor(d.rating))}<span style="color:var(--text-muted);font-size:.72rem;margin-left:4px">${d.rating}</span></div>
        <span style="color:var(--text-muted);font-size:.75rem"><i class="fa fa-route me-1"></i>${d.distance}</span>
      </div>
      <div style="color:var(--text-muted);font-size:.75rem;margin-top:6px"><i class="fa fa-calendar me-1"></i>${d.slots}</div>
      <div style="color:var(--text-muted);font-size:.75rem;margin-bottom:8px"><i class="fa fa-phone me-1"></i>${d.phone}</div>
      <button onclick="event.stopPropagation();encourageBooking('${d.name.replace(/'/g,"\\'")}');this.closest('.msg').querySelectorAll('button').forEach(b=>b.disabled=true);this.innerHTML='<i class=\\'fa fa-spinner fa-spin me-1\\'></i>Booking…'" style="width:100%;padding:6px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;border:none;border-radius:7px;font-size:.76rem;font-weight:600;cursor:pointer;transition:opacity .15s">
        <i class="fa fa-calendar-plus me-1"></i>Book Appointment
      </button>
    </div>`).join('');

  const mapHtml = `
    <strong>📍 Authorised Dealers near ${postcode.toUpperCase()}</strong>
    <div style="display:flex;gap:10px;margin-top:10px;align-items:flex-start">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0">${cards}</div>
      <div style="flex:1;min-width:0;position:sticky;top:0">
        <div id="dealerMap" style="height:320px;border-radius:10px;overflow:hidden;border:1px solid var(--border)"></div>
      </div>
    </div>`;

  await botReply(mapHtml, 600, true);
  setTimeout(() => initDealerMap(), 100);

  await botReply(`✅ <strong>${MOCK_DEALERS.length} authorised dealers</strong> found near you.<br><br>
    Click a dealer card to highlight it on the map, then hit <strong>Book Appointment</strong> to get your free recall repair booked right here.`);
  step = 'awaitBookingChoice';
  setPlaceholder('Type a message or click Book Appointment…');
}

function initDealerMap() {
  const el = document.getElementById('dealerMap');
  if (!el || typeof L === 'undefined') return;
  if (dealerMapInstance) { dealerMapInstance.remove(); dealerMapInstance = null; }

  const center = [
    MOCK_DEALERS.reduce((s,d) => s + d.lat, 0) / MOCK_DEALERS.length,
    MOCK_DEALERS.reduce((s,d) => s + d.lng, 0) / MOCK_DEALERS.length
  ];
  dealerMapInstance = L.map('dealerMap', { zoomControl: true, scrollWheelZoom: false }).setView(center, 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CartoDB', maxZoom: 19
  }).addTo(dealerMapInstance);

  window._dealerMarkers = MOCK_DEALERS.map((d, i) => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f8ef7,#7b5ea7);color:#fff;font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">${i+1}</div>`,
      iconSize: [28,28], iconAnchor: [14,14], popupAnchor: [0,-16]
    });
    const marker = L.marker([d.lat, d.lng], { icon })
      .addTo(dealerMapInstance)
      .bindPopup(`<div class="dealer-popup"><strong>${d.name}</strong>${d.address}<br>📞 ${d.phone}<br>⭐ ${d.rating}</div>`);
    marker.on('click', () => highlightCard(i));
    return marker;
  });
}

function highlightMarker(idx) {
  if (!window._dealerMarkers) return;
  window._dealerMarkers[idx].openPopup();
  dealerMapInstance.setView([MOCK_DEALERS[idx].lat, MOCK_DEALERS[idx].lng], 14, { animate: true });
  document.querySelectorAll('.dealer-card').forEach((c,i) => {
    c.style.borderColor = i === idx ? 'var(--primary)' : '';
    c.style.background  = i === idx ? 'rgba(79,142,247,.08)' : '';
  });
}
function highlightCard(idx) {
  document.querySelectorAll('.dealer-card').forEach((c,i) => {
    c.style.borderColor = i === idx ? 'var(--primary)' : '';
    c.style.background  = i === idx ? 'rgba(79,142,247,.08)' : '';
  });
}

// ══════════════════════════════════════
//  BOOKING FLOW
// ══════════════════════════════════════
function maskName(n)  { return n.split(' ').map(w => w[0] + '*'.repeat(w.length - 1)).join(' '); }
function maskEmail(e) { const [u,d] = e.split('@'); return u.slice(0,2)+'****'+u.slice(-1)+'@'+d; }
function maskPhone(p) { return p.slice(0,4)+' *** '+p.slice(-3); }

async function encourageBooking(dealerName) {
  bookingDealer = dealerName;
  await botReply(`🎯 Great! Let me get you booked in at <strong>${dealerName}</strong>.<br><br>
    I'll now fetch your registered details from the DVSA database to begin the booking process…`, 900);
  await fetchUserInfoForBooking();
}

async function fetchUserInfoForBooking() {
  await new Promise(r => setTimeout(r, 1000));
  const user = MOCK_USER_API[currentVIN];
  if (!user) {
    await botReply(`⚠️ Could not retrieve account details for this VIN. Please call the dealer directly.`);
    step = 'done'; return;
  }
  bookingUser = user;
  bookingEmail = user.email;

  const html = `
    <div class="booking-info-card">
      <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px">
        <i class="fa fa-shield-halved me-1" style="color:var(--primary)"></i>
        Details retrieved — shown in encrypted format for your privacy
      </div>
      <div class="info-row"><span class="info-label">Full Name</span><span class="info-val">${maskName(user.name)} <span class="encrypt-tag">🔒 masked</span></span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-val">${maskEmail(user.email)} <span class="encrypt-tag">🔒 masked</span></span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-val">${maskPhone(user.phone)} <span class="encrypt-tag">🔒 masked</span></span></div>
      <div class="info-row"><span class="info-label">Vehicle</span><span class="info-val">${vinData.make} ${vinData.model} ${vinData.year}</span></div>
    </div>`;
  await botReply(html, 500, true);
  await botReply(`Do these details look correct?<br><br>
    I'll send a one-time verification code to <strong>${maskEmail(user.email)}</strong>.<br>
    Or you can provide an <strong>alternate email</strong> if you prefer.`);

  const actionHtml = `
    <div style="width:100%">
      <div class="alt-email-row">
        <input type="email" id="altEmailInput" placeholder="Enter alternate email (optional)">
        <button onclick="useAltEmail()">Use This</button>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="confirm-btn" style="flex:1" onclick="sendOTPToEmail()">
          <i class="fa fa-envelope me-2"></i>Send OTP to ${maskEmail(user.email)}
        </button>
      </div>
    </div>`;
  await botReply(actionHtml, 300, true);
  step = 'awaitOTPChoice';
}

function useAltEmail() {
  const val = document.getElementById('altEmailInput').value.trim();
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    document.getElementById('altEmailInput').style.borderColor = 'var(--danger)';
    return;
  }
  bookingEmail = val;
  appendMsg('Use alternate email: ' + val, 'user');
  sendOTPToEmail(val);
}

async function sendOTPToEmail(email) {
  const target = email || bookingEmail;
  document.querySelectorAll('.alt-email-row, .confirm-btn').forEach(el => {
    if (el.closest('.msg')) el.closest('.bubble').style.opacity = '.4';
  });

  generatedOTP = '123456';

  await botReply(`📧 OTP sent to <strong>${maskEmail(target)}</strong><br>
    <span style="color:var(--text-muted);font-size:.77rem">
      Check your inbox — the code expires in 5 minutes.<br>
      <i class="fa fa-circle-info me-1" style="color:var(--primary)"></i>Use demo code <strong style="color:var(--primary);letter-spacing:.12em">123456</strong> to verify.
    </span>`);

  const otpHtml = `
    <div style="width:100%">
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px">Enter 6-digit OTP</div>
      <div class="otp-row" id="otpRow">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,0)" onkeydown="otpBack(event,this,0)">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,1)" onkeydown="otpBack(event,this,1)">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,2)" onkeydown="otpBack(event,this,2)">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,3)" onkeydown="otpBack(event,this,3)">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,4)" onkeydown="otpBack(event,this,4)">
        <input type="text" maxlength="1" class="otp-digit" oninput="otpNext(this,5)" onkeydown="otpBack(event,this,5)">
        <button onclick="verifyOTP()" style="margin-left:8px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;border:none;border-radius:8px;padding:0 14px;font-size:.82rem;cursor:pointer">Verify</button>
      </div>
      <div style="font-size:.73rem;color:var(--text-muted);margin-top:6px">
        Didn't receive it? <span style="color:var(--primary);cursor:pointer" onclick="sendOTPToEmail()">Resend OTP</span>
      </div>
    </div>`;
  await botReply(otpHtml, 400, true);
  step = 'awaitOTP';
  setTimeout(() => { const d = document.querySelectorAll('.otp-digit'); if (d.length) d[0].focus(); }, 200);
}

function otpNext(el, idx) {
  el.value = el.value.replace(/\D/g,'');
  if (el.value && idx < 5) { const next = document.querySelectorAll('.otp-digit')[idx+1]; if (next) next.focus(); }
  if (idx === 5 && el.value) verifyOTP();
}
function otpBack(e, el, idx) {
  if (e.key === 'Backspace' && !el.value && idx > 0) document.querySelectorAll('.otp-digit')[idx-1].focus();
}

async function verifyOTP() {
  const digits = [...document.querySelectorAll('.otp-digit')].map(i => i.value).join('');
  if (digits.length < 6) { document.querySelectorAll('.otp-digit').forEach(i => i.style.borderColor='var(--danger)'); return; }
  if (digits !== generatedOTP) {
    document.querySelectorAll('.otp-digit').forEach(i => { i.style.borderColor='var(--danger)'; i.value=''; });
    document.querySelectorAll('.otp-digit')[0].focus();
    await botReply(`❌ Incorrect OTP. Please try again.`, 300);
    return;
  }
  document.querySelectorAll('.otp-digit').forEach(i => i.style.borderColor = 'var(--success)');
  await botReply(`✅ <strong>Identity verified!</strong> Your booking is now being prepared.`, 400);
  step = 'awaitCalendar';
  setTimeout(showCalendar, 600);
}

// ══════════════════════════════════════
//  CALENDAR
// ══════════════════════════════════════
function showCalendar() {
  const now = new Date();
  calMonth = now.getMonth();
  calYear  = now.getFullYear();
  renderCalendar(calMonth, calYear);
}

function buildCalCells(month, year) {
  const days  = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const today = new Date(); today.setHours(0,0,0,0);
  const first = new Date(year, month, 1);
  const total = new Date(year, month+1, 0).getDate();
  let startDow = first.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  let cells = '';
  days.forEach(d => { cells += `<div class="cal-day-name">${d}</div>`; });
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    const isPast    = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday   = date.getTime() === today.getTime();
    const dateStr   = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = 'cal-day';
    if (isPast || isWeekend) cls += ' disabled';
    else if (selectedBookingDate === dateStr) cls += ' selected';
    else if (isToday) cls += ' today';
    const click = (!isPast && !isWeekend) ? `onclick="selectBookingDate('${dateStr}',this)"` : '';
    cells += `<div class="${cls}" ${click}>${d}</div>`;
  }
  return cells;
}

function calMarkup(month, year) {
  const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `
    <div class="cal-wrap" id="calWrap">
      <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px">
        <i class="fa fa-calendar-check me-1" style="color:var(--primary)"></i>Select an available appointment date
      </div>
      <div class="cal-header">
        <button onclick="changeMonth(-1)">‹</button>
        <span>${names[month]} ${year}</span>
        <button onclick="changeMonth(1)">›</button>
      </div>
      <div class="cal-grid" id="calGrid">${buildCalCells(month, year)}</div>
      <div id="timeSlotWrap" style="margin-top:10px"></div>
      <button class="confirm-btn" id="confirmSlotBtn" disabled onclick="confirmBookingSlot()">
        <i class="fa fa-calendar-plus me-2"></i>Confirm Appointment
      </button>
    </div>`;
}

function renderCalendar(month, year) {
  botReply(calMarkup(month, year), 300, true);
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  selectedBookingDate = null; selectedBookingTime = null;
  const wrap = document.getElementById('calWrap');
  if (wrap) { wrap.closest('.bubble').innerHTML = calMarkup(calMonth, calYear); }
}

function selectBookingDate(dateStr, el) {
  selectedBookingDate = dateStr;
  selectedBookingTime = null;
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  const wrap = document.getElementById('timeSlotWrap');
  if (!wrap) return;
  const slots = TIME_SLOTS.map(s =>
    `<span class="time-slot${!s.avail?' unavail':''}" ${s.avail?`onclick="selectBookingTime('${s.t}',this)"`:''} >${s.t}</span>`
  ).join('');
  wrap.innerHTML = `
    <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px">
      <i class="fa fa-clock me-1"></i>Select a time slot for <strong style="color:var(--text)">${dateStr}</strong>
    </div>
    <div class="time-slots">${slots}</div>`;
  const btn = document.getElementById('confirmSlotBtn');
  if (btn) btn.disabled = true;
}

function selectBookingTime(time, el) {
  selectedBookingTime = time;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  const btn = document.getElementById('confirmSlotBtn');
  if (btn) btn.disabled = false;
}

// ══════════════════════════════════════
//  CONFIRM BOOKING
// ══════════════════════════════════════
async function confirmBookingSlot() {
  if (!selectedBookingDate || !selectedBookingTime) return;
  const btn = document.getElementById('confirmSlotBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Booking…'; }
  await new Promise(r => setTimeout(r, 1200));

  const bookingRef = 'BK-' + Math.random().toString(36).substring(2,8).toUpperCase();
  const rc = vinData.recall;

  const confirmHtml = `
    <div class="confirm-card">
      <div class="confirm-icon"><i class="fa fa-circle-check"></i></div>
      <div style="font-weight:700;color:var(--success);margin-bottom:12px;font-size:.92rem">Appointment Confirmed!</div>
      <div class="confirm-row"><span class="confirm-lbl">Booking Ref</span><span class="confirm-val">${bookingRef}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Name</span><span class="confirm-val">${bookingUser.name}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Dealer</span><span class="confirm-val">${bookingDealer}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Date</span><span class="confirm-val">${selectedBookingDate}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Time</span><span class="confirm-val">${selectedBookingTime}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Vehicle</span><span class="confirm-val">${vinData.make} ${vinData.model} ${vinData.year}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Recall ID</span><span class="confirm-val">${rc.id}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Recall Type</span><span class="confirm-val">${rc.type}</span></div>
      <div class="confirm-row"><span class="confirm-lbl">Remedy</span><span class="confirm-val">${rc.remedy}</span></div>
      <div style="margin-top:10px;padding:8px;background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:8px;font-size:.76rem;color:var(--text-muted)">
        <i class="fa fa-envelope me-1" style="color:var(--success)"></i>
        Confirmation email with recall summary and required documents sent to <strong>${maskEmail(bookingEmail)}</strong>
      </div>
    </div>`;

  await botReply(confirmHtml, 400, true);
  await botReply(`🎉 You're all set, <strong>${bookingUser.name.split(' ')[0]}</strong>!<br><br>
    Your booking reference is <strong>${bookingRef}</strong>. A confirmation email has been sent with:<br>
    <ul style="margin:8px 0 0 0;padding-left:18px;font-size:.82rem;color:var(--text-muted)">
      <li>Appointment details &amp; dealer address</li>
      <li>Recall summary (${rc.id})</li>
      <li>What to bring on the day</li>
      <li>DVSA recall documentation</li>
    </ul><br>
    The repair is <strong>completely free of charge</strong>. Is there anything else I can help with?`);
  step = 'done';
  setPlaceholder('Type a message…');
  addChips(['Check another vehicle','Thanks, all done']);
}
