import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('uygulama adını gösterir', () => {
    const { getByText } = render(<App />);

    expect(getByText('iThinka Vision')).toBeTruthy();
  });
});
