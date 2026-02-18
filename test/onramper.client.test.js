const OnramperClient = require('../src/onramper/client');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('OnramperClient', () => {
  let client;
  let mock;
  const apiKey = 'test-api-key';
  const baseUrl = 'https://api.onramper.com';

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new OnramperClient({ apiKey, baseUrl });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Constructor', () => {
    it('should throw error if apiKey is missing', () => {
      expect(() => new OnramperClient({ baseUrl })).toThrow('ONRAMP_API_KEY is required');
    });

    it('should throw error if baseUrl is missing', () => {
      expect(() => new OnramperClient({ apiKey })).toThrow('ONRAMP_API_BASE is required');
    });
  });

  describe('getOnrampQuotes', () => {
    it('should fetch and normalize onramp quotes', async () => {
      const mockResponse = [
        {
          ramp: 'moonpay',
          payout: 0.00398,
          rate: 24138.08,
          availablePaymentMethods: [{ paymentTypeId: 'creditcard' }]
        }
      ];

      mock.onGet(`${baseUrl}/quotes/eur/btc`).reply(200, mockResponse);

      const quotes = await client.getOnrampQuotes({
        fiatCurrency: 'EUR',
        network: 'BTC',
        amount: 100,
        paymentMethod: 'creditcard'
      });

      expect(quotes).toHaveLength(1);
      expect(quotes[0]).toEqual({
        provider: 'moonpay',
        quote: 0.00398,
        network: 'BTC',
        estimatedOutAmount: 0.00398,
        raw: mockResponse[0]
      });
    });

    it('should handle API errors', async () => {
      mock.onGet(`${baseUrl}/quotes/eur/btc`).reply(400, { message: 'Invalid amount' });

      try {
        await client.getOnrampQuotes({
          fiatCurrency: 'EUR',
          network: 'BTC',
          amount: -1
        });
      } catch (error) {
        expect(error).toEqual({
          code: 'ONRAMP_API_ERROR',
          message: 'Invalid amount',
          details: { message: 'Invalid amount' }
        });
      }
    });
  });

  describe('createOnrampOrder', () => {
    it('should create and normalize onramp order', async () => {
      const mockResponse = {
        message: {
          transactionId: 'tx-123',
          onramp: 'moonpay',
          status: 'in_progress',
          outAmount: 0.00398,
          destination: 'btc',
          redirectUrl: 'https://checkout.moonpay.com/123',
          wallet: { address: 'bc1q...' }
        }
      };

      mock.onPost(`${baseUrl}/checkout/intent`).reply(200, mockResponse);

      const order = await client.createOnrampOrder({
        fiatCurrency: 'EUR',
        network: 'BTC',
        fiatAmount: 100,
        paymentMethod: 'creditcard',
        walletAddress: 'bc1q...',
        partnerOrderId: 'partner-123'
      });

      expect(order).toEqual({
        orderId: 'tx-123',
        checkoutUrl: 'https://checkout.moonpay.com/123',
        provider: 'moonpay',
        quote: 0.00398,
        network: 'btc',
        walletAddress: 'bc1q...',
        estimatedOutAmount: 0.00398,
        status: 'in_progress',
        raw: mockResponse
      });
    });
  });

  describe('getOnrampOrder', () => {
    it('should fetch and normalize transaction details', async () => {
      const mockResponse = {
        transactionId: 'tx-123',
        onramp: 'transfi',
        status: 'completed',
        outAmount: 0.00202,
        destination: 'btc',
        walletAddress: 'bc1q...',
        onrampTransactionId: 'OR-123'
      };

      mock.onGet(`${baseUrl}/transactions/tx-123`).reply(200, mockResponse);

      const order = await client.getOnrampOrder('tx-123');

      expect(order.orderId).toBe('tx-123');
      expect(order.status).toBe('completed');
      expect(order.onrampTransactionId).toBe('OR-123');
    });
  });

  describe('Retries', () => {
    it('should retry on 502/503/504 errors', async () => {
      // Mock 502 then 200
      mock.onGet(`${baseUrl}/quotes/eur/btc`)
        .replyOnce(502)
        .onGet(`${baseUrl}/quotes/eur/btc`)
        .reply(200, []);

      const quotes = await client.getOnrampQuotes({
        fiatCurrency: 'EUR',
        network: 'BTC',
        amount: 100
      });

      expect(quotes).toEqual([]);
      expect(mock.history.get.length).toBe(2);
    });

    it('should fail after max retries', async () => {
      mock.onGet(`${baseUrl}/quotes/eur/btc`).reply(503);

      try {
        await client.getOnrampQuotes({
          fiatCurrency: 'EUR',
          network: 'BTC',
          amount: 100
        });
      } catch (error) {
        expect(error.code).toBe('ONRAMP_API_ERROR');
        // 1 initial + 3 retries = 4 attempts
        expect(mock.history.get.length).toBe(4);
      }
    });
  });
});
