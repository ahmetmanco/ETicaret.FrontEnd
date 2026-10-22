export interface ProductImageItem {
  Id?: number;
  id?: number;
  FileName?: string;
  fileName?: string;
  Path: string;
  path?: string;
  IsMain?: boolean;
  isMain?: boolean;
}

export interface Product {
  id: number;
  Id?: number;
  name: string;
  Name?: string;
  stock: number;
  Stock?: number;
  price: number;
  Price?: number;
  createdDate?: Date | null;
  CreatedDate?: Date | null;
  updateDate?: Date | null;
  UpdatedDate?: Date | null;
  Image?: string;
  image?: string;
  Images?: ProductImageItem[];
  images?: ProductImageItem[];
}
