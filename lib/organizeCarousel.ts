/**
 * Canvas-based carousel for smooth sliding transitions between organize views
 * Similar to the hero DeviceScene's phone screen rendering
 */

export interface CarouselView {
  name: string;
  imagePath: string;
}

export class OrganizeCarouselRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private images: Map<string, HTMLImageElement> = new Map();
  private currentIndex: number = 0;
  private targetIndex: number = 0;
  private animationProgress: number = 0;
  private isAnimating: boolean = false;
  private views: CarouselView[];
  private onUpdate?: () => void;
  private wrapDirection: number = 0; // -1 = wrap left, 1 = wrap right, 0 = normal

  constructor(width: number, height: number, views: CarouselView[]) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.views = views;

    // Pre-load all images
    this.preloadImages();
  }

  private async preloadImages(): Promise<void> {
    const loadPromises = this.views.map(view => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.images.set(view.imagePath, img);
          console.log('[OrganizeCarousel] Loaded:', view.imagePath);
          resolve();
        };
        img.onerror = (err) => {
          console.error('[OrganizeCarousel] Failed to load:', view.imagePath, err);
          reject(err);
        };
        img.src = view.imagePath;
      });
    });

    try {
      await Promise.all(loadPromises);
      console.log('[OrganizeCarousel] All images preloaded');
      this.render();
    } catch (err) {
      console.error('[OrganizeCarousel] Failed to preload images:', err);
    }
  }

  /**
   * Navigate to a specific view index
   */
  public goToView(index: number): void {
    if (index === this.currentIndex) return;
    if (index < 0 || index >= this.views.length) return;

    console.log('[OrganizeCarousel] Transitioning from', this.currentIndex, 'to', index);

    this.targetIndex = index;
    this.isAnimating = true;
    this.animationProgress = 0;

    // For circular carousel, determine the shortest path
    // This ensures smooth wrapping (e.g., from last to first slides right, not left)
    const totalViews = this.views.length;
    const directDistance = index - this.currentIndex;
    const wrapDistance = directDistance > 0
      ? directDistance - totalViews
      : directDistance + totalViews;

    // Use the shorter distance
    if (Math.abs(wrapDistance) < Math.abs(directDistance)) {
      this.wrapDirection = wrapDistance > 0 ? 1 : -1;
    } else {
      this.wrapDirection = 0; // Normal direction
    }
  }

  /**
   * Update animation (call this in requestAnimationFrame)
   */
  public tick(): void {
    if (this.isAnimating) {
      // Smooth easing - ease out cubic
      this.animationProgress += 0.08;

      if (this.animationProgress >= 1) {
        this.animationProgress = 1;
        this.isAnimating = false;
        this.currentIndex = this.targetIndex;
      }

      this.render();

      if (this.onUpdate) {
        this.onUpdate();
      }
    }
  }

  /**
   * Render the current state to canvas
   */
  private render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    if (!this.isAnimating) {
      // Static view - just draw current image
      const currentView = this.views[this.currentIndex];
      const img = this.images.get(currentView.imagePath);

      if (img) {
        this.ctx.drawImage(img, 0, 0, width, height);
      }
    } else {
      // Animating - draw sliding transition
      const progress = this.easeOutCubic(this.animationProgress);
      const offset = progress * width;

      // Determine direction: use wrapDirection if set, otherwise normal comparison
      let direction: number;
      if (this.wrapDirection !== 0) {
        direction = this.wrapDirection;
      } else {
        direction = this.targetIndex > this.currentIndex ? 1 : -1;
      }

      // Draw current image sliding out
      const currentView = this.views[this.currentIndex];
      const currentImg = this.images.get(currentView.imagePath);
      if (currentImg) {
        this.ctx.drawImage(
          currentImg,
          -offset * direction,
          0,
          width,
          height
        );
      }

      // Draw target image sliding in
      const targetView = this.views[this.targetIndex];
      const targetImg = this.images.get(targetView.imagePath);
      if (targetImg) {
        this.ctx.drawImage(
          targetImg,
          width * direction - offset * direction,
          0,
          width,
          height
        );
      }
    }
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Get the canvas element (use this for Three.js texture)
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get current view index
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Set update callback (called when canvas changes)
   */
  public setOnUpdate(callback: () => void): void {
    this.onUpdate = callback;
  }

  /**
   * Check if currently animating
   */
  public isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.images.clear();
  }
}
