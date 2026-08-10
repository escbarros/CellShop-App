import { ApiProperty } from '@nestjs/swagger';

export class RecipientResponse {
  @ApiProperty({
    description: 'Full name of whoever receives the order.',
    example: 'Ana Beatriz Nogueira',
  })
  name!: string;

  @ApiProperty({
    description:
      'CPF with the first three and last two digits hidden. The route has no authentication, so it never hands back a whole document.',
    example: '***.533.447-**',
  })
  taxId!: string;

  @ApiProperty({
    description: 'Contact email recorded with the order.',
    example: 'ana.nogueira@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Contact phone recorded with the order, or null when none was given.',
    type: String,
    nullable: true,
    example: '11987654321',
  })
  phone!: string | null;

  @ApiProperty({ description: 'Zip code, eight digits with no punctuation.', example: '01310930' })
  zipCode!: string;

  @ApiProperty({ description: 'Street name of the delivery address.', example: 'Avenida Paulista' })
  street!: string;

  @ApiProperty({ description: 'Street number of the delivery address.', example: '1578' })
  number!: string;

  @ApiProperty({
    description: 'Extra address information, or null when none was given.',
    type: String,
    nullable: true,
    example: 'Apto 92, torre B',
  })
  complement!: string | null;

  @ApiProperty({ description: 'District of the delivery address.', example: 'Bela Vista' })
  district!: string;

  @ApiProperty({ description: 'City of the delivery address.', example: 'São Paulo' })
  city!: string;

  @ApiProperty({ description: 'Two letter state code.', example: 'SP' })
  state!: string;
}
