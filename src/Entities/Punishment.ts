import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Punishment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  type: PunishmentTypes;

  @Column({
    type: 'varchar',
  })
  discord_id: string;

  @Column({
    type: 'timestamp',
  })
  remove_date: Date;
}
