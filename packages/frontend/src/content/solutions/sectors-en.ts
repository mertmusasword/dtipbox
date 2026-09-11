import { SectorSolution } from './sectors';

export const SECTOR_SOLUTIONS_EN: Record<string, SectorSolution> = {
  restaurants: {
    slug: 'restaurants',
    sectorName: 'Restaurants & Fine Dining',
    badge: 'Digital Tipping for Restaurants',
    heroTitle: 'Tableside QR Code Digital Tipping for Restaurants & Dining',
    heroSubtitle: 'Enable diners to reward waitstaff and culinary teams in 6 seconds without cash or app downloads. Zero hardware, zero friction, direct bank settlement.',
    targetKeyword: 'restaurant digital tipping system',
    secondaryKeywords: ['restaurant qr tipping', 'waiter tipping platform', 'contactless tableside tips', 'restaurant tip pool software'],
    searchIntent: 'Commercial',
    metaTitle: 'Restaurant Digital Tipping & Tableside QR Code Tip System — Naponi',
    metaDescription: 'Eliminate lost tips in cashless dining. Tableside QR digital tipping for restaurants, bistros, and fine dining. Manage individual or pooled staff distribution effortlessly.',
    canonicalUrl: 'https://www.naponi.com/solutions/restaurants',
    problemTitle: 'The Cost of Cashless Dining on Restaurant Staff',
    problemDescription: 'Over 82% of restaurant patrons pay exclusively by card or digital wallet and carry zero physical cash. For hospitality venues, this creates severe friction:',
    problems: [
      'Waiters and service staff lose significant earned tip income, hurting overall take-home pay.',
      'Adding tips manually to POS terminals increases credit card processing fees and reconciliation headaches.',
      'High staff turnover rates and difficulties retaining top front-of-house talent.',
      'Disputes and lack of transparency during end-of-shift cash tip jar split calculations.',
    ],
    solutionTitle: 'Frictionless Tableside Tipping with Naponi',
    solutionDescription: 'Elegant QR codes positioned discreetly on tables, check presenters, or receipts allow guests to scan directly with their smartphone camera:',
    features: [
      {
        title: 'Table & Server Identification',
        description: 'Assign dynamic QR codes per table or on-duty waiter so guests know exactly who they are thanking.',
        icon: 'Utensils',
      },
      {
        title: 'Direct or Pooled Tip Splits',
        description: 'Route tips directly to individual servers or automatically contribute to end-of-day kitchen/bar pools.',
        icon: 'Users',
      },
      {
        title: 'Direct Bank Settlement',
        description: 'Non-custodial architecture: Tips flow straight to verified staff bank accounts or your corporate merchant gateway.',
        icon: 'Wallet',
      },
      {
        title: 'Zero Hardware Overhead',
        description: 'No bulky POS terminal rentals or battery charging required. Operates seamlessly with premium acrylic QR stands.',
        icon: 'Smartphone',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Generate Table QR Stands',
        description: 'Create high-resolution custom branded QR codes from your Naponi merchant dashboard in 2 minutes.',
      },
      {
        step: '02',
        title: 'Guests Scan at the Table',
        description: 'When the bill arrives, guests point their native phone camera at the QR code. The tip screen loads in under 1 second.',
      },
      {
        step: '03',
        title: 'Instant One-Tap Payment',
        description: 'Guests choose preset percentages (10%, 15%, 20%) and pay via Apple Pay, Google Pay, or card.',
      },
    ],
    useCases: [
      {
        title: 'Fine Dining & Bistros',
        description: 'Discreet check-presenter QR cards that preserve the refined dining ambiance without awkward POS prompts.',
      },
      {
        title: 'High-Volume Casual Eateries',
        description: 'Durable acrylic table stands enabling fast-paced turnarounds and immediate server gratuity recognition.',
      },
      {
        title: 'Multi-Location Restaurant Groups',
        description: 'Centralized management dashboard for franchise owners to monitor tip metrics and staff engagement across branches.',
      },
    ],
    faqs: [
      {
        question: 'Do restaurant guests need an app or account to tip?',
        answer: 'No. Guests simply open their smartphone camera, tap the notification, and complete payment with Apple Pay, Google Pay, or debit/credit card. No registration or app download is ever required.',
      },
      {
        question: 'How does Naponi handle tip pooling between front-of-house and kitchen staff?',
        answer: 'You can configure transparent tip distribution rules in your dashboard. Tips can be split by percentage (e.g., 65% servers, 25% kitchen, 10% bar) or allocated on an hourly worked basis.',
      },
      {
        question: 'Are there monthly terminal rental fees or hardware commitments?',
        answer: 'None. Naponi is 100% cloud-based software. You print or order durable QR acrylic stands, and start receiving tips immediately without expensive hardware leasing.',
      },
    ],
    relatedBlogSlugs: [
      'what-is-digital-tipping-complete-guide',
      'cashless-restaurant-digital-tipping-guide',
      'restaurant-tip-pooling-best-practices',
    ],
  },

  cafes: {
    slug: 'cafes',
    sectorName: 'Cafes & Specialty Coffee',
    badge: 'Digital Tip Jar for Cafes',
    heroTitle: 'Modern Contactless QR Tip Jar for Coffee Shops & Bakeries',
    heroSubtitle: 'Replace empty glass tip jars with an intuitive counter QR display. Guests tap and tip barista teams in seconds while picking up their brew.',
    targetKeyword: 'cafe digital tip jar',
    secondaryKeywords: ['coffee shop qr tipping', 'barista tip jar cashless', 'contactless cafe tips', 'bakery counter tip system'],
    searchIntent: 'Commercial',
    metaTitle: 'Digital QR Tip Jar for Cafes & Specialty Coffee Shops — Naponi',
    metaDescription: 'Boost barista tips by 40% with a contactless counter QR tip jar. Perfect for specialty coffee shops, bakeries, and grab-and-go espresso bars.',
    canonicalUrl: 'https://www.naponi.com/solutions/cafes',
    problemTitle: 'Why Traditional Glass Tip Jars Are Emptying Out',
    problemDescription: 'Modern coffee lovers pay for flat whites and croissants using contactless mobile taps, leaving no pocket change behind:',
    problems: [
      'Cash tip jars receive fewer coins each week, demotivating hard-working barista talent.',
      'Awkward counter POS tip prompts can make customers feel pressured or rush the queue.',
      'Unsecured cash jars on busy pickup counters carry theft and misplacement risks.',
      'Difficulties providing fair daily tip shares for morning versus afternoon barista shifts.',
    ],
    solutionTitle: 'The Elegant Counter QR Tip Solution for Cafes',
    solutionDescription: 'Position a sleek Naponi QR display right next to the espresso machine or pickup counter. Quick, subtle, and highly effective:',
    features: [
      {
        title: 'Micro-Tipping Presets',
        description: 'Optimized preset tip amounts ($1, $2, $3, or custom) tailored for quick counter purchases and coffee orders.',
        icon: 'Coffee',
      },
      {
        title: 'Queue-Friendly Speed',
        description: 'Completed in under 5 seconds while drinks are being prepared, preventing checkout counter bottlenecks.',
        icon: 'Zap',
      },
      {
        title: 'Automated Shift Splitting',
        description: 'Distribute gathered digital tips accurately based on barista shift hours logged during the day.',
        icon: 'Users',
      },
      {
        title: 'Theft-Proof Digital Jar',
        description: 'Eliminate physical cash tampering. Funds transfer directly and securely to merchant accounts.',
        icon: 'ShieldCheck',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Place Counter QR Stand',
        description: 'Mount a compact Naponi QR stand beside the order pickup or espresso bar.',
      },
      {
        step: '02',
        title: 'Customer Taps & Scans',
        description: 'Delighted by their latte art, customers scan while waiting for their takeaway cup.',
      },
      {
        step: '03',
        title: 'Barista Recognition',
        description: 'Tips register with instant feedback, keeping your team energized throughout the morning rush.',
      },
    ],
    useCases: [
      {
        title: 'Specialty Espresso Bars',
        description: 'Showcase barista craft and receive higher gratuities from discerning coffee enthusiasts.',
      },
      {
        title: 'Artisan Bakeries & Patisseries',
        description: 'Complement counter sales with seamless contactless tips for pastry chefs and front attendants.',
      },
      {
        title: 'Campus & Office Kiosks',
        description: 'Rapid throughput where speed is paramount and cash handling is practically non-existent.',
      },
    ],
    faqs: [
      {
        question: 'Will placing a QR stand slow down our counter coffee line?',
        answer: 'Not at all. Customers scan while waiting for their coffee at the pickup counter rather than blocking the ordering register, keeping queues fast and flowing.',
      },
      {
        question: 'Can small tip amounts like $1 or $2 be processed economically?',
        answer: 'Yes. Naponi leverages high-efficiency micro-payment integrations and standard digital wallets (Apple Pay, Google Pay) to ensure micro-tipping is frictionless and cost-effective.',
      },
      {
        question: 'Can our baristas see how much they collected in real time?',
        answer: 'Yes. Staff can view their daily performance and aggregated tip earnings through their personal mobile staff view.',
      },
    ],
    relatedBlogSlugs: [
      'cashless-restaurant-digital-tipping-guide',
      'restaurant-tip-pooling-best-practices',
      'digital-tipping-legal-compliance-tax-guide',
    ],
  },

  hotels: {
    slug: 'hotels',
    sectorName: 'Hotels & Luxury Resorts',
    badge: 'Hotel & Hospitality Digital Tipping',
    heroTitle: 'Seamless QR Tipping for Hotel Bellhops, Housekeeping & Concierge',
    heroSubtitle: 'Solve the cashless traveler dilemma. Give international guests a secure way to tip housekeeping, valet, and luggage staff in their local currency.',
    targetKeyword: 'hotel digital tipping platform',
    secondaryKeywords: ['hotel housekeeping tips qr', 'bellhop contactless tipping', 'hospitality staff tip system', 'resort guest digital tips'],
    searchIntent: 'Commercial',
    metaTitle: 'Hotel Digital Tipping Platform for Housekeeping & Bellhops — Naponi',
    metaDescription: 'Empower hotel housekeeping, valet, and concierge teams with contactless QR tipping. Multi-currency support for international travelers. No app required.',
    canonicalUrl: 'https://www.naponi.com/solutions/hotels',
    problemTitle: 'The Hospitality Tipping Challenge in Modern Tourism',
    problemDescription: 'International travelers rarely exchange local currency at airports anymore, leading to missed recognition for frontline hotel heroes:',
    problems: [
      'Guests frequently leave hotel rooms without tipping housekeeping simply due to lack of local cash.',
      'Valet and luggage attendants miss out on gratuities when guests carry only corporate charge cards.',
      'Hotels struggle with high housekeeping turnover, leading to recruiting strain and elevated operational costs.',
      'Traditional room envelopes with handwritten notes are impersonal and often ignored by guests.',
    ],
    solutionTitle: 'Enterprise-Grade QR Tipping for Hospitality Brands',
    solutionDescription: 'Discrete, luxury-branded QR plaques in guest suites and staff cards give guests instant peace of mind to express their appreciation:',
    features: [
      {
        title: 'In-Room Housekeeping Cards',
        description: 'Eco-friendly, elegant bedside and bathroom cards connecting guests directly to their room cleaning team.',
        icon: 'Hotel',
      },
      {
        title: 'Multi-Currency & Global Wallets',
        description: 'Foreign guests can pay using their preferred international cards, Apple Pay, or Google Pay without currency hassle.',
        icon: 'Globe',
      },
      {
        title: 'Departmental Segregation',
        description: 'Separate reporting and payout channels for Housekeeping, Bellhops, Concierge, Room Service, and Spa.',
        icon: 'Users',
      },
      {
        title: 'Guest Feedback & Review Linkage',
        description: 'Prompt delighted guests to leave a 5-star TripAdvisor or Google Review immediately after leaving a tip.',
        icon: 'Sparkles',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Deploy Room Plaques',
        description: 'Place tastefully designed room QR cards on the nightstand or desk in each guest room.',
      },
      {
        step: '02',
        title: 'Guest Scans via Smartphone',
        description: 'Before checkout, the guest scans the code, sees their housekeeper’s name, and chooses a tip amount.',
      },
      {
        step: '03',
        title: 'Housekeeping Motivated',
        description: 'Staff receive direct notifications and immediate rewards, elevating room cleanliness standards.',
      },
    ],
    useCases: [
      {
        title: 'Boutique & Luxury Hotels',
        description: 'Bespoke wooden or leather branded room QR stands that match premium interior design standards.',
      },
      {
        title: 'All-Inclusive Resorts',
        description: 'Digital tipping across expansive resort pools, cabanas, and private concierge teams.',
      },
      {
        title: 'Airport & Business Hotels',
        description: 'Instant gratification for corporate travelers on expense accounts with zero cash on hand.',
      },
    ],
    faqs: [
      {
        question: 'How do international guests pay if they don’t carry local currency?',
        answer: 'Naponi supports global credit/debit cards, Apple Pay, and Google Pay with automatic currency conversion, so guests can tip in their native billing currency seamlessly.',
      },
      {
        question: 'Can hotel management track tips and guest satisfaction scores?',
        answer: 'Yes. Enterprise hotel dashboards provide comprehensive analytics by department, room floor, and shift, including guest feedback ratings.',
      },
      {
        question: 'Does digital tipping integrate with existing hotel PMS or keycard systems?',
        answer: 'Naponi operates standalone via QR codes without requiring complex PMS integrations, but also provides open Webhook APIs for enterprise payroll synchronization.',
      },
    ],
    relatedBlogSlugs: [
      'hotel-housekeeping-digital-tipping-guide',
      'what-is-digital-tipping-complete-guide',
      'digital-tipping-legal-compliance-tax-guide',
    ],
  },

  bars: {
    slug: 'bars',
    sectorName: 'Bars, Pubs & Nightclubs',
    badge: 'Nightlife QR Tipping',
    heroTitle: 'Fast-Paced QR Tipping for Bartenders, Pubs & Nightclubs',
    heroSubtitle: 'Keep drink orders moving. Let guests tip their mixologist in 3 seconds at high-volume bars, festival counters, and VIP bottle service tables.',
    targetKeyword: 'bar digital tipping platform',
    secondaryKeywords: ['nightclub bartender qr tips', 'pub contactless tipping', 'mixologist digital tip box', 'fast bar payment tips'],
    searchIntent: 'Commercial',
    metaTitle: 'Bar & Nightclub Digital Tipping System for Bartenders — Naponi',
    metaDescription: 'Eliminate bar bottlenecks with 3-second QR tipping. Designed for busy nightclubs, cocktail lounges, and sports pubs. Direct payout to bartenders.',
    canonicalUrl: 'https://www.naponi.com/solutions/bars',
    problemTitle: 'High Noise, Crowded Counters, and Lost Nightlife Tips',
    problemDescription: 'In dark, loud nightlife venues, handling cash or entering PINs on slow card readers kills bar efficiency:',
    problems: [
      'Packed bars force bartenders to rush, skipping tip inquiries on handheld POS devices.',
      'Customers ordering rounds tap their card quickly and walk away before leaving a tip.',
      'Handling cash in low-light environments causes change errors and reconciliation discrepancies.',
      'Late-night staff attrition driven by insufficient compensation during grueling peak shifts.',
    ],
    solutionTitle: 'Rapid Bar Tipping Designed for High Volume',
    solutionDescription: 'Illuminated bar-top QR pads and coaster codes let patrons tip while waiting for their cocktails:',
    features: [
      {
        title: '3-Second Quick-Tap Checkout',
        description: 'Streamlined checkout interface optimized for dim lighting and high-speed mobile taps.',
        icon: 'Zap',
      },
      {
        title: 'Bar Coaster & Wristband Integration',
        description: 'Print QR codes directly onto drink coasters, counter mats, or festival wristbands.',
        icon: 'Wine',
      },
      {
        title: 'Shift-Based Bar Pooling',
        description: 'Fair automatic distribution among main bar mixologists, barbacks, and floor glass collectors.',
        icon: 'Users',
      },
      {
        title: 'Security & Anti-Fraud Protection',
        description: 'Encrypted transactions protect against chargebacks and counterfeit cash handling at 2 AM.',
        icon: 'ShieldCheck',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Affix Bar Mat QR Codes',
        description: 'Position illuminated or water-resistant QR displays along the bar counter.',
      },
      {
        step: '02',
        title: 'Customer Scans for Next Round',
        description: 'While sipping their drink, customers tap the QR and select a generous bartender tip.',
      },
      {
        step: '03',
        title: 'Bartenders Rewarded',
        description: 'Tips tally in the background, keeping bartender morale high during peak nightlife hours.',
      },
    ],
    useCases: [
      {
        title: 'Cocktail Lounges & Speakeasies',
        description: 'Recognize mixologist craftsmanship with customized digital gratitude and cocktail ratings.',
      },
      {
        title: 'High-Volume Nightclubs',
        description: 'Eliminate line stalling by decoupling tipping from primary entry POS terminals.',
      },
      {
        title: 'Sports Bars & Pubs',
        description: 'Coaster-based QR codes at every booth so fans can tip while enjoying game day broadcasts.',
      },
    ],
    faqs: [
      {
        question: 'Will dark lighting prevent phones from scanning the QR code?',
        answer: 'Modern smartphone cameras automatically adjust to dim bar lighting. We also supply high-contrast, UV-reactive and illuminated acrylic bar stands for maximum visibility.',
      },
      {
        question: 'Can barbacks and glass collectors be included in the digital tip pool?',
        answer: 'Yes. Naponi’s tip pool manager allows custom weighting (e.g., 80% lead bartenders, 20% barbacks) to maintain team harmony.',
      },
      {
        question: 'How fast do bartenders receive their tips?',
        answer: 'Depending on your venue configuration, funds are transferred either instantly via instant bank rail or aggregated for next-day direct deposit.',
      },
    ],
    relatedBlogSlugs: [
      'restaurant-tip-pooling-best-practices',
      'what-is-digital-tipping-complete-guide',
      'digital-tipping-legal-compliance-tax-guide',
    ],
  },

  barbers: {
    slug: 'barbers',
    sectorName: 'Barbers, Salons & Spas',
    badge: 'Salon & Spa Tipping',
    heroTitle: 'Contactless Digital Tipping for Barbers, Hair Stylists & Spas',
    heroSubtitle: 'Give your clients a comfortable, private way to tip their stylist after a haircut or spa session without awkward salon reception discussions.',
    targetKeyword: 'barber digital tipping system',
    secondaryKeywords: ['hair stylist qr tip box', 'salon contactless tips', 'spa therapist digital tipping', 'barbershop tip app'],
    searchIntent: 'Commercial',
    metaTitle: 'Barber, Salon & Spa Digital Tipping Platform — Naponi',
    metaDescription: 'Personalized mirror QR codes for barbers, hair stylists, and spa massage therapists. Increase stylist tips without awkward checkout questions.',
    canonicalUrl: 'https://www.naponi.com/solutions/barbers',
    problemTitle: 'Why Salon Clients Want a Private Way to Tip',
    problemDescription: 'Personal grooming is an intimate craft, but checkout tipping at a public reception counter often feels uncomfortable:',
    problems: [
      'Clients feel embarrassed asking "can I add a tip to the card?" in front of a waiting salon lobby.',
      'Salon receptionists frequently forget to prompt clients for stylist gratuities.',
      'Commission-based chair renters face complicated bookkeeping when tips get tangled with salon revenues.',
      'Clients leaving with fresh cuts or treatments carry only a smartphone and no physical cash.',
    ],
    solutionTitle: 'Station-Specific QR Codes for Every Chair & Mirror',
    solutionDescription: 'A personalized mirror decal at each styling station allows clients to tip directly from the barber chair:',
    features: [
      {
        title: 'Stylist Mirror Decals',
        description: 'Sleek, personalized QR decals mounted directly on styling mirrors displaying the barber or stylist’s profile.',
        icon: 'Scissors',
      },
      {
        title: '100% Direct Chair-Renter Payouts',
        description: 'Tips bypass general salon overhead and flow directly to the specific stylist who performed the service.',
        icon: 'Wallet',
      },
      {
        title: 'Private & Discreet Feedback',
        description: 'Clients choose their tip amount privately on their own phone without reception counter observation.',
        icon: 'Sparkles',
      },
      {
        title: 'Instagram & Portfolio Linkage',
        description: 'Optionally link your styling Instagram profile on the tip confirmation screen to gain new followers.',
        icon: 'Smartphone',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Apply Mirror QR Decal',
        description: 'Stick a branded stylist QR code at each haircutting chair or treatment room mirror.',
      },
      {
        step: '02',
        title: 'Client Scans Post-Service',
        description: 'While admiring their new hairstyle or treatment, the client scans the mirror code.',
      },
      {
        step: '03',
        title: 'Stylist Directly Credited',
        description: 'The tip lands in the stylist’s account with instant notification, fostering strong client loyalty.',
      },
    ],
    useCases: [
      {
        title: 'Barbershops',
        description: 'Dedicated chair QR codes where clients tip their regular barber effortlessly before brushing off.',
      },
      {
        title: 'Hair Salons & Colorists',
        description: 'Split tips smoothly between master colorists and salon assistants who washed the client’s hair.',
      },
      {
        title: 'Day Spas & Massage Therapists',
        description: 'Quiet in-room QR stands preserving the tranquil, relaxed spa environment without register noise.',
      },
    ],
    faqs: [
      {
        question: 'Does the salon owner have to handle stylist tip taxes?',
        answer: 'With Naponi’s direct-to-staff model, tips can flow directly into the stylist’s verified bank account as direct client gifts, drastically simplifying salon bookkeeping.',
      },
      {
        question: 'Can assistant shampooers also receive tips?',
        answer: 'Yes. Clients can select both the primary stylist and the assistant shampooer on the same mobile tipping screen.',
      },
      {
        question: 'Can an independent booth renter use Naponi without the salon owner?',
        answer: 'Absolutely. Independent chair renters and freelancers can create their own individual Naponi account in 2 minutes and start using personal mirror QR codes.',
      },
    ],
    relatedBlogSlugs: [
      'what-is-digital-tipping-complete-guide',
      'digital-tipping-legal-compliance-tax-guide',
      'cashless-restaurant-digital-tipping-guide',
    ],
  },

  valet: {
    slug: 'valet',
    sectorName: 'Valet Parking & Concierge',
    badge: 'Valet Digital Tipping',
    heroTitle: 'Fast QR Tipping for Valet Parking Attendants & Drivers',
    heroSubtitle: 'Eliminate the awkward "I don’t have cash" moment when cars pull up. Drivers scan the ticket or dashboard stand and tip before driving off.',
    targetKeyword: 'valet digital tipping solution',
    secondaryKeywords: ['valet parking contactless tips', 'parking attendant qr tip box', 'hotel valet cashless tips', 'car concierge tipping'],
    searchIntent: 'Commercial',
    metaTitle: 'Valet Parking Digital Tipping System — Naponi',
    metaDescription: 'Boost valet parking attendant tips by 60% with instant ticket and podium QR tipping. Drivers pay in 5 seconds via Apple Pay without holding up vehicle lanes.',
    canonicalUrl: 'https://www.naponi.com/solutions/valet',
    problemTitle: 'The 10-Second Cash Crunch at the Valet Podium',
    problemDescription: 'Vehicle retrieval happens in seconds, and almost no modern driver carries pocket bills while driving:',
    problems: [
      'Drivers genuinely want to tip after safe car retrieval, but sheepishly apologize for having no cash.',
      'Valet teams endure harsh weather and fast running, yet take-home pay suffers without cash tips.',
      'Handheld card terminals take too long to connect, creating dangerous vehicle queues and lane blockages.',
      'Difficulties keeping parking shifts staffed during evening rain or busy weekend rushes.',
    ],
    solutionTitle: '5-Second QR Tipping on Valet Tickets & Key Tags',
    solutionDescription: 'Print dynamic QR codes directly onto physical valet claim tickets or weather-resistant podium stands:',
    features: [
      {
        title: 'Valet Ticket QR Integration',
        description: 'Drivers scan their paper ticket or digital SMS claim link while waiting in the lobby for their car.',
        icon: 'Car',
      },
      {
        title: 'Zero Vehicle Line Stalling',
        description: 'Drivers complete tipping inside the lobby before the car even arrives at the curb.',
        icon: 'Zap',
      },
      {
        title: 'Shift-Based Pool Distribution',
        description: 'Equal distribution across active running valets, key dispatchers, and greeting attendants.',
        icon: 'Users',
      },
      {
        title: 'Weatherproof Outdoor Stands',
        description: 'Durable, waterproof podium plaques built to withstand rain, wind, and intense outdoor sunlight.',
        icon: 'ShieldCheck',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Driver Scans Claim Ticket',
        description: 'While their car is being retrieved from the parking garage, the driver scans the QR on their ticket.',
      },
      {
        step: '02',
        title: 'One-Tap Apple/Google Pay',
        description: 'Driver taps a preset $3, $5, or $10 tip and confirms via biometric Face ID.',
      },
      {
        step: '03',
        title: 'Car Arrives, Team Rewarded',
        description: 'When the car reaches the curb, the transaction is already complete with zero awkward delay.',
      },
    ],
    useCases: [
      {
        title: 'Hotel & Casino Valets',
        description: 'Seamless integration for high-end resort valets greeting international luxury travelers.',
      },
      {
        title: 'Upscale Restaurant Valet Podiums',
        description: 'Compact podium stands that enhance guest departure impressions after a pleasant evening.',
      },
      {
        title: 'Hospital & Medical Center Valets',
        description: 'Dignified, stress-free tipping for patients and family visitors during hospital visits.',
      },
    ],
    faqs: [
      {
        question: 'Can drivers tip before the car is brought up?',
        answer: 'Yes! In fact, most drivers prefer scanning their ticket while waiting in the climate-controlled lobby, meaning zero delays once their car arrives at the curb.',
      },
      {
        question: 'How do you handle outdoor weather on the valet podium?',
        answer: 'We provide heavy-duty UV-stabilized, waterproof anodized metal and acrylic plaques specifically engineered for outdoor parking podiums.',
      },
      {
        question: 'Can the tip be pooled among all valets on that evening’s shift?',
        answer: 'Yes. Naponi automatically pools and splits tips evenly among all attendants checked into the active shift.',
      },
    ],
    relatedBlogSlugs: [
      'hotel-housekeeping-digital-tipping-guide',
      'what-is-digital-tipping-complete-guide',
      'digital-tipping-legal-compliance-tax-guide',
    ],
  },
};
