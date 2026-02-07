import { BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };
}

function createService() {
  const categoriesRepository = createRepositoryMock();
  const brandsRepository = createRepositoryMock();
  const productsRepository = createRepositoryMock();
  const variantsRepository = createRepositoryMock();
  const inventoryRepository = createRepositoryMock();
  const couponsRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock();
  const ordersRepository = createRepositoryMock();
  const orderStatusHistoryRepository = createRepositoryMock();
  const taxRulesRepository = createRepositoryMock();
  const shippingRulesRepository = createRepositoryMock();
  const adminAuditLogRepository = createRepositoryMock();

  const service = new AdminService(
    categoriesRepository as any,
    brandsRepository as any,
    productsRepository as any,
    variantsRepository as any,
    inventoryRepository as any,
    couponsRepository as any,
    usersRepository as any,
    ordersRepository as any,
    orderStatusHistoryRepository as any,
    taxRulesRepository as any,
    shippingRulesRepository as any,
    adminAuditLogRepository as any,
  );

  return {
    service,
    categoriesRepository,
    brandsRepository,
    productsRepository,
  };
}

describe('AdminService required name validation', () => {
  it('rejects category creation when name is missing', async () => {
    const { service, categoriesRepository } = createService();

    await expect(
      service.createCategory({
        name: '   ',
        description: 'test',
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(categoriesRepository.save).not.toHaveBeenCalled();
  });

  it('trims category name before persistence', async () => {
    const { service, categoriesRepository } = createService();
    categoriesRepository.create.mockImplementation((payload: any) => payload);
    categoriesRepository.save.mockImplementation(async (payload: any) => ({ id: 1, ...payload }));

    const created = await service.createCategory({
      name: '  Portable Audio  ',
      description: 'test',
    } as any);

    expect(categoriesRepository.create).toHaveBeenCalledWith({
      name: 'Portable Audio',
      description: 'test',
    });
    expect(created.name).toBe('Portable Audio');
  });

  it('rejects product creation when name is missing before insert', async () => {
    const { service, categoriesRepository, brandsRepository, productsRepository } = createService();
    categoriesRepository.findOne.mockResolvedValue({ id: 1 });
    brandsRepository.findOne.mockResolvedValue({ id: 2 });

    await expect(
      service.createProduct({
        name: '   ',
        slug: 'example',
        description: 'desc',
        basePrice: 10,
        categoryId: 1,
        brandId: 2,
        isFeatured: false,
        published: true,
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(productsRepository.save).not.toHaveBeenCalled();
  });
});
