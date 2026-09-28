// Gestionale Riservato Admin — Sorsi e Morsi Bari (Autenticazione Server-Side su Supabase)

const ADMIN_SESSION_KEY = "sorsi_e_morsi_bari_admin_auth_v1";

let supabaseClient = null;
let realtimeChannel = null;

let adminState = {
  authenticated: false,
  tables: [...SORSI_E_MORSI_CONFIG.tables],
  menu: [...INITIAL_MENU],
  reviews: [...INITIAL_REVIEWS],
  bookings: [],
  settings: {
    maxSeatsIndoor: 44,
    maxSeatsOutdoor: 48,
    outdoorEnabled: true
  },
  tab: "bookings",
  dateFilter: getTodayFormatted(0),
  statusFilter: "all",
  areaFilter: "all",
  search: ""
};

function initSupabase() {
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(
      SORSI_E_MORSI_CONFIG.supabaseUrl,
      SORSI_E_MORSI_CONFIG.supabaseAnonKey
    );
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// Verifica credenziali tramite funzione RPC sicura su Supabase (verify_admin_login)
async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;
  const errEl = document.getElementById("adminLoginError");
  const btn = document.getElementById("adminLoginBtn");

  if (errEl) errEl.style.display = "none";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Verifica in corso...";
  }

  try {
    const { data, error } = await supabaseClient.rpc("verify_admin_login", {
      p_username: username,
      p_password: password
    });

    if (error || !data) {
      if (errEl) errEl.style.display = "block";
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Accedi al Gestionale";
      }
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    unlockAdminShell();
  } catch (err) {
    if (errEl) errEl.style.display = "block";
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Accedi al Gestionale";
    }
  }
}

function unlockAdminShell() {
  adminState.authenticated = true;
  const loginScreen = document.getElementById("adminLoginScreen");
  const shell = document.getElementById("adminShell");
  if (loginScreen) loginScreen.style.display = "none";
  if (shell) shell.classList.add("authenticated");

  fetchAdminData();
  subscribeAdminRealtime();
}

function handleAdminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.reload();
}

async function fetchAdminData() {
  if (!supabaseClient || !adminState.authenticated) return;

  try {
    const [settingsRes, tablesRes, menuRes, reviewsRes, bookingsRes] = await Promise.all([
      supabaseClient.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
      supabaseClient.from("restaurant_tables").select("*").order("sort_order", { ascending: true }),
      supabaseClient.from("menu_items").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
      supabaseClient.from("reviews").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("bookings").select("*").order("created_at", { ascending: false })
    ]);

    if (settingsRes.data) {
      adminState.settings = {
        maxSeatsIndoor: Number(settingsRes.data.max_seats_indoor || 44),
        maxSeatsOutdoor: Number(settingsRes.data.max_seats_outdoor || 48),
        outdoorEnabled: Boolean(settingsRes.data.outdoor_enabled)
      };
    }

    if (tablesRes.data && tablesRes.data.length > 0) {
      adminState.tables = tablesRes.data.map((t) => ({
        id: t.id,
        name: t.name,
        area: t.area,
        capacity: Number(t.capacity)
      }));
    }

    if (menuRes.data) {
      adminState.menu = menuRes.data.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        categoryLabel: row.category_label,
        price: Number(row.price),
        description: row.description,
        available: Boolean(row.available)
      }));
    }

    if (reviewsRes.data) {
      adminState.reviews = reviewsRes.data.map((row) => ({
        id: row.id,
        author: row.author,
        rating: Number(row.rating),
        date: row.date_label || "Recente",
        text: row.text,
        ownerReply: row.owner_reply || ""
      }));
    }

    if (bookingsRes.data) {
      adminState.bookings = bookingsRes.data.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        date: row.booking_date,
        time: row.booking_time,
        guests: Number(row.guests),
        area: row.area,
        assignedTable: row.assigned_table || "",
        status: row.status || "pending",
        notes: row.notes || "",
        createdAt: row.created_at_label || "Online"
      }));
    }
  } catch (err) {
    console.error("Errore sincronizzazione Admin:", err);
  }

  renderAdminAll();
}

function subscribeAdminRealtime() {
  if (!supabaseClient || realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel("sorsi-e-morsi-admin-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchAdminData())
    .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => fetchAdminData())
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => fetchAdminData())
    .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_settings" }, () => fetchAdminData())
    .subscribe();
}

function switchAdminTab(tab) {
  adminState.tab = tab;
  document.querySelectorAll(".admin-tabs-bar .cat-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  document.querySelectorAll(".admin-view").forEach((v) => {
    v.style.display = v.id === `adminView-${tab}` ? "block" : "none";
  });
  renderAdminAll();
}

function clearDateFilter() {
  adminState.dateFilter = "";
  const el = document.getElementById("adminFilterDate");
  if (el) el.value = "";
  renderAdminAll();
}

function renderAdminAll() {
  if (!adminState.authenticated) return;

  const pendingCount = adminState.bookings.filter((b) => b.status === "pending").length;
  const dateBookings = adminState.bookings.filter(
    (b) => (!adminState.dateFilter || b.date === adminState.dateFilter) && b.status !== "cancelled"
  );
  const totalGuests = dateBookings.reduce((s, b) => s + Number(b.guests || 0), 0);
  const avgRating =
    adminState.reviews.length > 0
      ? (adminState.reviews.reduce((s, r) => s + Number(r.rating), 0) / adminState.reviews.length).toFixed(1)
      : "4.7";

  document.getElementById("kpiTotalBookings").textContent = dateBookings.length;
  document.getElementById("kpiTotalGuests").textContent = totalGuests;
  document.getElementById("kpiPendingCount").textContent = pendingCount;
  document.getElementById("kpiAvgRating").textContent = `${avgRating} / 5`;

  renderBookingsTable();
  renderFloorplan();
  renderMenuTable();
  renderReviewsAdmin();
  renderSettingsAdmin();
}

function renderBookingsTable() {
  const tbody = document.getElementById("adminBookingsTbody");
  if (!tbody) return;

  const q = adminState.search.trim().toLowerCase();
  const filtered = adminState.bookings.filter((b) => {
    const matchDate = !adminState.dateFilter || b.date === adminState.dateFilter;
    const matchStatus = adminState.statusFilter === "all" || b.status === adminState.statusFilter;
    const matchArea = adminState.areaFilter === "all" || b.area === adminState.areaFilter;
    const matchSearch =
      !q ||
      b.customerName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q);
    return matchDate && matchStatus && matchArea && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-secondary);">Nessuna prenotazione trovata.</td></tr>`;
    return;
  }

  const statusLabels = {
    pending: "In attesa",
    confirmed: "Confermata",
    completed: "Completata",
    cancelled: "Annullata"
  };

  tbody.innerHTML = filtered
    .map((b) => {
      const tableOptions = adminState.tables
        .map(
          (t) =>
            `<option value="${t.id}" ${b.assignedTable === t.id ? "selected" : ""}>${t.id} (${t.area} - ${t.capacity}p)</option>`
        )
        .join("");

      return `
        <tr>
          <td><strong>${escapeHtml(b.id)}</strong><br><span style="font-size:0.74rem; color:var(--text-muted);">${escapeHtml(b.createdAt)}</span></td>
          <td><strong>${escapeHtml(b.customerName)}</strong><br><span style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(b.phone)}</span></td>
          <td>${escapeHtml(b.date)}<br><strong>Ore ${escapeHtml(b.time)}</strong></td>
          <td>${b.guests}</td>
          <td>${escapeHtml(b.area)}</td>
          <td>
            <select class="form-control" style="padding:6px 8px; font-size:0.8rem;" onchange="adminAssignTable('${escapeHtml(b.id)}', this.value)">
              <option value="">Non assegnato</option>
              ${tableOptions}
            </select>
          </td>
          <td>
            <span class="status-badge ${escapeHtml(b.status)}">${statusLabels[b.status] || b.status}</span>
            ${b.notes ? `<div style="font-size:0.76rem; color:var(--text-secondary); margin-top:4px;">${escapeHtml(b.notes)}</div>` : ""}
          </td>
          <td>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${
                b.status !== "confirmed"
                  ? `<button type="button" class="btn btn-primary btn-sm" onclick="adminUpdateBookingStatus('${escapeHtml(b.id)}', 'confirmed')">Conferma</button>`
                  : `<button type="button" class="btn btn-outline btn-sm" onclick="adminUpdateBookingStatus('${escapeHtml(b.id)}', 'completed')">Completa</button>`
              }
              ${
                b.status !== "cancelled"
                  ? `<button type="button" class="btn btn-outline btn-sm" onclick="adminUpdateBookingStatus('${escapeHtml(b.id)}', 'cancelled')">Annulla</button>`
                  : `<button type="button" class="btn btn-outline btn-sm" onclick="adminDeleteBooking('${escapeHtml(b.id)}')">Elimina</button>`
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderFloorplan() {
  const el = document.getElementById("adminTablesFloorplan");
  if (!el) return;
  const targetDate = adminState.dateFilter || getTodayFormatted(0);

  el.innerHTML = adminState.tables
    .map((t) => {
      const assigned = adminState.bookings.filter(
        (b) => b.date === targetDate && b.assignedTable === t.id && b.status !== "cancelled"
      );
      return `
        <div class="table-box ${assigned.length > 0 ? "occupied" : ""}">
          <div style="font-weight:700;">${escapeHtml(t.name)}</div>
          <div style="font-size:0.74rem; color:var(--text-secondary); margin-bottom:6px;">${escapeHtml(t.area)} • ${t.capacity} posti</div>
          ${
            assigned.length > 0
              ? assigned
                  .map(
                    (a) =>
                      `<div style="font-size:0.75rem; color:var(--accent-gold); margin-top:3px;">${escapeHtml(a.time)} — ${escapeHtml(a.customerName)} (${a.guests}p)</div>`
                  )
                  .join("")
              : `<div style="font-size:0.75rem; color:var(--accent-green-light);">Libero</div>`
          }
        </div>
      `;
    })
    .join("");
}

async function adminUpdateBookingStatus(id, status) {
  const payload = { status };
  if (status === "cancelled") payload.assigned_table = "";
  await supabaseClient.from("bookings").update(payload).eq("id", id);
  await fetchAdminData();
  showToast(`Prenotazione ${id} aggiornata.`);
}

async function adminAssignTable(id, tableId) {
  const b = adminState.bookings.find((x) => x.id === id);
  if (!b) return;
  const nextStatus = tableId && b.status === "pending" ? "confirmed" : b.status;
  await supabaseClient.from("bookings").update({ assigned_table: tableId, status: nextStatus }).eq("id", id);
  await fetchAdminData();
  showToast(`Tavolo aggiornato per ${b.customerName}.`);
}

async function adminDeleteBooking(id) {
  await supabaseClient.from("bookings").delete().eq("id", id);
  await fetchAdminData();
  showToast(`Prenotazione ${id} eliminata.`);
}

function isValidAdminPhone(raw) {
  let cleaned = String(raw || "").replace(/[\s\-\.\(\)]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return false;
  if (cleaned.startsWith("+39")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("0039")) cleaned = cleaned.slice(4);
  if (cleaned.startsWith("+")) {
    if (!/^\+[1-9]\d{8,13}$/.test(cleaned)) return false;
  } else {
    if (!/^3[1-9]\d{7,8}$/.test(cleaned) && !/^0[1-9]\d{6,9}$/.test(cleaned)) return false;
  }
  const digits = cleaned.replace(/\D/g, "");
  if (/(.)\1{5,}/.test(digits)) return false;
  if (new Set(digits.split("")).size < 3) return false;
  const fakeSequences = ["0123456", "1234567", "2345678", "3456789", "4567890", "9876543", "8765432", "7654321", "6543210"];
  if (fakeSequences.some((seq) => digits.includes(seq))) return false;
  return true;
}

async function handleAdminAddManualBooking(e) {
  e.preventDefault();
  const name = document.getElementById("admBookName").value.trim();
  const phone = document.getElementById("admBookPhone").value.trim();
  const date = document.getElementById("admBookDate").value;
  const time = document.getElementById("admBookTime").value;
  const guests = Number(document.getElementById("admBookGuests").value);
  const area = document.getElementById("admBookArea").value;
  const table = document.getElementById("admBookTable").value;
  const notes = document.getElementById("admBookNotes").value.trim();

  if (!name || !date) return;

  if (phone && !isValidAdminPhone(phone)) {
    showToast("Inserisci un numero di telefono reale valido (es. 347 123 4567).");
    return;
  }

  const code = "SEM-" + Math.floor(1000 + Math.random() * 9000);
  await supabaseClient.from("bookings").insert({
    id: code,
    customer_name: name,
    phone: phone || "Telefonica",
    email: "",
    booking_date: date,
    booking_time: time,
    guests,
    area,
    occasion: "Telefonica",
    assigned_table: table,
    status: "confirmed",
    notes,
    created_at_label: "Staff"
  });

  adminState.dateFilter = date;
  document.getElementById("adminFilterDate").value = date;
  await fetchAdminData();
  e.target.reset();
  document.getElementById("admBookDate").value = date;
  showToast(`Prenotazione ${code} salvata.`);
}

function renderMenuTable() {
  const tbody = document.getElementById("adminMenuTbody");
  if (!tbody) return;

  tbody.innerHTML = adminState.menu
    .map(
      (item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.categoryLabel)}</td>
        <td>
          <input
            type="number"
            step="0.50"
            value="${Number(item.price).toFixed(2)}"
            class="form-control"
            style="width:90px; padding:5px 8px;"
            onchange="adminUpdateDishPrice('${escapeHtml(item.id)}', this.value)"
          />
        </td>
        <td>
          <span class="status-badge ${item.available ? "confirmed" : "cancelled"}">
            ${item.available ? "Disponibile" : "Esaurito"}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="adminToggleDish('${escapeHtml(item.id)}')">
              ${item.available ? "Segna Esaurito" : "Attiva"}
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="adminDeleteDish('${escapeHtml(item.id)}')">Elimina</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

async function adminToggleDish(id) {
  const item = adminState.menu.find((m) => m.id === id);
  if (!item) return;
  await supabaseClient.from("menu_items").update({ available: !item.available }).eq("id", id);
  await fetchAdminData();
  showToast(`Disponibilità aggiornata per "${item.name}".`);
}

async function adminUpdateDishPrice(id, priceVal) {
  const parsed = Math.max(0.5, Number(priceVal) || 1);
  await supabaseClient.from("menu_items").update({ price: parsed }).eq("id", id);
  await fetchAdminData();
  showToast("Prezzo aggiornato.");
}

async function adminDeleteDish(id) {
  await supabaseClient.from("menu_items").delete().eq("id", id);
  await fetchAdminData();
  showToast("Piatto eliminato.");
}

async function handleAdminAddDish(e) {
  e.preventDefault();
  const name = document.getElementById("newDishName").value.trim();
  const category = document.getElementById("newDishCategory").value;
  const price = Number(document.getElementById("newDishPrice").value);
  const desc = document.getElementById("newDishDesc").value.trim();

  const catLabels = {
    "taglieri": "Taglieri & Antipasti",
    "primi": "Primi & Assassina",
    "secondi": "Secondi Mare & Terra",
    "cicci-pizze": "Il Ciccio & Pizze",
    "vini-drink": "Wine & Drink",
    "dolci": "Dolci Artigianali"
  };

  if (!name || !price) return;

  await supabaseClient.from("menu_items").insert({
    id: "sem-" + Date.now(),
    name,
    category,
    category_label: catLabels[category] || "Menu",
    price,
    description: desc || "",
    allergens: "",
    tags: ["new"],
    tag_labels: ["Novità"],
    available: true,
    image: "",
    sort_order: 0
  });

  await fetchAdminData();
  e.target.reset();
  showToast(`Piatto "${name}" aggiunto.`);
}

function renderReviewsAdmin() {
  const container = document.getElementById("adminReviewsList");
  if (!container) return;

  container.innerHTML = adminState.reviews
    .map(
      (r) => `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:18px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <strong>${escapeHtml(r.author)}</strong>
            <span style="color:var(--accent-gold); margin-left:10px;">Voto: ${r.rating}/5</span>
            <span style="font-size:0.76rem; color:var(--text-muted); margin-left:10px;">${escapeHtml(r.date)}</span>
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="adminDeleteReview('${escapeHtml(r.id)}')">Elimina</button>
        </div>
        <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">"${escapeHtml(r.text)}"</p>
        <div style="display:flex; gap:10px;">
          <input
            type="text"
            id="replyInput-${escapeHtml(r.id)}"
            class="form-control"
            style="padding:8px 12px; font-size:0.84rem;"
            placeholder="Risposta di Sorsi e Morsi..."
            value="${escapeHtml(r.ownerReply || "")}"
          />
          <button type="button" class="btn btn-primary btn-sm" onclick="adminSaveOwnerReply('${escapeHtml(r.id)}')">Salva Risposta</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function adminSaveOwnerReply(id) {
  const val = document.getElementById(`replyInput-${id}`)?.value.trim() || "";
  await supabaseClient.from("reviews").update({ owner_reply: val }).eq("id", id);
  await fetchAdminData();
  showToast("Risposta salvata.");
}

async function adminDeleteReview(id) {
  await supabaseClient.from("reviews").delete().eq("id", id);
  await fetchAdminData();
  showToast("Recensione rimossa.");
}

function renderSettingsAdmin() {
  document.getElementById("setIndoorMax").value = adminState.settings.maxSeatsIndoor;
  document.getElementById("setOutdoorMax").value = adminState.settings.maxSeatsOutdoor;
  document.getElementById("setOutdoorEnabled").checked = Boolean(adminState.settings.outdoorEnabled);
}

async function handleSaveAdminSettings(e) {
  e.preventDefault();
  const maxIndoor = Number(document.getElementById("setIndoorMax").value) || 44;
  const maxOutdoor = Number(document.getElementById("setOutdoorMax").value) || 48;
  const outdoorEnabled = document.getElementById("setOutdoorEnabled").checked;

  await supabaseClient
    .from("restaurant_settings")
    .update({
      max_seats_indoor: maxIndoor,
      max_seats_outdoor: maxOutdoor,
      outdoor_enabled: outdoorEnabled,
      updated_at: new Date().toISOString()
    })
    .eq("id", 1);

  await fetchAdminData();
  showToast("Impostazioni salvate.");
}

function exportBookingsCSV() {
  const headers = ["Codice", "Cliente", "Telefono", "Data", "Ora", "Persone", "Area", "Tavolo", "Stato", "Note"];
  const rows = adminState.bookings.map((b) => [
    b.id,
    `"${(b.customerName || "").replace(/"/g, '""')}"`,
    `"${(b.phone || "").replace(/"/g, '""')}"`,
    b.date,
    b.time,
    b.guests,
    b.area,
    b.assignedTable || "",
    b.status,
    `"${(b.notes || "").replace(/"/g, '""')}"`
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prenotazioni_sorsi_e_morsi_bari_${getTodayFormatted(0)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  initSupabase();

  const today = getTodayFormatted(0);
  ["adminFilterDate", "admBookDate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  document.getElementById("adminFilterDate")?.addEventListener("change", (e) => {
    adminState.dateFilter = e.target.value;
    renderAdminAll();
  });
  document.getElementById("adminFilterStatus")?.addEventListener("change", (e) => {
    adminState.statusFilter = e.target.value;
    renderAdminAll();
  });
  document.getElementById("adminFilterArea")?.addEventListener("change", (e) => {
    adminState.areaFilter = e.target.value;
    renderAdminAll();
  });
  document.getElementById("adminSearchInput")?.addEventListener("input", (e) => {
    adminState.search = e.target.value;
    renderAdminAll();
  });

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
    unlockAdminShell();
  }
});
