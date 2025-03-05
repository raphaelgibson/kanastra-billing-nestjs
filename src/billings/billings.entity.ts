import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Billings {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  governmentId: string;

  @Column()
  email: string;

  @Column('decimal')
  debtAmount: number;

  @Column('date')
  debtDueDate: Date;

  @Column({ unique: true })
  debtId: string;
}
