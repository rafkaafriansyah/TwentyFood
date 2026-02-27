
import { MenuItem, Voucher } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Noodles',
    description: 'Mie ayam lezat dengan potongan daging ayam bumbu spesial, sawi segar, dan pangsit renyah.',
    price: 15000,
    category: 'Noodles',
    image: 'https://imgx.sonora.id/crop/0x0:0x0/x/photo/2021/12/16/mie-ayamjpg-20211216030049.jpg',
    calories: 850,
    rating: 4.9,
    isPopular: true
  },
  {
    id: '2',
    name: 'Chicken noodles with Meatballs',
    description: 'Mie ayam spesial ditambah dengan bakso sapi kenyal dan kuah kaldu yang gurih.',
    price: 18000,
    category: 'Noodles',
    image: 'https://asset.kompas.com/crops/0UaKVhdG8uQRDiCMh3a9qBJpBPY=/0x0:1000x667/750x500/data/photo/2021/03/26/605d538c24900.jpeg',
    calories: 1100,
    rating: 4.8,
    isPopular: true
  },
  {
    id: '3',
    name: 'Spicy Meatballs',
    description: 'Bakso sapi halus dengan isian telur ayam utuh di dalamnya, disajikan dengan kuah kaldu yang pedas.',
    price: 20000,
    category: 'Bakso',
    image: 'https://jadilaper.com/wp-content/uploads/2024/08/bakso-menggugah-selera-foto-dbakso-osoae-beok.jpg',
    calories: 450,
    rating: 4.7,
    isPopular: true
  },
  {
    id: '13',
    name: 'Spicy grilled Meatballs with White rice',
    description: 'Bakso mercon dengan isian sambal cabai rawit yang melimpah, dijamin bikin ketagihan.',
    price: 22000,
    category: 'Bakso',
    image: 'https://sweetlysplendid.com/wp-content/uploads/2021/02/crockpot-sweet-and-spicy-meatballs-6.jpg',
    calories: 500,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Dimsum Original',
    description: 'Quinoa organik, kale, ubi panggang, buncis, dan saus tahini.',
    price: 20000,
    category: 'Desserts',
    image: 'https://www.jawaranyapedas.com/sk-eu/content/dam/brands/jawara/global_use/57301831-dim-sum.jpg.rendition.1960.1960.jpg',
    calories: 520,
    rating: 4.9
  },
  {
    id: '5',
    name: 'Dimsum Mentai',
    description: 'Kue cokelat hitam hangat dengan bagian tengah meleleh, disajikan dengan gelato vanilla.',
    price: 26000,
    category: 'Desserts',
    image: 'https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2025/03/05/dimsum-mentai-2655369190.png',
    calories: 680,
    rating: 4.9,
    isPopular: true
  },
  {
    id: '6',
    name: 'Fried Dimsum with melted Cheese',
    description: 'Vodka premium, espresso segar, dan liqueur kopi buatan rumah.',
    price: 30000,
    category: 'Desserts',
    image: 'https://garapmedia.com/wp-content/uploads/2025/11/resep-dimsum-goreng-keju-lumer-yang-gurih-dan-anti-gagal-1024x768.webp',
    calories: 220,
    rating: 4.5
  },
  {
    id: '9',
    name: 'Butterfly Pea Galaxy Tea',
    description: 'Teh bunga telang yang berubah warna secara ajaib dari biru ke ungu dengan sedikit perasan lemon dan kelopak mawar kering.',
    price: 65000,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800',
    calories: 120,
    rating: 4.9,
    isPopular: true
  },
  {
    id: '10',
    name: 'Ceremonial Matcha Cloud',
    description: 'Matcha grade seremonial Kyoto dengan lapisan cold foam susu almond yang lembut dan taburan emas 24k yang dapat dimakan.',
    price: 85000,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800',
    calories: 180,
    rating: 4.8,
    isPopular: true
  },
  {
    id: '11',
    name: 'Hibiscus Rose Sparkler',
    description: 'Infusi bunga sepatu organik, sirup mawar buatan rumah, soda premium, dan beri segar yang mendinginkan.',
    price: 75000,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800',
    calories: 95,
    rating: 4.7
  },
  {
    id: '12',
    name: 'Midnight Charcoal Latte',
    description: 'Latte arang aktif yang elegan dengan latte art kontras tinggi dan sentuhan rasa kelapa panggang.',
    price: 70000,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    calories: 150,
    rating: 4.6
  },
  {
    id: '7',
    name: 'Dragon Roll Special',
    description: 'Belut dan timun di dalam, dilapisi alpukat dan saus unagi di atasnya.',
    price: 190000,
    category: 'Sushi',
    image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&q=80&w=800',
    calories: 580,
    rating: 4.8
  },
  {
    id: '8',
    name: 'Avocado Toast Lux',
    description: 'Roti sourdough, alpukat tumbuk, tomat heirloom, dan telur poached.',
    price: 130000,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    calories: 440,
    rating: 4.4
  }
];

export const CATEGORIES = ['All', 'Noodles', 'Bakso', 'Pizza', 'Sushi', 'Salads', 'Desserts', 'Drinks'] as const;

export const AVAILABLE_VOUCHERS: Voucher[] = [
  { id: 'v1', code: 'MAKANHEMAT', discount: 0.2, type: 'percentage', label: 'Diskon 20% (Max 50rb)', minOrder: 100000, maxDiscount: 50000 },
  { id: 'v2', code: 'PROMOAI', discount: 50000, type: 'fixed', label: 'Potongan Rp 50.000', minOrder: 200000 },
  { id: 'v3', code: 'GRATISONGKIR', discount: 15000, type: 'fixed', label: 'Gratis Ongkir', minOrder: 80000 },
];

export const MOCK_DRIVERS = [
  {
    name: 'Budi Santoso',
    rating: 4.9,
    vehicle: 'Honda Vario 160 • B 4521 TZG',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Ahmad Fauzi',
    rating: 4.8,
    vehicle: 'Yamaha NMAX • B 6789 KLS',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  }
];
