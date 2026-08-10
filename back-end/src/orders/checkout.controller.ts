import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiEnvelope, ApiEnvelopeError } from '../common/dto/api-envelope.decorator';
import {
  IDEMPOTENCY_KEY_HEADER,
  IdempotencyKeyGuard,
} from '../common/guards/idempotency-key.guard';
import { API_TAGS } from '../common/swagger';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrderResponse } from './dto/order.response';

@ApiTags(API_TAGS.checkout)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(IdempotencyKeyGuard)
  @ApiOperation({
    summary: 'Place an order',
    description:
      'Validates the payload, decrements stock for every item and records the order. Stock is only taken when the whole order can be served, so a partial purchase never happens.',
  })
  @ApiHeader({
    name: IDEMPOTENCY_KEY_HEADER,
    required: true,
    description:
      'Client generated key that identifies this purchase attempt. Retrying with the same key returns the original order instead of buying twice.',
    example: '8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
  })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiEnvelope({
    status: HttpStatus.CREATED,
    description: 'Order placed. Stock was decremented and the idempotency key was recorded.',
    type: OrderResponse,
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description:
      'Idempotent repeat. This Idempotency-Key had already been used, so the order created the first time is returned unchanged and no new stock was taken.',
    type: OrderResponse,
  })
  @ApiEnvelopeError({
    status: HttpStatus.BAD_REQUEST,
    description: 'MISSING_IDEMPOTENCY_KEY. The request arrived without the Idempotency-Key header.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.NOT_FOUND,
    description: 'SKU_NOT_FOUND. One of the requested skus is unknown or no longer active.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.CONFLICT,
    description: 'INSUFFICIENT_STOCK. Someone else took the last units while this order was open.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'VALIDATION_FAILED. The payload broke a field rule; details lists every failure.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'SERVICE_UNAVAILABLE. Injected failure, used to exercise the retry path.',
  })
  create(
    @Body() payload: CreateCheckoutDto,
    @Headers(IDEMPOTENCY_KEY_HEADER) idempotencyKey: string,
    @Res({ passthrough: true }) response: Response,
  ): OrderResponse {
    const outcome = this.checkout.create(payload, idempotencyKey);

    if (outcome.replayed) {
      response.status(HttpStatus.OK);
    }

    return outcome.order;
  }
}
