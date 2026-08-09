import { ApiProperty } from '@nestjs/swagger';

export class VariantResponse {
  @ApiProperty({
    description: 'Stock keeping unit. Identifies the variant in every other endpoint.',
    example: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
  })
  sku!: string;

  @ApiProperty({
    description: 'Commercial name shown on the storefront, written in Brazilian Portuguese.',
    example: 'Floral Scrapbook · iPhone 16',
  })
  name!: string;

  @ApiProperty({
    description: 'Long description shown on the product detail, written in Brazilian Portuguese.',
    example:
      'Colagem de flores prensadas, fitas e polaroides sobre fundo bege, com espaço para nome e fotos.',
  })
  description!: string;

  @ApiProperty({
    description: 'Unit price as an integer amount of cents. R$ 79,90 is 7990.',
    type: 'integer',
    example: 7990,
  })
  priceCents!: number;

  @ApiProperty({
    description:
      'Unit price already formatted as Brazilian currency, so the client never divides by 100.',
    example: 'R$ 79,90',
  })
  formattedPrice!: string;

  @ApiProperty({
    description: 'Units currently on hand. Zero means sold out, not hidden.',
    type: 'integer',
    example: 12,
  })
  availableQty!: number;

  @ApiProperty({
    description: 'Whether the variant can be bought right now, meaning availableQty is above zero.',
    example: true,
  })
  available!: boolean;

  @ApiProperty({
    description: 'Absolute URL of the full size image, built from IMAGES_BASE_URL.',
    example: 'http://localhost:3333/images/cap-scrapbook-ip16-ais-tra.jpg',
  })
  imageUrl!: string;

  @ApiProperty({
    description: 'Absolute URL of the thumbnail, used by the storefront listing.',
    example: 'http://localhost:3333/images/cap-scrapbook-ip16-ais-tra-thumb.jpg',
  })
  thumbUrl!: string;
}
