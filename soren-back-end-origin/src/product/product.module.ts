import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { ProductRepository } from './product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService, ProductRepository, ProductResolver],
})
export class ProductModule {}
