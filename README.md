# Onramper Node.js Client

A production-quality Node.js module that wraps the Onramper HTTP API and normalizes responses to the Bitfront schema.

## Features

- **Full Coverage**: Supports onramp/offramp quotes and orders.
- **Normalization**: Maps Onramper fields to Bitfront schema.
- **Resilience**: Automatic retries on 502/503/504 errors with exponential backoff.
- **Error Handling**: Structured error objects with clear codes and details.
- **Logging**: Supports optional winston-like logger.
- **Timeouts**: Configurable timeout (default 10s).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ONRAMP_API_BASE` | Base URL for Onramper API (e.g., `https://api.onramper.com`) |
| `ONRAMP_API_KEY` | Your Onramper API Key |

## Installation

```bash
npm install axios
```

## Usage Example (Node.js)

```javascript
const OnramperClient = require('./src/onramper/client');

const client = new OnramperClient({
  apiKey: process.env.ONRAMP_API_KEY,
  baseUrl: process.env.ONRAMP_API_BASE,
  timeout: 10000,
  logger: console // Optional
});

async function example() {
  try {
    // Get Onramp Quotes
    const quotes = await client.getOnrampQuotes({
      fiatCurrency: 'EUR',
      network: 'BTC',
      amount: 100,
      paymentMethod: 'creditcard',
      country: 'us'
    });
    console.log('Quotes:', quotes);

    // Create Onramp Order
    const order = await client.createOnrampOrder({
      provider: 'moonpay',
      fiatCurrency: 'EUR',
      network: 'BTC',
      fiatAmount: 100,
      paymentMethod: 'creditcard',
      walletAddress: 'bc1q...',
      partnerOrderId: 'order_123',
      successUrl: 'https://myapp.com/success',
      failureUrl: 'https://myapp.com/failure'
    });
    console.log('Order:', order);
  } catch (error) {
    console.error('Error:', error.code, error.message);
  }
}
```

## Usage Example (curl)

### Get Quotes
```bash
curl -X GET "https://api.onramper.com/quotes/eur/btc?amount=100&paymentMethod=creditcard" \
     -H "Authorization: YOUR_API_KEY" \
     -H "Accept: application/json"
```

### Create Order (Checkout Intent)
```bash
curl -X POST "https://api.onramper.com/checkout/intent" \
     -H "Authorization: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "source": "eur",
       "destination": "btc",
       "amount": 100,
       "paymentMethod": "creditcard",
       "wallet": { "address": "bc1q..." }
     }'
```

## Bitfront Schema Mapping

| Bitfront Field | Onramper Field | Description |
|----------------|----------------|-------------|
| `orderId` | `transactionId` | Unique identifier for the transaction |
| `checkoutUrl` | `redirectUrl` | URL to redirect user for payment |
| `provider` | `onramp` / `ramp` | The service provider (e.g., moonpay) |
| `quote` | `outAmount` / `payout` | Estimated crypto/fiat amount to receive |
| `network` | `destination` | The blockchain network |
| `walletAddress`| `wallet.address` | Destination wallet address |
| `estimatedOutAmount` | `outAmount` | Same as quote |
| `onrampTransactionId` | `onrampTransactionId` | Provider-specific transaction ID |

## Testing

```bash
npm test
```
