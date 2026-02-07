import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryReservationStatus } from 'src/common/enums';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';
import { User } from './user.entity';

@Entity({ name: 'inventory_reservations' })
export class InventoryReservation {
  @PrimaryGeneratedColumn('uuid', { name: 'reservation_id' })
  reservationId: string;

  @ManyToOne(() => ProductVariant, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  @Column({ type: 'enum', enum: InventoryReservationStatus })
  status: InventoryReservationStatus;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
