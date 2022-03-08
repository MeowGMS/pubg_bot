import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class QueryElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  user_id: string;

  @Column({
    type: 'varchar',
  })
  game_nickname: string;

  @Column({
    type: 'varchar',
  })
  update_type: QueryUpdateType;

  @Column({
    type: 'int',
  })
  update_priority: number;
}
