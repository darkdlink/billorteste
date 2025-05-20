import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Load } from './load.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  load_id: number;

  @ManyToOne(() => Load)
  @JoinColumn({ name: 'load_id' })
  load: Load;

  @Column('text')
  summary_text: string;

  @Column('jsonb', { nullable: true })
  insights: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}