import { formatConfidence, groupDetections } from '../utils/detectionViewModel';

describe('detection view-model', () => {
  it('confidence değerini yüzde olarak biçimlendirir', () => {
    expect(formatConfidence(0.96)).toBe('%96');
    expect(formatConfidence(1.2)).toBe('%100');
    expect(formatConfidence(-0.1)).toBe('%0');
  });

  it('aynı sınıfları sayar ve en yüksek güveni korur', () => {
    expect(
      groupDetections([
        { class: 'Person', confidence: 0.81 },
        { class: 'Helmet', confidence: 0.91 },
        { class: 'Person', confidence: 0.96 },
      ]),
    ).toEqual([
      { className: 'Person', count: 2, confidence: 0.96 },
      { className: 'Helmet', count: 1, confidence: 0.91 },
    ]);
  });
});
