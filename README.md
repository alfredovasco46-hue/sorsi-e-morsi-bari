# Sorsi e Morsi — Food, Wine & Drink (Bari)

Sito web cliente e gestionale amministrativo realtime per **Sorsi e Morsi — Food, Wine & Drink**, Corso Vittorio Emanuele II, 73 — 70122 Bari (BA).

## Architettura Full-Stack

- **Sito Cliente (`index.html`, `app.js`, `data.js`, `styles.css`)**:
  - Hero e galleria con foto reali del locale su Corso Vittorio Emanuele II, 73 a Bari (Dehors esterno, Gran Tagliere Sorsi e Morsi, Spaghetti all'Assassina con Stracciatella, Tris di Friselle Gourmet).
  - Menu digitale completo sincronizzato in tempo reale con **Supabase** (34 specialità divise in 6 categorie: *Taglieri & Antipasti*, *Primi & Assassina*, *Secondi Mare & Terra*, *Il Ciccio & Pizze*, *Wine & Drink*, *Dolci Artigianali*).
  - Sistema di prenotazione tavoli online con controllo capienza in tempo reale (Dehors Corso Vittorio e Sala Interna & Wine Bar), generazione codice `SEM-XXXX` e ricerca/annullamento prenotazione.
  - Sezione recensioni interattiva con risposte ufficiali dello staff e invio nuove recensioni.

- **Pannello Admin Riservato (`admin.html`, `admin.js`)**:
  - Autenticazione protetta tramite RPC PostgreSQL (`verify_admin_login` con `pgcrypto` + `bcrypt`).
  - Credenziali Admin:
    - **Username**: `admin` (oppure `sorsi_admin`)
    - **Password**: `sorsiemorsi2026`
  - Gestione prenotazioni in tempo reale (conferma, completamento, annullamento, assegnazione tavoli `D1–D6` e `S1–S6`, inserimento manuale, esportazione CSV).
  - Mappa visuale dei tavoli per data (Dehors Corso Vittorio + Sala Interna & Wine Bar).
  - Gestione Menu (modifica prezzi istantanea, stato Disponibile/Esaurito, aggiunta/eliminazione piatti).
  - Moderazione recensioni e risposta ufficiale del proprietario.
  - Configurazione capienza massima per fascia oraria e attivazione/chiusura del Dehors esterno.

## Backend Supabase

- **Project ID**: `rwzkrvmkhmkcqrvqcikd`
- **URL**: `https://rwzkrvmkhmkcqrvqcikd.supabase.co`
- **Storage Bucket**: `assets` (pubblico, con foto ufficiali ospitate su CDN Supabase)
- **Tabelle**: `restaurant_settings`, `restaurant_tables`, `menu_items`, `reviews`, `bookings`, `admin_credentials`

## Contatti & Social Ufficiali

- **Indirizzo**: Corso Vittorio Emanuele II, 73 — 70122 Bari (BA)
- **Telefono**: `+39 392 766 6689`
- **Instagram**: [@sorsiemorsi.bari](https://www.instagram.com/sorsiemorsi.bari)
- **Facebook**: [Sorsi e Morsi Bari](https://www.facebook.com/sorsiemorsibari)
