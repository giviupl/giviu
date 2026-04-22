interface ColorSwatchProps {
  colors: { name: string; hex: string }[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  maxVisible?: number;
}

export default function ColorSwatch({
  colors,
  selectedIndex,
  onSelect,
  size = 'md',
  shape = 'circle',
  maxVisible,
}: ColorSwatchProps) {
  const sizeClasses = {
    sm: 'color-swatch-sm',
    md: 'color-swatch-md',
    lg: 'color-swatch-lg',
  };

  const visibleColors = maxVisible ? colors.slice(0, maxVisible) : colors;
  const hiddenCount = maxVisible ? colors.length - maxVisible : 0;

  const stopTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="color-swatch-container"
      onTouchStart={stopTouch}
      onTouchMove={stopTouch}
      onTouchEnd={stopTouch}
    >
      {visibleColors.map((color, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect?.(index);
          }}
          className={`color-swatch ${sizeClasses[size]} ${shape === 'square' ? 'color-swatch-square' : ''} ${selectedIndex === index ? 'active' : ''}`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
          aria-label={`Kolor: ${color.name}${selectedIndex === index ? ' (wybrany)' : ''}`}
          aria-pressed={selectedIndex === index}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="color-swatch-more">+{hiddenCount}</span>
      )}
    </div>
  );
}
