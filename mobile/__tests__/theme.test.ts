import { brandColors, darkColors, getThemeColors, lightColors } from '../theme';

describe('uygulama teması', () => {
  it('brandbook ana renklerini aynen içerir', () => {
    expect(brandColors).toEqual({
      charcoal: '#414040',
      magenta: '#C03456',
      green: '#63A94B',
      turquoise: '#009CA8',
      gray: '#706F6F',
      purple: '#8F1874',
      yellow: '#FEC700',
    });
  });

  it('sistem açık veya belirsiz olduğunda açık paleti seçer', () => {
    expect(getThemeColors('light')).toBe(lightColors);
    expect(getThemeColors(null)).toBe(lightColors);
  });

  it('sistem karanlık olduğunda karanlık paleti seçer', () => {
    expect(getThemeColors('dark')).toBe(darkColors);
  });
});
