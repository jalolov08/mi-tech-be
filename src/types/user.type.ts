export type User = {
  email: string;
  password: string;
  name: string;
  surname?: string;
  phone?: string;
  role:string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};
