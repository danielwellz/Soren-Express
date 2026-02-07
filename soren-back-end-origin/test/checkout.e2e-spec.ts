import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const runDbE2E = process.env.RUN_DB_E2E === 'true';
const describeDb = runDbE2E ? describe : describe.skip;

describeDb('Checkout flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, creates order, and confirms fake payment', async () => {
    const email = `e2e_${Date.now()}@soren.store`;
    const password = 'Checkout123!';

    const registerMutation = {
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            user { id email }
            tokens { accessToken refreshToken }
          }
        }
      `,
      variables: {
        input: {
          email,
          password,
          fullName: 'Checkout E2E User',
        },
      },
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send(registerMutation)
      .expect(200);

    const accessToken = registerResponse.body?.data?.register?.tokens?.accessToken;
    expect(accessToken).toBeTruthy();

    const productsResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query Products {
            products(pagination: { page: 1, pageSize: 1 }) {
              items {
                id
                variants {
                  id
                }
              }
            }
          }
        `,
      })
      .expect(200);

    const variantId = productsResponse.body?.data?.products?.items?.[0]?.variants?.[0]?.id;
    expect(variantId).toBeTruthy();

    await request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          mutation AddToCart($input: AddCartItemInput!) {
            addToCart(input: $input) { id }
          }
        `,
        variables: {
          input: {
            variantId: Number(variantId),
            quantity: 1,
          },
        },
      })
      .expect(200);

    const createOrderResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          mutation CreateOrder($input: CreateOrderInput!) {
            createOrder(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            shippingName: 'Checkout User',
            shippingAddress: '123 Main St',
            shippingCity: 'Los Angeles',
            shippingRegion: 'US-CA',
            shippingPostalCode: '90001',
          },
        },
      })
      .expect(200);

    const orderId = createOrderResponse.body?.data?.createOrder?.id;
    expect(orderId).toBeTruthy();

    const createIntentResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
            createPaymentIntent(input: $input) {
              payment {
                intentId
              }
            }
          }
        `,
        variables: {
          input: {
            orderId: Number(orderId),
          },
        },
      })
      .expect(200);

    const intentId = createIntentResponse.body?.data?.createPaymentIntent?.payment?.intentId;
    expect(intentId).toBeTruthy();

    const confirmPaymentResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          mutation ConfirmPayment($input: ConfirmPaymentInput!) {
            confirmPayment(input: $input) {
              payment { status }
              order { status }
            }
          }
        `,
        variables: {
          input: {
            intentId,
            cardLast4: '4242',
          },
        },
      })
      .expect(200);

    expect(confirmPaymentResponse.body?.data?.confirmPayment?.payment?.status).toBe('SUCCEEDED');
    expect(confirmPaymentResponse.body?.data?.confirmPayment?.order?.status).toBe('PAID');
  });
});
