import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'Vitrin / Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },
  {
    displayName: 'Ürün Yönetimi',
    iconName: 'list-details',
    route: '/products',
    chip: false,
    external: false,
  },
  {
    displayName: 'Yeni Ürün Ekle',
    iconName: 'plus',
    route: '/products/create',
    chip: false,
    external: false,
  },
  {
    displayName: 'Adreslerim (İl/İlçe/Mahalle)',
    iconName: 'map-pin',
    route: '/addresses',
    chip: false,
    external: false,
  },
  {
    displayName: 'Sepetim',
    iconName: 'basket',
    route: '/baskets',
    chip: false,
    external: false,
  },
  {
    displayName: 'Sipariş Yönetimi',
    iconName: 'truck-delivery',
    route: '/admin/orders',
    chip: false,
    external: false,
  },
  {
    displayName: 'Kullanıcılar & Roller',
    iconName: 'users',
    route: '/admin/customers',
    chip: false,
    external: false,
  },
  {
    displayName: 'HerYerHerYerde Ana Vitrin',
    iconName: 'home',
    route: '/',
    chip: false,
    external: false,
  }
];
