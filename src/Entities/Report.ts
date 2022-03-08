import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  report_msg_channel: string;

  @Column({
    type: 'varchar',
  })
  report_message: string;

  @Column({
    type: 'varchar',
  })
  dm_channel: string;

  @Column({
    type: 'varchar',
  })
  dm_message: string;

  @Column({
    type: 'varchar',
  })
  author: string;

  @Column({
    type: 'varchar',
  })
  reason: string;
}
