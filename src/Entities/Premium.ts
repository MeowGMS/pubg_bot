import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Premium {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  discord_id: string;

  @Column({
    type: 'timestamp',
  })
  remove_date: Date;

  @Column({
    type: 'varchar',
  })
  role_id: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  get_times: number;
}
