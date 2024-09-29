import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CivilityEnum } from '../models/civility';

@Entity('user_account', { schema: 'core' })
export class UserAccount {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('character varying', { name: 'email' })
  email: string;

  @Column('character varying', { name: 'first_name' })
  first_name: string;

  @Column('character varying', { name: 'last_name' })
  last_name: string;

  @Column('enum', { name: 'civ', enum: CivilityEnum })
  civ: CivilityEnum;

  @Column('character varying', { name: 'password' })
  password: string;

  @Column('character varying', { name: 'photo' })
  photo: string;

  @Column('boolean', { name: 'actived', default: true })
  actived: boolean;

  @Column('boolean', { name: 'archived', default: false })
  archived: boolean;

  @Column('timestamp', { name: 'creation_date', default: 'NOW()' })
  creation_date: string;

  @Column('timestamp', { name: 'update_date', default: 'NOW()', onUpdate: 'NOW()' })
  update_date: string;
}
