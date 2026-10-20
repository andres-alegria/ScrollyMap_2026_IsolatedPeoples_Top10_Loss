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
  // The globe leaves and comes back. It goes out across chapter four's bottom
  // edge, so the hand-off line in chapter five has the screen to itself, then
  // returns for chapter six — bigger and centred — to show the ranked ten on
  // their own. Shown that way it is a beat the reader stops at, rather than
  // something that dissolves under a headline just as it arrives.
  globeWindows: [
    { reveal: { trigger: 'chapter 01', start: 'top bottom', end: 'top 75%' },
      fadeOut: { trigger: 'chapter 04' } },
    { reveal: { trigger: 'chapter 06', start: 'top 70%', end: 'top 30%' },
      // Out as the first ranked section rises over it.
      fadeOut: { trigger: 'chapter 06', start: 'bottom bottom', end: 'bottom center' } },
  ],

  // Which chapter gets the larger centred frame (see .map-container--finale).
  globeFinale: { trigger: 'chapter 06' },

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
    // Loss first, then what is left: the reader sees what was taken before
    // seeing the remainder, which lands harder than the reverse.
    beats: [
      { label: 'Tree cover lost since 2015',
        color: '#e66d6d', textColor: '#181818' },          /* adjust loss box + text */
      // Pine Green — the colour the panels paint forest with
      { label: 'Forest remaining in 2025',
        color: '#0a2f29', textColor: '#ffffff' },          /* adjust extent box + text */
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
      { role: 'Data collection', name: 'Latoya Abulu & Aimee Gabay' },
      { role: 'Design and development', name: 'Andrés Alegría' },
    ],
    sourcesTitle: 'Sources',
    sources:
      'Territory boundaries were compiled and verified with information provided by '
      + 'AIDESEP, AMAN, CEJIS, CONAIE, FUNAI, GTI-PIACI, Iniciativa Amotocodie, ISA, OPI, '
      + 'OPIAC, ORPIO, Pueblos Vivos and Dr. Manish Chandi. '
      + 'Forest cover and loss are from the Global Forest Change dataset v1.13 '
      + '(Hansen et al., University of Maryland), covering 2000 to 2025 and accessed through '
      + 'Google Earth Engine and Global Nature Watch. Shaded relief on the world '
      + 'map is from the GEBCO 2024 Grid.',
  },
 
  chapters: [
    
    // chapter 01
    {
      id: 'chapter 01',
      // Opens where the copy opens: the Kakataibo reserves in Peru. No dots
      // yet — this chapter is one place, not the dataset.
      //
      // Zooms here describe a proportion of the globe's frame, not a pixel
      // size: useGlobeSequence adds log2(frameWidth / 440) before applying
      // them, so the sphere fills the same fraction of the frame at every
      // width instead of overflowing narrow ones and stranding wide ones.
      // 1.08 leaves a margin inside the frame at both ends of the range —
      // narrow screens draw the globe edge to edge otherwise. The closing beat
      // pushes in
      // a little. Measured on the live map, the sphere is about 341px across
      // at an effective zoom of 1.0.
      globe: {
        center: [-75.65, -8.9], zoom: 1.08,
        start: 'top bottom', end: 'top 70%',
        // The same point the countdown's #2 panel spins its locator to, so
        // the land is in the same place both times the piece shows it.
        focus: [-75.622212, -8.88791],            /* adjust focus dot position */
        // The spreadsheet's name for this land, as used at #2 and on the
        // closing world map.
        legend: 'North and South Kakataibo Indigenous Reserve, Peru',
        layers: { centroids: 0, 'centroids-label': 0, 'centroids top 10': 0,
                  'ranked-ten': 0, 'chapter-focus': 0.9 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>The canopy of the Amazon rainforest runs thick in some patches. In others, the forest is shaved down to the root in bright green rectangular chunks, the occasional nude trees left standing.</p><p>Families of voluntarily isolated, or “uncontacted,” Kakataibo people walk these lands in the North and South Kakataibo Indigenous Reserve, Peru, dependent on the forests and rich biodiverse world underneath its canopy for survival — food, shelter and medicine. The area is under threat from <b>illegal loggers, drug trafficking</b> and other illegal activities.</p><p>“These communities are highly vulnerable,” said Julio Cusurichi, an Indigenous Shipibo-Conibo leader and member of the Interethnic Association for the Development of the Peruvian Rainforest (AIDESEP). “Any contact could lead to the death of all these people.”</p><p>The North and South Kakataibo Indigenous Reserve is one of many Indigenous lands, tribal reserves and protected areas around the world designed — either through recognition by states or NGOs — to protect voluntary isolated peoples. Estimates point to around <b>200 groups</b> of people living in voluntary isolation and initial contact, stretching from Brazil to India; some living in defined lands, while others do not.</p><p>Mongabay mapped the Indigenous territories, tribal reserves and protected areas around the world with the confirmed presence of peoples living in voluntary isolation and analyzed forest cover loss in the decade from 2015 to 2025.</p><p>Based on these figures, we ranked:</p><ul class='chapter-list'><li>the lands in humid tropical forests with the most tree cover loss</li><li>the lands per country which saw the most tree cover loss</li></ul>",
      // No `location` here on purpose. The camera for these chapters belongs
      // to `globe` above, and only to that. A `location` makes the template
      // fly the map on chapter enter — to the same centre, but at the bare
      // configured zoom, with none of the frame-fit offset the globe sequence
      // adds (see FIT_BASE_W in use-globe-sequence.js). The two cameras then
      // took turns: entering a chapter shrank the globe by a third, and the
      // next scroll event snapped it back.
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
        center: [78.0, 2.0], zoom: 1.08, spin: 'east',
        start: 'top bottom-=10%', end: 'top 25%',
        legend: 'Indigenous and protected lands in Asia',
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0,
                  'ranked-ten': 0, 'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>Using data provided by national Indigenous organizations, the international working group on Indigenous Peoples in Isolation and Initial Contact (GTI PIACI) and Indigenous experts on the confirmed presence of uncontacted people, Mongabay overlapped it with Indigenous and protected lands and assembled a list of <b>65 defined lands</b> where they live.</p><p>These exist across nine countries — Bolivia, Brazil, Colombia, Ecuador, India, Indonesia, Paraguay, Peru and Venezuela. Mongabay then analyzed tree cover using Global Nature Watch.</p><p>Among these, 56 lands are located in tropical moist broadleaf forests.</p><p>This assessment does not showcase the exact or unique location of isolated peoples but rather the boundaries of Indigenous and protected lands their presence overlaps with. Using public data, the assessment exists to give a general sense of the state of forests on protected lands uncontacted peoples depend on.</p>",
      // No `location`: the globe's camera is `globe` above, and only that.
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 03
    {
      id: 'chapter 03',
      // The findings half of what used to be one long chapter. Carries on
      // eastward across the Pacific rather than doubling back, so no longitude
      // is passed twice, and settles on a South America wide enough to hold
      // both the Gran Chaco and the Amazon — the two this chapter contrasts.
      globe: {
        center: [-60.0, -14.0], zoom: 1.08, spin: 'east',
        start: 'top bottom-=10%', end: 'top 25%',
        legend: 'Indigenous and protected lands in South America',
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0,
                  'ranked-ten': 0, 'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>According to the findings, all 65 lands lost a total of nearly <b>2 million hectares</b> (4.94 million acres) of tree cover between 2015 and 2025 — similar in size to El Salvador. Of this, more than 568,150 hectares (1.4 million acres) was primary forest loss.</p><p>The Gran Chaco in Bolivia and Paraguay was hit particularly hard, accounting for more than 1.38 million hectares (3.42 million acres) of the 2-million-hectare loss in the 10-year period. Various clans of uncontacted Ayoreo people, who live on these lands, are impacted.</p><p>“The agriculture frontier is expanding in these territories, causing forest loss and wildfires by setting fires to clear forest land for new pasture or cattle,” said Oscar Alquizalet, director of the NGO Pueblos Vivos in Bolivia.</p><p>Lands in tropical moist broadleaf forests lost more than 465,300 hectares (1,149,780 acres) of tree cover, 394,000 hectares (973,595 acres), or 84%, of which was primary forest.</p><p>Tree cover loss does not necessarily mean deforestation. It can be due to multiple factors, explained Global Nature Watch, including “mechanical harvesting, fire, disease, or storm damage.”</p><p>When looking at the top three drivers of forest loss, the most recurrent were natural disturbances (non-fire events like landslides), permanent agriculture and shifting cultivation.</p>",
      // No `location`: the globe's camera is `globe` above, and only that.
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 04
    {
      id: 'chapter 04',
      // Closes in on the western Amazon — Rondônia and Uru-Eu-Wau-Wau, which
      // this chapter is about. The eastward sweep is already done by the
      // chapter before, so this is a short move rather than another crossing.
      globe: {
        center: [-62.5, -9.0], zoom: 1.08,
        start: 'top bottom-=10%', end: 'top 25%',
        legend: 'Indigenous and protected lands in South America',
        layers: { centroids: 0.9, 'centroids-label': 0, 'centroids top 10': 0,
                  'ranked-ten': 0, 'chapter-focus': 0 },
      },
      alignment: 'fully',
      card: true,
      hidden: false,
      title: ' ',
      description: "<p>Wildfires, a growing threat to forests worldwide, were a driver of nearly <b>995,650 hectares</b> (2.46 million acres) of loss across all lands. In a few incidents in the Amazon, such as in the Uru-Eu-Wau-Wau Indigenous Territory, loss due to wildfires increased significantly over the last two years.</p><p>“Advancing fire kills the [isolated] peoples’ food supply, burns their huts and puts them in fear of being burned alive,” Ivaneide “Neidinha” Bandeira Cardozo, an inhabitant of Uru-Eu-Wau-Wau and coordinator of the Kanindé Ethno-environmental Defense Association, told Mongabay.</p><p>“Besides, they certainly suffer from respiratory diseases that can lead to death. It also signifies the advance of land grabbing, and thus the loss of Indigenous territory.”</p>",
      // No `location`: the globe's camera is `globe` above, and only that.
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 05
    {
      id: 'chapter 05',
      alignment: 'fully',
      card: true,
      displayText: true,
      hidden: false,
      title: ' ',
      description: "<p>Below are the <b>10 lands in tropical moist forests</b> with the largest share of forest lost. This ranking, with rates of detection accuracy, is approximate.</p>",
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 06
    {
      id: 'chapter 06',
      // No copy: one screen whose only job is to hold the globe still long
      // enough to be read. The camera has already moved here while hidden, so
      // the reveal lands on a finished view rather than on a move in progress.
      globe: {
        center: [-62.0, -12.0], zoom: 1.18,
        start: 'top bottom', end: 'top 80%',
        legend: 'The 10 lands with the largest share of forest lost',
        layers: { centroids: 0, 'centroids-label': 0, 'centroids top 10': 0,
                  'ranked-ten': 0.9, 'chapter-focus': 0 },
      },
      alignment: 'fully',
      globeOnly: true,
      hidden: false,
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
        center: [-60.439372, 0.050421],
        // same caption as the beat before: without it the midpoint swap
        // blanks the bar while the globe is still on screen
        legend: 'The 10 lands with the largest share of forest lost',
        zoom: 5,                             // adjust closing zoom depth
        pitch: 45,                           // adjust closing tilt
        bearing: -25,                        // adjust closing rotation
        start: 'top bottom', end: 'top top',
      },
      areaId: 10,
      // beat2/beat3 are the render script's numbering. Its beat1 was the 2000
      // extent panel, which the piece no longer shows.
      panels: {
        extent: '/panels/10_pirititi_beat2.webp',
        loss: '/panels/10_pirititi_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 10, kmFrac: 0.1079, miFrac: 0.1736 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-60.439372, 0.050421],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Roraima',
      country: 'Brazil',
      rank: '#10',
      title: 'Pirititi Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Pirititi',
      description: "<p>Home to the Pirititi, this 43,404-hectare (107,254-acre) territory in Brazil lost <b>1.2%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Logging, other natural disturbances and permanent agriculture</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> Not recorded</li></ul>",
    },

    // Top 9
    {
      id: 'Top 9',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 9,
      panels: {
        extent: '/panels/09_piripkura_beat2.webp',
        loss: '/panels/09_piripkura_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1965, miFrac: 0.3162 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-61.000967, -9.669405],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Mato Grosso',
      country: 'Brazil',
      rank: '#9',
      title: 'Piripkura Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Piripkura',
      description: "<p>Home to the Piripkura, this 242,500-hectare (599,231-acre) territory in Brazil lost <b>1.4%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Permanent agriculture, shifting cultivation and logging</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 76 hectares (2.3% of all loss)</li></ul>",
    },

    // Top 8
    {
      id: 'Top 8',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 8,
      panels: {
        extent: '/panels/08_yabarana_beat2.webp',
        loss: '/panels/08_yabarana_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 10, kmFrac: 0.1451, miFrac: 0.2335 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-65.838243, 5.537543],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Amazonas',
      country: 'Venezuela',
      rank: '#8',
      title: 'Yabarana Traditional Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Yabarana',
      description: "<p>Home to the Jotï, this 95,052-hectare (234,879-acre) territory in Venezuela lost <b>1.7%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Other natural disturbances, wildfire and shifting cultivation</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 242 hectares (27.5% of all loss)</li></ul>",
    },

    // Top 7
    {
      id: 'Top 7',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 7,
      panels: {
        extent: '/panels/07_massaco_beat2.webp',
        loss: '/panels/07_massaco_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1423, miFrac: 0.229 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-62.572194, -12.562867],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Rondônia',
      country: 'Brazil',
      rank: '#7',
      title: 'Massaco Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Massaco',
      description: "<p>Home to the isolated Massaco, this 421,895-hectare (1,042,525-acre) territory in Brazil lost <b>2.6%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Wildfire, other natural disturbances and permanent agriculture</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 8,739 hectares (89.4% of all loss)</li></ul>",
    },

    // Top 6
    {
      id: 'Top 6',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 6,
      panels: {
        extent: '/panels/06_caru_beat2.webp',
        loss: '/panels/06_caru_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1807, miFrac: 0.2908 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-46.333046, -3.718335],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Maranhão',
      country: 'Brazil',
      rank: '#6',
      title: 'Caru Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Caru',
      description: "<p>Home to the isolated groups of the Presídio and Juruti igarapés, this 172,667-hectare (426,669-acre) territory in Brazil lost <b>2.7%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Other natural disturbances, wildfire and permanent agriculture</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 1,108 hectares (24.1% of all loss)</li></ul>",
    },

    // Top 5
    {
      id: 'Top 5',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 5,
      panels: {
        extent: '/panels/05_uwottuja_beat2.webp',
        loss: '/panels/05_uwottuja_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 60, kmFrac: 0.1624, miFrac: 0.2614 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-66.609753, 5.163116],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Amazonas',
      country: 'Venezuela',
      rank: '#5',
      title: 'Uwottüja Traditional Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Uwottüja',
      description: "<p>Home to the isolated Uwottüja, this 2,285,494-hectare (5,647,579-acre) territory in Venezuela lost <b>2.8%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Wildfire, permanent agriculture and other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 12,881 hectares (28.4% of all loss)</li></ul>",
    },

    // Top 4
    {
      id: 'Top 4',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 4,
      panels: {
        extent: '/panels/04_yuqui_beat2.webp',
        loss: '/panels/04_yuqui_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 10, kmFrac: 0.1115, miFrac: 0.1795 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-64.876321, -16.588368],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Cochabamba',
      country: 'Bolivia',
      rank: '#4',
      title: 'Yuqui (Community Land of Origin)',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Yuqui',
      description: "<p>Home to the Yuqui, this 115,924-hectare (286,454-acre) territory in Bolivia lost <b>3.5%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Wildfire, other natural disturbances and permanent agriculture</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 1,526 hectares (38.4% of all loss)</li></ul>",
    },

    // Top 3
    {
      id: 'Top 3',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 3,
      panels: {
        extent: '/panels/03_uru_eu_wau_wau_beat2.webp',
        loss: '/panels/03_uru_eu_wau_wau_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 40, kmFrac: 0.1356, miFrac: 0.2182 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-63.477747, -11.183612],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Rondônia',
      country: 'Brazil',
      rank: '#3',
      title: 'Uru-Eu-Wau-Wau Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Uru-Eu-Wau-Wau',
      description: "<p>Home to four isolated groups, this 1,867,120-hectare (4,613,754-acre) territory in Brazil lost <b>4.1%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Wildfire, permanent agriculture and other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 64,747 hectares (87.1% of all loss)</li></ul>",
    },

    // Top 2
    {
      id: 'Top 2',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 2,
      panels: {
        extent: '/panels/02_kakataibo_beat2.webp',
        loss: '/panels/02_kakataibo_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 30, kmFrac: 0.136, miFrac: 0.2189 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-75.622212, -8.88791],
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Ucayali',
      country: 'Peru',
      rank: '#2',
      title: 'North and South Kakataibo Indigenous Reserve',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Kakataibo',
      description: "<p>Home to the Kakataibo, this 148,996-hectare (368,177-acre) territory in Peru lost <b>5.1%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Permanent agriculture, other natural disturbances and logging</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> Not recorded</li></ul>",
    },

    // Top 1
    {
      id: 'Top 1',
      type: 'stage',
      stage: 'AreaReveal',
      areaId: 1,
      panels: {
        extent: '/panels/01_ariboia_beat2.webp',
        loss: '/panels/01_ariboia_beat3.webp',
      },
      // scale bar: same number in km and mi, different bar lengths
      scale: { n: 20, kmFrac: 0.1629, miFrac: 0.2622 },
      // locator: spins the globe so this territory faces the viewer
      locator: [-46.42441, -5.069811],
      // The one section that fades out completely rather than to 0.45, and
      // that finishes before the hand-over rather than at the end of it. The
      // others give way to another full-bleed panel, which covers whatever is
      // left of them; this one gives way to a text card, which is a screen
      // tall and arrives from the bottom — so anything still showing above it
      // is a half-faded map standing over the closing line, which reads as a
      // mistake rather than as a crossfade.
      timings: { fade: 1, recedeTo: 0.9 },
      // first-level division and country: the locator caption joins them,
      // the menu bar uses the country on its own
      adm1: 'Maranhão',
      country: 'Brazil',
      rank: '#1',
      title: 'Araribóia Indigenous Territory',
      // shown in the jump bar, where the full name will not fit
      menuName: 'Araribóia',
      description: "<p>Home to the isolated Awá, this 413,288-hectare (1,021,257-acre) territory in Brazil lost <b>14.2%</b> of its 2000 tree cover between 2015 and 2025.</p><ul class='area-facts'><li><span class='area-facts__label'>Top three drivers of forest loss:</span> Wildfire, permanent agriculture and other natural disturbances</li><li><span class='area-facts__label'>Tree cover loss due to wildfires:</span> 41,478 hectares (72% of all loss)</li></ul>",
    },

    // ------------------------------------------------------------------
    // After the countdown, two closings. First the same ten countries seen
    // whole, as one world map; then the lands the assessment could not rank
    // but the reporting would not leave out. The second pair are shaped like
    // the intro chapters — copy on the left, a map beside it — rather than
    // like the ranked sections, because they are read rather than counted.
    // ------------------------------------------------------------------

    // chapter 07 — the closing world map. Dot positions come straight from
    // render_world_robinson.py (x and y are fractions of the image); the label
    // positions are placed by hand, because seven of the nine lands fall
    // inside eight per cent of the map's width and no rule would untangle
    // them. lx/ly are the label's anchor, in the same fractions.
    {
      id: 'chapter 07',
      type: 'stage',
      stage: 'WorldLosses',
      panel: '/panels/world_robinson.webp',
      panelAlt: 'Robinson projection world map with the nine lands marked, one in each country in the assessment',
      viewBox: [2600, 1070],
      title: 'The hardest-hit land in each country',
      description: "<p>Across the nine countries with presence of peoples living in isolation, these are the lands that lost the most tree cover between 2015 and 2025 compared to a 2000 tree cover baseline.</p>",
      lands: [
        // Each land's full name, broken over two lines where the gap it sits
        // in is too narrow for one — the Atlantic between South America and
        // Africa is barely a tenth of the map wide at this latitude.
        //
        // `driver` is the first of the three the dataset lists, and `fire` is
        // the hectares of that loss attributed to wildfire; the share is
        // worked out from `loss` where it is shown, so the two cannot drift
        // apart. null is the dataset's "No data", which three of the nine
        // carry and which the popup says in those words.
        { country: 'Paraguay',  land: 'Chaco Biosphere Reserve Expansion',
          name: ['Chaco Biosphere Reserve', 'Expansion'],
          loss: 910948, driver: 'Permanent agriculture', fire: 9712,
          x: 0.336, y: 0.728, lx: 0.420, ly: 0.845, anchor: 'start' },
        // Ñembi Guasu sits against the Paraguayan border, 17 units from the
        // Chaco reserve's dot on this map: the two largest losses in the set
        // are neighbours. Their leaders leave in opposite directions so the
        // pair reads as two marks rather than one.
        { country: 'Bolivia',   land: 'Ñembi Guasu Conservation Area',
          name: ['Ñembi Guasu', 'Conservation Area'],
          loss: 316346, driver: 'Wildfire', fire: 308487,
          x: 0.3364, y: 0.712, lx: 0.175, ly: 0.772, anchor: 'end' },
        { country: 'Brazil',    land: 'Araribóia Indigenous Territory',
          name: ['Araribóia', 'Indigenous Territory'],
          loss: 57613,  driver: 'Wildfire', fire: 41478,
          x: 0.371, y: 0.607, lx: 0.428, ly: 0.590, anchor: 'start' },
        { country: 'Venezuela', land: 'Uwottüja Traditional Territory',
          name: ['Uwottüja', 'Traditional Territory'],
          loss: 53778,  driver: 'Permanent agriculture', fire: 13314,
          x: 0.315, y: 0.529, lx: 0.350, ly: 0.282, anchor: 'start' },
        { country: 'Colombia',  land: 'Chiribiquete National Park',
          name: ['Chiribiquete', 'National Park'],
          loss: 14807,  driver: 'Permanent agriculture', fire: 390,
          x: 0.297, y: 0.561, lx: 0.190, ly: 0.378, anchor: 'end' },
        { country: 'Peru',      land: 'North and South Kakataibo Indigenous Reserve',
          name: ['North and South Kakataibo', 'Indigenous Reserve'],
          loss: 8803,   driver: 'Permanent agriculture', fire: null,
          x: 0.291, y: 0.636, lx: 0.170, ly: 0.620, anchor: 'end' },
        { country: 'Ecuador',   land: 'Waorani Territory',
          name: ['Waorani Territory'],
          loss: 2290,   driver: 'Shifting cultivation', fire: null,
          x: 0.287, y: 0.577, lx: 0.170, ly: 0.500, anchor: 'end' },
        { country: 'Indonesia', land: 'Aketajawe-Lolobata National Park',
          name: ['Aketajawe-Lolobata', 'National Park'],
          loss: 1305,   driver: 'Wildfire', fire: 893,
          x: 0.856, y: 0.561, lx: 0.872, ly: 0.330, anchor: 'start' },
        { country: 'India',     land: 'Great Nicobar Tribal Reserve',
          name: ['Great Nicobar', 'Tribal Reserve'],
          loss: 9,      driver: 'Logging', fire: null,
          x: 0.760, y: 0.515, lx: 0.757, ly: 0.730, anchor: 'end' },
      ],
    },

    // chapter 08 — the hand-off into that section, set like the line that
    // introduced the countdown so the two read as a matching pair
    {
      id: 'chapter 08',
      alignment: 'fully',
      card: true,
      displayText: true,
      hidden: false,
      title: ' ',
      description: "<h3 class='display-head'>Other lands to watch for</h3><p>Here are other lands that were not included in this assessment but face increased threats to forests or high levels of forest loss in the last couple years.</p>",
      onChapterEnter: [],
      onChapterExit: [],
    },

    // chapter 09
    {
      id: 'chapter 09',
      type: 'stage',
      stage: 'WatchArea',
      panel: '/panels/halmahera_extent.webp',
      panelAlt: 'Satellite-derived map of forest remaining in 2025 on Halmahera, Indonesia, with the mapped extent of lands used by O\u2019 Hongana Manyawa people outlined',
      // box, locator and scale come from render_panels_watch.py
      scale: { n: 20, kmFrac: 0.1504, miFrac: 0.242 },
      locator: [128.17051, 0.63895],
      caption: 'Forest remaining in 2025. The outline is Survival International\u2019s approximation of the lands used by O\u2019 Hongana Manyawa. For security reasons, map is deliberately rough.',
      title: 'The O\u2019 Hongana Manyawa in Halmahera',
      description: "<p>Lands used by uncontacted O\u2019 Hongana Manyawa people in Indonesia\u2019s Halmahera Island overlap with the Aketajawe-Lolobata National Park. However, voluntarily isolated members of the tribe use much more land, and mapping efforts by various groups of their territory are underway.</p><p>According to an approximate map by human rights organization Survival International, a wave of mining concessions, many for nickel, impact forests uncontacted O\u2019 Hongana Manyawa people depend on for food and survival.</p><p>The Jakarta declaration, which calls on governments to protect the lands and rights of uncontacted peoples worldwide, was drafted in Indonesia in a bid to strengthen the global alliance for the protection of uncontacted peoples and the inclusion of tribes in Indonesia.</p><p>For the safety of the isolated members of the group, Mongabay will not publish the most up-to-date map of lands the O\u2019 Hongana Manyawa people use.</p><p>\u201CThis map is very helpful in showing the existence of the O\u2019 Hongana Manyawa Indigenous Community \u2026 but does not yet cover the entire O\u2019 Hongana Manyawa Indigenous territory. The work to document the existence of O\u2019 Hongana Manyawa and its Indigenous territory is not yet complete, and it will continue,\u201D said Yoga Kipli, directorate of community support and former head of participatory mapping for the Indigenous Peoples\u2019 Alliance of the Archipelago (AMAN).</p>",
    },

    // chapter 10
    {
      id: 'chapter 10',
      type: 'stage',
      stage: 'WatchArea',
      panel: '/panels/new_guinea_extent.webp',
      panelAlt: 'Satellite-derived map of forest remaining in 2025 across New Guinea, with the border between Indonesia and Papua New Guinea marked',
      scale: { n: 400, kmFrac: 0.1719, miFrac: 0.2767 },
      locator: [140.5, -5.5],
      caption: 'Forest remaining in 2025 across New Guinea.',
      title: 'Isolated tribes in New Guinea',
      description: "<p>Mongabay could not include any lands in New Guinea, which includes the Indonesian half of West Papua and the country of Papua New Guinea, in its assessment due to lack of accurate data, mapping sources and the safety of isolated tribes.</p><p>In West Papua, there are currently between two and 10 \u201Ctruly uncontacted tribal groups\u201D in the rainforests, said Dorince Mehue, an AMAN campaigner for the Papua region.</p><p>Calculating the number of tribes living in voluntary isolation in West Papua is challenging due to geographic difficulties, restricted access for journalists and international humanitarian organizations and surrounding communities deliberately withholding information on isolated tribes to protect them from exploitation or external threats.</p><p>The primary forests they depend on face multiple threats. This threatens the survival and culture of uncontacted tribes in West Papua, according to Mehue.</p><p>\u201CThey face the expansion of extractive industries,\u201D she told Mongabay. \u201COf hundreds of thousands of hectares of customary forests turned into monopolistic oil palm plantations and agribusiness projects. Nickel mining activities on small islands such as Gag Island in Raja Ampat, as well as commercial logging, are clearing primary forests.\u201D</p><p>The ongoing armed conflict, security forces and armed civilian groups have forced thousands of residents of remote villages to flee into the forest, Mehue said.</p>",
    },
  ],
};