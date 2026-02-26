import { CartService } from './cart.service';

describe('CartService merge guest cart', () => {
  it('merges guest cart items into user cart and deactivates guest cart', async () => {
    const cartsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const service = new CartService(
      cartsRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { trackEvent: jest.fn() } as any,
    );

    const user = { id: 12 } as any;
    const userCart = { id: 1, items: [] } as any;
    const guestCart = {
      id: 2,
      sessionId: 'guest-123',
      active: true,
      items: [
        { variant: { id: 101 }, quantity: 2 },
        { variant: { id: 102 }, quantity: 1 },
      ],
    } as any;

    jest.spyOn(service, 'getCartForUserOrSession').mockResolvedValue(userCart);
    jest.spyOn(service, 'addItem').mockResolvedValue(userCart);

    cartsRepository.findOne.mockResolvedValue(guestCart);
    cartsRepository.save.mockResolvedValue({ ...guestCart, active: false });

    const result = await service.mergeGuestCartToUser(
      { sessionId: 'guest-123' },
      user,
    );

    expect(service.addItem).toHaveBeenCalledTimes(2);
    expect(service.addItem).toHaveBeenNthCalledWith(1, { variantId: 101, quantity: 2 }, user);
    expect(service.addItem).toHaveBeenNthCalledWith(2, { variantId: 102, quantity: 1 }, user);
    expect(cartsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ active: false }),
    );
    expect(result).toBe(userCart);
  });
});
