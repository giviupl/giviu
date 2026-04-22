'use client';

import { useState } from 'react';
import SectionLine from '@/components/SectionLine';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    title: string;
    description: string;
    items: FAQItem[];
    headingAs?: 'h1' | 'h2';
}

export default function FAQSection({ title, description, items, headingAs = 'h2' }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const Heading = headingAs;

    return (
        <section className="faq-section">
            <div className="faq-container">

                {/* Header */}
                <div className="faq-header">
                    <div className="faq-title-wrapper">
                        <SectionLine spacing="sm" />
                        <Heading className="faq-title">{title}</Heading>
                    </div>
                    <p className="faq-description">{description}</p>
                </div>

                {/* FAQ items */}
                <div className="faq-list">
                    {items.map((item, index) => (
                        <div key={index} className={`faq-item ${openIndex === index ? 'faq-item--open' : ''}`}>
                            <button
                                className="faq-question"
                                onClick={() => toggleFaq(index)}
                                aria-expanded={openIndex === index}
                            >
                                <span className="faq-question-text">
                                    {item.question}
                                </span>
                                <span className="faq-icon">
                                    +
                                </span>
                            </button>
                            <div className="faq-answer">
                                <p className="faq-answer-text">{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
