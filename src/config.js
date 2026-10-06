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
  // Anchored to chapter three's bottom edge, which is also where chapter
  // four's closing keyframe plays out — the globe pulls back to the ranked
  // ten, then fades across the same edge. Chapter four's own line is large,
  // centred and alone on the screen by the time the fade has finished.
  globeFadeOut: { trigger: 'chapter 03' },

  // The globe used to need no reveal: it sat behind the page, so the intro
  // simply covered it. Its caption does not — that has to stack above the
  // copy to be readable on a phone, which means it would also sit over the
  // intro. Holding both back until chapter one is arriving solves it for the
  // pair, and costs nothing visually: the globe was not readable under the
  // intro artwork anyway.
  globeReveal: { trigger: 'chapter 01', start: 'top bottom', end: 'top 75%' },

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


  // The legend beneath each panel. One entry per beat, because the two beats
  // do not show the same quantity: the first is forest extent at a moment in
  // time, the second is loss over a period. A single shared label once invited
  // the reader to read bare savanna in the extent panel as deforestation, so
  // each beat now names its own quantity in full and only loss is pink.
  panelLabels: {
    // Two states, two boxes. The filled box IS the legend: it carries the
    // colour the panel is painting with, so the swatch and the words are one
    // object rather than a key the reader has to pair up.
    beats: [
      // Pine Green — the colour the panels paint forest with
      { label: 'Forest remaining in 2025',
        color: '#0a2f29', textColor: '#ffffff' },          /* adjust extent box + text */
      { label: 'Tree cover lost since 2015',
        color: '#e66d6d', textColor: '#181818' },          /* adjust loss box + text */
    ],
    // the label that has not been reached yet, as plain text with no box
    idleColor: '#6b7672',                                  /* adjust idle label colour */
    note: 'Note: Not all tree cover loss is detected. Fire, for example, can burn trees while the satellite image can sometimes read it as forest extent.',
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
      { role: 'Design and development', name: 'Andrés Alegría' },
    ],
    sourcesTitle: 'Sources',
    sources:
      'Territory boundaries were compiled and verified with AIDESEP, AMAN, CEJIS, CONAIE, '
      + 'FUNAI, GTI-PIACI, Iniciativa Amotocodie, ISA, OPI, OPIAC, ORPIO and Pueblos Vivos. '
      + 'Forest cover and loss are from the Global Forest Change dataset v1.13 '
      + '(Hansen et al., University of Maryland), covering 2000 to 2025 and accessed through '
      + 'Google Earth Engine and Global Nature Watch.',
  },
 
  chapters: [
    
    // chapter 01
    {
      id: 'chapter 01',
      // Opens where the copy opens: the Ituna/Itatá territory in Pará. No dots
      // yet — this chapter is one place, not the dataset.
      //
      // Zooms throughout are tuned to the square the globe sits in, not the
      // old full-viewport backdrop. Measured on the live map, the sphere is
      // about 341px across at zoom 1.0 and grows roughly 13% per 0.1 zoom.
      // The frame is 40vw capped at 520px, so it is only 400px wide on a
      // 1000px window — the narrowest the two-column layout goes. Past about
      // zoom 1.3 the sphere is wider than that and gets clipped into flat
      // vertical edges, so every keyframe here stays under it.
      globe: {
        center: [-52.0, -4.0], zoom: 1.2,
        start: 'top bottom', end: 'top 70%',
        // Ituna/Itatá is not one of the 65 mapped lands, so it has no centroid
        // in the style. This is a one-off point drawn for this chapter only.
        // Area-weighted centroid of the territory polygon (Ituna_itate.kml,
        // 2026_033_AA_Ituna_Brazil_GIF), which closes at 142,808 ha against a
        // documented extent of about 142,000.
        focus: [-52.0001, -4.0831],               /* adjust focus dot position */
        legend: 'Ituna/Itatá Indigenous Territory, Brazil',
        layers: { centroids: 0, 'centroids-label': 0, 'centroids top 10': 0,
                  'chapter-focus': 0.9 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>The canopy of the Amazon rainforest runs thick in some patches. In others, the forest is shaved down to the root in bright green rectangular chunks, the occasional nude trees left standing. Among it all are several groups of people living in voluntary isolation, often called “uncontacted peoples.”</p><p>Families of isolated Igarapé Ipiaçava people walk these lands in the Ituna/Itatá Indigenous Territory, Brazil, highly dependent on the forests and rich biodiverse world underneath its canopy for survival — food, shelter and medicine. This area they walk was once one of the most deforested Indigenous lands in Brazil.</p><p>“It is a place where we find, time and again, people who do not belong to the territory, leading to illegal logging and land grabbing,” Auzerina Duarte Macuxi, with the Coordination of the Indigenous Organizations of the Brazilian Amazon (COIAB), tells Mongabay. “This is accompanied by the encroachment of farms. When these farms are established within the territories, they effectively displace the Indigenous communities.”</p><p>The Ituna/Itatá Indigenous Territory is one of many Indigenous lands, tribal reserves and protected areas around the world designed — either through recognition by states or NGOs — to protect voluntary isolated peoples. Estimates point to around <b>200 groups</b> of people living in voluntary isolation and initial contact, stretching from Brazil to India; some living in defined lands, while others do not.</p><p>Mongabay mapped the Indigenous territories, tribal reserves and protected areas around the world with the confirmed presence of peoples living in voluntary isolation and analyzed forest cover loss in the decade from 2015 to 2025. This assessment, using public data, exists to give a general sense of the state of forests on protected lands uncontacted peoples depend on.</p><p>Based on these figures, we ranked the lands in tropical humid forests with the highest detected tree cover loss from 2015 to 2025, the lands per country which saw the most tree cover loss in this same period and looked at key drivers razing forests.</p>",
      location: { center: [-52.0, -4.0], zoom: 1.2, pitch: 0, bearing: 0 },
      mapAnimation: 'easeTo',
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 02
    {
      id: 'chapter 02',
      // The dataset arrives with the paragraph that describes it. One
      // continuous eastward turn out of Brazil, over Africa, to the Indian
      // Ocean — the far end of the nine countries the copy lists, so the
      // reader sees the spread rather than being told about it.
      globe: {
        center: [78.0, 2.0], zoom: 0.85, spin: 'east',
        start: 'top bottom-=10%', end: 'top 25%',
        legend: 'Indigenous and protected lands in South East Asia',
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0,
                  'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>Using data provided by national organizations, the international working group on Indigenous Peoples in Isolation and Initial Contact (GTI PIACI) and Indigenous experts on the confirmed presence of uncontacted people, Mongabay overlapped it with Indigenous and protected lands (Indigenous territories, tribal reserves and protected areas) and assembled a list of <b>65 defined lands</b> where they live. These exist across nine countries — Bolivia, Brazil, Colombia, Ecuador, India, Indonesia, Paraguay, Peru and Venezuela. Mongabay then analyzed tree cover using Global Nature Watch.</p><p>Among these, 56 lands are located in tropical moist broadleaf forests.</p><p>This assessment does not showcase the exact or unique location of isolated peoples but rather the boundaries of Indigenous and protected lands their presence overlaps with.</p><p>According to the findings, all 65 lands lost a total of nearly <b>2 million hectares</b> (4.94 million acres) of tree cover between 2015 and 2025 — similar in size to El Salvador. Of this, more than 568,150 hectares (1.4 million acres) was primary forest loss — nearly the size of Brunei.</p><p>Tree cover loss does not necessarily mean deforestation. It can be due to multiple factors, explained Global Nature Watch, including “mechanical harvesting, fire, disease, or storm damage.”</p><p>Wildfires, a growing threat to forests worldwide, was a driver of nearly 995,650 hectares (2.46 million acres) of this loss. In a few incidents in the Amazon, loss due to wildfires in lands used by isolated peoples increased in the last two years.</p><p>When looking at the top three drivers of forest loss, the most recurrent were natural disturbances (non-fire events like landslides) and permanent agriculture.</p>",
      location: { center: [78.0, 2.0], zoom: 0.85, pitch: 0, bearing: 0 },
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 03
    {
      id: 'chapter 03',
      // Carries on eastward across the Pacific rather than doubling back, so
      // no longitude is passed twice, and closes on the Gran Chaco this
      // chapter is about.
      globe: {
        center: [-60.5, -20.5], zoom: 1.28, spin: 'east',
        start: 'top bottom-=10%', end: 'top 25%',
        legend: 'Indigenous and protected lands in South America',
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0,
                  'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>Across the lands that experienced the most tree loss, the Gran Chaco in South America was hit particularly hard, accounting for more than <b>1.38 million hectares</b> (3.42 million acres) of loss in the 10-year period. Four of the top 10 lands with the most tree cover loss were in Bolivia and Paraguay’s Chaco, and three were in the top five. Various clans of uncontacted Ayoreo people, who live on these lands, are impacted.</p><p>According to Indigenous rights experts in Bolivia and Paraguay, the driving forces behind this tree cover loss are agriculture and cattle ranching.</p><p>“The agriculture frontier is expanding in these territories, causing forest loss and wildfires by setting fires to clear forest land for new pasture or cattle,” said Oscar Alquizalet, director of the NGO Pueblos Vivos in Bolivia.</p><p>Guei Basui Picanerai, secretary of the Guidai and Ducodegosode Ayoreo Association of Paraguay, which represents Ayoreo communities in the Chaco, says uncontacted people are living in fear.</p><p>“They live running from one place to another because they’re frightened of the loud noises of the machinery,” Picanerai said.</p>",
      location: { center: [-60.5, -20.5], zoom: 1.28, pitch: 0, bearing: 0 },
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 04
    {
      id: 'chapter 04',
      // The globe's closing gesture, which belongs to the end of chapter
      // three rather than to this chapter: the keyframe hangs off this
      // element only because that is where the scroll window falls. Chapter
      // three's bottom edge IS this chapter's top edge, so a window measured
      // from 'top' here runs across the tail of the chapter before it.
      //
      // The camera pulls back from the Chaco to hold all ten ranked lands at
      // once and the dots swap to that ten, finishing at 'top 60%'. The fade
      // only begins at 'bottom center' of chapter three — the same edge, at
      // 50% — so the move lands and is read for a moment before the globe
      // starts going. By the time this chapter's line is centred on screen,
      // the fade has finished and there is nothing beside it.
      globe: {
        center: [-62.0, -12.0], zoom: 1.05,
        start: 'top bottom', end: 'top 60%',
        legend: 'Top 10 lands globally with highest detected tree cover loss',
        layers: { centroids: 0, 'centroids-label': 0, 'centroids top 10': 0.9,
                  'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      displayText: true,
      hidden: false,
      title: ' ',
      description: "<p>Below are the <b>top 10 lands globally</b> with highest detected tree cover loss. This global ranking across biomes, with rates of detection accuracy, is approximate.</p>",
      onChapterEnter: [],
      onChapterExit: [],
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
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/10_uwottuja_beat2.webp',
        loss: '/panels/10_uwottuja_beat3.webp',
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
      description: "<p>Home to the isolated Uwottüja, this 2,285,494 ha territory in Venezuela lost <b>2.8%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 12,881 hectares (28.4% of all loss)</li></ul>",
    },

    // Top 9
    {
      id: 'Top 9',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 9,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/09_yuqui_beat2.webp',
        loss: '/panels/09_yuqui_beat3.webp',
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
      title: 'Yuqui (Community Land of Origin)',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Yuqui',
      description: "<p>Home to the Yuqui, this 115,924 ha territory in Bolivia lost <b>3.5%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Other natural disturbances, Permanent agriculture</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 1,526 hectares (38.4% of all loss)</li></ul>",
    },

    // Top 8
    {
      id: 'Top 8',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 8,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/08_uru_eu_wau_wau_beat2.webp',
        loss: '/panels/08_uru_eu_wau_wau_beat3.webp',
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
      title: 'Uru-Eu-Wau-Wau Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Uru-Eu-Wau-Wau',
      description: "<p>Home to four isolated groups, this 1,867,120 ha territory in Brazil lost <b>4.1%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 64,747 hectares (87.1% of all loss)</li></ul>",
    },

    // Top 7
    {
      id: 'Top 7',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 7,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/07_kakataibo_beat2.webp',
        loss: '/panels/07_kakataibo_beat3.webp',
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
      title: 'North and South Kakataibo Indigenous Reserve',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Kakataibo',
      description: "<p>Home to the Kakataibo, this 148,996 ha territory in Peru lost <b>5.1%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Permanent agriculture, Other natural disturbances, Logging</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> Not recorded</li></ul>",
    },

    // Top 6
    {
      id: 'Top 6',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 6,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/06_chaco_reserva_beat2.webp',
        loss: '/panels/06_chaco_reserva_beat3.webp',
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
      title: 'Chaco Biosphere Reserve',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chaco',
      description: "<p>Home to the Ayoreo (five clans), this 4,707,205 ha territory in Paraguay lost <b>11.7%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Permanent agriculture, Wildfire, Logging</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 182,893 hectares (37.1% of all loss)</li></ul>",
    },

    // Top 5
    {
      id: 'Top 5',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 5,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/05_ariboia_beat2.webp',
        loss: '/panels/05_ariboia_beat3.webp',
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
      title: 'Araribóia Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Araribóia',
      description: "<p>Home to the isolated Awá, this 413,288 ha territory in Brazil lost <b>14.2%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 41,478 hectares (72.0% of all loss)</li></ul>",
    },

    // Top 4
    {
      id: 'Top 4',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 4,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/04_chaco_ampliacion_beat2.webp',
        loss: '/panels/04_chaco_ampliacion_beat3.webp',
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
      title: 'Chaco Biosphere Reserve Expanded Area',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chaco (amp.)',
      description: "<p>Home to the Ayoreo-Totobiegosode, this 2,492,757 ha territory in Paraguay lost <b>17.0%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Permanent agriculture, Wildfire, Logging</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 7,298 hectares (1.6% of all loss)</li></ul>",
    },

    // Top 3
    {
      id: 'Top 3',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 3,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/03_otuquis_beat2.webp',
        loss: '/panels/03_otuquis_beat3.webp',
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
      description: "<p>Home to the Ayoreo, this 903,350 ha territory in Bolivia lost <b>17.2%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 127,306 hectares (98.5% of all loss)</li></ul>",
    },

    // Top 2
    {
      id: 'Top 2',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 2,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/02_nembi_guasu_beat2.webp',
        loss: '/panels/02_nembi_guasu_beat3.webp',
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
      title: 'Ñembi Guasu Conservation Area',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Ñembi Guasu',
      description: "<p>Home to the Ayoreo, this 1,207,850 ha territory in Bolivia lost <b>27.2%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 308,487 hectares (97.5% of all loss)</li></ul>",
    },

    // Top 1
    {
      id: 'Top 1',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 1,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/01_chacobo_pacahuara_beat2.webp',
        loss: '/panels/01_chacobo_pacahuara_beat3.webp',
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
      title: 'Chacobo-Pacahuara Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Chacobo-Pacahuara',
      description: "<p>Home to the Pacahuara, this 517,307 ha territory in Bolivia lost <b>33.7%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top 3 drivers of forest loss:</span> Wildfire, Permanent agriculture, Shifting cultivation</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 134,154 hectares (98.4% of all loss)</li></ul>",
    },
  ],
};
