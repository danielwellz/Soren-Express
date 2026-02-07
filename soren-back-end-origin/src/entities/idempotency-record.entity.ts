import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'idempotency_records' })
@Index(['scopeKey', 'operation', 'idempotencyKey'], { unique: true })
export class IdempotencyRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scope_key' })
  scopeKey: string;

  @Column({ type: 'varchar', length: 128 })
  operation: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255 })
  idempotencyKey: string;

  @Column({ name: 'request_hash', type: 'varchar', length: 128 })
  requestHash: string;

  @Column({ name: 'response_snapshot', type: 'simple-json', nullable: true })
  responseSnapshot?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
