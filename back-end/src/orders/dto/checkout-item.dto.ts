import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export const MIN_ITEM_QUANTITY = 1;
export const MAX_ITEM_QUANTITY = 10;

export class CheckoutItemDto {
  @ApiProperty({
    description: 'Stock keeping unit of the variant being bought, as returned by GET /products.',
    example: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
    maxLength: 60,
  })
  @IsString({ message: 'Informe o produto.' })
  @IsNotEmpty({ message: 'Informe o produto.' })
  @MaxLength(60, { message: 'Produto inválido.' })
  sku!: string;

  @ApiProperty({
    description: 'How many units of this variant to buy.',
    type: 'integer',
    example: 2,
    minimum: MIN_ITEM_QUANTITY,
    maximum: MAX_ITEM_QUANTITY,
  })
  @IsInt({ message: 'Informe a quantidade em números inteiros.' })
  @Min(MIN_ITEM_QUANTITY, { message: 'Leve ao menos uma unidade.' })
  @Max(MAX_ITEM_QUANTITY, { message: 'Leve no máximo 10 unidades de cada capinha.' })
  quantity!: number;
}
