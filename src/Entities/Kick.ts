import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Kick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  voice_id: string;

  @Column({
    type: 'timestamp',
  })
  unpunish_date: Date;

  @Column({
    type: 'varchar',
  })
  punish_id: string;
}
