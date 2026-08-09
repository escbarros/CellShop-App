import { useState } from 'react';

const INTRINSIC_WIDTH = 600;
const INTRINSIC_HEIGHT = 800;

type ProductImageProps = {
  src: string;
  alt: string;
};

export function ProductImage({ src, alt }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? placeholderFor(src) : src}
      alt={alt}
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function placeholderFor(src: string): string {
  try {
    return new URL('placeholder.svg', src).href;
  } catch {
    return src;
  }
}
