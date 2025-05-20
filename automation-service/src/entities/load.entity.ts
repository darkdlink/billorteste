import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Driver } from './driver.entity';

@Entity('loads')
export class Load {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  eta: Date;

  @Column()
  source: string;

  @Column({ nullable: true })
  external_id: string;

  @Column({ nullable: true })
  driver_id: number;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}