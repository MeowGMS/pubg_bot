import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Seeking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  voice_channel: string;

  @Column({
    type: 'varchar',
  })
  msg_channel: string;

  @Column({
    type: 'varchar',
  })
  message: string;

  @Column({
    type: 'varchar',
  })
  author: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_bump?: Date;

  @Column({
    type: 'timestamp',
  })
  created_at: Date;

  @Column({
    type: 'varchar',
  })
  invite: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  comment: string;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  is_ranked?: boolean;
}
