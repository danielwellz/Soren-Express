import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { CheckoutService } from 'src/checkout/checkout.service';

class PaymentWebhookEventDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  intentId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: PaymentWebhookEventDto,
    @Headers('x-soren-signature') signature?: string,
  ): Promise<{ received: boolean; duplicate?: boolean; ignored?: boolean; orderId?: number }> {
    return this.checkoutService.processPaymentWebhook(body, signature);
  }
}
