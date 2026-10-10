import { BlogPost, BlogAuthor } from './posts';

export const DEFAULT_AUTHOR_DE: BlogAuthor = {
  name: 'Naponi Gastronomie-Redaktion',
  role: 'Experten für bargeldlose Bezahlsysteme & Gastronomie-Fintech',
  avatar: '/naponi-brand.svg',
  bio: 'Das Naponi-Redaktionsteam unterstützt Gastronomen, Hoteliers und Serviceteams in Deutschland, Österreich und der Schweiz bei der Einführung moderner, steuerfreier Trinkgeldsysteme.',
};

export const BLOG_CATEGORIES_DE = [
  'Digitales Trinkgeld',
  'QR-Code Trinkgeld',
  'Gastronomie & Restaurants',
  'Cafés & Röstereien',
  'Hotellerie',
  'Mitarbeiter-Leitfaden',
  'Recht & Steuern (§ 3 Nr. 51 EStG)',
] as const;

export const BLOG_POSTS_DE: BlogPost[] = [
  {
    slug: 'digitales-trinkgeld-gastronomie-leitfaden',
    title: 'Digitales Trinkgeld für die Gastronomie: Der vollständige Leitfaden für Restaurants & Cafés (2026)',
    excerpt: 'Wie Restaurants, Cafés und Bars in Deutschland bargeldloses Trinkgeld per QR-Code einführen. Steuerfreiheit nach § 3 Nr. 51 EStG, Vergleich mit Kassenfunktionen und Praxistipps.',
    content: `
      <p class="lead">
        Immer mehr Gäste in Deutschland zahlen Restaurantrechnungen mit Karte, Apple Pay oder Smartphone. Das Problem für Servicemitarbeiter: Wo früher Kleingeld in die Schürze floss, sinken die Trinkgelder drastisch. <strong>Digitales Trinkgeld per QR-Code</strong> schließt diese Lücke direkt am Gasttisch – ohne Kassenbindung, ohne Terminal-Wartezeit und 100% steuerfrei.
      </p>

      <h2>Warum traditionelles Trinkgeld in Deutschland unter Druck steht</h2>
      <p>
        Der Trend zum bargeldlosen Bezahlen hat sich in den letzten Jahren rasant beschleunigt. Während Gäste vor wenigen Jahren die Rechnung aufrundeten („Stimmt so“), führt die reine Kartenzahlung am EC-Terminal häufig dazu, dass Trinkgeld vergessen oder aus Bequemlichkeit weggelassen wird.
      </p>
      <ul>
        <li><strong>Terminal-Zwang:</strong> Nicht jedes mobile Kartenterminal bietet eine intuitive Trinkgeldabfrage.</li>
        <li><strong>Hohe Abzüge:</strong> Läuft das Trinkgeld über das Abrechnungskonto des Inhabers, drohen steuerliche Risiken und Bankgebühren.</li>
        <li><strong>Mitarbeiterfluktuation:</strong> Fachkräfte im Service und in der Küche wandern ab, wenn das Netto-Einkommen durch fehlendes Trinkgeld schrumpft.</li>
      </ul>

      <h2>Die rechtliche Lage in Deutschland: 100% Steuerfreiheit nach § 3 Nr. 51 EStG</h2>
      <p>
        In Deutschland ist Trinkgeld für angestellte Arbeitnehmer grundsätzlich <strong>vollständig einkommensteuerfrei und sozialversicherungsfrei</strong> (§ 3 Nr. 51 des Einkommensteuergesetzes - EStG). Diese Befreiung gilt jedoch nur unter einer zentralen Bedingung:
      </p>
      <blockquote>
        „Trinkgelder sind steuerfrei, wenn sie anlässlich einer Arbeitsleistung dem Arbeitnehmer freiwillig und ohne Rechtsanspruch von Dritten zusätzlich zu dem Betrag gegeben werden, der für diese Arbeitsleistung zu zahlen ist.“
      </blockquote>
      <p>
        <strong>Entscheidender Vorteil von Naponi:</strong> Wenn Gäste Trinkgeld per persönlichem QR-Code oder Tischaufsteller direkt an den Kellner oder den Mitarbeiter-Pool senden, fließt das Geld rechtlich direkt von Gast (Dritter) zu Mitarbeiter. Der Gastronom wird nicht zum Treuhänder und vermeidet zeitraubende Lohnabrechnungskonstrukte.
      </p>

      <h2>Wie funktioniert das QR-Code Trinkgeldsystem am Tisch?</h2>
      <ol>
        <li><strong>Aufsteller am Tisch oder auf der Rechnung:</strong> Der Gast scannt den Naponi-QR-Code mit der normalen Smartphone-Kamera – ganz ohne App-Download.</li>
        <li><strong>Wunschbetrag wählen:</strong> Schnellauswahl mit einem Tipp (z. B. 10%, 15%, 20% oder freier Euro-Betrag).</li>
        <li><strong>Direkte Zahlung:</strong> Bezahlung in 6 Sekunden per Apple Pay, Google Pay oder Kreditkarte.</li>
        <li><strong>Sofortige Gutschrift:</strong> Das Trinkgeld landet direkt auf dem hinterlegten Konto der Servicekraft oder im gemeinsamen Trinkgeld-Pool.</li>
      </ol>

      <h2>Vorteile für Restaurantinhaber und Geschäftsführer</h2>
      <ul>
        <li><strong>Höhere Mitarbeiterzufriedenheit:</strong> Teams verzeichnen durch den einfachen Bezahlvorgang im Durchschnitt 30% bis 45% mehr Trinkgeldeinnahmen.</li>
        <li><strong>Keine Kassen- oder POS-Kosten:</strong> Keine teuren Software-Upgrades oder monatliche Lizenzgebühren für bestehende Kassensysteme nötig.</li>
        <li><strong>Transparenz & Fairness:</strong> Ob Einzelauszahlung für den jeweiligen Kellner oder automatischer Schicht-Pool für Küche und Service – alles ist digital nachvollziehbar.</li>
      </ul>

      <div class="blog-cta-box" style="margin-top: 2.5rem; padding: 2rem; border-radius: 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05)); border: 1px solid rgba(245, 158, 11, 0.3);">
        <h3 style="color: #fbbf24; margin-bottom: 0.5rem;">Starten Sie mit 0 € Fixkosten für Ihren Betrieb</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
          Registrieren Sie Ihr Restaurant oder Café in nur 2 Minuten. Erhalten Sie sofort druckfertige QR-Codes für Ihre Tische. Keine Grundgebühr, keine Vertragslaufzeit.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/register" class="blog-btn-cta" style="background: #f59e0b; color: #000; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none;">Kostenlos registrieren &rarr;</a>
          <a href="/tools/tip-calculator" style="display: inline-flex; align-items: center; color: #fbbf24; font-weight: 600; text-decoration: none; padding: 0.75rem 1rem;">Trinkgeld-Rechner testen &rarr;</a>
        </div>
      </div>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Digitales Trinkgeld für Gastronomie und Restaurants in Deutschland',
    author: DEFAULT_AUTHOR_DE,
    category: 'Digitales Trinkgeld',
    tags: ['digitales trinkgeld', 'gastronomie', 'qr code trinkgeld', 'steuerfrei estg', 'kellner trinkgeld'],
    targetKeyword: 'digitales trinkgeld gastronomie',
    secondaryKeywords: ['trinkgeld qr code restaurant', 'steuerfreies trinkgeld estg', 'bargeldlos trinkgeld geben', 'trinkgeld app kellner'],
    searchIntent: 'Commercial',
    metaTitle: 'Digitales Trinkgeld für die Gastronomie (Leitfaden 2026) — Naponi',
    metaDescription: 'Wie Gastronomen in Deutschland bargeldloses Trinkgeld per QR-Code einführen. Steuerfrei nach § 3 Nr. 51 EStG, 40% mehr Trinkgeld, ohne App-Download.',
    canonicalUrl: 'https://www.naponi.com/blog/digitales-trinkgeld-gastronomie-leitfaden',
    language: 'de',
    status: 'published',
    datePublished: '2026-03-15T09:00:00Z',
    dateModified: '2026-10-10T12:00:00Z',
    readingTime: '6 Min. Lesezeit',
    isFeatured: true,
    faq: [
      {
        question: 'Ist digitales Trinkgeld in Deutschland wirklich steuerfrei?',
        answer: 'Ja, gemäß § 3 Nr. 51 EStG ist Trinkgeld für angestellte Arbeitnehmer vollkommen einkommensteuer- und sozialversicherungsfrei, solange es freiwillig vom Gast direkt an den Mitarbeiter gezahlt wird.',
      },
      {
        question: 'Müssen Gäste eine App installieren, um Trinkgeld zu geben?',
        answer: 'Nein. Gäste scannen einfach den QR-Code mit der Smartphone-Kamera. Die Zahlungsseite öffnet sich im Browser und ermöglicht die Zahlung per Apple Pay, Google Pay oder Karte in unter 6 Sekunden.',
      },
      {
        question: 'Funktioniert Naponi mit unserem bestehenden Kassensystem?',
        answer: 'Ja, Naponi funktioniert völlig autark neben jedem Kassensystem (wie Vectron, orderbird, Gastronovi oder Lightspeed). Es ist keine Schnittstellenprogrammierung nötig.',
      },
    ],
    relatedSlugs: [
      'trinkgeld-berechnen-wie-viel-deutschland-knigge',
      'trinkgeld-pool-aufteilung-gastronomie-system',
    ],
  },
  {
    slug: 'trinkgeld-berechnen-wie-viel-deutschland-knigge',
    title: 'Trinkgeld in Deutschland berechnen: Knigge, Richtwerte & bargeldlose Bezahlung',
    excerpt: 'Wie viel Trinkgeld gibt man im Restaurant, Café oder Hotel in Deutschland? Knigge-Regeln, 5-10% Richtwerte und bargeldloses Trinkgeld per Smartphone.',
    content: `
      <p class="lead">
        „Stimmt so!“ gehört in deutschen Restaurants zum guten Ton. Doch wie viel Trinkgeld ist hierzulande angemessen, wie berechnet man den Betrag richtig und was gilt, wenn man mit Karte oder Smartphone bezahlt? Hier finden Sie alle Richtwerte und Knigge-Regeln im Überblick.
      </p>

      <h2>Typische Trinkgeld-Richtwerte in Deutschland</h2>
      <table class="blog-table" style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(255,255,255,0.15); text-align: left;">
            <th style="padding: 0.75rem;">Bereich / Anlass</th>
            <th style="padding: 0.75rem;">Richtwert</th>
            <th style="padding: 0.75rem;">Praxisbeispiel</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 0.75rem;"><strong>Restaurant (Guter Service)</strong></td>
            <td style="padding: 0.75rem; color: #10b981;">5% bis 10%</td>
            <td style="padding: 0.75rem;">Rechnung 64,00 € &rarr; auf 70,00 € aufrunden</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 0.75rem;"><strong>Gehobene Gastronomie / Fine Dining</strong></td>
            <td style="padding: 0.75rem; color: #10b981;">10% bis 15%</td>
            <td style="padding: 0.75rem;">Rechnung 180,00 € &rarr; 18,00 € bis 25,00 €</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 0.75rem;"><strong>Café / Bäckerei (Tresen)</strong></td>
            <td style="padding: 0.75rem;">Kleingeld / Aufrunden</td>
            <td style="padding: 0.75rem;">Cappuccino 3,80 € &rarr; 4,00 € oder 0,50 € ins Glas</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 0.75rem;"><strong>Hotel (Gepäck / Housekeeping)</strong></td>
            <td style="padding: 0.75rem;">1 € bis 3 € pro Gepäck / Tag</td>
            <td style="padding: 0.75rem;">Gepäckträger 2 € pro Koffer, Zimmerreinigung 2-5 €</td>
          </tr>
          <tr>
            <td style="padding: 0.75rem;"><strong>Taxi & Fahrservice</strong></td>
            <td style="padding: 0.75rem;">ca. 10% / Aufrunden</td>
            <td style="padding: 0.75rem;">Fahrpreis 18,20 € &rarr; auf 20,00 €</td>
          </tr>
        </tbody>
      </table>

      <h2>Die mathematische Formel für das Restaurant</h2>
      <p>
        Um das Trinkgeld schnell im Kopf oder mit unserem <a href="/tools/tip-calculator">Online-Trinkgeldrechner</a> zu berechnen:
      </p>
      <code>Trinkgeldbetrag = Rechnungsbetrag &times; (Prozentsatz / 100)</code>
      <p>
        <strong>Tipp für den Alltag:</strong> Berechnen Sie einfach 10% (Komma um eine Stelle nach links verschieben). Bei einer Rechnung von 48,00 € entsprechen 10% genau 4,80 €. Runden Sie auf glatte 53,00 € auf.
      </p>

      <h2>Wie gibt man bargeldlos Trinkgeld?</h2>
      <p>
        Immer mehr moderne Gastronomiebetriebe nutzen heute Naponi-QR-Codes direkt auf dem Tisch oder auf der Rechnung. Der Vorteil: Sie müssen dem Kellner nicht den Betrag laut zurufen, sondern wählen diskret am Smartphone den Betrag und zahlen sicher mit Apple Pay oder Google Pay.
      </p>

      <div class="blog-cta-box" style="margin-top: 2rem; padding: 1.5rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);">
        <h4 style="margin-bottom: 0.5rem; color: #fff;">Probieren Sie unseren kostenlosen Rechner aus</h4>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1rem;">
          Teilen Sie Rechnungen blitzschnell auf mehrere Personen auf und berechnen Sie das faire Trinkgeld.
        </p>
        <a href="/tools/tip-calculator" class="home-btn-primary" style="display: inline-block;">Zum Trinkgeld-Rechner &rarr;</a>
      </div>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Trinkgeld in Deutschland berechnen Knigge und Richtwerte',
    author: DEFAULT_AUTHOR_DE,
    category: 'Mitarbeiter-Leitfaden',
    tags: ['trinkgeld berechnen', 'knigge deutschland', 'wie viel trinkgeld restaurant', 'trinkgeldrechner'],
    targetKeyword: 'trinkgeld berechnen deutschland',
    secondaryKeywords: ['wie viel trinkgeld gibt man', 'trinkgeld prozent restaurant', 'trinkgeld knigge', 'trinkgeldrechner online'],
    searchIntent: 'Informational',
    metaTitle: 'Trinkgeld in Deutschland berechnen: Knigge & Richtwerte — Naponi',
    metaDescription: 'Wie viel Trinkgeld gibt man in Deutschland im Restaurant, Café und Hotel? Richtwerte (5-10%), Knigge-Regeln und bargeldlos Trinkgeld geben.',
    canonicalUrl: 'https://www.naponi.com/blog/trinkgeld-berechnen-wie-viel-deutschland-knigge',
    language: 'de',
    status: 'published',
    datePublished: '2026-03-20T10:00:00Z',
    dateModified: '2026-10-10T12:00:00Z',
    readingTime: '5 Min. Lesezeit',
    isFeatured: false,
    faq: [
      {
        question: 'Ist Trinkgeld in Deutschland Pflicht?',
        answer: 'Nein, Trinkgeld ist in Deutschland rechtlich absolut freiwillig. Allerdings gilt es bei gutem Service als gesellschaftliche Anerkennung und wichtiger Einkommensbestandteil für Servicekräfte.',
      },
      {
        question: 'Wie viel Trinkgeld ist im Restaurant üblich?',
        answer: 'Üblich sind 5% bis 10% des Rechnungsbetrags. Bei hervorragendem Service oder in der gehobenen Gastronomie werden auch 12% bis 15% gegeben.',
      },
    ],
    relatedSlugs: [
      'digitales-trinkgeld-gastronomie-leitfaden',
      'trinkgeld-pool-aufteilung-gastronomie-system',
    ],
  },
  {
    slug: 'trinkgeld-pool-aufteilung-gastronomie-system',
    title: 'Trinkgeld-Pool & Aufteilung im Restaurant: Modelle, Punktesystem und faire Schichtabrechnung',
    excerpt: 'Trinkgeld gerecht unter Service, Küche und Bar aufteilen. Punktesystem, Excel-Abrechnung und gesetzliche Vorgaben für Gastronomen in der DACH-Region.',
    content: `
      <p class="lead">
        In vielen Restaurants entsteht Streit um das Trinkgeld: Die Servicekräfte nehmen das Geld direkt vom Gast entgegen, doch das großartige Essen aus der Küche und die perfekten Drinks der Bar haben den Erfolg erst möglich gemacht. Ein <strong>digitaler Trinkgeld-Pool</strong> sorgt für Transparenz und Teamfrieden.
      </p>

      <h2>Die 3 gängigsten Modelle zur Trinkgeldaufteilung</h2>
      <ol>
        <li>
          <strong>Gleiche Aufteilung (Kopfprinzip):</strong><br />
          Das gesamte Trinkgeld wird durch die Anzahl aller arbeitenden Mitarbeiter geteilt. Ideal für kleine Cafés oder eingespielte Teams mit flachen Hierarchien.
        </li>
        <li>
          <strong>Prozentuale Rollenaufteilung:</strong><br />
          Typischerweise erhält der direkte Service 60%, die Küche 25% und die Bar 15% des Pools.
        </li>
        <li>
          <strong>Das Punktesystem (Abrechnung nach Stunden & Verantwortung):</strong><br />
          Jede Rolle erhält einen Gewichtungsfaktor (z. B. Kellner 1.0, Barmann 1.0, Koch 0.6, Runner 0.5). Die Trinkgeldanteile berechnen sich aus <code>Stunden &times; Punkte</code>.
        </li>
      </ol>

      <h2>Gesetzliche Vorgaben: Dürfen Chefs am Trinkgeld-Pool partizipieren?</h2>
      <p>
        In Deutschland ist die Rechtslage eindeutig: <strong>Inhaber, Geschäftsführer und leitende Angestellte dürfen nicht am Trinkgeld-Pool teilnehmen.</strong> Das Trinkgeld gebührt ausschließlich dem ausführenden Personal. Eine Einbehaltung durch den Arbeitgeber ist rechtlich unzulässig.
      </p>

      <h2>Vollständige Automatisierung mit Naponi</h2>
      <p>
        Statt nach Mitternacht mit Taschenrechner und Papierlisten im Büro zu sitzen, berechnet Naponi die Verteilung vollautomatisch basierend auf den Schichtzeiten Ihres Teams. Exportieren Sie die Daten als CSV für Ihre Buchhaltung mit nur einem Klick.
      </p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Trinkgeld Pool und Aufteilung im Restaurant',
    author: DEFAULT_AUTHOR_DE,
    category: 'Mitarbeiter-Leitfaden',
    tags: ['trinkgeld pool', 'trinkgeld aufteilung restaurant', 'tronc system', 'service kueche trinkgeld'],
    targetKeyword: 'trinkgeld pool restaurant',
    secondaryKeywords: ['trinkgeld aufteilen schlüssel', 'küche am trinkgeld beteiligen', 'trinkgeld punktesystem', 'gastronomie trinkgeldverteilung'],
    searchIntent: 'Commercial',
    metaTitle: 'Trinkgeld-Pool & Aufteilung im Restaurant (Modelle & Rechner) — Naponi',
    metaDescription: 'Wie teilen Gastronomen Trinkgeld gerecht zwischen Service, Küche und Bar auf? Modelle, Punktesystem und kostenloser Schichtrechner.',
    canonicalUrl: 'https://www.naponi.com/blog/trinkgeld-pool-aufteilung-gastronomie-system',
    language: 'de',
    status: 'published',
    datePublished: '2026-03-25T11:00:00Z',
    dateModified: '2026-10-10T12:00:00Z',
    readingTime: '5 Min. Lesezeit',
    isFeatured: false,
    faq: [
      {
        question: 'Darf der Küchenchef am Trinkgeld-Pool teilnehmen?',
        answer: 'Angestellte Köche und Küchenhilfen dürfen am Trinkgeld-Pool beteiligt werden. Handelt es sich beim Küchenchef jedoch um den Inhaber oder einen Geschäftsführer mit Leitungsfunktion, ist die Teilnahme ausgeschlossen.',
      },
    ],
    relatedSlugs: [
      'digitales-trinkgeld-gastronomie-leitfaden',
      'trinkgeld-berechnen-wie-viel-deutschland-knigge',
    ],
  },
];
