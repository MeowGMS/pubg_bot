import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  discord_id: string;

  @Column({
    type: 'varchar',
  })
  pubg_id: string;

  @Column({
    type: 'timestamp',
    precision: 6,
    nullable: true,
  })
  last_stats_update?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_query_update?: Date;

  @Column({
    type: 'varchar',
  })
  game_nickname: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  tpp?: IViewStats;

  @Column({
    type: 'json',
    nullable: true,
  })
  fpp?: IViewStats;
}
