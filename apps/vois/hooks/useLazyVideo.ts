import { useEffect, useRef, useState } from 'react';

interface UseLazyVideoOptions {
  rootMargin?: string;
  threshold?: number;
}

export const useLazyVideo = (options: UseLazyVideoOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { rootMargin = '200px', threshold = 0.1 } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, shouldLoad]);

  return { videoRef, shouldLoad };
};
