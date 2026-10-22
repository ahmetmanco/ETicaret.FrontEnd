export class User {
  firstName?: string;
  lastName?: string;
  uname!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;
  role?: 'Customer' | 'Seller';
  storeName?: string;
  taxNumber?: string;
}
