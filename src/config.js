const { VITE_MAPBOX_ACCESS_TOKEN } = import.meta.env;

export default {
  style: 'mapbox://styles/mongabay/cmtalpr3p00j901shfgl9bjk0',
  
  accessToken: VITE_MAPBOX_ACCESS_TOKEN,

  showMarkers: false,
  theme: 'mongabay',
  intro: {
    title: 'Forests at the Edge',
    subtitle:
      "Tracking forest cover loss across isolated tribal lands worldwide. These are the 10 lands that lost the largest share of their forest.",
    date: 'X Sep 2026',
    // The intro collage, assembled from individual elements over the paper
    // ground. Positions are percentages of the viewport and are the knob for
    // arranging this — nothing in the components hard-codes a layout.
    //
    // Seeded from the bands measured in the old flat artwork: pieces occupy a
    // left column (0-27%) and a right column (73-100%), leaving the middle
    // clear for the title. Exact placement wants your eye — the exported files
    // were all normalised to the same width, so they don't record where they
    // sat in the original.
    //
    //   left/top  where the piece rests, as % of the viewport
    //   width     as % of viewport width; height follows the file's aspect
    //   onMobile  include in the top strip on narrow screens
    art: [
      { src: '/intro-art/people-water.webp', left: '0%', top: '10%', width: '24.3%', onMobile: true },
      { src: '/intro-art/house.webp', left: '0%', top: '34%', width: '24.3%', onMobile: true },
      // Flush to the left edge (the file has no transparent gutter), and lifted
      // clear of the social icons, which start at 90.8% of the viewport. That
      // lift means it no longer centres exactly on the "scroll down to
      // discover" cue at 78.7% — it now sits a little above it. Sized by
      // height so its vertical placement holds as the window reshapes.
      // Listed after `house` so it stacks above the piece immediately overhead.
      { src: '/intro-art/earth-left.webp', left: '0%', top: '60.5%', height: '28.2%' },
      { src: '/intro-art/closeupface.webp', left: '74.4%', top: '5%', width: '12.6%', onMobile: true },
      { src: '/intro-art/man.webp', left: '88.3%', top: '5%', width: '11.7%' },
      // Directly below `man`, which ends at 13.8%. Anchored right so it stays
      // flush to the edge at any viewport shape.
      { src: '/intro-art/earth-right.webp', right: '0%', top: '16%', height: '28.2%' },
      { src: '/intro-art/topview-peopleforests.webp', left: '79.3%', top: '46%', width: '20.7%' },
      { src: '/intro-art/people-topview.webp', left: '75.7%', top: '70%', width: '24.3%' },
    ],

    social: [
      {
        name: 'X',
        src: 'x.svg',
        href: 'https://x.com/mongabay',
      },
      {
        name: 'LinkedIn',
        src: 'linkedin.svg',
        href: 'https://www.linkedin.com/company/mongabay/posts/',
      },
    ],
  },
  logos: [
    {
      name: 'mongabay',
      src: 'mongabay-logo.svg',
      width: '150',
      href: 'https://news.mongabay.com',
    },
  ],



  // Globe atmosphere. space-color is matched to the paper texture in
  // src/assets/background-image.jpg so the sphere reads as sitting on the
  // page rather than floating in Mapbox's default starfield.
  // The globe leaves on chapter three, not on the last keyframe — the '#10'
  // keyframe below exists only to drive the closing zoom, and would otherwise
  // hold the globe up over the countdown.
  globeFadeOut: { trigger: 'chapter 03' },

  // No `globeReveal` block: the globe is present from the moment the intro
  // artwork scrolls off it, so it is already there as chapter one comes up.
  // (useGlobeVisibility still supports one — add
  //  globeReveal: { trigger, start, end } to hold it back again.)

  globeAtmosphere: {
    // mapbox-gl creates its WebGL context with alpha:true, so a transparent
    // space-color lets the page's paper texture show through around the globe
    // instead of a flat colour. If this renders black on some browser, fall
    // back to the paper tone: '#f7f4ee'.
    'space-color': 'rgba(0, 0, 0, 0)',
    'star-intensity': 0,                      // no stars
    'horizon-blend': 0.02,                    // adjust: softness at the limb
    'color': 'rgba(247, 244, 238, 0)',
    'high-color': 'rgba(223, 230, 238, 0.35)', // adjust: faint limb glow
  },


  // The indicator beneath each panel: a heading naming what the colour means,
  // and the three time spans the bar slides between. Same for every area, so it
  // lives here once rather than repeating on all ten chapters.
  panelLabels: {
    heading: 'Tree cover loss',
    beat1: '2000',
    beat2: '2025',
    beat3: '2015–2025',
    // matches the red used for loss and cleared ground on the panels
    color: '#e66d6d',
  },

  alignment: 'left',
  // The footer is now just the dark strip the logo sits on; the credits that
  // used to live here are in the section above it.
  footer: '',

  credits: {
    backToStart: 'Back to the start',
    people: [
      { role: 'Produced by', name: 'Latoya Abulu' },
      { role: 'Creative Director', name: 'Samantha Lee' },
      { role: 'Banner art', name: 'Emilie Languedoc' },
      { role: 'Data Editor and Designer', name: 'Andrés Alegría' },
    ],
    sourcesTitle: 'Sources',
    sources:
      'Territory boundaries were compiled and verified with AIDESEP, AMAN, CEJIS, CONAIE, '
      + 'FUNAI, GTI-PIACI, Iniciativa Amotocodie, ISA, OPI, OPIAC, ORPIO and Pueblos Vivos. '
      + 'Forest cover and loss are from the Global Forest Change dataset v1.13 '
      + '(Hansen et al., University of Maryland), covering 2000 to 2025 and accessed through '
      + 'Google Earth Engine.',
  },
 
  chapters: [
    
    // chapter 01
    {
      id: 'chapter 01',
      // Parked over the Indian Ocean, west of Southeast Asia, while still
      // hidden. This is only where the rotation begins, never a view the
      // reader sees. Everything from here on is one continuous eastward turn
      // ending on South America — no longitude is passed twice.
      globe: {
        center: [70, 6], zoom: 1.9,
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0 },
      },
      alignment: 'fully',
      // cream card, so the copy stays legible over the globe
      card: true,
      hidden: false,
      title: ' ',
      description: "<b>Uncontacted peoples</b> generally refers to Indigenous peoples who have remained largely isolated to the present day, maintaining their traditional lifestyles and functioning mostly independently from any political or governmental entities.<br><br><b>Peoples in initial contact</b> share the same characteristics but beginning to regularly communicate with and integrate into mainstream society.<br><br>They live across different regions in South East Asia and South America.",
      location: {
        center: [-87.0, 13.622],
        zoom: 2.1,
        pitch: 0,
        bearing: 0,
      },
      
      mapAnimation: 'easeTo',
      onChapterEnter: [    ],
      onChapterExit: [  ],
    },

    // chapter 02
    {
      id: 'chapter 02',
      // Westward from West Africa crosses South America before reaching Asia,
      // so the reader sees the Amazon go by on the way. Starts early so the
      // globe is already turning when it fades in, and lands just before the
      // copy is revealed.
      // The whole eastward sweep happens here, in one move: away from the
      // Indian Ocean, across Southeast Asia — the second region chapter one's
      // closing line names, reached about a sixth of the way in, just as that
      // copy finishes — then out over the Pacific to South America.
      //
      // This chapter's own copy starts appearing at 'top 74%', by which point
      // the turn is roughly 79% done and South America is already swinging
      // into frame. It comes to rest at 'top 60%', shortly after that
      // paragraph has begun travelling up the screen.
      globe: {
        center: [-66.9, -7.4], zoom: 2.1, spin: 'east',
        start: 'top bottom+=29%', end: 'top 60%',
        layers: { centroids: 0.9, 'centroids-label': 0.9, 'centroids top 10': 0 },
      },
      alignment: 'fully',
      // cream card, so the copy stays legible over the globe
      card: true,
      hidden: false,
      title: ' ',
      description: "Uncontacted peoples choose to live detached from the rest of the world, and their mobility patterns allow them to engage in gathering and hunting, thereby preserving their cultures and languages. <br><br>These peoples have a strict dependency on their ecological environment. Any changes to their natural habitat can harm both the survival of individual members and the group as a whole.",
      
      location: {
        center: [-87.0, 13.622],
        zoom: 2.1,
        pitch: 0,
        bearing: 0,
      },
      
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [      ],
      onChapterExit: [      ],
    },

    // chapter 03
    {
      id: 'chapter 03',
      // Same position as the chapter before, so the globe simply holds on
      // South America — where all ten ranked territories are — while this
      // chapter is read, then fades out into the countdown. It is still the
      // last keyframe, which is what the fade-out is anchored to.
      //
      // This keyframe exists only to swap the dots: all 101 territories give
      // way to the ranked ten. Layer opacities snap at the midpoint of the
      // window rather than crossfading, so the window is placed to put that
      // midpoint just after this chapter's closing line has finished
      // revealing — 'top 2%' is where that lands.
      globe: {
        center: [-66.9, -7.4], zoom: 2.1,
        start: 'top 10%', end: 'top top-=100',
        layers: { centroids: 0, 'centroids-label': 0, 'centroids top 10': 0.9 },
      },
      alignment: 'fully',
      // cream card, so the copy stays legible over the globe
      card: true,
      hidden: false,
      title: ' ',
      description: "Legal protections make estimating the total number of uncontacted peoples challenging, but estimates point to between <b>100 and 200 uncontacted tribes</b> numbering up to <b>10,000 individuals total</b>. <br><br>Mongabay mapped legally recognized lands used by isolated Indigenous peoples worldwide and analyzed forest cover loss from 2015 to 2025. Boundaries of 65 lands were compiled and verified with Indigenous organizations, experts, and the international working group on Indigenous Peoples in Isolation and Initial Contact (GTI PIACI), using data from Global Forest Watch.<br><br><b>Below are the Top 10 lands that lost the largest share of their forest, spread across Bolivia, Paraguay, Brazil, Peru and Venezuela.</b>",
       
      location: {
        center: [-61.339655, -6.100119
],
        zoom: 3.5,
        pitch: 0,
        bearing: 0,
      },
      
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [      ],
      onChapterExit: [      ],
    },

    // Top 10
    {
      id: 'Top 10',
      type: 'stage',
      stage: 'AreaReveal',
      // Camera only, no layer changes: as this section climbs up over the
      // globe, the camera dives from 2.1 to 5, tilts over and swings round to
      // settle on the first territory itself. The globe is fading out across
      // the same stretch, so the move is glimpsed rather than watched — it
      // reads as the story taking over rather than as a separate animation.
      globe: {
        // the territory's own centroid, the same point its locator globe marks
        center: [-66.601027, 5.193362],
        zoom: 5,                             // adjust closing zoom depth
        pitch: 45,                           // adjust closing tilt
        bearing: -25,                        // adjust closing rotation
        start: 'top bottom', end: 'top top',
      },
      areaId: 10,
      panels: {
        beat1: '/panels/10_uwottuja_beat1.webp',
        beat2: '/panels/10_uwottuja_beat2.webp',
        beat3: '/panels/10_uwottuja_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 60, kmFrac: 0.1624, miFrac: 0.2614 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-66.601027, 5.193362],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Amazonas',
      country: 'Venezuela',
      rank: '#10',
      title: 'Uwottüja Traditional Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Uwottüja',
      homeTo: 'The isolated Uwottüja',
      description: "This 2,285,494 ha territory in Venezuela lost <b>2.8%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and other natural disturbances. Wildfire accounted for 28.4% of that loss.",
    },

    // Top 9
    {
      id: 'Top 9',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 9,
      panels: {
        beat1: '/panels/09_yuqui_beat1.webp',
        beat2: '/panels/09_yuqui_beat2.webp',
        beat3: '/panels/09_yuqui_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 10, kmFrac: 0.1115, miFrac: 0.1795 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-64.876321, -16.588368],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Cochabamba',
      country: 'Bolivia',
      rank: '#9',
      title: 'Yuqui',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Yuqui',
      homeTo: 'The Yuqui',
      description: "This 115,924 ha territory in Bolivia lost <b>3.5%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, other natural disturbances and permanent agriculture. Wildfire accounted for 38.4% of that loss.",
    },

    // Top 8
    {
      id: 'Top 8',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 8,
      panels: {
        beat1: '/panels/08_uru_eu_wau_wau_beat1.webp',
        beat2: '/panels/08_uru_eu_wau_wau_beat2.webp',
        beat3: '/panels/08_uru_eu_wau_wau_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 40, kmFrac: 0.1356, miFrac: 0.2182 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-63.477747, -11.183612],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Rondônia',
      country: 'Brazil',
      rank: '#8',
      title: 'Uru-Eu-Wau-Wau',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Uru-Eu-Wau-Wau',
      homeTo: 'Four isolated groups',
      description: "This 1,867,120 ha territory in Brazil lost <b>4.1%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and other natural disturbances. Wildfire accounted for 87.1% of that loss.",
    },

    // Top 7
    {
      id: 'Top 7',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 7,
      panels: {
        beat1: '/panels/07_kakataibo_beat1.webp',
        beat2: '/panels/07_kakataibo_beat2.webp',
        beat3: '/panels/07_kakataibo_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 30, kmFrac: 0.136, miFrac: 0.2189 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-75.645689, -8.567506],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Ucayali',
      country: 'Peru',
      rank: '#7',
      title: 'North and South Kakataibo Reserve',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Kakataibo',
      homeTo: 'The Kakataibo',
      description: "This 148,996 ha territory in Peru lost <b>5.1%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by permanent agriculture, other natural disturbances and logging. Wildfire loss is not recorded.",
    },

    // Top 6
    {
      id: 'Top 6',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 6,
      panels: {
        beat1: '/panels/06_chaco_reserva_beat1.webp',
        beat2: '/panels/06_chaco_reserva_beat2.webp',
        beat3: '/panels/06_chaco_reserva_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 100, kmFrac: 0.1649, miFrac: 0.2654 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-60.407265, -20.041908],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Alto Paraguay',
      country: 'Paraguay',
      rank: '#6',
      title: 'Reserva de la Biosfera del Chaco',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chaco',
      homeTo: 'The Ayoreo (five clans)',
      description: "This 4,707,205 ha territory in Paraguay lost <b>11.7%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by permanent agriculture, wildfire and logging. Wildfire accounted for 37.1% of that loss.",
    },

    // Top 5
    {
      id: 'Top 5',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 5,
      panels: {
        beat1: '/panels/05_ariboia_beat1.webp',
        beat2: '/panels/05_ariboia_beat2.webp',
        beat3: '/panels/05_ariboia_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1629, miFrac: 0.2622 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-46.42441, -5.069811],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Maranhão',
      country: 'Brazil',
      rank: '#5',
      title: 'Araribóia',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Araribóia',
      homeTo: 'The isolated Awá',
      description: "This 413,288 ha territory in Brazil lost <b>14.2%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and other natural disturbances. Wildfire accounted for 72.0% of that loss.",
    },

    // Top 4
    {
      id: 'Top 4',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 4,
      panels: {
        beat1: '/panels/04_chaco_ampliacion_beat1.webp',
        beat2: '/panels/04_chaco_ampliacion_beat2.webp',
        beat3: '/panels/04_chaco_ampliacion_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 75, kmFrac: 0.1628, miFrac: 0.262 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-59.948442, -21.259369],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Boquerón',
      country: 'Paraguay',
      rank: '#4',
      title: 'Ampliación Reserva de Biosfera del Chaco',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chaco (amp.)',
      homeTo: 'The Ayoreo-Totobiegosode',
      description: "This 2,492,757 ha territory in Paraguay lost <b>17.0%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by permanent agriculture, wildfire and logging. Wildfire accounted for 1.6% of that loss.",
    },

    // Top 3
    {
      id: 'Top 3',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 3,
      panels: {
        beat1: '/panels/03_otuquis_beat1.webp',
        beat2: '/panels/03_otuquis_beat2.webp',
        beat3: '/panels/03_otuquis_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 40, kmFrac: 0.151, miFrac: 0.243 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-58.607035, -19.342304],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Santa Cruz',
      country: 'Bolivia',
      rank: '#3',
      title: 'Otuquis National Park',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Otuquis',
      homeTo: 'The Ayoreo',
      description: "This 903,350 ha territory in Bolivia lost <b>17.2%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and other natural disturbances. Wildfire accounted for 98.5% of that loss.",
    },

    // Top 2
    {
      id: 'Top 2',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 2,
      panels: {
        beat1: '/panels/02_nembi_guasu_beat1.webp',
        beat2: '/panels/02_nembi_guasu_beat2.webp',
        beat3: '/panels/02_nembi_guasu_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 50, kmFrac: 0.1584, miFrac: 0.255 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-59.820558, -18.789828],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Santa Cruz',
      country: 'Bolivia',
      rank: '#2',
      title: 'Ñembi Guasu',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Ñembi Guasu',
      homeTo: 'The Ayoreo',
      description: "This 1,207,850 ha territory in Bolivia lost <b>27.2%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and other natural disturbances. Wildfire accounted for 97.5% of that loss.",
    },

    // Top 1
    {
      id: 'Top 1',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 1,
      panels: {
        beat1: '/panels/01_chacobo_pacahuara_beat1.webp',
        beat2: '/panels/01_chacobo_pacahuara_beat2.webp',
        beat3: '/panels/01_chacobo_pacahuara_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1506, miFrac: 0.2423 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-65.879489, -11.977774],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Beni',
      country: 'Bolivia',
      rank: '#1',
      title: 'Chacobo-Pacahuara',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chacobo-Pacahuara',
      homeTo: 'The Pacahuara',
      description: "This 517,307 ha territory in Bolivia lost <b>33.7%</b> of its 2000 tree cover between 2015 and 2025, driven mainly by wildfire, permanent agriculture and shifting cultivation. Wildfire accounted for 98.4% of that loss.",
    },
  ],
};
