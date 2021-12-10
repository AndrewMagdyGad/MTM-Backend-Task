import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { Length, IsNotEmpty, IsEmail } from 'class-validator'
import * as bcrypt from 'bcryptjs'
import { Post } from './Post'
import { Comment } from './Comment'

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Length(4, 20)
  username: string

  @Column()
  @IsEmail()
  email: string

  @Column()
  @Length(4, 100)
  password: string

  @Column()
  @IsNotEmpty()
  role: string

  @Column({ default: null })
  refreshToken: string

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  lastLoginDate: Date

  @OneToMany((type) => Post, (post) => post.author)
  posts: Post[]

  @OneToMany((type) => Comment, (comment) => comment.author)
  comments: Comment[]

  @Column()
  @CreateDateColumn()
  createdAt: Date

  @Column()
  @UpdateDateColumn()
  updatedAt: Date

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8)
  }

  checkIfUnEncryptedPasswordIsValid(unEncryptedPassword: string) {
    return bcrypt.compareSync(unEncryptedPassword, this.password)
  }
}
