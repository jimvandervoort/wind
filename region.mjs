const regions = [
  {
    name: 'wind',
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
        name: 'Guincho 🇵🇹',
        slug: 'guincho',
        url: 'https://www.windguru.cz/31',
      },
    ],
  },
];

function randSkinTone() {
  const skinTones = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']; // Skin tone modifiers
  return skinTones[Math.floor(Math.random() * skinTones.length)];
}

function randGender() {
  const genders = ['\u{200D}\u{2640}\u{FE0F}', '\u{200D}\u{2642}\u{FE0F}']; // Female and Male modifiers
  return genders[Math.floor(Math.random() * genders.length)];
}

export default regions;
