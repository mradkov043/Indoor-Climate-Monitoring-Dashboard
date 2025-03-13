import { SensorDataSubject } from './sensorController';

describe('Observers and Notifications', () => {
  let subject: SensorDataSubject;
  const fixedDate = new Date('2024-06-12T03:31:34.711Z');

  beforeEach(() => {
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as unknown as Date);
    subject = new SensorDataSubject();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds and notifies observers', () => {
    const observerMock = jest.fn();
    subject.addObserver(observerMock);
    subject.notifyObservers({ type: 'Humidity', value: '50%', timestamp: fixedDate.toISOString() });

    expect(observerMock).toHaveBeenCalledWith({
      type: 'Humidity',
      value: '50%',
      timestamp: fixedDate.toISOString()
    });
  });

  it('removes observers correctly', () => {
    const observerMock = jest.fn();
    subject.addObserver(observerMock);
    subject.removeObserver(observerMock);
    subject.notifyObservers({ type: 'Humidity', value: '50%', timestamp: fixedDate.toISOString() });

    expect(observerMock).not.toHaveBeenCalled();
  });
});
