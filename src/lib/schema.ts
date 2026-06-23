export interface PersonData {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image?: string;
  sameAs: string[];
  knowsAbout: string[];
  address?: { 
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    country: string; 
  };
}

export interface SiteData {
  url: string;
  name: string;
  description: string;
}

export function generatePerson(data: PersonData) {
  return {
    '@type': 'Person',
    '@id': `${data.url}/#person`,
    name: data.name,
    jobTitle: data.jobTitle,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    sameAs: data.sameAs,
    knowsAbout: data.knowsAbout,
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.country,
      },
    }),
  };
}

export function generateWebSite(data: SiteData, personId: string) {
  return {
    '@type': 'WebSite',
    '@id': `${data.url}/#website`,
    url: data.url,
    name: data.name,
    description: data.description,
    author: { '@id': personId },
    publisher: { '@id': personId },
    inLanguage: 'en',
  };
}

export function generateWebPage(data: { url: string; name: string; description: string; dateModified: string }, siteId: string, aboutId: string) {
  return {
    '@type': 'WebPage',
    '@id': `${data.url}/#webpage`,
    url: data.url,
    name: data.name,
    description: data.description,
    isPartOf: { '@id': siteId },
    about: { '@id': aboutId },
    inLanguage: 'en',
    dateModified: data.dateModified,
  };
}

export function generateOrganization(data: { name: string; url: string; logo: string; sameAs: string[]; founderId: string }) {
  return {
    '@type': 'Organization',
    '@id': `${data.url}/#organization`,
    name: data.name,
    url: data.url,
    logo: { '@type': 'ImageObject', url: data.logo },
    sameAs: data.sameAs,
    founder: { '@id': data.founderId },
    foundingDate: '2019-01-01',
  };
}

export function generateBreadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1].url}/#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQPage(qas: { question: string; answer: string }[], baseUrl?: string) {
  const id = baseUrl ? `${baseUrl}/#faq` : '/#faq';
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}

export function generateBlogPosting(data: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  publisherId: string;
  keywords?: string[];
  section?: string;
  wordCount?: number;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${data.url}/#article`,
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    author: data.authorUrl 
      ? { '@type': 'Person', '@id': data.authorUrl, name: data.authorName }
      : { '@type': 'Person', name: data.authorName },
    publisher: { '@id': data.publisherId },
    mainEntityOfPage: { '@id': data.url },
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    ...(data.keywords && { keywords: data.keywords.join(', ') }),
    ...(data.section && { articleSection: data.section }),
    ...(data.wordCount && { wordCount: data.wordCount }),
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

export function generateArticle(data: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorId: string;
  publisherId: string;
  keywords?: string[];
}) {
  return {
    '@type': 'Article',
    '@id': `${data.url}/#article`,
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    author: { '@id': data.authorId },
    publisher: { '@id': data.publisherId },
    mainEntityOfPage: { '@id': data.url },
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    ...(data.keywords && { keywords: data.keywords.join(', ') }),
  };
}

export function generateLocalBusiness(person: PersonData) {
  return {
    '@type': 'LocalBusiness',
    '@id': `${person.url}/#localbusiness`,
    name: `${person.name} — Senior DevOps Engineer`,
    description: person.description,
    url: person.url,
    sameAs: person.sameAs,
    ...(person.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: person.address.streetAddress,
        addressLocality: person.address.addressLocality,
        addressRegion: person.address.addressRegion,
        postalCode: person.address.postalCode,
        addressCountry: person.address.country,
      },
    }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '33.343355',
      longitude: '10.490444',
    },
    ICBM: '33.343355, 10.490444',
  };
}

export function generateProfessionalService(data: {
  name: string;
  description: string;
  url: string;
  providerId: string;
  areaServed: string[];
  serviceTypes: string[];
}) {
  return {
    '@type': 'ProfessionalService',
    '@id': `${data.url}/#service`,
    name: data.name,
    description: data.description,
    provider: { '@id': data.providerId },
    areaServed: data.areaServed.map((a) => ({ '@type': 'Place', name: a })),
    serviceType: data.serviceTypes,
  };
}

export function generateItemList(items: { position: number; url: string; name: string }[], baseUrl?: string) {
  const id = baseUrl ? `${baseUrl}/#blog-posts` : '/#blog-posts';
  return {
    '@type': 'ItemList',
    '@id': id,
    name: 'Technical blog posts by Aymen ben Yedder',
    description: 'Articles on DevOps, infrastructure automation, and systems engineering.',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      url: item.url,
      name: item.name,
    })),
  };
}

export function generateSoftwareApplication(data: { name: string; url: string; description: string; creatorId: string }) {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${data.url}/#softwareapp`,
    name: data.name,
    url: data.url,
    description: data.description,
    applicationCategory: 'Portfolio',
    operatingSystem: 'Web',
    creator: { '@id': data.creatorId },
    author: { '@id': data.creatorId },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function generateAuthor(data: { name: string; url: string; jobTitle?: string; bio?: string; image?: string; sameAs?: string[]; knowsAbout?: string[] }) {
  return {
    '@type': 'Person',
    '@id': `${data.url}/#person`,
    name: data.name,
    jobTitle: data.jobTitle,
    description: data.bio,
    url: data.url,
    ...(data.image && { image: data.image }),
    sameAs: data.sameAs,
    knowsAbout: data.knowsAbout,
  };
}

export function generateTechArticle(data: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  publisherId: string;
  keywords?: string[];
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  dependencies?: string[];
}) {
  return {
    '@type': 'TechArticle',
    '@id': `${data.url}/#techarticle`,
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    author: data.authorUrl
      ? { '@type': 'Person', '@id': data.authorUrl, name: data.authorName }
      : { '@type': 'Person', name: data.authorName },
    publisher: { '@id': data.publisherId },
    mainEntityOfPage: { '@id': data.url },
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    ...(data.keywords && { keywords: data.keywords.join(', ') }),
    ...(data.proficiencyLevel && { proficiencyLevel: data.proficiencyLevel }),
    ...(data.dependencies && { dependencies: data.dependencies }),
  };
}

export function generateHeadGraph(
  person: PersonData,
  site: SiteData,
  page?: { url?: string; name?: string; description?: string }
) {
  const personObj = generatePerson(person);
  const personId = personObj['@id'];
  const siteObj = generateWebSite(site, personId);
  const siteId = siteObj['@id'];
  const pageUrl = page?.url || site.url;
  const pageName = page?.name || site.name;
  const pageDescription = page?.description || site.description;
  const pageObj = generateWebPage(
    { url: pageUrl, name: pageName, description: pageDescription, dateModified: new Date().toISOString().split('T')[0] },
    siteId,
    personId
  );
  const org = generateOrganization({
    name: site.name,
    url: site.url,
    logo: person.image || `${site.url}/assets/img/preview.webp`,
    sameAs: person.sameAs,
    founderId: personId,
  });
  const lb = generateLocalBusiness(person);
  const service = generateProfessionalService({
    name: `${person.name} — Senior DevOps Engineer`,
    description: 'Professional DevOps consulting, CI/CD automation, cloud infrastructure, and web development services.',
    url: `${site.url}/services/`,
    providerId: personId,
    areaServed: ['Tunisia', 'France', 'Europe', 'Middle East', 'North Africa'],
    serviceTypes: ['DevOps Consulting', 'CI/CD Pipeline Automation', 'Cloud Infrastructure', 'Web Development', 'Server Setup & Hardening'],
  });
  const app = generateSoftwareApplication({
    name: site.name,
    url: site.url,
    description: site.description,
    creatorId: personId,
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [personObj, siteObj, pageObj, org, lb, service, app],
  };
}