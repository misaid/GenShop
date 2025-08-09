import AWS from 'aws-sdk';
import stripe from 'stripe';
import OpenAI from 'openai';

// Prevent external network calls during tests by mocking heavy SDKs
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      constructor() {}
      get chat() {
        return {
          completions: {
            create: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      name: 'Test Product',
                      price: 1,
                      description: 'desc',
                      stock: 1,
                      categories: ['Test'],
                      department: 'Electronics',
                    }),
                  },
                },
              ],
            }),
          },
        };
      }
      get images() {
        return {
          generate: async () => ({ data: [{ b64_json: '' }] }),
        };
      }
    },
  };
});

vi.mock('aws-sdk', () => {
  const putObject = () => ({ promise: async () => ({}) });
  return {
    default: {
      S3: class {
        constructor() {}
        putObject = putObject;
      },
    },
  };
});

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      constructor() {}
      checkout = {
        sessions: {
          create: async () => ({ id: 'sess_123', amount_total: 100 }),
          retrieve: async () => ({
            amount_total: 100,
            shipping_details: {
              address: {
                line1: 'a',
                city: 'b',
                postal_code: 'c',
                country: 'd',
              },
            },
            line_items: { data: [] },
            metadata: { items: JSON.stringify({}), processed: false },
          }),
          update: async () => ({}),
        },
      };
    },
  };
});
