import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'admin_audit_log' })
export class AdminAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'actor_user_id', type: 'int' })
  actorUserId: number;

  @Column({ type: 'varchar', length: 120 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 120 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 120, nullable: true })
  entityId?: string;

  @Column({ name: 'before_state', type: 'simple-json', nullable: true })
  beforeState?: Record<string, unknown>;

  @Column({ name: 'after_state', type: 'simple-json', nullable: true })
  afterState?: Record<string, unknown>;

  @Column({ name: 'correlation_id', type: 'varchar', length: 120 })
  correlationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
