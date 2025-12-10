import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '../../generated/prisma';
import { PaginationDto } from 'src/common/dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger('ProductService');

  onModuleInit() {
      this.$connect();
      this.logger.log('DB connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

 async findAll( paginationDto: PaginationDto ) {

  const { page = 1, limit = 10 } = paginationDto;  

  const totalItems = await this.product.count({ where: { available: true } });

  const lastPage = Math.ceil(totalItems / limit);

  return {
      data: await this.product.findMany({
        skip: ( page - 1 ) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total: totalItems,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id , available: true }
    });
    

    if ( !product ) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return product;
  }

   async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __,...data} = updateProductDto;

    const existingProduct = await this.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return {
        message: `Product with id ${id} not found, cannot update`
      };
    }

    return this.product.update({
      where: { id },
      data: data,
    });

  }

  async remove(id: number) {

    await this.findOne(id);

    // return this.product.delete({
    //   where: { id }
    // });
    const product = await this.product.update({
      where: { id },
      data: { available: false }
    })
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids)); //esto es para purgar a los duplicados, tener en cuenta ya que puede haber productos con el mismo ID pero diferente campo como size con XL o CH
    const products = await this.product.findMany({
      where: {
        id: { in: ids },
      }
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: `Some products are not valid`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return products;
  }
}
