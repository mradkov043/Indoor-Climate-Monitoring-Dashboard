import { Request, Response } from 'express';
import { streamSensorData } from './sensorController';

const mockSetHeader = jest.fn();
const mockWrite = jest.fn();
const mockEnd = jest.fn();

const mockRes = {
  setHeader: mockSetHeader,
  write: mockWrite,
  end: mockEnd
} as unknown as Response;

describe('sensorController', () => {
  describe('streamSensorData', () => {
    it('should set headers and handle streaming data', () => {
      const mockSendUpdate = jest.fn();
      const mockSetHeader = jest.fn();
      const mockWrite = jest.fn();
      const mockEnd = jest.fn();
      const mockOn = jest.fn((event, handler) => {
        if (event === 'close') handler();
      });

      const mockReq = { on: mockOn } as unknown as Request;
      const mockRes = {
        setHeader: mockSetHeader,
        write: mockWrite,
        end: mockEnd
      } as unknown as Response;

      streamSensorData(mockReq, mockRes);

      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockSetHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockSetHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockOn).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});

