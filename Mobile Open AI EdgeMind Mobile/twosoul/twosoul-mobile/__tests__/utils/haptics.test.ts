import { HapticType } from '../../utils/haptics';

describe('Haptic Feedback Utilities', () => {
  describe('Haptic Types', () => {
    it('should have haptic types defined', () => {
      expect(HapticType.LIGHT).toBeDefined();
      expect(HapticType.MEDIUM).toBeDefined();
      expect(HapticType.HEAVY).toBeDefined();
      expect(HapticType.SUCCESS).toBeDefined();
      expect(HapticType.WARNING).toBeDefined();
      expect(HapticType.ERROR).toBeDefined();
      expect(HapticType.SELECTION).toBeDefined();
    });

    it('should have correct haptic type values', () => {
      expect(typeof HapticType.LIGHT).toBe('string');
      expect(typeof HapticType.MEDIUM).toBe('string');
      expect(typeof HapticType.HEAVY).toBe('string');
    });
  });

  describe('Haptic Utilities Export', () => {
    it('should export haptic functions', () => {
      const haptics = require('../../utils/haptics');

      expect(haptics.triggerLightHaptic).toBeDefined();
      expect(haptics.triggerMediumHaptic).toBeDefined();
      expect(haptics.triggerHeavyHaptic).toBeDefined();
      expect(haptics.triggerSuccessHaptic).toBeDefined();
      expect(haptics.triggerWarningHaptic).toBeDefined();
      expect(haptics.triggerErrorHaptic).toBeDefined();
      expect(haptics.triggerSelectionHaptic).toBeDefined();
      expect(haptics.triggerHapticSequence).toBeDefined();
    });

    it('should export haptic presets', () => {
      const { HapticPresets } = require('../../utils/haptics');

      expect(HapticPresets).toBeDefined();
      expect(HapticPresets.buttonPress).toBeDefined();
      expect(HapticPresets.messageSent).toBeDefined();
      expect(HapticPresets.messageReceived).toBeDefined();
      expect(HapticPresets.personalityChange).toBeDefined();
      expect(HapticPresets.error).toBeDefined();
      expect(HapticPresets.warning).toBeDefined();
      expect(HapticPresets.longPress).toBeDefined();
      expect(HapticPresets.swipe).toBeDefined();
      expect(HapticPresets.doubleTap).toBeDefined();
      expect(HapticPresets.loadingStart).toBeDefined();
      expect(HapticPresets.loadingComplete).toBeDefined();
      expect(HapticPresets.onboardingStep).toBeDefined();
      expect(HapticPresets.onboardingComplete).toBeDefined();
    });
  });

  describe('Haptic Presets', () => {
    it('should have all haptic presets as functions', () => {
      const { HapticPresets } = require('../../utils/haptics');

      Object.values(HapticPresets).forEach((preset: any) => {
        expect(typeof preset).toBe('function');
      });
    });

    it('should have 13 haptic presets', () => {
      const { HapticPresets } = require('../../utils/haptics');
      const presetCount = Object.keys(HapticPresets).length;

      expect(presetCount).toBe(13);
    });
  });

  describe('Haptic Functions', () => {
    it('should export haptic trigger functions', () => {
      const {
        triggerLightHaptic,
        triggerMediumHaptic,
        triggerHeavyHaptic,
        triggerSuccessHaptic,
        triggerWarningHaptic,
        triggerErrorHaptic,
        triggerSelectionHaptic,
      } = require('../../utils/haptics');

      expect(typeof triggerLightHaptic).toBe('function');
      expect(typeof triggerMediumHaptic).toBe('function');
      expect(typeof triggerHeavyHaptic).toBe('function');
      expect(typeof triggerSuccessHaptic).toBe('function');
      expect(typeof triggerWarningHaptic).toBe('function');
      expect(typeof triggerErrorHaptic).toBe('function');
      expect(typeof triggerSelectionHaptic).toBe('function');
    });

    it('should export haptic sequence function', () => {
      const { triggerHapticSequence } = require('../../utils/haptics');

      expect(typeof triggerHapticSequence).toBe('function');
    });
  });
});

