let regions = [
  {
    name: 'capetown',
    from: 8,
    to: 20,
    spots: [
      {
        name: 'Khaya Beach 🐕',
        slug: 'khaya',
        url: 'https://www.windguru.cz/208276',
      },
      {
        name: 'Dolphin 🐬️',
        slug: 'dolphin',
        url: 'https://www.windguru.cz/206959',
      },
      {
        name: `Big Bay ${'🏄' + randSkinTone() + randGender()}`,
        slug: 'bigbay',
        url: 'https://www.windguru.cz/131599',
      },
      {
        name: 'Langebaan 🦭',
        slug: 'langebaan',
        url: 'https://www.windguru.cz/21691',
      },
      {
        name: 'Shark Bay 🦈',
        slug: 'sharkbay',
        url: 'https://www.windguru.cz/67005',
      },
      {
        name: 'Misty Cliffs 👻',
        slug: 'misty',
        url: 'https://www.windguru.cz/208280',
      },
      {
        name: 'Her<span class="m">m</span>anus 🐋',
        slug: 'hermanus',
        url: 'https://www.windguru.cz/80216',
      },
      {
        name: 'Witsand 🏖️',
        slug: 'witsand',
        url: 'https://www.windguru.cz/131707',
      },
      {
        name: 'Brandvlei 🔥️',
        slug: 'braindvlei',
        url: 'https://www.windguru.cz/131692',
      },
    ],
  },
  {
    name: 'tarifa',
    from: 8,
    to: 21,
    spots: [
      {
        name: 'Los Lances 🛶',
        slug: 'lances',
        url: 'https://www.windguru.cz/48776',
      },
      {
        name: 'Valdevaqueros ⛱️',
        slug: 'valdevaqueros',
        url: 'https://www.windguru.cz/541946',
      },
      {
        name: 'Caños de Mecca 🌊',
        slug: 'canos',
        url: 'https://www.windguru.cz/5691',
      },
      {
        name: 'Balneario 💀',
        slug: 'balneario',
        url: 'https://www.windguru.cz/48780',
      },
      {
        name: 'Estepona 🌴',
        slug: 'estepona',
        url: 'https://www.windguru.cz/48787',
      },
      {
        name: 'Palmones 🏗️',
        slug: 'palmones',
        url: 'https://www.windguru.cz/48785',
      },
      {
        name: `Getares ${'🏄' + randSkinTone() + randGender()}`,
        slug: 'getares',
        url: 'https://www.windguru.cz/48784',
      },
      {
        name: 'Cabopino ⛰️',
        slug: 'cabopino',
        url: 'https://www.windguru.cz/48790',
      },
      {
        name: 'Guincho 🇵🇹',
        slug: 'guincho',
        url: 'https://www.windguru.cz/31',
      },
    ],
  },
  {
    name: 'holland',
    from: 8,
    to: 21,
    spots: [
      {
        name: 'Kijkduin 👀',
        slug: 'kijkduin',
        url: 'https://www.windguru.cz/48305',
      },
      {
        name: 'De Slufter 🏝️',
        slug: 'deslufter',
        url: 'https://www.windguru.cz/48309',
      },
      {
        name: 'Hoek van Holland 🚢',
        slug: 'hoekvanholland',
        url: 'https://www.windguru.cz/48307',
      },
      {
        name: 'Rockanje ⚓️',
        slug: 'rockanje',
        url: 'https://www.windguru.cz/500879',
      },
      {
        name: 'Ouddorp 🏛️',
        slug: 'ouddorp',
        url: 'https://www.windguru.cz/181964',
      },
      {
        name: 'Brouwersdam 🦑',
        slug: 'brouwersdam',
        url: 'https://www.windguru.cz/97',
      },
      {
        name: 'Vrouwenpolder 💅',
        slug: 'vrouwenpolder',
        url: 'https://www.windguru.cz/48323',
      },
      {
        name: 'Cadzand Bad 🇧🇪',
        slug: 'cadzandbad',
        url: 'https://www.windguru.cz/48328',
      },
      {
        name: 'Grevelingendam 🌬️',
        slug: 'grevelingendam',
        url: 'https://www.windguru.cz/147',
      },
      {
        name: 'Noordwijk aan Zee 🏄',
        slug: 'noordwijk',
        url: 'https://www.windguru.cz/575',
      },
      {
        name: 'Wijk aan Zee 🌊',
        slug: 'wijkaanzee',
        url: 'https://www.windguru.cz/1120682',
      },
      {
        name: 'Texel 🏝️',
        slug: 'texel',
        url: 'https://www.windguru.cz/48262',
      },
      {
        name: 'Vlieland 🏝️',
        slug: 'vlieland',
        url: 'https://www.windguru.cz/48261',
      },
      {
        name: 'Terschelling, West aan Zee 🏝️',
        slug: 'terschelling',
        url: 'https://www.windguru.cz/48260',
      },
      {
        name: 'Ameland, Noordzeestrand 🏝️',
        slug: 'ameland',
        url: 'https://www.windguru.cz/48255',
      },
      {
        name: 'Schiermonnikoog West End 🏝️',
        slug: 'schiermonnikoog',
        url: 'https://www.windguru.cz/500856',
      },
      {
        name: 'Kornwerderzand 🌉',
        slug: 'kornwerderzand',
        url: 'https://www.windguru.cz/500867',
      },
      {
        name: 'Workum 🚣',
        slug: 'workum',
        url: 'https://www.windguru.cz/48267',
      },
      {
        name: 'Mirns 🚣',
        slug: 'mirns',
        url: 'https://www.windguru.cz/3642',
      },
      {
        name: 'Medemblik ⛵',
        slug: 'medemblik',
        url: 'https://www.windguru.cz/48274',
      },
      {
        name: 'Enkhuizen ⛵',
        slug: 'enkhuizen',
        url: 'https://www.windguru.cz/46944',
      },
    ],
  },
  {
    name: 'restofworld',
    from: 8,
    to: 21,
    spots: [
      {
        name: 'Le Morne 🇲🇺',
        slug: 'lemorne',
        url: 'https://www.windguru.cz/118',
      },
    ],
  }
];

function randSkinTone() {
  const skinTones = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']; // Skin tone modifiers
  return skinTones[Math.floor(Math.random() * skinTones.length)];
}

function randGender() {
  const genders = ['\u{200D}\u{2640}\u{FE0F}', '\u{200D}\u{2642}\u{FE0F}']; // Female and Male modifiers
  return genders[Math.floor(Math.random() * genders.length)];
}

if (process.env.WIND_MINI === 'true') {
  regions = regions.filter(region => region.name === 'tarifa');
  regions[0].spots = regions[0].spots.filter(spot => spot.slug === 'lances');
}

export default regions;
