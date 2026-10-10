import { BlogPost, BlogAuthor } from './posts';

export const DEFAULT_AUTHOR_ES: BlogAuthor = {
  name: 'Equipo Editorial Naponi Hostelería',
  role: 'Especialistas en FinTech para Restauración y Pagos Digitales',
  avatar: '/naponi-brand.svg',
  bio: 'El equipo de Naponi ayuda a restaurantes, bares y hoteles en España y Latinoamérica a modernizar el cobro de propinas sin efectivo de forma justa, transparente y directa.',
};

export const BLOG_CATEGORIES_ES = [
  'Propina Digital',
  'Código QR Propinas',
  'Restaurantes y Bares',
  'Cafeterías',
  'Hoteles y Turismo',
  'Gestión de Personal',
] as const;

export const BLOG_POSTS_ES: BlogPost[] = [
  {
    slug: 'que-es-propina-digital-guia-restaurantes',
    title: '¿Qué es la propina digital? Guía completa para restaurantes y hostelería (2026)',
    excerpt: 'Descubre cómo funciona la propina digital mediante código QR en restaurantes y bares. Ventajas para camareros, aumento de ingresos y configuración en minutos.',
    content: `
      <p class="lead">
        Con el auge de los pagos móviles y con tarjeta (Apple Pay, Google Pay, tarjetas contactless), el dinero en efectivo está desapareciendo de los bolsillos de los clientes. Para los camareros y el personal de hostelería, esto significa una pérdida crítica en sus ingresos mensuales. La <strong>propina digital mediante código QR</strong> es la solución tecnológica que devuelve las propinas a los equipos de sala y cocina.
      </p>

      <h2>¿Por qué los clientes ya no dejan propina en metálico?</h2>
      <p>
        No es falta de generosidad: según estudios del sector hostelero, más del 80% de los comensales querría premiar un buen servicio, pero <strong>no llevan monedas ni billetes encima</strong>. Preguntar al camarero si se puede añadir la propina en el datáfono suele resultar incómodo, o bien el dinero acaba en la cuenta general del negocio sujeto a comisiones bancarias y retenciones.
      </p>

      <h2>¿Cómo funciona la propina digital de Naponi?</h2>
      <ol>
        <li><strong>Identificador o QR en la mesa:</strong> En cada mesa o en la cuenta se coloca un soporte elegante con un código QR único.</li>
        <li><strong>Escaneo instantáneo:</strong> El comensal escanea el QR con su móvil sin necesidad de descargar ninguna aplicación móvil.</li>
        <li><strong>Elección del importe:</strong> Elige un porcentaje (10%, 15%, 20%) o introduce una cantidad personalizada en euros.</li>
        <li><strong>Pago seguro en 6 segundos:</strong> Con Bizum, Apple Pay, Google Pay o tarjeta bancaria.</li>
        <li><strong>Llegada directa al camarero:</strong> El dinero se transfiere directamente a la cuenta del empleado o al bote común del equipo.</li>
      </ol>

      <h2>Ventajas clave para propietarios de restaurantes</h2>
      <ul>
        <li><strong>Atracción y retención de talento:</strong> Los camareros ganan entre un 35% y un 50% más de propinas, lo que reduce la rotación de plantilla.</li>
        <li><strong>Cero costes de integración:</strong> No requiere modificar el software TPV existente ni comprar datáfonos adicionales.</li>
        <li><strong>Total transparencia:</strong> Panel de control para el hostelero con estadísticas en tiempo real y opciones de reparto automatizado.</li>
      </ul>

      <div class="blog-cta-box" style="margin-top: 2.5rem; padding: 2rem; border-radius: 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05)); border: 1px solid rgba(245, 158, 11, 0.3);">
        <h3 style="color: #fbbf24; margin-bottom: 0.5rem;">Cree su cuenta gratuita para su restaurante hoy</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
          Configure su establecimiento en 2 minutos y descargue sus códigos QR listos para imprimir. Sin costes fijos mensuales.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/register" class="blog-btn-cta" style="background: #f59e0b; color: #000; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none;">Crear cuenta gratis &rarr;</a>
          <a href="/tools/tip-calculator" style="display: inline-flex; align-items: center; color: #fbbf24; font-weight: 600; text-decoration: none; padding: 0.75rem 1rem;">Calculadora de propinas &rarr;</a>
        </div>
      </div>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Propina digital en restaurantes y hosteleria con codigo QR',
    author: DEFAULT_AUTHOR_ES,
    category: 'Propina Digital',
    tags: ['propina digital', 'hosteleria', 'codigo qr propinas', 'camareros', 'restaurantes espana'],
    targetKeyword: 'propina digital restaurantes',
    secondaryKeywords: ['propinas con codigo qr', 'propina sin efectivo hosteleria', 'como cobrar propinas con qr', 'propina camareros'],
    searchIntent: 'Commercial',
    metaTitle: '¿Qué es la Propina Digital para Restaurantes? (Guía 2026) — Naponi',
    metaDescription: 'Cómo implementar propinas digitales con código QR en restaurantes y bares. Aumente los ingresos de sus camareros sin comisiones ocultas.',
    canonicalUrl: 'https://www.naponi.com/blog/que-es-propina-digital-guia-restaurantes',
    language: 'es',
    status: 'published',
    datePublished: '2026-03-18T10:00:00Z',
    dateModified: '2026-10-10T12:00:00Z',
    readingTime: '5 Min. de lectura',
    isFeatured: true,
    faq: [
      {
        question: '¿Los clientes necesitan instalar una app para dejar propina?',
        answer: 'No. El cliente solo tiene que apuntar con la cámara de su teléfono móvil al código QR de la mesa y pagar mediante Apple Pay, Google Pay o tarjeta en pocos segundos.',
      },
      {
        question: '¿Cómo llega el dinero a los empleados?',
        answer: 'Dependiendo de la configuración elegida por el restaurante, la propina puede ir directamente a la cuenta del camarero asignado o acumularse en el bote común digital del turno para repartirse de forma equitativa.',
      },
    ],
    relatedSlugs: [
      'como-calcular-dividir-propinas-camareros-restaurante',
    ],
  },
  {
    slug: 'como-calcular-dividir-propinas-camareros-restaurante',
    title: 'Cómo calcular y repartir propinas en hostelería: Bote común y sistema de puntos',
    excerpt: 'Aprende a repartir el bote de propinas entre sala, barra y cocina de forma equitativa y transparente. Modelos de reparto, turnos y calculadora.',
    content: `
      <p class="lead">
        El reparto del bote en un restaurante es uno de los temas más sensibles para mantener un ambiente de trabajo positivo. Si el sistema no se percibe como justo, surgen tensiones entre el personal de sala (camareros) y el de cocina (cocineros, friegaplatos). A continuación, analizamos los mejores métodos probados en hostelería.
      </p>

      <h2>Los 3 métodos más utilizados para repartir el bote</h2>
      <h3>1. Reparto a partes iguales (Cafeterías y locales pequeños)</h3>
      <p>
        Se suma todo el bote recaudado durante el turno o la semana y se divide entre el número total de trabajadores que han prestado servicio. Es fácil de calcular, pero puede generar fricción si unos empleados trabajaron más horas o asumieron más responsabilidades.
      </p>

      <h3>2. Reparto porcentual por áreas (Sala, Cocina, Barra)</h3>
      <p>
        Un estándar habitual en restaurantes con servicio completo de mesas:
      </p>
      <ul>
        <li><strong>Sala / Camareros:</strong> 60% del total.</li>
        <li><strong>Cocina y limpieza:</strong> 25% del total.</li>
        <li><strong>Barra / Bartenders:</strong> 15% del total.</li>
      </ul>

      <h3>3. Sistema de puntos y horas trabajadas (El método más justo)</h3>
      <p>
        Se asigna un peso o multiplicador a cada puesto en función de la implicación directa en el servicio:
      </p>
      <ul>
        <li>Camarero principal / Responsable de sala: 1.0 puntos</li>
        <li>Camarero / Barman: 0.9 puntos</li>
        <li>Cocinero / Chef de partida: 0.7 puntos</li>
        <li>Ayudante de cocina / Friegaplatos: 0.5 puntos</li>
      </ul>
      <p>
        Cada empleado acumula puntos según sus horas de turno: <code>Puntos Empleado = Horas Trabajadas &times; Peso del Puesto</code>. El valor económico de cada punto se calcula dividiendo el bote total entre la suma total de puntos.
      </p>

      <h2>¿Puede el dueño o encargado quedarse parte del bote?</h2>
      <p>
        En la legislación laboral y el convenio de hostelería en España, <strong>las propinas pertenecen exclusivamente a los trabajadores</strong>. La dirección o gerencia no debe retener ni quedarse con ninguna porción de las propinas destinadas al personal.
      </p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Reparto de propinas y bote comun en restaurantes camareros cocina',
    author: DEFAULT_AUTHOR_ES,
    category: 'Gestión de Personal',
    tags: ['repartir propinas', 'bote comun restaurante', 'camareros cocina propina', 'calculadora propinas'],
    targetKeyword: 'como repartir propinas restaurante',
    secondaryKeywords: ['bote propinas hosteleria', 'reparto propinas camareros cocina', 'sistema de puntos propina', 'calculadora reparto propinas'],
    searchIntent: 'Commercial',
    metaTitle: 'Cómo Repartir Propinas en Hostelería: Bote y Sistema de Puntos — Naponi',
    metaDescription: 'Guía paso a paso para calcular y repartir el bote de propinas entre camareros, cocina y barra de forma equitativa. Modelos y calculadora gratuita.',
    canonicalUrl: 'https://www.naponi.com/blog/como-calcular-dividir-propinas-camareros-restaurante',
    language: 'es',
    status: 'published',
    datePublished: '2026-03-22T10:00:00Z',
    dateModified: '2026-10-10T12:00:00Z',
    readingTime: '5 Min. de lectura',
    isFeatured: false,
    faq: [
      {
        question: '¿La cocina debe recibir propinas en España?',
        answer: 'Aunque tradicionalmente las propinas las recibía el personal de sala, la gran mayoría de los restaurantes modernos incluyen a la cocina en el bote común (entre un 20% y un 30% del total), ya que la calidad de la comida es determinante para la propina.',
      },
    ],
    relatedSlugs: [
      'que-es-propina-digital-guia-restaurantes',
    ],
  },
];
