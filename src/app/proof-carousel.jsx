import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import DepthCarousel from '../components/depth-carousel/DepthCarousel.jsx';
import proofData from '../../content/profile/proofs.json';

const proofs = proofData.map(item => ({
  ...item,
  image: new URL(item.image, document.baseURI).href
}));

function ProofGallery() {
  const [active, setActive] = useState(0);
  const item = proofs[active];

  return (
    <div className="proof-gallery">
      <div className="proof-carousel-frame">
        <DepthCarousel
          items={proofs}
          cardWidth={340}
          cardHeight={430}
          depth={220}
          spread={90}
          tilt={22}
          tiltDirection="right"
          perspective={1400}
          visibleCards={4}
          falloff={0.2}
          blur={6}
          autoplay
          loop
          onChange={setActive}
        />
      </div>
      <div className="proof-caption" aria-live="polite">
        <span>{String(active + 1).padStart(2, '0')} / {String(proofs.length).padStart(2, '0')}</span>
        <strong>{item.title}</strong>
        <a href={item.image} target="_blank" rel="noopener noreferrer">查看完整图片 ↗</a>
      </div>
    </div>
  );
}

export function mountProofCarousel(element) {
  const root = createRoot(element);
  root.render(<ProofGallery />);
  return () => root.unmount();
}
