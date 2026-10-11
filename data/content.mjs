// Single source of truth for site content.
// Edit this file, then run `npm run build` to regenerate the HTML pages, sitemap.xml and llms.txt.
// Only add links that have been verified; omit a field rather than guessing.

export const site = {
  url: 'https://jstnurmind.com',
  name: 'JSTNURMIND',
  pronunciation: 'Just In Your Mind',
  alternateNames: ['Just In Your Mind', 'JustInYourMind', 'JST NUR MIND', 'Just in ur mind'],
  origin: 'New York City, NY',
  location: { city: 'Austin', region: 'TX' },
  description:
    'Masked producer and DJ exploring the space between underground dance music, alternative hip-hop, and everything in between.',
  bio: [
    'JSTNURMIND is a New York-born, Austin-based masked producer and DJ whose music moves between alternative hip-hop, house, techno, and other corners of underground electronic music.',
    'His work balances introspective moods, playful energy, and rhythm-driven experimentation.',
  ],
  genres: ['Electronic', 'Alternative Hip-Hop', 'House', 'Techno', 'Hip-Hop', 'Rap'],
  heroImage: {
    src: '/assets/images/jstnurmind-red-mask-music-producer-austin.webp',
    width: 1168,
    height: 880,
    alt: 'JSTNURMIND in his red faceted mask and a black t-shirt, looking to the side against a pale blue backdrop.',
  },
  portrait: {
    src: '/assets/images/jstnurmind-red-mask-portrait.jpeg',
    width: 576,
    height: 1024,
    alt: 'Close-up portrait of JSTNURMIND wearing the red faceted mask, lit by a soft spotlight.',
  },
  shareImage: {
    square: '/assets/images/jstnurmind-share-image-1-1.jpeg?v=2',
    squareSize: 506,
    wide: '/assets/images/jstnurmind-share-image-16-9.jpeg',
  },
  contact: {
    formspreeEndpoint: 'https://formspree.io/f/xyegzdjb',
    inquiryTypes: ['Booking', 'Collaboration', 'Music Feature', 'Other'],
  },
};

export const listenLinks = [
  { label: 'Spotify', url: 'https://open.spotify.com/artist/3yjVlX4NAHcFIpwEMrHNNc' },
  { label: 'Apple Music', url: 'https://music.apple.com/gb/artist/jstnurmind/1468414742' },
  { label: 'YouTube', url: 'https://www.youtube.com/@jstnurmind' },
  { label: 'Bandcamp', url: 'https://jstnurmind.bandcamp.com/' },
  { label: 'SoundCloud', url: 'https://soundcloud.com/jstnurmind' },
  { label: '[untitled]', url: 'https://untitled.stream/jstnurmind' },
];

export const followLinks = [
  { label: 'Instagram', url: 'https://www.instagram.com/jstnurmind/' },
  { label: 'X / Twitter', url: 'https://x.com/jstnurmind' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@jstnurmind' },
  { label: 'Linktree', url: 'https://linktr.ee/jstnurmind' },
];

// Newest first. `smartLinkUrl` is the multi-platform landing page for the release.
export const releases = [
  {
    id: 'raverr-pack-sounds',
    title: 'Raverr Pack Sounds',
    releaseDate: '2025-12-12',
    artwork: '/assets/images/raverr-pack-sounds-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/3w5sXDCFPMFk0W8uOb8vyC',
    youtubeUrl: 'https://www.youtube.com/playlist?list=OLAK5uy_lpfjW98cJP33ndJbGO9tYhIfi1PQGBA-s',
    youtubeMusicUrl: 'https://music.youtube.com/playlist?list=OLAK5uy_kNFBrGozhIG8j8_eRGab-3XFC82b-N4YI',
    soundcloudUrl: 'https://soundcloud.com/jstnurmind/sets/raverr-pack-sounds',
    smartLinkUrl: 'https://tr.ee/1NFYoPm42d',
  },
  {
    id: 'raverr-pack-2',
    title: 'Raverr Pack 2 (Vocal Version)',
    releaseDate: '2025-11-07',
    artwork: '/assets/images/raverr-pack-2-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/2iyezLHEvV8MF6bmIfOA0M',
    youtubeUrl: 'https://www.youtube.com/playlist?list=OLAK5uy_lQdihN3qMg9M5CfWElLFul62t7dYcWRfI',
    youtubeMusicUrl: 'https://music.youtube.com/playlist?list=OLAK5uy_kXWJxXuclNqWrfi-OqsfnpL83_ddGd04o',
    smartLinkUrl: 'https://tr.ee/hpc5ONDSvH',
  },
  {
    id: 'raverr-pack-1',
    title: 'Raverr Pack 1 (Vocal Version)',
    releaseDate: '2025-05-02',
    artwork: '/assets/images/raverr-pack-1-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/2f2YBPnHWmDj0V99UAaGRY',
    soundcloudUrl: 'https://soundcloud.com/jstnurmind/sets/raverr-pack-1',
    bandcampUrl: 'https://jstnurmind.bandcamp.com/album/raverr-pack-1',
    smartLinkUrl: 'https://tr.ee/8MOr1FxKYm',
  },
  {
    id: 'raverr',
    title: 'Raverr',
    releaseDate: '2025-01-29',
    artwork: '/assets/images/raverr-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/6iJapG6nvETBPhSP2aDapz',
    soundcloudUrl: 'https://soundcloud.com/jstnurmind/sets/raverr',
    bandcampUrl: 'https://jstnurmind.bandcamp.com/album/raverr',
    smartLinkUrl: 'https://tr.ee/FahSYwUITs',
  },
  {
    id: 'too-good-like-way',
    title: 'Too Good (Like Way)',
    releaseDate: '2024-12-03',
    artwork: '/assets/images/too-good-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/5gs76qgIMsAkXysnI13s8V',
    appleMusicUrl: 'https://music.apple.com/za/album/too-good-like-way-single/1780507089',
    youtubeUrl: 'https://www.youtube.com/playlist?list=OLAK5uy_l3WjWb0zVDQVTE0xb5w7ARwlJ55KQPyAw',
    youtubeMusicUrl: 'https://music.youtube.com/playlist?list=OLAK5uy_k0qSi57mMZe-TOsDrTgG6PlmwZ4fHZsWI',
    smartLinkUrl: 'https://tr.ee/BuGPJ0v1gw',
  },
  {
    id: 'we-are-so-back',
    title: 'We Are So Back',
    releaseDate: '2024-11-05',
    artwork: '/assets/images/we-are-so-back-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/4ZGWHH8JGNVtvFWspvbQ5I',
    youtubeUrl: 'https://youtu.be/F4oMo7g7AWc',
    youtubeMusicUrl: 'https://music.youtube.com/playlist?list=OLAK5uy_nXgQfOaI8Gxv-RlY-8qMeZO1s9tqh4LE8',
    soundcloudUrl: 'https://soundcloud.com/jstnurmind/sets/we-are-so-back',
    bandcampUrl: 'https://jstnurmind.bandcamp.com/album/we-are-so-back',
    smartLinkUrl: 'https://tr.ee/oPhlmyT_8b',
  },
  {
    id: 'we-are-so-fucking-back',
    title: 'We Are So Fucking Back',
    releaseDate: '2024-10-16',
    artwork: '/assets/images/we-are-so-fucking-back-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/track/3S3VmKr4tqroHaSj2n0XTp',
    youtubeUrl: 'https://youtu.be/OsfyMwuPfk0',
    youtubeMusicUrl: 'https://music.youtube.com/watch?v=OsfyMwuPfk0',
    bandcampUrl: 'https://jstnurmind.bandcamp.com/track/we-are-so-fucking-back',
    smartLinkUrl: 'https://tr.ee/WxJ73FwKsi',
  },
  {
    id: 'is-it-lust-or-more-than-that',
    title: 'Is It Lust or More Than That?',
    releaseDate: '2023-06-15',
    artwork: '/assets/images/is-it-lust-or-more-than-that-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/4zpXYiUDylXpg3ds4Xw6bp',
    smartLinkUrl: 'https://tr.ee/kV30mfH6G1',
  },
  {
    id: 'find-me-you-already',
    title: 'Find Me (You Already)',
    releaseDate: '2023-03-17',
    artwork: '/assets/images/find-me-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/42Jp4EjCphlJQdPwuxi2Yz',
    smartLinkUrl: 'https://tr.ee/rDjsMYAM3q',
  },
  {
    id: 'suddenly',
    title: 'Suddenly',
    releaseDate: '2022-07-08',
    artwork: '/assets/images/suddenly-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/770kZKHSY0Ms5AWIqJNeGd',
    smartLinkUrl: 'https://tr.ee/fkQwVah6Wx',
  },
  {
    id: 'u-move',
    title: 'U Move',
    releaseDate: '2022-02-22',
    artwork: '/assets/images/u-move-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/1kDnXsOYd1J3wlfOqKltyi',
    smartLinkUrl: 'https://tr.ee/1n7zI5pjIY',
  },
  {
    id: 'there-is-a-rhythm',
    title: 'There Is A Rhythm',
    releaseDate: '2021-06-19',
    artwork: '/assets/images/there-is-rhythm-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/60fJPkRCwt5kjp5BOa9aVx',
    smartLinkUrl: 'https://tr.ee/fnLC4SS_x_',
  },
  {
    id: 'you-make-me-wanna',
    title: 'You Make Me Wanna... (cover)',
    releaseDate: '2021-02-01',
    artwork: '/assets/images/you-make-me-wanna-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/7f583cWx9JKFwZ0RaVBRln',
    smartLinkUrl: 'https://tr.ee/laqTTtSnyI',
  },
  {
    id: 'determined-by-clouds',
    title: 'Determined by Clouds',
    releaseDate: '2020-04-24',
    artwork: '/assets/images/determined-by-clouds-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/4s9ZnPSdfCqsp6W1YZ9pWe',
    smartLinkUrl: 'https://tr.ee/n-f8f-K1mE',
  },
  {
    id: 'childish-dreams',
    title: 'Childish Dreams',
    releaseDate: '2019-12-06',
    artwork: '/assets/images/childish-dreams-jstnurmind-album-cover.webp',
    spotifyUrl: 'https://open.spotify.com/album/1O7B0CGFHvQyLVq0ROzTCQ',
    appleMusicUrl: 'https://music.apple.com/gb/album/childish-dreams-ep/1489565984',
    youtubeUrl: 'https://www.youtube.com/playlist?list=OLAK5uy_kiL-sRKSUtrsaVjfPMlVl4fbk28TM7PYA',
    youtubeMusicUrl: 'https://music.youtube.com/playlist?list=OLAK5uy_mZ3j3xELNZjw-6A_Qy7xQ6UhZTaeTT47Y',
    smartLinkUrl: 'https://tr.ee/Gn8DmP5COD',
  },
];

// Homepage "Selected Music", in display order. Chosen by the artist; never derived from release dates.
export const featuredReleaseIds = ['raverr-pack-2', 'too-good-like-way', 'we-are-so-fucking-back'];

// Homepage "Featured On": third-party channels that have published JSTNURMIND tracks.
export const features = [
  {
    id: 'eelf-step-to-me',
    channel: 'EELF',
    channelUrl: 'https://www.youtube.com/@EELFtrax',
    title: 'Step To Me (Vocal Version)',
    youtubeId: 'W5I7fYW3ACA',
    // Track appears on this release (verified against the Spotify tracklist).
    releaseId: 'raverr-pack-2',
  },
  {
    id: 'houz-suddenly',
    channel: 'HOUZ',
    channelUrl: 'https://www.youtube.com/@HOUZMUSIC',
    title: 'Suddenly',
    youtubeId: 'GXx1dSkFE0I',
    releaseId: 'suddenly',
  },
];

// Recurring radio shows. Episodes newest first.
export const residencies = [
  {
    id: 'shared-frequencies-season-11',
    station: 'Shared Frequencies Radio',
    season: 'Season 11',
    name: 'Real Magic',
    period: 'Jan – May 2025',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLegt56zc9D_5H4BIZMCxaUxT3-KdSlIA-',
    episodes: [
      { date: '2025-05', youtubeId: '6PQVCzU1PQc' },
      { date: '2025-04', youtubeId: 'yeeeNCJyHhg' },
      { date: '2025-03', youtubeId: 'SVYHU5vylLk' },
      { date: '2025-02', youtubeId: 'f4kIIQGoBVI' },
      { date: '2025-01', youtubeId: 'iN12R01ZKJA' },
    ],
  },
  {
    id: 'shared-frequencies-season-9',
    station: 'Shared Frequencies Radio',
    season: 'Season 9',
    name: 'Otherworld',
    period: 'Jul – Nov 2023',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLegt56zc9D_7tDTHwRUITsYV3r7nJCyK4',
    episodes: [
      { date: '2023-11', youtubeId: 'l5MXveufKqU' },
      { date: '2023-10', youtubeId: 'C8iDvQ6mb2k' },
      { date: '2023-09', youtubeId: '4yILegstyd0' },
      { date: '2023-08', youtubeId: 'wgljaHoLokI' },
      { date: '2023-07', youtubeId: 'BfKixLN--nA' },
    ],
  },
];

// Live performances, newest first. Entries dated after the build date render as upcoming.
// `featured` controls the homepage selection; everything appears in /live/.
export const appearances = [
  {
    id: 'nightmarket-atx-dj-spotlight',
    title: 'DJ Spotlight',
    venue: 'NIGHTMARKET.ATX',
    city: 'Austin, TX',
    date: '2026-01-23',
    poster: {
      src: '/assets/images/jstnurmind-nightmarket-atx-dj-spotlight.webp',
      width: 600,
      height: 800,
      alt: 'NIGHTMARKET.ATX DJ Spotlight poster featuring JSTNURMIND',
    },
  },
  {
    id: 'valhalla-tavern-live',
    title: 'Live at Valhalla Tavern',
    venue: 'Valhalla Tavern',
    city: 'Austin, TX',
    date: '2026-01-15',
    youtubeId: '-cOfUbndHRo',
    featured: true,
  },
  {
    id: 'kingdom-open-decks',
    title: 'Open Decks Night',
    venue: 'Kingdom',
    city: 'Austin, TX',
    date: '2025-11-05',
    youtubeId: 'l_l-Fp1odV4',
    featured: true,
  },
  {
    id: 'dadalab-open-decks',
    title: 'Open Decks Night',
    venue: 'Dadalab',
    city: 'Austin, TX',
    date: '2025-10-30',
    youtubeId: 'pUA7d2FDPzY',
    featured: true,
  },
];
