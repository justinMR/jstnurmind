// Generates the static pages from data/content.mjs. No dependencies; run with `npm run build:html`.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  site,
  listenLinks,
  followLinks,
  releases,
  featuredReleaseIds,
  features,
  residencies,
  appearances,
} from '../data/content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);
const year = today.slice(0, 4);

// ---------- helpers ----------

const esc = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const html = (strings, ...values) =>
  strings.reduce((out, str, i) => {
    const value = values[i - 1];
    return out + (Array.isArray(value) ? value.join('') : value ?? '') + str;
  });

const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d || 1));
  const options = d
    ? { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', year: 'numeric', timeZone: 'UTC' };
  return date.toLocaleDateString('en-US', options);
};

const formatMonth = (iso) => {
  const [y, m] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const time = (iso) => html`<time datetime="${iso}">${formatDate(iso)}</time>`;

const ext = (url, label, className = 'text-link', context = '') =>
  html`<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener">${label}${context ? html`<span class="visually-hidden">: ${esc(context)}</span>` : ''}<span class="visually-hidden"> (opens in a new tab)</span></a>`;

const arrow = html`<span aria-hidden="true"> ↗</span>`;

// Escaped title with any trailing parenthetical set in italics: "Too Good <em>(Like Way)</em>".
const releaseTitle = (title) => esc(title).replace(/\(([^)]+)\)$/, '<em>($1)</em>');

const youtubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/sddefault.jpg`;

const releaseById = Object.fromEntries(releases.map((r) => [r.id, r]));

const platformFields = [
  ['appleMusicUrl', 'Apple Music'],
  ['youtubeUrl', 'YouTube'],
  ['youtubeMusicUrl', 'YouTube Music'],
  ['bandcampUrl', 'Bandcamp'],
  ['soundcloudUrl', 'SoundCloud'],
];

const isUpcoming = (appearance) => appearance.date > today;

const appearanceHeading = (a) => (a.title.includes(a.venue) ? a.title : `${a.title} — ${a.venue}`);

// Display version of the heading with an italic "at": "Open Decks Night <em>at</em> Kingdom".
const appearanceTitle = (a) =>
  a.title.includes(a.venue)
    ? esc(a.title).replace(' at ', ' <em>at</em> ')
    : html`${esc(a.title)} <em>at</em> ${esc(a.venue)}`;

// "Just In Your Mind" → "just - in - your - mind"
const spokenName = site.pronunciation.toLowerCase().split(/\s+/).join(' - ');

// ---------- components ----------

const faviconPath = (await readFile(join(root, 'favicon.svg'), 'utf8')).match(/<path[^>]*\sd="([^"]+)"/)[1];
const maskMark = html`<svg class="mask-mark" viewBox="-11.5 0 1115 1115" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="${faviconPath}"/></svg>`;

const navItems = [
  ['Music', '/#music'],
  ['Live', '/#live'],
  ['About', '/#about'],
  ['Contact', '/#contact'],
];

// The homepage hero carries the full wordmark, so its header shows the mask alone.
const siteHeader = ({ wordmark = true } = {}) => html`
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="wordmark" href="/" aria-label="JSTNURMIND — home">${maskMark}${wordmark ? html`<span aria-hidden="true">JSTNURMIND</span>` : ''}</a>
      <div class="site-header__actions">
      <nav class="site-nav" aria-label="Primary">
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
          <span class="nav-toggle__bars" aria-hidden="true"></span><span class="nav-toggle__label">Menu</span>
        </button>
        <ul class="nav-list" id="primary-nav">
          ${navItems.map(([label, href]) => html`<li><a href="${href}">${label}</a></li>`)}
        </ul>
      </nav>
      <button class="icon-button theme-toggle" type="button" aria-pressed="false" aria-label="Dark theme" title="Toggle dark theme">
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>
      </button>
      </div>
    </div>
  </header>`;

// Section heading row: display title plus an optional "more" link on the right.
const sectionHead = ({ id, title, more }) => html`
  <div class="section-head">
    <h2 class="section-title" id="${id}-title">${title}</h2>
    ${more ? html`<a class="more-link" href="${more.href}">${more.label} <span aria-hidden="true">→</span></a>` : ''}
  </div>`;

const hero = () => html`
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <h1 class="hero__title" id="hero-title">JSTNURMIND</h1>
      <figure class="hero__media">
        <img src="${site.portrait.src}" width="${site.portrait.width}" height="${site.portrait.height}"
          alt="${esc(site.portrait.alt)}" fetchpriority="high" decoding="async">
      </figure>
      <div class="hero__text">
        <p class="pronunciation"><span class="pronunciation__label">Pronunciation</span> <span class="pronunciation__value">${esc(spokenName)}</span></p>
        <p class="hero__lede">${esc(site.description)}</p>
        <div class="hero__actions">
          ${ext(listenLinks[0].url, 'Listen on Spotify', 'button button--primary')}
          <a class="button button--outline hero__secondary" href="#music">Selected music <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </div>
  </section>`;

// Decorative and duplicated for a seamless loop, so hidden from assistive tech; the genres are in the page metadata.
// The track slides by exactly one run, so each run must be wider than the viewport or a gap opens at the end of
// every cycle. Three passes of the genres (~3300px at desktop size) covers screens up to that width.
const genreBanner = () => {
  const passes = Array.from({ length: 3 }, () => site.bannerGenres).flat();
  const run = html`<span class="marquee__run">${passes.map((g) => html`${esc(g)} <span class="marquee__sep">×</span> `)}</span>`;
  return html`
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">${run}${run}</div>
  </div>`;
};

// variant: 'lead' and 'row' on the homepage, 'grid' on /music/.
const releaseCard = (release, { variant = 'grid', headingTag = 'h3' } = {}) => {
  const primaryUrl = release.spotifyUrl || release.smartLinkUrl;
  const newTabNote = release.spotifyUrl ? ' (opens Spotify in a new tab)' : ' (opens in a new tab)';
  const links = [
    ...(release.spotifyUrl ? [ext(release.spotifyUrl, html`Spotify${arrow}`, 'release__primary', release.title)] : []),
    ...(variant === 'grid'
      ? release.smartLinkUrl
        ? [ext(release.smartLinkUrl, 'Other platforms', '', release.title)]
        : []
      : platformFields.filter(([key]) => release[key]).map(([key, label]) => ext(release[key], label, '', release.title))),
  ];

  return html`
    <article class="release release--${variant}">
      <a class="release__art" href="${esc(primaryUrl)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        <img src="${release.artwork}" width="800" height="800" alt="" ${variant === 'lead' ? '' : 'loading="lazy"'} decoding="async">
      </a>
      <div class="release__body">
        ${release.releaseDate ? html`<p class="release__date">${time(release.releaseDate)}</p>` : ''}
        <${headingTag} class="release__title"><a href="${esc(primaryUrl)}" target="_blank" rel="noopener">${releaseTitle(release.title)}<span class="visually-hidden">${newTabNote}</span></a></${headingTag}>
        ${links.length ? html`<ul class="release__links">${links.map((l) => html`<li>${l}</li>`)}</ul>` : ''}
      </div>
    </article>`;
};

// One row of a listing: date or label, display title, optional trailing link.
const listRow = ({ label, title, link = '', headingTag = 'h3' }) => html`
  <li class="list-row">
    <p class="list-row__label">${label}</p>
    <${headingTag} class="list-row__title">${title}</${headingTag}>
    <div class="list-row__link">${link}</div>
  </li>`;

// Label logo (linking to the channel), then the featured track and a link to the feature video.
const featureCard = (f) => html`
  <li class="feature">
    <a class="feature__logo" href="${esc(f.channelUrl)}" target="_blank" rel="noopener">
      ${f.logo
        ? html`<img class="${f.logo.mono ? 'feature__logo-img feature__logo-img--mono' : 'feature__logo-img'}" src="${f.logo.src}" width="${f.logo.width}" height="${f.logo.height}" alt="${esc(f.channel)}" loading="lazy" decoding="async">`
        : html`<span class="feature__logo-text">${esc(f.channel)}</span>`}
      <span class="visually-hidden"> on YouTube (opens in a new tab)</span>
    </a>
    <h4 class="feature__title">${releaseTitle(f.title)}</h4>
    <p class="feature__link">${ext(youtubeWatchUrl(f.youtubeId), html`Watch the feature${arrow}`, '', `${f.title} on ${f.channel}`)}</p>
  </li>`;

const selectedReleases = () => {
  const [lead, ...rest] = featuredReleaseIds.map((id) => {
    const release = releaseById[id];
    if (!release) throw new Error(`featuredReleaseIds references unknown release "${id}"`);
    return release;
  });
  return html`
  <section class="section" id="music" aria-labelledby="music-title">
    <div class="container">
      ${sectionHead({ id: 'music', title: 'Selected <em>music</em>', more: { href: '/music/', label: `All ${releases.length} releases` } })}
      <div class="featured-releases">
        ${releaseCard(lead, { variant: 'lead' })}
        <div class="featured-releases__side">${rest.map((r) => releaseCard(r, { variant: 'row' }))}</div>
      </div>
      ${features.length
        ? html`
      <div class="subsection">
        <h3 class="subsection-label">Featured on</h3>
        <ul class="features">${features.map(featureCard)}</ul>
      </div>`
        : ''}
    </div>
  </section>`;
};

const appearanceRow = (a, { headingTag = 'h3' } = {}) => {
  const heading = appearanceHeading(a);
  const link = a.youtubeId
    ? ext(youtubeWatchUrl(a.youtubeId), html`Watch${arrow}`, '', heading)
    : a.ticketUrl
      ? ext(a.ticketUrl, html`Tickets${arrow}`, '', heading)
      : '';
  return listRow({
    label: html`${isUpcoming(a) ? 'Upcoming · ' : ''}${time(a.date)}`,
    title: appearanceTitle(a),
    link,
    headingTag,
  });
};

const residencyRow = (r) =>
  listRow({
    label: `${r.episodes[0].date.slice(0, 4)} · ${esc(r.season.replace('Season ', 'S'))}`,
    title: html`${esc(r.name)} <em>— ${esc(r.station.replace(/ Radio$/, ''))} residency</em>`,
    link: ext(r.playlistUrl, html`Season${arrow}`, '', `${r.name}, ${r.station} ${r.season}`),
  });

const liveSection = () => {
  const upcoming = appearances.filter(isUpcoming).reverse();
  const recent = appearances.filter((a) => !isUpcoming(a)).slice(0, 4);
  const posterSet = appearances.find((a) => a.poster);
  return html`
  <section class="section section--ruled" id="live" aria-labelledby="live-title">
    <div class="container">
      ${sectionHead({ id: 'live', title: 'Live <em>&amp;</em> on air', more: { href: '/live/', label: 'Full archive' } })}
      <div class="live">
        <ul class="list live__list">
          ${upcoming.map((a) => appearanceRow(a))}
          ${recent.map((a) => appearanceRow(a))}
          ${residencies.map(residencyRow)}
        </ul>
        ${posterSet
          ? html`
        <figure class="live__poster">
          <img src="${posterSet.poster.src}" width="${posterSet.poster.width}" height="${posterSet.poster.height}" alt="${esc(posterSet.poster.alt)}" loading="lazy" decoding="async">
          <figcaption>${esc(posterSet.venue)} — ${formatMonth(posterSet.date)}</figcaption>
        </figure>`
          : ''}
      </div>
    </div>
  </section>`;
};

const about = () => html`
  <section class="section section--ruled about" id="about" aria-labelledby="about-title">
    <div class="container about__inner">
      <figure class="about__media">
        <img src="${site.maskImage.src}" width="${site.maskImage.width}" height="${site.maskImage.height}"
          alt="${esc(site.maskImage.alt)}" loading="lazy" decoding="async">
      </figure>
      <div class="about__text">
        <h2 class="subsection-label" id="about-title">About<span class="visually-hidden"> JSTNURMIND</span></h2>
        <p class="about__quote">${esc(site.pullQuote)}</p>
        <p class="body-large">${esc(site.bio[0])}</p>
        <dl class="facts">
          <div><dt>From</dt><dd>New York City</dd></div>
          <div><dt>Based in</dt><dd>${esc(site.location.city)}, Texas</dd></div>
          <div><dt>Practice</dt><dd>Producer / DJ</dd></div>
        </dl>
      </div>
    </div>
  </section>`;

const contact = () => html`
  <section class="section section--ruled" id="contact" aria-labelledby="contact-title">
    <div class="container contact">
      <div class="contact__intro">
        <h2 class="section-title" id="contact-title">Contact</h2>
        <p class="body-large">For bookings, collaborations, features, and other inquiries.</p>
      </div>
      <form class="contact-form" action="${site.contact.formspreeEndpoint}" method="POST" data-contact-form>
        <input type="hidden" name="_subject" value="New inquiry from jstnurmind.com">
        <div class="field">
          <label for="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" autocomplete="name" required maxlength="120">
        </div>
        <div class="field">
          <label for="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="200">
        </div>
        <div class="field field--full">
          <label for="contact-type">Inquiry type</label>
          <select id="contact-type" name="inquiry_type" required>
            <option value="" disabled selected>Select one</option>
            ${site.contact.inquiryTypes.map((t) => html`<option>${esc(t)}</option>`)}
          </select>
        </div>
        <div class="field field--full">
          <label for="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows="6" required maxlength="5000"></textarea>
        </div>
        <div class="field--trap" aria-hidden="true">
          <label for="contact-gotcha">Leave this field empty</label>
          <input id="contact-gotcha" type="text" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>
        <div class="contact-form__footer field--full">
          <button class="button button--primary" type="submit">Send message</button>
          <p class="form-status" role="status" aria-live="polite" data-form-status></p>
        </div>
      </form>
    </div>
  </section>`;

const siteFooter = () => html`
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <a class="site-footer__wordmark" href="/">JSTNURMIND</a>
      <nav aria-label="Listen and follow">
        <ul class="footer-links">${[...listenLinks, ...followLinks].map((l) => html`<li>${ext(l.url, esc(l.label), 'footer-link')}</li>`)}</ul>
      </nav>
      <nav aria-label="Site">
        <ul class="footer-links footer-links--site">
          <li><a class="footer-link" href="/music/">All releases</a></li>
          <li><a class="footer-link" href="/live/">Live &amp; radio archive</a></li>
          <li><a class="footer-link" href="/#contact">Contact</a></li>
        </ul>
      </nav>
      <p class="site-footer__legal">© ${year} JSTNURMIND · New York roots, based in Austin, TX</p>
    </div>
  </footer>`;

// ---------- structured data ----------

const artistNode = () => ({
  '@type': ['Person', 'MusicGroup'],
  '@id': `${site.url}/#artist`,
  name: site.name,
  alternateName: site.alternateNames,
  description: site.description,
  image: site.url + site.portrait.src,
  genre: site.genres,
  foundingLocation: { '@type': 'Place', name: site.origin },
  address: { '@type': 'PostalAddress', addressLocality: site.location.city, addressRegion: site.location.region },
  url: site.url,
  sameAs: [...listenLinks, ...followLinks].map((l) => l.url),
});

const albumNodes = () =>
  releases.map((r) => ({
    '@type': 'MusicAlbum',
    name: r.title,
    datePublished: r.releaseDate,
    url: r.spotifyUrl || r.smartLinkUrl,
    sameAs: platformFields.map(([key]) => r[key]).filter(Boolean),
    image: site.url + r.artwork,
    byArtist: { '@id': `${site.url}/#artist` },
  }));

const eventNodes = () =>
  appearances.map((a) => ({
    '@type': 'MusicEvent',
    name: `JSTNURMIND — ${appearanceHeading(a)}`,
    startDate: a.date,
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: a.venue,
      address: { '@type': 'PostalAddress', addressLocality: site.location.city, addressRegion: site.location.region },
    },
    ...(a.youtubeId ? { url: youtubeWatchUrl(a.youtubeId) } : {}),
    ...(a.poster ? { image: site.url + a.poster.src } : {}),
    performer: { '@id': `${site.url}/#artist` },
  }));

const residencyNodes = () =>
  residencies.map((r) => ({
    '@type': 'CreativeWorkSeries',
    name: `${r.name} — ${r.station} ${r.season}`,
    url: r.playlistUrl,
    startDate: r.episodes.at(-1).date,
    endDate: r.episodes[0].date,
    creator: { '@id': `${site.url}/#artist` },
  }));

const jsonLd = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}</script>`;

// ---------- layout ----------

const layout = ({ path, title, description, body, graph, preloadImage, headerWordmark = true }) => {
  const url = site.url + path;
  return html`<!DOCTYPE html>
<!-- Generated by scripts/build.mjs from data/content.mjs. Edit those files, not this one. -->
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#101010" media="(max-width: 47.99rem)">
  <meta name="theme-color" content="#df0000">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="JSTNURMIND">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <!-- share image (1:1); X uses the 16:9 twitter:image below -->
  <meta property="og:image" content="${site.url}${site.shareImage.square}">
  <meta property="og:image:width" content="${site.shareImage.squareSize}">
  <meta property="og:image:height" content="${site.shareImage.squareSize}">
  <meta property="og:image:alt" content="JSTNURMIND in the red faceted mask">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@jstnurmind">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.url}${site.shareImage.wide}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" as="font" type="font/ttf" href="/assets/fonts/Instrument_Serif/InstrumentSerif-Regular.ttf" crossorigin>
  ${preloadImage ? html`<link rel="preload" as="image" href="${preloadImage}" fetchpriority="high">` : ''}
  <script>(()=>{const d=document.documentElement;d.classList.add('js');let t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='dark'||t==='light')d.dataset.theme=t})()</script>
  <link rel="stylesheet" href="/styles.css">
  <script defer src="/index.js"></script>
  ${jsonLd(graph)}
</head>

<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${siteHeader({ wordmark: headerWordmark })}
  <main id="main">
    ${body}
  </main>
  ${siteFooter()}
</body>

</html>
`;
};

// ---------- pages ----------

const homePage = () =>
  layout({
    path: '/',
    title: 'JSTNURMIND | Electronic Music Producer & DJ | Austin, TX',
    description:
      'Discover JSTNURMIND, a masked electronic music producer and DJ from New York City, based in Austin, Texas. Explore music, live sets, and releases.',
    preloadImage: site.portrait.src,
    headerWordmark: false,
    graph: [
      { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name },
      artistNode(),
      ...albumNodes(),
      ...eventNodes(),
      ...residencyNodes(),
    ],
    body: [hero(), genreBanner(), selectedReleases(), liveSection(), about(), contact()].join(''),
  });

const pageIntro = ({ title, intro }) => html`
  <section class="page-intro">
    <div class="container">
      <h1 class="section-title">${title}</h1>
      ${intro ? html`<p class="body-large">${esc(intro)}</p>` : ''}
    </div>
  </section>`;

const videoEmbed = ({ youtubeId, title }) => html`
  <div class="video" data-youtube-id="${esc(youtubeId)}" data-title="${esc(title)}">
    <a class="video__trigger" href="${youtubeWatchUrl(youtubeId)}" target="_blank" rel="noopener">
      <img src="${youtubeThumb(youtubeId)}" width="640" height="480" alt="" loading="lazy" decoding="async"
        onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${esc(youtubeId)}/hqdefault.jpg'">
      <span class="video__play" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span>
      <span class="visually-hidden">Play “${esc(title)}”</span>
    </a>
  </div>`;

// Archive card on /live/: video (or poster), date, title, link.
const mediaCard = ({ media, label, title, link = '', headingTag = 'h3' }) => html`
  <article class="media-card">
    ${media}
    <div class="media-card__body">
      <p class="media-card__label">${label}</p>
      <${headingTag} class="media-card__title">${title}</${headingTag}>
      ${link ? html`<p class="media-card__link">${link}</p>` : ''}
    </div>
  </article>`;

const appearanceCard = (a) => {
  const heading = appearanceHeading(a);
  return mediaCard({
    media: a.youtubeId
      ? videoEmbed({ youtubeId: a.youtubeId, title: `JSTNURMIND — ${heading}, ${a.city}` })
      : a.poster
        ? html`<div class="poster"><img src="${a.poster.src}" width="${a.poster.width}" height="${a.poster.height}" alt="${esc(a.poster.alt)}" loading="lazy" decoding="async"></div>`
        : '',
    label: html`${isUpcoming(a) ? 'Upcoming · ' : ''}${time(a.date)} · ${esc(a.city)}`,
    title: appearanceTitle(a),
    link: a.youtubeId
      ? ext(youtubeWatchUrl(a.youtubeId), html`Watch on YouTube${arrow}`, '', heading)
      : a.ticketUrl
        ? ext(a.ticketUrl, html`Tickets${arrow}`, '', heading)
        : '',
  });
};

const musicPage = () =>
  layout({
    path: '/music/',
    title: 'Discography | JSTNURMIND',
    description: `Every JSTNURMIND release, from ${releases.at(-1).title} to ${releases[0].title}. Stream on Spotify and other platforms.`,
    graph: [artistNode(), ...albumNodes()],
    body: html`
    ${pageIntro({ title: 'Discography', intro: 'Every JSTNURMIND release, newest first.' })}
    <section class="section section--tight" aria-label="All releases">
      <div class="container">
        <div class="release-grid">
          ${releases.map((r) => releaseCard(r, { variant: 'grid', headingTag: 'h2' }))}
        </div>
      </div>
    </section>`,
  });

const livePage = () => {
  const upcoming = appearances.filter(isUpcoming).reverse();
  const past = appearances.filter((a) => !isUpcoming(a));
  return layout({
    path: '/live/',
    title: 'Live & Radio Archive | JSTNURMIND',
    description:
      'Live DJ sets and radio appearances by JSTNURMIND in Austin, Texas, including the Shared Frequencies Radio residencies Otherworld and Real Magic.',
    graph: [artistNode(), ...eventNodes(), ...residencyNodes()],
    body: html`
    ${pageIntro({ title: 'Live <em>&amp;</em> on air', intro: 'Live sets and radio appearances, newest first.' })}
    ${upcoming.length
      ? html`
    <section class="section section--tight" aria-labelledby="upcoming-title">
      <div class="container">
        <h2 class="archive-title" id="upcoming-title">Upcoming</h2>
        <ul class="list">${upcoming.map((a) => appearanceRow(a))}</ul>
      </div>
    </section>`
      : ''}
    <section class="section section--tight" aria-labelledby="sets-title">
      <div class="container">
        <h2 class="archive-title" id="sets-title">Live sets</h2>
        <div class="media-grid">${past.map(appearanceCard)}</div>
      </div>
    </section>
    ${residencies.map(
      (r) => html`
    <section class="section section--tight section--ruled" aria-labelledby="${r.id}-title">
      <div class="container">
        <div class="archive-header">
          <div>
            <p class="archive-header__label">${esc(r.station)} · ${esc(r.season)} · ${esc(r.period)}</p>
            <h2 class="archive-title" id="${r.id}-title">${esc(r.name)}</h2>
          </div>
          ${ext(r.playlistUrl, html`Full season playlist${arrow}`, 'more-link')}
        </div>
        <div class="media-grid">
          ${r.episodes.map((ep) =>
            mediaCard({
              media: videoEmbed({ youtubeId: ep.youtubeId, title: `JSTNURMIND — ${r.name}, ${r.station} ${r.season} (${formatDate(ep.date)})` }),
              label: esc(r.season),
              title: html`${esc(r.name)} <em>— ${formatDate(ep.date)}</em>`,
              link: ext(youtubeWatchUrl(ep.youtubeId), html`Watch on YouTube${arrow}`, '', `${r.name}, ${formatDate(ep.date)}`),
            }),
          )}
        </div>
      </div>
    </section>`,
    )}`,
  });
};

const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${site.url}/</loc>
    <lastmod>${today}</lastmod>
    <image:image><image:loc>${site.url}${site.portrait.src}</image:loc></image:image>
    <image:image><image:loc>${site.url}${site.maskImage.src}</image:loc></image:image>
  </url>
  <url>
    <loc>${site.url}/music/</loc>
    <lastmod>${today}</lastmod>
${releases.map((r) => `    <image:image><image:loc>${site.url}${r.artwork}</image:loc></image:image>`).join('\n')}
  </url>
  <url>
    <loc>${site.url}/live/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`;

const llms = () => `# JSTNURMIND

> JSTNURMIND (pronounced "${site.pronunciation}") is a masked producer and DJ, originally from New York City and based in Austin, Texas. His music moves between alternative hip-hop, house, techno, and other corners of underground electronic music.

Official website: ${site.url}

- [Discography](${site.url}/music/)
- [Live & radio archive](${site.url}/live/)
- [Contact](${site.url}/#contact)

## Listen and follow

${[...listenLinks, ...followLinks].map((l) => `- [${l.label}](${l.url})`).join('\n')}

## Selected music

${featuredReleaseIds.map((id) => `- [${releaseById[id].title}](${releaseById[id].spotifyUrl})`).join('\n')}

## Featured on

${features.map((f) => `- [JSTNURMIND — ${f.title}](${youtubeWatchUrl(f.youtubeId)}), featured by [${f.channel}](${f.channelUrl})`).join('\n')}

## Discography

${releases.map((r) => `- [${r.title}](${r.spotifyUrl || r.smartLinkUrl}) (${formatDate(r.releaseDate)})`).join('\n')}

## Radio residencies

${residencies
  .map(
    (r) =>
      `- [${r.name}, ${r.station} ${r.season}](${r.playlistUrl}) (${r.period}): ${r.episodes
        .map((ep) => `[${formatDate(ep.date)}](${youtubeWatchUrl(ep.youtubeId)})`)
        .join(', ')}`,
  )
  .join('\n')}

## Live appearances

${appearances
  .map((a) => {
    const label = `${appearanceHeading(a)}, ${a.city}`;
    return `- ${a.youtubeId ? `[${label}](${youtubeWatchUrl(a.youtubeId)})` : label} (${formatDate(a.date)})`;
  })
  .join('\n')}
`;

// ---------- write ----------

const outputs = {
  'index.html': homePage(),
  'music/index.html': musicPage(),
  'live/index.html': livePage(),
  'sitemap.xml': sitemap(),
  'llms.txt': llms(),
};

for (const [file, contents] of Object.entries(outputs)) {
  const target = join(root, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'));
  console.log(`wrote ${file}`);
}
