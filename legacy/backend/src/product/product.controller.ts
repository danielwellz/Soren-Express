// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Patch,
//   Delete,
// } from '@nestjs/common';
// import { ProductService } from './product.service';
// import { CreateProductInput } from './dto/create-product.input';
// import { UpdateProductInput } from './dto/update-product.input';
// import { Product } from './entities/product.entity';

// @Controller('products')
// export class ProductController {
//   constructor(private readonly productService: ProductService) {}

//   @Get()
//   async findAll(): Promise<Product[]> {
//     return await this.productService.findAll();
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string): Promise<Product> {
//     return await this.productService.findOne(+id);
//   }

//   @Post()
//   async create(
//     @Body() createProductInput: CreateProductInput,
//   ): Promise<Product> {
//     return await this.productService.create(createProductInput);
//   }

//   @Patch(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() updateProductInput: UpdateProductInput,
//   ): Promise<Product> {
//     return await this.productService.update(+id, updateProductInput);
//   }

//   @Delete(':id')
//   async remove(@Param('id') id: string): Promise<void> {
//     return await this.productService.remove(+id);
//   }
// }
