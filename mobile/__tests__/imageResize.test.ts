import { IMAGE_JPEG_QUALITY, IMAGE_MAX_LONG_EDGE } from '../constants/image';
import { calculateOptimizedDimensions, getImageResizeTarget } from '../utils/imageResize';

describe('görsel optimizasyon boyutları', () => {
  it('merkezi optimizasyon değerlerini kullanır', () => {
    expect(IMAGE_MAX_LONG_EDGE).toBe(1280);
    expect(IMAGE_JPEG_QUALITY).toBe(0.85);
  });

  it('büyük yatay görselin genişliğini sınırlar ve oranını korur', () => {
    expect(getImageResizeTarget({ width: 4000, height: 3000 })).toEqual({
      width: 1280,
      height: null,
    });
    expect(calculateOptimizedDimensions({ width: 4000, height: 3000 })).toEqual({
      width: 1280,
      height: 960,
    });
  });

  it('büyük portre görselin yüksekliğini sınırlar ve oranını korur', () => {
    expect(getImageResizeTarget({ width: 3000, height: 4000 })).toEqual({
      width: null,
      height: 1280,
    });
    expect(calculateOptimizedDimensions({ width: 3000, height: 4000 })).toEqual({
      width: 960,
      height: 1280,
    });
  });

  it('kare görseli kare olarak küçültür', () => {
    expect(calculateOptimizedDimensions({ width: 3000, height: 3000 })).toEqual({
      width: 1280,
      height: 1280,
    });
  });

  it('küçük ve tam sınırdaki görselleri büyütmez', () => {
    expect(getImageResizeTarget({ width: 800, height: 600 })).toBeNull();
    expect(calculateOptimizedDimensions({ width: 800, height: 600 })).toEqual({
      width: 800,
      height: 600,
    });
    expect(getImageResizeTarget({ width: 720, height: 1280 })).toBeNull();
  });

  it('geçersiz boyutları reddeder', () => {
    expect(() => getImageResizeTarget({ width: 0, height: 600 })).toThrow(RangeError);
    expect(() => getImageResizeTarget({ width: 800, height: Number.NaN })).toThrow(RangeError);
  });
});
