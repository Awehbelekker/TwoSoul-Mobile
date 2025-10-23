import { AnimationTimings } from '../../utils/animations';

describe('Animation Utilities', () => {
  describe('Animation Timings', () => {
    it('should have correct timing values', () => {
      expect(AnimationTimings.FAST).toBe(150);
      expect(AnimationTimings.NORMAL).toBe(300);
      expect(AnimationTimings.SLOW).toBe(500);
      expect(AnimationTimings.VERY_SLOW).toBe(800);
    });

    it('should have all timing presets', () => {
      expect(AnimationTimings).toHaveProperty('FAST');
      expect(AnimationTimings).toHaveProperty('NORMAL');
      expect(AnimationTimings).toHaveProperty('SLOW');
      expect(AnimationTimings).toHaveProperty('VERY_SLOW');
    });

    it('should have timing values in ascending order', () => {
      expect(AnimationTimings.FAST).toBeLessThan(AnimationTimings.NORMAL);
      expect(AnimationTimings.NORMAL).toBeLessThan(AnimationTimings.SLOW);
      expect(AnimationTimings.SLOW).toBeLessThan(AnimationTimings.VERY_SLOW);
    });
  });

  describe('Animation Utilities Export', () => {
    it('should export animation utilities', () => {
      const animations = require('../../utils/animations');

      expect(animations.createFadeInAnimation).toBeDefined();
      expect(animations.createSlideUpAnimation).toBeDefined();
      expect(animations.createScaleAnimation).toBeDefined();
      expect(animations.createBounceAnimation).toBeDefined();
      expect(animations.createPulseAnimation).toBeDefined();
      expect(animations.createShakeAnimation).toBeDefined();
      expect(animations.createRotationAnimation).toBeDefined();
      expect(animations.createFadeSlideAnimation).toBeDefined();
    });

    it('should export easing presets', () => {
      const { EasingPresets } = require('../../utils/animations');

      expect(EasingPresets).toBeDefined();
      expect(EasingPresets.EASE_IN).toBeDefined();
      expect(EasingPresets.EASE_OUT).toBeDefined();
      expect(EasingPresets.EASE_IN_OUT).toBeDefined();
      expect(EasingPresets.LINEAR).toBeDefined();
      expect(EasingPresets.BOUNCE).toBeDefined();
    });
  });

  describe('Animation Functions', () => {
    it('should create animation functions that return objects with startAnimation', () => {
      const { createFadeInAnimation } = require('../../utils/animations');
      const result = createFadeInAnimation(300);

      expect(result).toHaveProperty('fadeAnim');
      expect(result).toHaveProperty('startAnimation');
      expect(typeof result.startAnimation).toBe('function');
    });

    it('should support custom durations', () => {
      const { createFadeInAnimation } = require('../../utils/animations');

      const fast = createFadeInAnimation(150);
      const slow = createFadeInAnimation(800);

      expect(fast).toBeDefined();
      expect(slow).toBeDefined();
    });
  });
});

