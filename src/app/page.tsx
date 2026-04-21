import Hero from '@/components/home/Hero';
import RecommendationsSection from '@/components/home/RecommendationsSection';
import InspirationSection from '@/components/home/InspirationSection';
import QualitySection from '@/components/home/QualitySection';
import CTASection from '@/components/home/CTASection';
import dynamic from 'next/dynamic';
import FAQSection from '@/components/FAQSection';
import { FAQ_GENERAL } from '@/data/faq';

// Lazy load below-fold components
const BrandsCarousel = dynamic(() => import('@/components/BrandsCarousel'), {
  loading: () => <div style={{ minHeight: '100px' }} />,
});
const RecentlyViewedCarousel = dynamic(() => import('@/components/RecentlyViewedCarousel'), {
  loading: () => <div style={{ minHeight: '0px' }} />,
});

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Giviu',
  url: 'https://giviu.pl',
  logo: 'https://giviu.pl/og-default.jpg',
  description: 'Prezenty firmowe premium od najlepszych marek. Stanley, Moleskine, The North Face z personalizacją.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    availableLanguage: 'Polish',
  },
  sameAs: [
    'https://www.linkedin.com/company/giviu',
    'https://www.instagram.com/giviu.pl',
  ],
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Giviu — Prezenty Firmowe Premium',
  url: 'https://giviu.pl',
  description: 'Prezenty firmowe premium z personalizacją. Stanley, Moleskine, The North Face dla firm.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Warszawa',
    addressCountry: 'PL',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Polska',
  },
  priceRange: '$$',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Giviu',
  url: 'https://giviu.pl',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_GENERAL.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <BrandsCarousel />
      <RecommendationsSection />
      <InspirationSection />
      <QualitySection />
      <div className="home-faq">
        <FAQSection 
          title="Najczęściej zadawane pytania"
          description="Znajdź odpowiedzi na najczęstsze pytania dotyczące współpracy z Giviu."
          items={FAQ_GENERAL}
        />
      </div>
      <CTASection />
      <RecentlyViewedCarousel />
    </>
  );
}
