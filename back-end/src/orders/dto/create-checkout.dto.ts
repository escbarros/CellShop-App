import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { CheckoutItemDto } from './checkout-item.dto';
import { RecipientDto } from './recipient.dto';

export const MIN_ORDER_ITEMS = 1;
export const MAX_ORDER_ITEMS = 5;

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Lines of the order. Each sku may appear only once, with its own quantity.',
    type: [CheckoutItemDto],
    minItems: MIN_ORDER_ITEMS,
    maxItems: MAX_ORDER_ITEMS,
  })
  @IsArray({ message: 'Informe os itens da compra.' })
  @ArrayMinSize(MIN_ORDER_ITEMS, { message: 'Escolha ao menos uma capinha.' })
  @ArrayMaxSize(MAX_ORDER_ITEMS, { message: 'Leve no máximo 5 capinhas diferentes por pedido.' })
  @ArrayUnique((item: CheckoutItemDto) => item.sku, {
    message: 'Cada capinha pode aparecer uma vez só. Some as unidades no mesmo item.',
  })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiProperty({
    description: 'Who receives the order and where it is delivered.',
    type: RecipientDto,
  })
  @IsDefined({ message: 'Informe os dados de entrega.' })
  @ValidateNested()
  @Type(() => RecipientDto)
  recipient!: RecipientDto;
}
