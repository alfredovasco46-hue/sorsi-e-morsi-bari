// Logica Sito Cliente — Sorsi e Morsi Bari (Collegata a Supabase)

const LUNCH_SLOTS = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];
const DINNER_SLOTS = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"];
const TIME_SLOTS = [...LUNCH_SLOTS, ...DINNER_SLOTS];

let supabaseClient = null;
let realtimeChannel = null;

let state = {
  menu: [...INITIAL_MENU],
  reviews: [...INITIAL_REVIEWS],
  bookings: [],
  settings: {
    maxSeatsIndoor: SORSI_E_MORSI_CONFIG.maxSeatsPerSlotIndoor,
    maxSeatsOutdoor: SORSI_E_MORSI_CONFIG.maxSeatsPerSlotOutdoor,
    outdoorEnabled: SORSI_E_MORSI_CONFIG.outdoorEnabled
  },
  menuCategory: "all",
  menuSearch: ""
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
  setTimeout(() => {
    toast.remove();
  }, 3400);
}

async function fetchPublicData() {
  if (!supabaseClient) {
    renderAll();
    return;
  }

  try {
    const [settingsRes, menuRes, reviewsRes, bookingsRes] = await Promise.all([
      supabaseClient.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
      supabaseClient.from("menu_items").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
      supabaseClient.from("reviews").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("bookings").select("*")
    ]);

    if (settingsRes.data) {
      state.settings = {
        maxSeatsIndoor: Number(settingsRes.data.max_seats_indoor || 44),
        maxSeatsOutdoor: Number(settingsRes.data.max_seats_outdoor || 48),
        outdoorEnabled: Boolean(settingsRes.data.outdoor_enabled)
      };
    }

    if (menuRes.data && menuRes.data.length > 0) {
      state.menu = menuRes.data.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        categoryLabel: row.category_label,
        price: Number(row.price),
        description: row.description,
        tagLabels: Array.isArray(row.tag_labels) ? row.tag_labels : [],
        available: Boolean(row.available)
      }));
    }

    if (reviewsRes.data && reviewsRes.data.length > 0) {
      state.reviews = reviewsRes.data.map((row) => ({
        id: row.id,
        author: row.author,
        rating: Number(row.rating),
        date: row.date_label || "Recente",
        favoriteDish: row.favorite_dish || "",
        text: row.text,
        ownerReply: row.owner_reply || ""
      }));
    }

    if (bookingsRes.data) {
      state.bookings = bookingsRes.data.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        date: row.booking_date,
        time: row.booking_time,
        guests: Number(row.guests),
        area: row.area,
        assignedTable: row.assigned_table || "",
        status: row.status || "pending"
      }));
    }
  } catch (err) {
    console.warn("Errore caricamento dati:", err);
  }

  renderAll();
}

function subscribePublicRealtime() {
  if (!supabaseClient || realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel("sorsi-e-morsi-public-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => fetchPublicData())
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => fetchPublicData())
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchPublicData())
    .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_settings" }, () => fetchPublicData())
    .subscribe();
}

// ===================== MENU DIVISO IN SEZIONI ORDINATE =====================
const MENU_SECTIONS = [
  {
    id: "taglieri",
    title: "Taglieri & Antipasti",
    subtitle: "I nostri celebri taglieri di salumi e formaggi pugliesi, tris di friselle gourmet, tartare e carpacci"
  },
  {
    id: "primi",
    title: "Primi & Spaghetti all'Assassina",
    subtitle: "Spaghetti all'Assassina, tiella barese riso patate e cozze, orecchiette fresche e primi di mare"
  },
  {
    id: "secondi",
    title: "Secondi Mare & Terra",
    subtitle: "Bombette della Valle d'Itria, polpo arrosto su crema di ceci, zuppa di pesce e tagliate selezionate"
  },
  {
    id: "cicci-pizze",
    title: "Il Ciccio & Pizze",
    subtitle: "Il Ciccio barese caldo farcito, focaccia barese, panzerotti fritti e pizze a lunga lievitazione"
  },
  {
    id: "vini-drink",
    title: "Wine & Drink",
    subtitle: "Calici e bottiglie delle migliori cantine pugliesi, Spritz d'autore e cocktail signature"
  },
  {
    id: "dolci",
    title: "Dolci Artigianali",
    subtitle: "Sporcamuss caldi alla crema pasticcera, pasticciotto leccese, tiramisù e dessert della casa"
  }
];

function normalizeCategory(cat) {
  if (cat === "taglieri" || cat === "antipasti") return "taglieri";
  if (cat === "primi") return "primi";
  if (cat === "secondi" || cat === "pescato") return "secondi";
  if (cat === "cicci-pizze" || cat === "pizze" || cat === "panzerotti") return "cicci-pizze";
  if (cat === "vini-drink" || cat === "vini" || cat === "drink") return "vini-drink";
  if (cat === "dolci") return "dolci";
  return "taglieri";
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const q = state.menuSearch.trim().toLowerCase();
  const filtered = state.menu.filter((item) => {
    const normCat = normalizeCategory(item.category);
    const matchCat = state.menuCategory === "all" || normCat === state.menuCategory;
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-secondary); padding:24px 0;">Nessun piatto trovato.</p>`;
    return;
  }

  const sectionsHtml = MENU_SECTIONS.map((sec) => {
    const items = filtered.filter((item) => normalizeCategory(item.category) === sec.id);
    if (items.length === 0) return "";

    const rowsHtml = items
      .map(
        (item) => `
        <div class="menu-row ${!item.available ? "sold-out" : ""}">
          <div class="menu-row-top">
            <span class="menu-row-name">${escapeHtml(item.name)}</span>
            <span class="menu-row-dots"></span>
            <span class="menu-row-price">${
              item.available
                ? `${Number(item.price).toFixed(2).replace(".", ",")} €`
                : "Esaurito"
            }</span>
          </div>
          ${
            item.description
              ? `<p class="menu-row-desc">${escapeHtml(item.description)}</p>`
              : ""
          }
        </div>
      `
      )
      .join("");

    return `
      <div class="menu-section-block">
        <div class="menu-section-block-header">
          <h3 class="menu-section-block-title">${escapeHtml(sec.title)}</h3>
          <p class="menu-section-block-sub">${escapeHtml(sec.subtitle)}</p>
        </div>
        <div class="menu-section-block-list">
          ${rowsHtml}
        </div>
      </div>
    `;
  })
    .filter(Boolean)
    .join("");

  grid.innerHTML = sectionsHtml;
}

function setMenuCategory(cat, btnEl) {
  state.menuCategory = cat;
  document.querySelectorAll(".cat-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  if (btnEl) btnEl.classList.add("active");
  renderMenu();
}

function openMenuView(e) {
  if (e && e.preventDefault) e.preventDefault();
  const homeSections = document.getElementById("homeSections");
  const menuSection = document.getElementById("menu");
  const navMenu = document.getElementById("navLinkMenu");

  if (homeSections) homeSections.style.display = "none";
  if (menuSection) menuSection.style.display = "block";
  if (navMenu) navMenu.style.color = "var(--accent-green-light)";

  renderMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMenuView(targetSectionId = "home", e) {
  if (e && e.preventDefault) e.preventDefault();
  const homeSections = document.getElementById("homeSections");
  const menuSection = document.getElementById("menu");
  const navMenu = document.getElementById("navLinkMenu");

  if (menuSection) menuSection.style.display = "none";
  if (homeSections) homeSections.style.display = "block";
  if (navMenu) navMenu.style.color = "";

  const targetEl = document.getElementById(targetSectionId);
  if (targetEl && targetSectionId !== "home") {
    targetEl.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ===================== PRENOTAZIONE MINIMAL =====================
function getBookedSeats(date, time, area) {
  return state.bookings
    .filter((b) => b.date === date && b.time === time && b.area === area && b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.guests || 0), 0);
}

function renderBookingOptions() {
  const areaSelect = document.getElementById("bookArea");
  const timeSelect = document.getElementById("bookTime");
  const dateInput = document.getElementById("bookDate");
  const guestsInput = document.getElementById("bookGuests");
  if (!areaSelect || !timeSelect || !dateInput) return;

  // Se il Dehors Corso Vittorio è chiuso dalle impostazioni admin, mostra solo Sala Interna & Wine Bar
  const currentArea = areaSelect.value || "Dehors Corso Vittorio";
  if (!state.settings.outdoorEnabled) {
    areaSelect.innerHTML = `<option value="Sala Interna & Wine Bar" selected>Sala Interna & Wine Bar</option>`;
  } else {
    areaSelect.innerHTML = `
      <option value="Dehors Corso Vittorio" ${currentArea === "Dehors Corso Vittorio" ? "selected" : ""}>Dehors Corso Vittorio</option>
      <option value="Sala Interna & Wine Bar" ${currentArea === "Sala Interna & Wine Bar" ? "selected" : ""}>Sala Interna & Wine Bar</option>
    `;
  }

  const selectedDate = dateInput.value || getTodayFormatted(0);
  const selectedArea = areaSelect.value;
  const requestedGuests = Number(guestsInput?.value || 2);
  const maxSeats =
    selectedArea === "Dehors Corso Vittorio"
      ? Number(state.settings.maxSeatsOutdoor || 48)
      : Number(state.settings.maxSeatsIndoor || 44);

  const prevTime = timeSelect.value || "20:30";

  const renderGroup = (slots) =>
    slots
      .map((slot) => {
        const booked = getBookedSeats(selectedDate, slot, selectedArea);
        const remaining = Math.max(0, maxSeats - booked);
        const disabled = remaining < requestedGuests;
        return `<option value="${slot}" ${disabled ? "disabled" : ""} ${slot === prevTime && !disabled ? "selected" : ""}>
          ${slot}${disabled ? " (Completo)" : ""}
        </option>`;
      })
      .join("");

  timeSelect.innerHTML = `
    <optgroup label="Pranzo & Aperitivo (12:00 – 15:00)">
      ${renderGroup(LUNCH_SLOTS)}
    </optgroup>
    <optgroup label="Aperitivo Serale & Cena (18:30 – 23:00)">
      ${renderGroup(DINNER_SLOTS)}
    </optgroup>
  `;
}

function isValidRealPhone(raw) {
  let cleaned = String(raw || "").replace(/[\s\-\.\(\)]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return false;

  if (cleaned.startsWith("+39")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0039")) {
    cleaned = cleaned.slice(4);
  }

  if (cleaned.startsWith("+")) {
    if (!/^\+[1-9]\d{8,13}$/.test(cleaned)) return false;
  } else {
    const isItalianMobile = /^3[1-9]\d{7,8}$/.test(cleaned);
    const isItalianLandline = /^0[1-9]\d{6,9}$/.test(cleaned);
    if (!isItalianMobile && !isItalianLandline) return false;
  }

  const digits = cleaned.replace(/\D/g, "");
  if (/(.)\1{5,}/.test(digits)) return false;
  if (new Set(digits.split("")).size < 3) return false;
  const fakeSequences = [
    "0123456", "1234567", "2345678", "3456789", "4567890",
    "9876543", "8765432", "7654321", "6543210"
  ];
  if (fakeSequences.some((seq) => digits.includes(seq))) return false;

  return true;
}

function showPhoneFieldError(msg) {
  const phoneInput = document.getElementById("bookPhone");
  const phoneErr = document.getElementById("bookPhoneError");
  if (phoneErr) {
    phoneErr.textContent = msg || "";
    phoneErr.style.display = msg ? "block" : "none";
  }
  if (phoneInput) {
    phoneInput.style.borderColor = msg ? "var(--danger)" : "";
  }
}

async function handleUserBookingSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const date = document.getElementById("bookDate").value;
  const time = document.getElementById("bookTime").value;
  const guests = Number(document.getElementById("bookGuests").value);
  const area = document.getElementById("bookArea").value;
  const name = document.getElementById("bookName").value.trim();
  const phoneInput = document.getElementById("bookPhone");
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const notes = document.getElementById("bookNotes").value.trim();

  if (!name || !phone || !date || !time) return;

  if (!isValidRealPhone(phone)) {
    const errMsg = "Inserisci un numero di telefono reale valido (es. 347 123 4567).";
    showPhoneFieldError(errMsg);
    showToast(errMsg);
    if (phoneInput) phoneInput.focus();
    return;
  }
  showPhoneFieldError("");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Invio in corso...";
  }

  const code = "SEM-" + Math.floor(1000 + Math.random() * 9000);
  const nowStr = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const mealType = LUNCH_SLOTS.includes(time) ? "Pranzo" : "Cena / Aperitivo";

  const payload = {
    id: code,
    customer_name: name,
    phone,
    email: "",
    booking_date: date,
    booking_time: time,
    guests,
    area,
    occasion: mealType,
    assigned_table: "",
    status: "pending",
    notes: notes || "",
    created_at_label: `Oggi, ${nowStr}`
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("bookings").insert(payload);
    if (error) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Conferma Prenotazione";
      }
      showToast("Si è verificato un errore. Riprova.");
      return;
    }
    await fetchPublicData();
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "Conferma Prenotazione";
  }

  const confirmBox = document.getElementById("bookingConfirmationBox");
  if (confirmBox) {
    confirmBox.style.display = "block";
    confirmBox.innerHTML = `
      <div class="booking-confirmation">
        <div style="font-weight:700; margin-bottom:6px;">Prenotazione registrata — Codice: ${escapeHtml(code)}</div>
        <div style="color:var(--text-secondary);">
          ${escapeHtml(name)} • ${escapeHtml(date)} ore ${escapeHtml(time)} (${mealType}) • ${guests} persone (${escapeHtml(area)})
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">
          Conserva il codice ${escapeHtml(code)} per verificare lo stato o annullare la prenotazione.
        </div>
      </div>
    `;
  }

  e.target.reset();
  document.getElementById("bookDate").value = date;
  document.getElementById("bookGuests").value = "2";
  renderBookingOptions();
  showToast(`Prenotazione ${code} registrata.`);
}

function toggleLookupBox() {
  const box = document.getElementById("lookupBox");
  if (!box) return;
  box.style.display = box.style.display === "none" ? "block" : "none";
}

async function handleLookupBooking(e) {
  if (e && e.preventDefault) e.preventDefault();
  const q = document.getElementById("lookupBookingInput")?.value.trim().toLowerCase();
  const resEl = document.getElementById("lookupBookingResult");
  if (!resEl || !q) return;

  await fetchPublicData();

  const matches = state.bookings.filter(
    (b) =>
      b.id.toLowerCase() === q ||
      b.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))
  );

  if (matches.length === 0) {
    resEl.innerHTML = `<p style="font-size:0.86rem; color:var(--text-secondary);">Nessuna prenotazione trovata.</p>`;
    return;
  }

  const statusMap = {
    pending: "In attesa di conferma",
    confirmed: "Confermata",
    completed: "Completata",
    cancelled: "Annullata"
  };

  resEl.innerHTML = matches
    .map(
      (b) => `
      <div style="padding:14px; background:var(--bg-primary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); margin-bottom:10px; font-size:0.86rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong>${escapeHtml(b.id)} — ${escapeHtml(b.customerName)}</strong>
          <span class="status-badge ${escapeHtml(b.status)}">${statusMap[b.status] || b.status}</span>
        </div>
        <div style="color:var(--text-secondary); margin-bottom:8px;">
          ${escapeHtml(b.date)} ore ${escapeHtml(b.time)} • ${b.guests} persone • ${escapeHtml(b.area)}
          ${b.assignedTable ? ` • Tavolo: ${escapeHtml(b.assignedTable)}` : ""}
        </div>
        ${
          b.status !== "cancelled"
            ? `<button type="button" class="btn btn-outline btn-sm" onclick="cancelBookingByUser('${escapeHtml(b.id)}')">Annulla Prenotazione</button>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

async function cancelBookingByUser(bookingId) {
  if (supabaseClient) {
    await supabaseClient.from("bookings").update({ status: "cancelled", assigned_table: "" }).eq("id", bookingId);
    await fetchPublicData();
  }
  await handleLookupBooking();
  showToast(`Prenotazione ${bookingId} annullata.`);
}

// ===================== RECENSIONI =====================
function renderReviews() {
  const listEl = document.getElementById("reviewsList");
  const avgEl = document.getElementById("avgRatingScore");
  const countEl = document.getElementById("totalReviewsCount");
  if (!listEl) return;

  const total = state.reviews.length;
  const avg =
    total > 0
      ? (state.reviews.reduce((s, r) => s + Number(r.rating), 0) / total).toFixed(1)
      : "4.7";

  if (avgEl) avgEl.textContent = avg;
  if (countEl) countEl.textContent = `${total} recensioni in evidenza • 1.250+ su Google`;

  listEl.innerHTML = state.reviews
    .map(
      (r) => `
      <article class="review-card">
        <div>
          <div class="review-meta-top">
            <div>
              <div class="review-author">${escapeHtml(r.author)}</div>
              <div style="font-size:0.76rem; color:var(--text-muted);">${escapeHtml(r.date)}</div>
            </div>
            <div class="review-rating-text">Voto: ${Number(r.rating)} / 5</div>
          </div>
          <p class="review-body">"${escapeHtml(r.text)}"</p>
        </div>
        <div>
          ${
            r.favoriteDish
              ? `<div style="font-size:0.78rem; color:var(--accent-green-light);">Piatto consigliato: ${escapeHtml(r.favoriteDish)}</div>`
              : ""
          }
          ${
            r.ownerReply
              ? `<div class="review-owner-reply">
                  <strong>Risposta di Sorsi e Morsi</strong>
                  <span>${escapeHtml(r.ownerReply)}</span>
                </div>`
              : ""
          }
        </div>
      </article>
    `
    )
    .join("");
}

async function handleNewReviewSubmit(e) {
  e.preventDefault();
  const author = document.getElementById("revAuthor").value.trim();
  const rating = Number(document.getElementById("revRating").value || 5);
  const dish = document.getElementById("revDish").value.trim();
  const text = document.getElementById("revText").value.trim();

  if (!author || !text) return;

  const newRev = {
    id: "rev-" + Date.now(),
    author,
    rating,
    date_label: "Oggi",
    category: "Food, Wine & Drink",
    favorite_dish: dish,
    text,
    owner_reply: ""
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("reviews").insert(newRev);
    if (error) {
      showToast("Errore durante l'invio della recensione.");
      return;
    }
    await fetchPublicData();
  }

  e.target.reset();
  showToast("Recensione pubblicata. Grazie!");
}

function renderAll() {
  renderMenu();
  renderBookingOptions();
  renderReviews();
}

let userHasScrolledManually = false;
["wheel", "touchmove", "keydown", "mousedown"].forEach((evt) => {
  window.addEventListener(evt, () => {
    userHasScrolledManually = true;
  }, { passive: true, once: true });
});

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
  if (!userHasScrolledManually) {
    window.scrollTo(0, 0);
  }
});

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  initSupabase();

  const today = getTodayFormatted(0);
  const bookDate = document.getElementById("bookDate");
  if (bookDate) {
    bookDate.value = today;
    bookDate.min = today;
    bookDate.addEventListener("change", renderBookingOptions);
  }

  const phoneInput = document.getElementById("bookPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const cleaned = phoneInput.value
        .replace(/[^\d+\s]/g, "")
        .replace(/(?!^)\+/g, "");
      if (phoneInput.value !== cleaned) {
        phoneInput.value = cleaned;
      }
      showPhoneFieldError("");
    });

    phoneInput.addEventListener("blur", () => {
      const val = phoneInput.value.trim();
      if (val && !isValidRealPhone(val)) {
        showPhoneFieldError("Inserisci un numero di telefono reale valido (es. 347 123 4567).");
      } else {
        showPhoneFieldError("");
      }
    });
  }

  document.getElementById("bookGuests")?.addEventListener("change", renderBookingOptions);
  document.getElementById("bookArea")?.addEventListener("change", renderBookingOptions);

  const searchInput = document.getElementById("menuSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.menuSearch = e.target.value;
      renderMenu();
    });
  }

  renderAll();
  if (!userHasScrolledManually) window.scrollTo(0, 0);
  await fetchPublicData();
  if (!userHasScrolledManually) window.scrollTo(0, 0);
  subscribePublicRealtime();
});
