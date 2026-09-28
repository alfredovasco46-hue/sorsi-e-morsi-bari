// Configurazione e dati ufficiali SORSI E MORSI — FOOD, WINE & DRINK BARI (Corso Vittorio Emanuele II, 73)

const SORSI_E_MORSI_CONFIG = {
  name: "Sorsi e Morsi",
  city: "Bari • Corso Vittorio Emanuele II, 73",
  subtitle: "Food, Wine & Drink • Taglieri • Cucina Tipica Barese • Cicci & Pizze",
  address: "Corso Vittorio Emanuele II, 73 — 70122 Bari (BA)",
  phone: "392 766 6689",
  phoneClean: "393927666689",
  instagramUrl: "https://www.instagram.com/sorsiemorsi.bari",
  facebookUrl: "https://www.facebook.com/sorsiemorsibari",
  googleMapsUrl: "https://www.google.com/maps/place/Sorsi+e+Morsi+Food,+Wine+%26+Drink/@41.1263975,16.8698707,17z/data=!3m1!4b1!4m6!3m5!1s0x1347e9e70ef88de9:0x407b1f5e794bcb3e!8m2!3d41.1263975!4d16.8698707!16s%2Fg%2F11rfmzzyq8?hl=it",
  coordinates: { lat: 41.1263975, lng: 16.8698707 },
  supabaseUrl: "https://rwzkrvmkhmkcqrvqcikd.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3emtydm1raG1rY3FydnFjaWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTQzNDgsImV4cCI6MjEwNjE5MDM0OH0.9Ip1CydDGfnoUI1QGvqEO29SKke9zG7RF2KPzh0Nfj8",
  hours: "Lun – Ven: 11:00 – 00:00 • Sab – Dom: 11:00 – 15:30 / 18:30 – 00:00",
  maxSeatsPerSlotIndoor: 44,
  maxSeatsPerSlotOutdoor: 48,
  outdoorEnabled: true,
  serviceNote: "Coperto e servizio 2,00 € • Prenotazione online consigliata per Pranzo, Aperitivo Rinforzato e Cena • Dehors esterno su Corso Vittorio Emanuele II",
  tables: [
    { id: "D1", name: "Tavolo D1", area: "Dehors Corso Vittorio", capacity: 2 },
    { id: "D2", name: "Tavolo D2", area: "Dehors Corso Vittorio", capacity: 4 },
    { id: "D3", name: "Tavolo D3", area: "Dehors Corso Vittorio", capacity: 4 },
    { id: "D4", name: "Tavolo D4", area: "Dehors Corso Vittorio", capacity: 6 },
    { id: "D5", name: "Tavolo D5", area: "Dehors Corso Vittorio", capacity: 8 },
    { id: "D6", name: "Tavolo D6", area: "Dehors Corso Vittorio", capacity: 4 },
    { id: "S1", name: "Tavolo S1", area: "Sala Interna & Wine Bar", capacity: 2 },
    { id: "S2", name: "Tavolo S2", area: "Sala Interna & Wine Bar", capacity: 4 },
    { id: "S3", name: "Tavolo S3", area: "Sala Interna & Wine Bar", capacity: 4 },
    { id: "S4", name: "Tavolo S4", area: "Sala Interna & Wine Bar", capacity: 6 },
    { id: "S5", name: "Tavolo S5", area: "Sala Interna & Wine Bar", capacity: 8 },
    { id: "S6", name: "Tavolo S6", area: "Sala Interna & Wine Bar", capacity: 4 }
  ]
};

function getTodayFormatted(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const INITIAL_MENU = [
  // TAGLIERI & ANTIPASTI
  { id: "tag-1", name: "Il Gran Tagliere Sorsi e Morsi (x2)", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 24.00, description: "Capocollo di Martina Franca, crudo di Parma 24 mesi, pancetta tesa, salame al coltello, formaggi stagionati pugliesi e confetture artigianali.", tagLabels: [], available: true },
  { id: "tag-2", name: "Trio di Friselle Gourmet Pugliesi", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 12.00, description: "Tre friselle croccanti: salmone, stracciatella e pistacchio; mortadella IGP, stracciatella e pesto di pistacchio; datterini e fior di latte.", tagLabels: [], available: true },
  { id: "tag-3", name: "Burrata Artigianale di Andria e Crudo", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 13.00, description: "Burrata fresca pugliese servita con prosciutto crudo di Parma DOP, pomodori secchi e olio EVO Coratina.", tagLabels: [], available: true },
  { id: "tag-4", name: "Panzerottini e Sgagliozze della Tradizione", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 9.00, description: "Cestino caldo di panzerottini fritti al momento con pomodoro e mozzarella, accompagnati da sgagliozze baresi.", tagLabels: [], available: true },
  { id: "tag-5", name: "Tartare di Tonno Rosso e Stracciatella", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 15.00, description: "Tonno rosso battuto al coltello con stracciatella pugliese, scorza di lime e crostini caldi.", tagLabels: [], available: true },
  { id: "tag-6", name: "Polpette di Pane e Caciocavallo al Sugo", category: "taglieri", categoryLabel: "Taglieri & Antipasti", price: 9.50, description: "Morbide polpette della tradizione barese servite con fonduta di caciocavallo podolico e basilico fresco.", tagLabels: [], available: true },

  // PRIMI & ASSASSINA
  { id: "pri-1", name: "Spaghetti all'Assassina Barese", category: "primi", categoryLabel: "Primi & Assassina", price: 12.00, description: "Il piatto simbolo di Bari: spaghetto risottato in padella di ferro, bruciacchiato, croccante e piccante secondo la ricetta originale.", tagLabels: [], available: true },
  { id: "pri-2", name: "Assassina con Stracciatella Pugliese", category: "primi", categoryLabel: "Primi & Assassina", price: 14.00, description: "Lo spaghetto all'assassina croccante servito con cuore fresco di stracciatella di Andria a contrasto.", tagLabels: [], available: true },
  { id: "pri-3", name: "Orecchiette alle Cime di Rapa", category: "primi", categoryLabel: "Primi & Assassina", price: 11.50, description: "Orecchiette fresche artigianali con cime di rapa, filetti di acciuga, aglio, peperoncino e mollica tostata.", tagLabels: [], available: true },
  { id: "pri-4", name: "Orecchiette al Ragù di Braciole Baresi", category: "primi", categoryLabel: "Primi & Assassina", price: 13.00, description: "Orecchiette condite con il tradizionale ragù lento della domenica, involtino di braciola e cacioricotta.", tagLabels: [], available: true },
  { id: "pri-5", name: "Spaghetto alle Vongole Veraci", category: "primi", categoryLabel: "Primi & Assassina", price: 14.50, description: "Spaghetti trafilati al bronzo con vongole veraci, prezzemolo fresco, aglio dolce e olio extravergine.", tagLabels: [], available: true },
  { id: "pri-6", name: "Riso, Patate e Cozze (Tiella Barese)", category: "primi", categoryLabel: "Primi & Assassina", price: 13.00, description: "La classica tiella barese gratinata al forno con riso, patate a fette, cozze nere, pecorino e pomodorini.", tagLabels: [], available: true },

  // SECONDI MARE & TERRA
  { id: "sec-1", name: "Polpo Arrostito su Purea di Fave e Cicorie", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 16.00, description: "Tentacolo di polpo croccante alla piastra adagiato su vellutata di fave di Carpino e cicoriella campestre.", tagLabels: [], available: true },
  { id: "sec-2", name: "Frittura Mista di Calamari e Gamberi", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 15.00, description: "Calamari e gamberi freschi dorati in semola rimacinata di grano duro, asciutti e croccanti.", tagLabels: [], available: true },
  { id: "sec-3", name: "Tagliata di Scottona Rucola, Grana e Datterini", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 18.00, description: "Controfiletto di scottona alla griglia con rucola selvatica, scaglie di Grana Padano 24 mesi e pomodorini.", tagLabels: [], available: true },
  { id: "sec-4", name: "Bombette di Martina Franca alla Piastra", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 14.00, description: "Involtini di capocollo ripieni di canestrato pugliese accompagnati da patate al forno al rosmarino.", tagLabels: [], available: true },
  { id: "sec-5", name: "Tataki di Tonno in Crosta di Pistacchio", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 17.00, description: "Filetto di tonno scottato in crosta di pistacchi di Bronte con cipolla rossa di Acquaviva caramellata.", tagLabels: [], available: true },
  { id: "sec-6", name: "Fave e Cicorie della Tradizione", category: "secondi", categoryLabel: "Secondi Mare & Terra", price: 10.00, description: "Purea di fave bianche pugliesi con cicorie selvatiche saltate, crostoni di pane di Altamura e olio EVO.", tagLabels: [], available: true },

  // IL CICCIO & PIZZE
  { id: "cic-1", name: "Il Ciccio Sorsi e Morsi", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 12.50, description: "Focaccia bianca soffice e croccante farcita con rucola, pomodori confit, mozzarella di bufala DOP e crudo di Parma.", tagLabels: [], available: true },
  { id: "cic-2", name: "Ciccio Mortadella, Stracciatella e Pistacchio", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 12.00, description: "Base bianca calda farcita all'uscita con mortadella Bologna IGP, stracciatella fresca e granella di pistacchio.", tagLabels: [], available: true },
  { id: "cic-3", name: "Ciccio Capocollo, Burrata e Fichi", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 13.00, description: "Base bianca croccante con capocollo di Martina Franca, cuore di burrata pugliese e gocce di fichi caramellati.", tagLabels: [], available: true },
  { id: "cic-4", name: "Pizza Margherita Verace", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 8.00, description: "Pomodoro San Marzano DOP, fior di latte pugliese, basilico fresco e olio extravergine.", tagLabels: [], available: true },
  { id: "cic-5", name: "Pizza Barese con Salsiccia e Cime di Rapa", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 11.00, description: "Fior di latte, cime di rapa saltate, salsiccia a punta di coltello e peperoncino.", tagLabels: [], available: true },
  { id: "cic-6", name: "Panzerotto Pugliese XXL (Fritto o al Forno)", category: "cicci-pizze", categoryLabel: "Il Ciccio & Pizze", price: 7.50, description: "Impasto lievitato 24 ore ripieno di pomodoro San Marzano e fior di latte filante.", tagLabels: [], available: true },

  // WINE & DRINK
  { id: "vin-1", name: "Calice di Primitivo di Manduria DOC", category: "vini-drink", categoryLabel: "Wine & Drink", price: 6.50, description: "Rosso corposo e vellutato con note di prugna matura, amarena e spezie dolci.", tagLabels: [], available: true },
  { id: "vin-2", name: "Calice di Negroamaro Rosato Salento IGT", category: "vini-drink", categoryLabel: "Wine & Drink", price: 6.00, description: "Rosato pugliese fresco e minerale, ideale con taglieri, friselle e piatti di mare.", tagLabels: [], available: true },
  { id: "vin-3", name: "Calice di Verdeca di Locorotondo DOC", category: "vini-drink", categoryLabel: "Wine & Drink", price: 6.00, description: "Bianco autoctono profumato e sapido con sentori agrumati e floreali.", tagLabels: [], available: true },
  { id: "vin-4", name: "Sorsi Spritz Pugliese", category: "vini-drink", categoryLabel: "Wine & Drink", price: 8.00, description: "Liquore agli agrumi del Gargano, prosecco millesimato, soda e rametto di rosmarino fresco.", tagLabels: [], available: true },
  { id: "vin-5", name: "Negroni Mediterraneo", category: "vini-drink", categoryLabel: "Wine & Drink", price: 9.00, description: "Gin botanico pugliese, vermouth rosso artigianale, bitter e scorza d'arancia.", tagLabels: [], available: true },
  { id: "vin-6", name: "Birra Artigianale Pugliese alla Spina (0.4L)", category: "vini-drink", categoryLabel: "Wine & Drink", price: 6.00, description: "Bionda non filtrata ad alta fermentazione, fresca e profumata.", tagLabels: [], available: true },

  // DOLCI ARTIGIANALI
  { id: "dol-1", name: "Sporcamuss Caldi alla Crema Chantilly", category: "dolci", categoryLabel: "Dolci Artigianali", price: 6.00, description: "Sfoglie calde croccanti ripiene di crema pasticcera e spolverate di zucchero a velo.", tagLabels: [], available: true },
  { id: "dol-2", name: "Tiramisù Artigianale della Casa", category: "dolci", categoryLabel: "Dolci Artigianali", price: 6.00, description: "Preparato ogni giorno con mascarpone fresco, savoiardi, caffè espresso e cacao amaro.", tagLabels: [], available: true },
  { id: "dol-3", name: "Cheesecake al Pistacchio o Frutti di Bosco", category: "dolci", categoryLabel: "Dolci Artigianali", price: 6.50, description: "Base croccante di biscotto e crema vellutata con topping a scelta.", tagLabels: [], available: true },
  { id: "dol-4", name: "Pasticciotto Leccese Caldo", category: "dolci", categoryLabel: "Dolci Artigianali", price: 5.00, description: "Pasta frolla dorata ripiena di crema pasticcera ed amarena servita tiepida.", tagLabels: [], available: true }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Valerio M.",
    rating: 5,
    date: "3 giorni fa",
    favoriteDish: "Gran Tagliere & Spaghetti all'Assassina",
    text: "Posizione splendida in pieno Corso Vittorio Emanuele. Abbiamo preso il Gran Tagliere Sorsi e Morsi con confetture fatte in casa e due Spaghetti all'Assassina: croccanti, bruciacchiati e piccanti alla perfezione!",
    ownerReply: "Grazie di cuore Valerio! Il nostro tagliere e l'Assassina sono il nostro orgoglio, ti aspettiamo presto su Corso Vittorio Emanuele!"
  },
  {
    id: "rev-2",
    author: "Chiara & Matteo",
    rating: 5,
    date: "1 settimana fa",
    favoriteDish: "Trio di Friselle Gourmet & Il Ciccio",
    text: "Il trio di friselle gourmet con salmone, stracciatella e pistacchio è pazzesco, così come il Ciccio con bufala, pomodori confit e crudo di Parma. Ottima carta dei vini pugliesi e personale gentilissimo.",
    ownerReply: "Grazie mille ragazzi! Felici che abbiate apprezzato le nostre friselle e il Ciccio."
  },
  {
    id: "rev-3",
    author: "Giuseppe L.",
    rating: 5,
    date: "2 settimane fa",
    favoriteDish: "Orecchiette alle Braciole & Polpo su Fave",
    text: "Tappa fissa in centro a Bari sia per un aperitivo rinforzato con tagliere e calice di Primitivo sia per cena. Orecchiette al ragù di braciole e polpo su purea di fave davvero eccellenti.",
    ownerReply: ""
  },
  {
    id: "rev-4",
    author: "Elena R.",
    rating: 5,
    date: "3 settimane fa",
    favoriteDish: "Frittura Mista & Sporcamuss Caldi",
    text: "Locale accogliente a due passi da Bari Vecchia e dal Teatro Petruzzelli. Frittura leggerissima, sporcamuss caldi strepitosi e servizio rapido anche nel weekend.",
    ownerReply: "Grazie Elena! A prestissimo da Sorsi e Morsi!"
  }
];
