import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const ONLY_DIGITS_TAX_ID = /^\d{11}$/;
const ONLY_DIGITS_ZIP_CODE = /^\d{8}$/;
const TWO_LETTERS_STATE = /^[A-Za-z]{2}$/;

export class RecipientDto {
  @ApiProperty({
    description: 'Full name of whoever receives the order.',
    example: 'Ana Beatriz Nogueira',
    minLength: 3,
    maxLength: 120,
  })
  @IsString({ message: 'Informe o nome de quem vai receber.' })
  @MinLength(3, { message: 'O nome precisa ter ao menos 3 letras.' })
  @MaxLength(120, { message: 'O nome pode ter no máximo 120 caracteres.' })
  name!: string;

  @ApiProperty({
    description: 'Brazilian CPF, eleven digits with no punctuation.',
    example: '39053344705',
    pattern: ONLY_DIGITS_TAX_ID.source,
  })
  @Matches(ONLY_DIGITS_TAX_ID, { message: 'Informe o CPF com 11 números, sem pontos nem traço.' })
  taxId!: string;

  @ApiProperty({
    description: 'Contact email, where the order confirmation is sent.',
    example: 'ana.nogueira@example.com',
    maxLength: 150,
  })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(150, { message: 'O e-mail pode ter no máximo 150 caracteres.' })
  email!: string;

  @ApiPropertyOptional({
    description: 'Contact phone with area code. Optional.',
    example: '11987654321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Telefone inválido.' })
  @MaxLength(20, { message: 'O telefone pode ter no máximo 20 caracteres.' })
  phone?: string;

  @ApiProperty({
    description: 'Brazilian postal code, eight digits with no dash.',
    example: '01310930',
    pattern: ONLY_DIGITS_ZIP_CODE.source,
  })
  @Matches(ONLY_DIGITS_ZIP_CODE, { message: 'Informe o CEP com 8 números, sem traço.' })
  zipCode!: string;

  @ApiProperty({
    description: 'Street name of the delivery address.',
    example: 'Avenida Paulista',
    maxLength: 150,
  })
  @IsString({ message: 'Informe a rua.' })
  @IsNotEmpty({ message: 'Informe a rua.' })
  @MaxLength(150, { message: 'A rua pode ter no máximo 150 caracteres.' })
  street!: string;

  @ApiProperty({
    description: 'Street number. Text, because addresses like 1578-A exist.',
    example: '1578',
    maxLength: 20,
  })
  @IsString({ message: 'Informe o número.' })
  @IsNotEmpty({ message: 'Informe o número.' })
  @MaxLength(20, { message: 'O número pode ter no máximo 20 caracteres.' })
  number!: string;

  @ApiPropertyOptional({
    description: 'Apartment, block or reference point. Optional.',
    example: 'Apto 92, torre B',
    maxLength: 60,
  })
  @IsOptional()
  @IsString({ message: 'Complemento inválido.' })
  @MaxLength(60, { message: 'O complemento pode ter no máximo 60 caracteres.' })
  complement?: string;

  @ApiProperty({
    description: 'Neighbourhood of the delivery address.',
    example: 'Bela Vista',
    maxLength: 80,
  })
  @IsString({ message: 'Informe o bairro.' })
  @IsNotEmpty({ message: 'Informe o bairro.' })
  @MaxLength(80, { message: 'O bairro pode ter no máximo 80 caracteres.' })
  district!: string;

  @ApiProperty({
    description: 'City of the delivery address.',
    example: 'São Paulo',
    maxLength: 80,
  })
  @IsString({ message: 'Informe a cidade.' })
  @IsNotEmpty({ message: 'Informe a cidade.' })
  @MaxLength(80, { message: 'A cidade pode ter no máximo 80 caracteres.' })
  city!: string;

  @ApiProperty({
    description: 'State as the two letter Brazilian abbreviation.',
    example: 'SP',
    pattern: TWO_LETTERS_STATE.source,
  })
  @Matches(TWO_LETTERS_STATE, { message: 'Informe o estado com 2 letras, como SP.' })
  state!: string;
}
