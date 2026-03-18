import { ArrayMinSize, IsArray, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  items!: string[];

  @IsNumber()
  @Min(0)
  totalAmount!: number;
}
