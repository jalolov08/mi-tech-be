export type User = {
  email: string;
  password: string;
  name: string;
  surname?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};
