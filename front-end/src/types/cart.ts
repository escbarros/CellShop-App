import { z } from 'zod';

export const cartItemSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const storedCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export type CartItem = z.infer<typeof cartItemSchema>;
