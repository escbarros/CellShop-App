import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponse {
  @ApiProperty({
    description: 'Stock keeping unit frozen at purchase time, so the order survives catalog edits.',
    example: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
  })
  sku!: string;

  @ApiProperty({
    description: 'Product name frozen at purchase time, written in Brazilian Portuguese.',
    example: 'Floral Scrapbook · iPhone 16',
  })
  name!: string;

  @ApiProperty({ description: 'Units bought of this variant.', type: 'integer', example: 2 })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price frozen at purchase time, as an integer amount of cents.',
    type: 'integer',
    example: 7990,
  })
  unitPriceCents!: number;

  @ApiProperty({
    description: 'Line total in cents, meaning unitPriceCents multiplied by quantity.',
    type: 'integer',
    example: 15980,
  })
  subtotalCents!: number;
}
