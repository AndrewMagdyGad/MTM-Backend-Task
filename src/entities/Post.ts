import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import { User } from './User'
import { Comment } from './Comment'

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @IsNotEmpty()
  title: string

  @Column()
  @IsNotEmpty()
  description: string

  @OneToMany((type) => Comment, (comment) => comment.post)
  comments: Comment[]

  @ManyToOne((type) => User, (author) => author.id)
  author: User

  @ManyToMany(() => User)
  @JoinTable()
  likes: User[]

  @Column()
  @CreateDateColumn()
  createdAt: Date

  @Column()
  @UpdateDateColumn()
  updatedAt: Date
}
