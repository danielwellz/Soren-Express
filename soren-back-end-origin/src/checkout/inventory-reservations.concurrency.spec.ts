import { InventoryReservationStatus } from 'src/common/enums';
import { CheckoutService } from './checkout.service';

describe('Inventory reservations concurrency', () => {
  it('allows only one reservation for the last unit under parallel requests', async () => {
    const inventory = { quantity: 1, reserved: 0 } as any;
    const reservations: any[] = [];

    const inventoryReservationsRepository = {
      find: jest.fn(async ({ where }: any = {}) => {
        if (!where) {
          return [...reservations];
        }

        return reservations.filter((reservation) => {
          if (where.status && reservation.status !== where.status) {
            return false;
          }
          if (where.order && reservation.order?.id !== where.order.id) {
            return false;
          }
          if (where.variant && reservation.variant?.id !== where.variant.id) {
            return false;
          }
          return true;
        });
      }),
      findOne: jest.fn(async ({ where }: any) => {
        return (
          reservations.find((reservation) => {
            if (where.status && reservation.status !== where.status) {
              return false;
            }
            if (where.order && reservation.order?.id !== where.order.id) {
              return false;
            }
            if (where.variant && reservation.variant?.id !== where.variant.id) {
              return false;
            }
            return true;
          }) || null
        );
      }),
      create: jest.fn((value: any) => value),
      save: jest.fn(async (value: any) => {
        const existingIndex = reservations.findIndex(
          (reservation) => reservation.reservationId && reservation.reservationId === value.reservationId,
        );

        if (!value.reservationId) {
          value.reservationId = `res-${reservations.length + 1}`;
        }

        if (existingIndex >= 0) {
          reservations[existingIndex] = value;
        } else {
          reservations.push(value);
        }

        return value;
      }),
    } as any;

    const service = new CheckoutService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        findOne: jest.fn(async () => inventory),
        save: jest.fn(async (value) => value),
      } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      inventoryReservationsRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const user = { id: 9 } as any;
    const variant = { id: 77 } as any;

    const orderA = {
      id: 100,
      items: [{ variant, sku: 'SKU-77', quantity: 1 }],
    } as any;

    const orderB = {
      id: 101,
      items: [{ variant, sku: 'SKU-77', quantity: 1 }],
    } as any;

    const results = await Promise.allSettled([
      (service as any).reserveInventoryForOrder(orderA, user, undefined, 'cid-a'),
      (service as any).reserveInventoryForOrder(orderB, user, undefined, 'cid-b'),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(
      reservations.filter((reservation) => reservation.status === InventoryReservationStatus.ACTIVE),
    ).toHaveLength(1);
  });
});
