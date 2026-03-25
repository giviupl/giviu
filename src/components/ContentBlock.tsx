import SectionLine from '@/components/SectionLine';

interface ContentBlockProps {
  layout: 'text-left' | 'text-right';
  title: string;
  titleSecondary?: string;
  paragraphs: string[];
  image?: string;
  headingAs?: 'h1' | 'h2';
}

export default function ContentBlock({ 
  layout, 
  title, 
  titleSecondary,
  paragraphs, 
  image,
  headingAs = 'h2',
}: ContentBlockProps) {
  const isTextLeft = layout === 'text-left';
  const Heading = headingAs;

  return (
    <section className="content-block">
      <div className={`content-block-grid ${isTextLeft ? '' : 'content-block-reversed'}`}>
        
        {/* Text */}
        <div className="content-block-text">
          <div className="content-block-text-inner">
            <SectionLine spacing="sm" />
            <Heading className="content-block-title">
              {titleSecondary ? (
                <>
                  <span className="content-block-title-dark">{title}</span>
                  <br />
                  <span className="content-block-title-primary">{titleSecondary}</span>
                </>
              ) : (
                <span className="content-block-title-primary">{title}</span>
              )}
            </Heading>
            <div className="content-block-paragraphs">
              {paragraphs.map((text, index) => (
                <p key={index} className="content-block-paragraph">{text}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Image / Placeholder */}
        <div className="content-block-image-wrapper">
          <div className="content-block-image">
            {image ? (
              <img src={image} alt={title} className="content-block-img" />
            ) : (
              <svg className="content-block-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
