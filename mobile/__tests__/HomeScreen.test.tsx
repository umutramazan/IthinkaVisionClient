import { act, fireEvent, render } from '@testing-library/react-native';

import { HomeScreen } from '../screens/HomeScreen';

describe('HomeScreen', () => {
  afterEach(() => jest.useRealTimers());

  it('yalnızca Detection modelini gösterir', () => {
    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('Detection')).toBeTruthy();
    expect(queryByText('Classification')).toBeNull();
  });

  it('görsel seçilmeden değerlendirmeyi engeller', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Değerlendir'));
    expect(getByText('Devam etmek için kamera veya galeriden bir görsel seçin.')).toBeTruthy();
  });

  it('model seçilmeden değerlendirmeyi engeller', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Galeri'));
    fireEvent.press(getByText('Değerlendir'));
    expect(getByText('Devam etmek için Detection modelini seçin.')).toBeTruthy();
  });

  it('loading sırasında kontrolleri pasifleştirir ve gruplu sonucu gösterir', () => {
    jest.useFakeTimers();
    const { getByRole, getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Galeri'));
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Değerlendir'));

    expect(getByText('Görsel değerlendiriliyor…')).toBeTruthy();
    expect(getByRole('button', { name: 'Değerlendir' }).props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(getByRole('button', { name: 'Kamera' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    act(() => jest.advanceTimersByTime(700));
    expect(getByText('Person')).toBeTruthy();
    expect(getByText('2 adet')).toBeTruthy();
    expect(getByText('%96')).toBeTruthy();
  });

  it('boş sonucu hata yerine bilgi görünümü olarak gösterir', () => {
    jest.useFakeTimers();
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Galeri'));
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Boş'));
    fireEvent.press(getByText('Değerlendir'));
    act(() => jest.advanceTimersByTime(700));
    expect(getByText('Nesne tespit edilemedi')).toBeTruthy();
  });

  it('statik hata senaryosunu kullanıcı dostu diyalogda gösterir', () => {
    jest.useFakeTimers();
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Kamera'));
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Hata'));
    fireEvent.press(getByText('Değerlendir'));
    act(() => jest.advanceTimersByTime(700));
    expect(
      getByText('Görsel değerlendirilirken bir sorun oluştu. Lütfen tekrar deneyin.'),
    ).toBeTruthy();
  });
});
