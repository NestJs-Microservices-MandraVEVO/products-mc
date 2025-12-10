import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @Post()
  @MessagePattern({cmd: 'create_product'})
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  // @Get()
  @MessagePattern({cmd: 'get_products'})
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern({cmd: 'get_product'})
  findOne(@Payload('id',ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  // @Patch(':id')
  @MessagePattern({cmd: 'update_product'})
  update(
    // @Param('id',ParseIntPipe) id: number,
    // @Body() updateProductDto: UpdateProductDto, 
    @Payload() updateProductDto: UpdateProductDto,
  )
     {
    
    return this.productService.update(updateProductDto.id, updateProductDto);
  }

  // @Delete(':id')
  @MessagePattern({cmd: 'delete_product'})
  remove(@Payload     ('id',ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  @MessagePattern({cmd: 'validate_products'})
  validateProduct(@Payload() ids: number[]){
    return this.productService.validateProducts(ids);
  }
}
