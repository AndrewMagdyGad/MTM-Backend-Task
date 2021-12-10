import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import { User } from './User'
import { Post } from './Post'

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @IsNotEmpty()
  title: string

  @Column()
  @IsNotEmpty()
  description: string

  @ManyToOne((type) => Post, (post) => post.id)
  post: Post

  @ManyToOne((type) => User, (author) => author.id)
  author: User

  @Column()
  @CreateDateColumn()
  createdAt: Date

  @Column()
  @UpdateDateColumn()
  updatedAt: Date
}
