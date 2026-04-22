interface SectionLineProps {
    spacing?: 'sm' | 'md' | 'lg' | 'none';
    vertical?: boolean;
    className?: string;
  }
  
  export default function SectionLine({ spacing = 'md', vertical = false, className = '' }: SectionLineProps) {
    const spacingValues = {
      none: '0',
      sm: '16px',
      md: '24px',
      lg: '32px',
    };
  
    if (vertical) {
      return (
        <div 
          className={`section-line section-line-vertical ${className}`} 
          style={{
            width: '1px',
            backgroundColor: 'var(--color-primary)',
            alignSelf: 'stretch',
            flexShrink: 0,
          }} 
        />
      );
    }
  
    return (
      <div 
        className={`section-line ${className}`} 
        style={{
          height: '1px',
          backgroundColor: 'var(--color-primary)',
          marginBottom: spacingValues[spacing],
          width: '100%',
        }} 
      />
    );
  }
