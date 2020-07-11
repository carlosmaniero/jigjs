import {Platform} from '../platform';

describe('Platform', () => {
  describe('browser', () => {
    const purePlatform = Platform.browser();
    it('isBrowser returns true', () => {
      expect(purePlatform.isBrowser()).toBeTruthy();
    });

    it('isServer returns false', () => {
      expect(purePlatform.isServer()).toBeFalsy();
    });

    it('returns browser strategy', () => {
      expect(purePlatform.strategy(() => 1, () => 2)).toBe(1);
    });
  });

  describe('server', () => {
    const purePlatform = Platform.server();

    it('isServer returns true', () => {
      expect(purePlatform.isBrowser()).toBeFalsy();
    });

    it('isServer returns false', () => {
      expect(purePlatform.isServer()).toBeTruthy();
    });

    it('returns server strategy', () => {
      expect(purePlatform.strategy(() => 1, () => 2)).toBe(2);
    });
  });
});
