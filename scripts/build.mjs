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

const time = (iso) => html`<time datetime="${iso}">${formatDate(iso)}</time>`;

const arrow = '<span class="ext-icon" aria-hidden="true">↗</span>';

const ext = (url, label, className = 'text-link', context = '') =>
  html`<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${context ? html`<span class="visually-hidden">: ${esc(context)}</span>` : ''}${arrow}<span class="visually-hidden"> (opens in a new tab)</span></a>`;

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

// ---------- components ----------

const faviconPath = (await readFile(join(root, 'favicon.svg'), 'utf8')).match(/<path[^>]*\sd="([^"]+)"/)[1];
const maskMark = html`<svg class="mask-mark" viewBox="-11.5 0 1115 1115" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="${faviconPath}"/></svg>`;

const navItems = [
  ['Music', '/#music'],
  ['Live', '/#live'],
  ['About', '/#about'],
  ['Contact', '/#contact'],
];

const siteHeader = () => html`
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="wordmark" href="/" aria-label="JSTNURMIND — home">${maskMark}<span>JSTNURMIND</span></a>
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

const sectionHeader = ({ id, eyebrow, title, intro, headingTag = 'h2' }) => html`
  <div class="section-header">
    ${eyebrow ? html`<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <${headingTag} class="section-title"${id ? html` id="${id}-title"` : ''}>${esc(title)}</${headingTag}>
    ${intro ? html`<p class="section-intro">${esc(intro)}</p>` : ''}
  </div>`;

const hero = () => html`
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <div class="hero__text">
        <p class="eyebrow">New York roots / Austin, TX</p>
        <h1 class="hero__title" id="hero-title">JSTNURMIND</h1>
        <p class="hero__pronounce">Pronounced “${esc(site.pronunciation)}”</p>
        <p class="hero__lede">${esc(site.description)}</p>
        <div class="hero__actions">
          <a class="button button--primary" href="#music">Listen to the music</a>
        </div>
      </div>
      <figure class="hero__media">
        <img src="${site.heroImage.src}" width="${site.heroImage.width}" height="${site.heroImage.height}"
          alt="${esc(site.heroImage.alt)}" fetchpriority="high" decoding="async">
      </figure>
    </div>
  </section>`;

const labelStrip = (...parts) => html`<div class="label-strip">${parts}</div>`;

// Featured cards get a Spotify button plus every verified platform; archive cards stay compact.
const releaseCard = (release, { headingTag = 'h3', compact = false, lead = false } = {}) => {
  const primaryUrl = release.spotifyUrl || release.smartLinkUrl;
  const primaryLabel = release.spotifyUrl ? 'Listen on Spotify' : 'Listen';
  const primaryDestination = release.spotifyUrl ? 'Spotify' : 'streaming platforms';
  const extras = compact
    ? [
        ...(release.spotifyUrl ? [ext(release.spotifyUrl, 'Spotify', 'text-link text-link--primary', release.title)] : []),
        ...(release.smartLinkUrl ? [ext(release.smartLinkUrl, 'Other platforms', 'text-link', release.title)] : []),
      ]
    : platformFields.filter(([key]) => release[key]).map(([key, label]) => ext(release[key], label, 'text-link', release.title));
  const classes = ['release-card', compact && 'release-card--compact', lead && 'release-card--lead'].filter(Boolean).join(' ');

  return html`
    <article class="${classes}">
      <a class="release-card__art" href="${esc(primaryUrl)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        <img src="${release.artwork}" width="800" height="800" alt="${esc(release.title)} cover artwork" ${lead ? '' : 'loading="lazy"'} decoding="async">
      </a>
      <div class="release-card__body">
        <${headingTag} class="release-card__title"><a href="${esc(primaryUrl)}" target="_blank" rel="noopener">${esc(release.title)}<span class="visually-hidden"> — listen on ${primaryDestination} (opens in a new tab)</span></a></${headingTag}>
        ${compact
          ? ''
          : html`<div class="release-card__actions">${ext(primaryUrl, primaryLabel, 'button button--small', release.title)}</div>`}
        ${release.releaseDate || extras.length
          ? labelStrip(
              release.releaseDate ? html`<p class="meta">${time(release.releaseDate)}</p>` : '',
              extras.length ? html`<ul class="link-list">${extras.map((l) => html`<li>${l}</li>`)}</ul>` : '',
            )
          : ''}
      </div>
    </article>`;
};

const selectedReleases = () => {
  const selected = featuredReleaseIds.map((id) => {
    const release = releaseById[id];
    if (!release) throw new Error(`featuredReleaseIds references unknown release "${id}"`);
    return release;
  });
  return html`
  <section class="section" id="music" aria-labelledby="music-title">
    <div class="container">
      ${sectionHeader({ id: 'music', eyebrow: 'Music', title: 'Selected Music', intro: 'Explore different sides of the JSTNURMIND sound.' })}
      <div class="release-grid release-grid--featured">
        ${selected.map((r, i) => releaseCard(r, { lead: i === 0 }))}
      </div>
      <p class="section-more"><a class="text-link text-link--strong" href="/music/">All releases <span aria-hidden="true">→</span></a></p>
    </div>
  </section>`;
};

const videoEmbed = ({ youtubeId, title, eager = false }) => html`
  <div class="video" data-youtube-id="${esc(youtubeId)}" data-title="${esc(title)}">
    <a class="video__trigger" href="${youtubeWatchUrl(youtubeId)}" target="_blank" rel="noopener">
      <img src="${youtubeThumb(youtubeId)}" width="640" height="480" alt="" ${eager ? '' : 'loading="lazy"'} decoding="async"
        onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${esc(youtubeId)}/hqdefault.jpg'">
      <span class="video__play" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span>
      <span class="visually-hidden">Play “${esc(title)}”</span>
    </a>
  </div>`;

const featureCard = (feature) => {
  const release = feature.releaseId ? releaseById[feature.releaseId] : null;
  const fullTitle = `JSTNURMIND — ${feature.title}`;
  return html`
    <article class="media-card">
      ${videoEmbed({ youtubeId: feature.youtubeId, title: `${fullTitle} (${feature.channel})` })}
      <div class="media-card__body">
        <p class="eyebrow eyebrow--accent">${esc(feature.channel)}</p>
        <h3 class="media-card__title">${esc(feature.title)}</h3>
        ${labelStrip(
          html`<p class="meta">JSTNURMIND · Featured by ${ext(feature.channelUrl, feature.channel, 'text-link')}</p>`,
          html`<ul class="link-list">
          <li>${ext(youtubeWatchUrl(feature.youtubeId), 'Watch feature', 'text-link', feature.title)}</li>
          ${release?.spotifyUrl
            ? html`<li>${ext(
                release.spotifyUrl,
                release.title === feature.title ? 'Listen on Spotify' : `From ${release.title} on Spotify`,
                'text-link',
                feature.title,
              )}</li>`
            : ''}
        </ul>`,
        )}
      </div>
    </article>`;
};

const featuredOn = () => html`
  <section class="section" id="featured" aria-labelledby="featured-title">
    <div class="container">
      ${sectionHeader({ id: 'featured', eyebrow: 'Selected features', title: 'Featured On' })}
      <div class="media-grid media-grid--pair">
        ${features.map(featureCard)}
      </div>
    </div>
  </section>`;

const residencyCard = (residency, { headingTag = 'h4' } = {}) => {
  const latest = residency.episodes[0];
  return html`
    <article class="residency-card">
      <a class="residency-card__thumb" href="${esc(residency.playlistUrl)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        <img src="${youtubeThumb(latest.youtubeId)}" width="640" height="480" alt="" loading="lazy" decoding="async"
          onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${esc(latest.youtubeId)}/hqdefault.jpg'">
      </a>
      <div class="residency-card__body">
        <p class="eyebrow">${esc(residency.station)} · ${esc(residency.season)}</p>
        <${headingTag} class="media-card__title">${esc(residency.name)}</${headingTag}>
        ${labelStrip(
          html`<p class="meta">${esc(residency.period)} · ${residency.episodes.length} monthly episodes</p>`,
          html`<ul class="link-list">
          <li>${ext(residency.playlistUrl, 'Watch the full season', 'text-link', residency.name)}</li>
          <li>${ext(youtubeWatchUrl(latest.youtubeId), `Latest episode (${formatDate(latest.date)})`)}</li>
        </ul>`,
        )}
      </div>
    </article>`;
};

const appearanceCard = (a, { headingTag = 'h4' } = {}) => {
  const heading = appearanceHeading(a);
  return html`
    <article class="media-card media-card--compact">
      ${a.youtubeId
        ? videoEmbed({ youtubeId: a.youtubeId, title: `JSTNURMIND — ${heading}, ${a.city}` })
        : a.poster
          ? html`<div class="poster"><img src="${a.poster.src}" width="${a.poster.width}" height="${a.poster.height}" alt="${esc(a.poster.alt)}" loading="lazy" decoding="async"></div>`
          : ''}
      <div class="media-card__body">
        <p class="eyebrow">${isUpcoming(a) ? 'Upcoming · ' : ''}${esc(a.city)}</p>
        <${headingTag} class="media-card__title">${esc(heading)}</${headingTag}>
        ${labelStrip(
          html`<p class="meta">${time(a.date)}</p>`,
          a.youtubeId ? html`<ul class="link-list"><li>${ext(youtubeWatchUrl(a.youtubeId), 'Watch on YouTube', 'text-link', heading)}</li></ul>` : '',
          a.ticketUrl ? html`<ul class="link-list"><li>${ext(a.ticketUrl, 'Tickets')}</li></ul>` : '',
        )}
      </div>
    </article>`;
};

const liveSection = () => {
  const upcoming = appearances.filter(isUpcoming).reverse();
  const featuredSets = appearances.filter((a) => a.featured && !isUpcoming(a));
  return html`
  <section class="section" id="live" aria-labelledby="live-title">
    <div class="container">
      ${sectionHeader({ id: 'live', eyebrow: 'Live', title: 'Live & On Air' })}
      ${upcoming.length
        ? html`
      <div class="subsection">
        <h3 class="subsection-title">Upcoming</h3>
        <div class="media-grid media-grid--three">${upcoming.map((a) => appearanceCard(a))}</div>
      </div>`
        : ''}
      <div class="subsection">
        <h3 class="subsection-title">Radio residencies / Shared Frequencies</h3>
        <div class="media-grid media-grid--pair">${residencies.map((r) => residencyCard(r))}</div>
      </div>
      <div class="subsection">
        <h3 class="subsection-title">Selected live sets</h3>
        <div class="media-grid media-grid--three">${featuredSets.map((a) => appearanceCard(a))}</div>
      </div>
      <p class="section-more"><a class="text-link text-link--strong" href="/live/">Full live &amp; radio archive <span aria-hidden="true">→</span></a></p>
    </div>
  </section>`;
};

const about = () => html`
  <section class="section about-section" id="about" aria-labelledby="about-title">
    <div class="container about">
      <figure class="about__media">
        <img src="${site.portrait.src}" width="${site.portrait.width}" height="${site.portrait.height}"
          alt="${esc(site.portrait.alt)}" loading="lazy" decoding="async">
      </figure>
      <div class="about__text">
        ${sectionHeader({ id: 'about', eyebrow: 'About', title: 'About JSTNURMIND' })}
        ${site.bio.map((p) => html`<p class="body-large">${esc(p)}</p>`)}
        <dl class="facts">
          <div><dt>From</dt><dd>New York City</dd></div>
          <div><dt>Based in</dt><dd>${esc(site.location.city)}, Texas</dd></div>
          <div><dt>Practice</dt><dd>Producer / DJ</dd></div>
        </dl>
      </div>
    </div>
  </section>`;

const contact = () => html`
  <section class="section" id="contact" aria-labelledby="contact-title">
    <div class="container contact">
      <div class="contact__intro">
        ${sectionHeader({ id: 'contact', eyebrow: 'Contact', title: 'Get in Touch', intro: 'For bookings, collaborations, features, and other inquiries.' })}
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
      <div class="site-footer__brand">
        <a class="wordmark wordmark--large" href="/">${maskMark}<span>JSTNURMIND</span></a>
        <p class="site-footer__tagline">Producer and DJ. New York roots, based in Austin, TX.</p>
      </div>
      <nav class="site-footer__col" aria-label="Listen">
        <h2 class="footer-heading">Listen</h2>
        <ul>${listenLinks.map((l) => html`<li>${ext(l.url, l.label, 'footer-link')}</li>`)}</ul>
      </nav>
      <nav class="site-footer__col" aria-label="Follow">
        <h2 class="footer-heading">Follow</h2>
        <ul>${followLinks.map((l) => html`<li>${ext(l.url, l.label, 'footer-link')}</li>`)}</ul>
      </nav>
      <nav class="site-footer__col" aria-label="Site">
        <h2 class="footer-heading">Site</h2>
        <ul>
          <li><a class="footer-link" href="/music/">All releases</a></li>
          <li><a class="footer-link" href="/live/">Live &amp; radio archive</a></li>
          <li><a class="footer-link" href="/#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
    <div class="container site-footer__legal">
      <p>© ${year} JSTNURMIND. All rights reserved.</p>
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

const layout = ({ path, title, description, body, graph, preloadImage }) => {
  const url = site.url + path;
  return html`<!DOCTYPE html>
<!-- Generated by scripts/build.mjs from data/content.mjs. Edit those files, not this one. -->
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
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
  ${siteHeader()}
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
    preloadImage: site.heroImage.src,
    graph: [
      { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name },
      artistNode(),
      ...albumNodes(),
      ...eventNodes(),
      ...residencyNodes(),
    ],
    body: [hero(), selectedReleases(), featuredOn(), liveSection(), about(), contact()].join(''),
  });

const pageIntro = ({ eyebrow, title, intro }) => html`
  <section class="page-intro">
    <div class="container">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="page-title">${esc(title)}</h1>
      ${intro ? html`<p class="section-intro">${esc(intro)}</p>` : ''}
    </div>
  </section>`;

const musicPage = () =>
  layout({
    path: '/music/',
    title: 'Discography | JSTNURMIND',
    description: `Every JSTNURMIND release, from ${releases.at(-1).title} to ${releases[0].title}. Stream on Spotify and other platforms.`,
    graph: [artistNode(), ...albumNodes()],
    body: html`
    ${pageIntro({ eyebrow: 'Music', title: 'Discography', intro: 'Every JSTNURMIND release, newest first.' })}
    <section class="section section--tight" aria-label="All releases">
      <div class="container">
        <div class="release-grid release-grid--archive">
          ${releases.map((r) => releaseCard(r, { headingTag: 'h2', compact: true }))}
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
    ${pageIntro({ eyebrow: 'Live', title: 'Live & On Air', intro: 'Live sets and radio appearances, newest first.' })}
    ${upcoming.length
      ? html`
    <section class="section section--tight" aria-labelledby="upcoming-title">
      <div class="container">
        <h2 class="subsection-title" id="upcoming-title">Upcoming</h2>
        <div class="media-grid media-grid--three">${upcoming.map((a) => appearanceCard(a, { headingTag: 'h3' }))}</div>
      </div>
    </section>`
      : ''}
    <section class="section section--tight" aria-labelledby="sets-title">
      <div class="container">
        <h2 class="subsection-title" id="sets-title">Live sets</h2>
        <div class="media-grid media-grid--three">${past.map((a) => appearanceCard(a, { headingTag: 'h3' }))}</div>
      </div>
    </section>
    ${residencies.map(
      (r) => html`
    <section class="section section--tight" aria-labelledby="${r.id}-title">
      <div class="container">
        <div class="archive-header">
          <div>
            <p class="eyebrow">${esc(r.station)} · ${esc(r.season)} · ${esc(r.period)}</p>
            <h2 class="subsection-title" id="${r.id}-title">${esc(r.name)}</h2>
          </div>
          ${ext(r.playlistUrl, 'Full season playlist', 'text-link text-link--strong')}
        </div>
        <div class="media-grid media-grid--three">
          ${r.episodes.map(
            (ep) => html`
          <article class="media-card media-card--compact">
            ${videoEmbed({ youtubeId: ep.youtubeId, title: `JSTNURMIND — ${r.name}, ${r.station} ${r.season} (${formatDate(ep.date)})` })}
            <div class="media-card__body">
              <h3 class="media-card__title">${esc(r.name)} — ${formatDate(ep.date)}</h3>
              ${labelStrip(html`<ul class="link-list"><li>${ext(youtubeWatchUrl(ep.youtubeId), 'Watch on YouTube', 'text-link', `${r.name}, ${formatDate(ep.date)}`)}</li></ul>`)}
            </div>
          </article>`,
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
    <image:image><image:loc>${site.url}${site.heroImage.src}</image:loc></image:image>
    <image:image><image:loc>${site.url}${site.portrait.src}</image:loc></image:image>
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
