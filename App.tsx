
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Search, UtensilsCrossed, X, Minus, Plus, 
  Star, Sparkles, MessageCircle, ArrowRight, Home, 
  Clock, Flame, ShieldCheck, CreditCard,
  Wallet, Landmark, CheckCircle2, MapPin, Navigation,
  Bike, PackageCheck, Receipt, Bell, Phone, Info, Award,
  Truck, Zap, Heart, ChefHat, Ticket, Tag, CreditCard as FlazzIcon,
  ShoppingBag, HandCoins
} from 'lucide-react';
import { MENU_ITEMS, CATEGORIES, MOCK_DRIVERS, AVAILABLE_VOUCHERS } from './constants';
import { MenuItem, CartItem, AIRecommendation, OrderInfo, OrderStatus, Voucher } from './types';
import { getAIRecommendations } from './geminiService';

const PAYMENT_METHODS = [
  { id: 'gopay', name: 'GoPay', icon: <Wallet size={20} />, color: 'text-blue-400', bg: 'bg-blue-900/20', desc: 'Saldo Gojek' },
  { id: 'shopeepay', name: 'ShopeePay', icon: <ShoppingBag size={20} />, color: 'text-orange-400', bg: 'bg-orange-900/20', desc: 'Saldo Shopee' },
  { id: 'ovo', name: 'OVO', icon: <Wallet size={20} />, color: 'text-purple-400', bg: 'bg-purple-900/20', desc: 'Saldo OVO Cash' },
  { id: 'dana', name: 'DANA', icon: <Landmark size={20} />, color: 'text-blue-400', bg: 'bg-sky-900/20', desc: 'Dompet Digital' },
  { id: 'cod', name: 'COD', icon: <HandCoins size={20} />, color: 'text-green-400', bg: 'bg-green-900/20', desc: 'Bayar di Tempat' },
  { id: 'flazz', name: 'Flazz', icon: <FlazzIcon size={20} />, color: 'text-blue-300', bg: 'bg-blue-900/20', desc: 'Kartu Chip' },
];

const TRANSACTION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3';
const ARRIVED_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
const CLICK_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const BUY_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';

interface FlyingObject {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  moving: boolean;
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('gopay');
  const [activeOrder, setActiveOrder] = useState<OrderInfo | null>(null);
  const [address, setAddress] = useState('Jl. Andromeda2 No.20 Kota.Bekasi');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [flyingItems, setFlyingItems] = useState<FlyingObject[]>([]);
  const [cartBouncing, setCartBouncing] = useState(false);

  // Intro Logic
  const [showIntro, setShowIntro] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const fullWelcomeText = "Selamat datang di website Order makanan dan minuman cepat saji";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullWelcomeText.length) {
        setDisplayedText(prev => prev + fullWelcomeText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowIntro(false);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!activeOrder) return;
    const sequence: { status: OrderStatus; delay: number }[] = [
      { status: 'confirming', delay: 2000 },
      { status: 'preparing', delay: 4000 },
      { status: 'searching_driver', delay: 3000 },
      { status: 'on_the_way', delay: 7000 },
      { status: 'arrived', delay: 3000 },
      { status: 'delivered', delay: 2000 },
    ];
    let timer: any;
    const runSequence = async () => {
      for (const step of sequence) {
        await new Promise(resolve => {
          timer = setTimeout(() => {
            setActiveOrder(prev => {
              if (!prev) return null;
              const nextStatus = step.status;
              if (nextStatus === 'arrived') playArrivedSound();
              const updates: Partial<OrderInfo> = { status: nextStatus };
              if (nextStatus === 'searching_driver') updates.driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
              if (nextStatus === 'on_the_way') updates.eta = 12;
              if (nextStatus === 'arrived') updates.eta = 1;
              return { ...prev, ...updates };
            });
            resolve(true);
          }, step.delay);
        });
      }
    };
    runSequence();
    return () => clearTimeout(timer);
  }, [activeOrder?.id]);

  const triggerFlyAnimation = (itemId: string) => {
    const imgEl = document.getElementById(`item-img-${itemId}`) || document.getElementById(`ai-item-img-${itemId}`);
    const cartEl = document.getElementById('cart-btn');
    
    if (imgEl && cartEl) {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();
      
      const newFlyingItem: FlyingObject = {
        id: Date.now(),
        startX: imgRect.left + imgRect.width / 2,
        startY: imgRect.top + imgRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
        moving: false
      };

      setFlyingItems(prev => [...prev, newFlyingItem]);

      setTimeout(() => {
        setFlyingItems(prev => prev.map(item => 
          item.id === newFlyingItem.id ? { ...item, moving: true } : item
        ));
      }, 50);

      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== newFlyingItem.id));
        setCartBouncing(true);
        setTimeout(() => setCartBouncing(false), 400);
      }, 700);
    }
  };

  const addToCart = (item: MenuItem) => {
    playBuySound();
    triggerFlyAnimation(item.id);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = MENU_ITEMS.find(m => m.id === id);
    if (delta > 0) {
      playBuySound();
      if (item) triggerFlyAnimation(id);
    } else {
      playClickSound();
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 8000;
  const platformFee = 1500;

  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (cartSubtotal < selectedVoucher.minOrder) return 0;
    let amount = 0;
    if (selectedVoucher.type === 'percentage') {
      amount = cartSubtotal * selectedVoucher.discount;
      if (selectedVoucher.maxDiscount) amount = Math.min(amount, selectedVoucher.maxDiscount);
    } else {
      amount = selectedVoucher.discount;
    }
    return amount;
  }, [selectedVoucher, cartSubtotal]);

  const cartTotal = Math.max(0, cartSubtotal + deliveryFee + platformFee - discountAmount);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const playTransactionSound = () => {
    const audio = new Audio(TRANSACTION_SOUND_URL);
    audio.play().catch(e => console.error("Error playing transaction sound:", e));
  };

  const playArrivedSound = () => {
    const audio = new Audio(ARRIVED_SOUND_URL);
    audio.play().catch(e => console.error("Error playing arrived sound:", e));
  };

  const playClickSound = () => {
    const audio = new Audio(CLICK_SOUND_URL);
    audio.volume = 0.6;
    audio.play().catch(e => console.error("Error playing click sound:", e));
  };

  const playBuySound = () => {
    const audio = new Audio(BUY_SOUND_URL);
    audio.volume = 0.7;
    audio.play().catch(e => console.error("Error playing buy sound:", e));
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiRecs([]);
    const recs = await getAIRecommendations(aiPrompt, MENU_ITEMS);
    setAiRecs(recs);
    setIsAiLoading(false);
    setIsChatOpen(true);
  };

  const handleCheckout = () => {
    const newOrder: OrderInfo = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'confirming',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      total: cartTotal,
      eta: 25,
      address: address
    };
    playTransactionSound();
    setActiveOrder(newOrder);
    setCart([]);
    setSelectedVoucher(null);
    setIsCartOpen(false);
  };

  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      {/* Cinematic Intro Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black transition-opacity duration-1000">
           <div className="max-w-4xl px-10 text-center space-y-8">
              <div className="flex justify-center mb-8 animate-pulse">
                 <div className="bg-white p-4 rounded-3xl text-slate-900 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    <ChefHat size={48} />
                 </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black outfit text-white tracking-tighter leading-tight min-h-[120px]">
                {displayedText}
                <span className="inline-block w-1 h-10 md:h-14 bg-orange-600 ml-2 animate-pulse align-middle"></span>
              </h1>
              <p className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-bold animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
                Crafting Your Cravings...
              </p>
           </div>
        </div>
      )}

      {/* Main App with Blur Effect */}
      <div className={`flex flex-col flex-1 transition-all duration-[1500ms] ease-out ${showIntro ? 'blur-[50px] scale-90 opacity-0' : 'blur-none scale-100 opacity-100'}`}>
        
        {/* Flying "Bullet" (Bulet Terbang) Effects */}
        {flyingItems.map(item => (
          <div
            key={item.id}
            className="fixed z-[9999] pointer-events-none rounded-full bg-orange-500 shadow-[0_0_20px_rgba(255,92,0,0.8)]"
            style={{
              width: item.moving ? '10px' : '20px',
              height: item.moving ? '10px' : '20px',
              top: item.moving ? item.endY : item.startY,
              left: item.moving ? item.endX : item.startX,
              opacity: item.moving ? 0.4 : 1,
              transform: item.moving ? 'scale(0.5)' : 'scale(1)',
              transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
              boxShadow: '0 0 15px #FF5C00, 0 0 30px #FF5C00'
            }}
          />
        ))}

        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 md:px-12 py-4 flex items-center justify-between ${
          scrolled ? 'mt-4 mx-6 rounded-[2.5rem] glass-v2 shadow-[0_10px_60px_rgba(0,0,0,0.8)]' : 'bg-transparent'
        }`}>
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveOrder(null)}>
            <div className="bg-white p-2 rounded-2xl text-slate-900 shadow-xl group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-[15deg] transition-all duration-500">
              <ChefHat size={24} />
            </div>
            <span className="text-2xl font-[800] tracking-tight text-white outfit">
              Twenty<span className="text-orange-600">Food.</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 glass-v2 px-6 py-2.5 rounded-full hover:bg-white/10 transition-all group cursor-pointer">
            <MapPin size={16} className="text-orange-500 animate-bounce" />
            <span className="text-sm font-bold text-white/80 truncate max-w-[200px]">{address}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              id="cart-btn"
              onClick={() => {
                playClickSound();
                setIsCartOpen(true);
              }}
              className={`group relative flex items-center justify-center w-14 h-14 bg-white text-slate-900 rounded-[1.4rem] hover:bg-orange-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-500 shadow-xl ${cartBouncing ? 'cart-bounce' : ''}`}
            >
              <ShoppingCart size={24} className="group-hover:-translate-y-1 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-full border-[3px] border-slate-900 shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-10 z-10">
          {!activeOrder ? (
            <>
              {/* Hero */}
              <section className="relative px-6 md:px-12 overflow-hidden mb-20">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1 space-y-10 text-center lg:text-left">
                    {/* Operational Hours - Small Font */}
                    <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-top duration-1000">
                      <div className="flex items-center gap-4 mb-2">
                         <Clock className="text-orange-500" size={20} />
                         <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Operational Hours</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white outfit tracking-widest drop-shadow-xl mb-6">
                        09:00 - 22:00
                      </h2>
                    </div>

                    <div className="inline-flex items-center gap-3 px-6 py-2 glass-v2 rounded-full text-xs font-black tracking-[0.2em] text-orange-500 border border-white/5 animate-pulse">
                      <Tag size={16} /> SMART DEALS APPLIED
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight outfit">
                      Mau makan enak tapi malas keluar rumah? <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-400 to-red-500">Order di TwentyFood aja!!</span>
                    </h1>
                    <p className="text-sm text-white/40 font-medium max-w-lg leading-relaxed italic mx-auto lg:mx-0">
                      mau pesan makanan yang menyesuaikan mood kamu saat ini? minta rekomendasi sama AI aja!
                    </p>
                    
                    <div className="relative group max-w-2xl mx-auto lg:mx-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative glass-v2 p-3 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-3">
                        <div className="flex-1 flex items-center px-6 py-4 w-full">
                          <Search className="text-white/20 mr-4 shrink-0" size={24} />
                          <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="mau makan apa hari ini? nanti AI rekomendasikan."
                            className="w-full bg-transparent outline-none text-white placeholder:text-white/20 font-bold text-lg"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            playClickSound();
                            handleAiSearch();
                          }}
                          className="w-full md:w-auto bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-sm tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                        >
                          {isAiLoading ? 'THINKING...' : 'AI RECOMMEND'}
                          {!isAiLoading && <ArrowRight size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative hidden lg:block">
                    <div className="relative z-10 p-10">
                      <div className="absolute inset-0 bg-white/5 rounded-[6rem] blur-[80px] -rotate-6"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                        className="w-full h-[650px] object-cover rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-[16px] border-white/5 rotate-2 transition-transform duration-1000"
                        alt="Hero"
                      />
                      <div className="absolute -bottom-10 -left-10 glass-v2 p-10 rounded-[3rem] shadow-2xl animate-float">
                        <div className="flex items-center gap-6">
                          <div className="bg-orange-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                            <Zap size={32} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white/40 uppercase tracking-widest">SPECIAL OFFER</p>
                            <p className="text-3xl font-black text-white tracking-tighter">Up to 20% OFF</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter */}
              <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16 overflow-x-auto hide-scrollbar py-4">
                <div className="flex items-center gap-6">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        playClickSound();
                        setSelectedCategory(cat);
                      }}
                      className={`px-10 py-4 rounded-[2rem] text-sm font-black tracking-widest transition-all duration-500 whitespace-nowrap ${
                        selectedCategory === cat 
                          ? 'bg-white text-slate-900 shadow-2xl scale-110' 
                          : 'glass-v2 text-white/40 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>

              {/* Menu Grid */}
              <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 xl:gap-8">
                  {filteredMenu.map((item) => (
                    <div key={item.id} className="card-appear group glass-v2 rounded-[2.5rem] p-4 border border-white/5 hover:border-orange-500/30 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                      <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6">
                        <img 
                          id={`item-img-${item.id}`}
                          src={item.image} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                          alt={item.name}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {item.isPopular && (
                            <div className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow-lg">HOT</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 px-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                          <Star size={10} fill="currentColor" /> {item.rating} • {item.calories} CAL
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h3>
                        <p className="text-[11px] text-white/40 font-medium line-clamp-2 leading-relaxed h-8">{item.description}</p>
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PRICE</span>
                             <span className="text-lg font-black text-white tracking-tighter">{formatIDR(item.price)}</span>
                          </div>
                          <button onClick={() => addToCart(item)} className="w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white active:scale-90 shadow-lg transition-all">
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* Delivery Screen */
            <section className="px-6 md:px-12 max-w-7xl mx-auto py-10">
               <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-12">
                     <div className="glass-v2 rounded-[4rem] p-12 border border-white/5 shadow-xl overflow-hidden relative">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 relative z-10">
                          <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter outfit">Live Tracking</h2>
                            <p className="text-white/20 font-bold uppercase tracking-widest text-[10px] mt-2">ID: {activeOrder.id}</p>
                          </div>
                          <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-[2.5rem] border border-white/5">
                             <Clock className="text-orange-500" size={32} />
                             <span className="text-3xl font-black text-white">{activeOrder.status === 'delivered' ? 'ARRIVED' : `${activeOrder.eta} mins`}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-10">
                           {['confirming', 'preparing', 'searching_driver', 'on_the_way', 'delivered'].map((s, i) => (
                              <div key={s} className={`flex flex-col items-center opacity-${['confirming', 'preparing', 'searching_driver', 'on_the_way', 'delivered'].indexOf(activeOrder.status) >= i ? '100' : '20'}`}>
                                 <div className="w-16 h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {activeOrder.driver && (
                       <div className="glass-v2 p-10 rounded-[4rem] flex items-center gap-10 text-white shadow-2xl">
                          <img src={activeOrder.driver.image} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white/10" alt="Driver" />
                          <div className="flex-1">
                             <h4 className="text-2xl font-black">{activeOrder.driver.name}</h4>
                             <p className="text-white/20 font-bold uppercase tracking-widest text-xs">{activeOrder.driver.vehicle}</p>
                          </div>
                          <div className="flex gap-4">
                             <button onClick={playClickSound} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"><Phone size={24} /></button>
                             <button onClick={playClickSound} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"><MessageCircle size={24} /></button>
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="w-full lg:w-[400px] space-y-10">
                     <div className="glass-v2 rounded-[4rem] p-10 border border-white/5 shadow-xl">
                        <h3 className="text-xl font-black text-white mb-8">Ringkasan Pembayaran</h3>
                        <div className="space-y-4 mb-8">
                           <div className="flex justify-between text-sm font-bold text-white/40">
                              <span>Subtotal</span>
                              <span>{formatIDR(activeOrder.subtotal)}</span>
                           </div>
                           {activeOrder.discount > 0 && (
                             <div className="flex justify-between text-sm font-black text-green-400">
                                <span>Diskon Promo</span>
                                <span>-{formatIDR(activeOrder.discount)}</span>
                             </div>
                           )}
                           <div className="flex justify-between text-sm font-bold text-white/40">
                              <span>Ongkir & Layanan</span>
                              <span>{formatIDR(18000)}</span>
                           </div>
                        </div>
                        <div className="pt-8 border-t border-white/10 flex justify-between items-center mb-10">
                           <span className="text-2xl font-black">Total Net</span>
                           <span className="text-2xl font-black text-orange-500">{formatIDR(activeOrder.total)}</span>
                        </div>
                        <button onClick={() => { playClickSound(); setActiveOrder(null); }} className="w-full py-6 glass-v2 text-white rounded-[2.5rem] font-black text-xs tracking-widest uppercase hover:bg-white hover:text-slate-900 transition-all">Back to Menu</button>
                     </div>
                  </div>
               </div>
            </section>
          )}
        </main>

        <footer className="pb-16 pt-8 z-10 px-6 text-center">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] outfit select-none">
            website order makanan dan minuman cepat saji yang di buat oleh <span className="text-white/40 font-black">Rafka Afriansyah</span>
          </p>
        </footer>

        <div className={`fixed inset-0 z-[100] transition-all duration-700 ${isCartOpen ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-700 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
          <aside className={`absolute right-0 top-0 h-full w-full max-w-xl bg-[#0a0a0a] shadow-2xl transition-transform duration-700 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-white/5`}>
             <div className="flex flex-col h-full">
                <div className="p-12 border-b border-white/5 flex items-center justify-between">
                   <h2 className="text-4xl font-black outfit">Cart.</h2>
                   <button onClick={() => { playClickSound(); setIsCartOpen(false); }} className="w-14 h-14 bg-white/5 rounded-[1.8rem] flex items-center justify-center hover:bg-white/10 transition-colors"><X size={28} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 hide-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-5"><ShoppingCart size={150} /></div>
                  ) : (
                    <>
                      <div className="space-y-8">
                        {cart.map(item => (
                          <div key={item.id} className="flex gap-8 group">
                            <img src={item.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl" alt={item.name} />
                            <div className="flex-1 py-1">
                               <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-black text-white text-lg leading-tight">{item.name}</h4>
                                  <span className="font-black text-white">{formatIDR(item.price * item.quantity)}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center glass-v2 rounded-2xl p-1 gap-4 border border-white/5">
                                     <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 bg-white/5 rounded-xl text-white"><Minus size={16} /></button>
                                     <span className="font-black text-white">{item.quantity}</span>
                                     <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 bg-white/5 rounded-xl text-white"><Plus size={16} /></button>
                                  </div>
                                  <button onClick={() => { playClickSound(); updateQuantity(item.id, -item.quantity); }} className="text-[10px] font-black text-red-500">REMOVE</button>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-10 border-t border-white/5">
                         <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6">Pilih Voucher Diskon</h3>
                         <div className="space-y-4">
                            {AVAILABLE_VOUCHERS.map(v => (
                              <button
                                key={v.id}
                                onClick={() => {
                                  playClickSound();
                                  setSelectedVoucher(selectedVoucher?.id === v.id ? null : v);
                                }}
                                disabled={cartSubtotal < v.minOrder}
                                className={`w-full relative p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-6 ${
                                  selectedVoucher?.id === v.id ? 'border-green-500 bg-green-950/20' : 'glass-v2 border-white/5 hover:border-white/20'
                                } ${cartSubtotal < v.minOrder ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
                              >
                                 <div className={`p-4 rounded-2xl ${selectedVoucher?.id === v.id ? 'bg-green-600 text-white' : 'bg-white/5 text-white/40'}`}>
                                    <Ticket size={24} />
                                  </div>
                                  <div className="text-left flex-1">
                                     <p className="font-black text-white text-sm">{v.label}</p>
                                     <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">KODE: {v.code}</p>
                                     {cartSubtotal < v.minOrder && <p className="text-[9px] text-red-500 font-bold mt-1">Min order {formatIDR(v.minOrder)}</p>}
                                  </div>
                                  {selectedVoucher?.id === v.id && <CheckCircle2 size={24} className="text-green-500" />}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="pt-10 border-t border-white/5">
                         <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6">Metode Pembayaran</h3>
                         <div className="grid grid-cols-2 gap-4">
                            {PAYMENT_METHODS.map(method => (
                              <button
                                key={method.id}
                                onClick={() => {
                                  playClickSound();
                                  setSelectedPayment(method.id);
                                }}
                                className={`relative p-5 rounded-[2rem] border transition-all duration-500 flex flex-col gap-3 group overflow-hidden ${
                                  selectedPayment === method.id 
                                    ? 'border-orange-500 bg-orange-950/20 shadow-lg' 
                                    : 'glass-v2 border-white/5 hover:border-white/20'
                                }`}
                              >
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                   selectedPayment === method.id ? 'bg-orange-600 text-white' : 'bg-white/5 text-white/20 group-hover:text-white'
                                 }`}>
                                    {method.icon}
                                 </div>
                                 <div className="text-left">
                                    <p className="font-black text-white text-xs">{method.name}</p>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{method.desc}</p>
                                 </div>
                                 {selectedPayment === method.id && (
                                   <div className="absolute top-4 right-4 text-orange-500">
                                      <CheckCircle2 size={16} />
                                   </div>
                                 )}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Payment Summary Column Moved Here */}
                      {cart.length > 0 && (
                        <div className="pt-12 border-t border-white/5 space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                           <div className="space-y-4">
                              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4">Ringkasan Pesanan</h3>
                              <div className="flex justify-between text-xs font-black text-white/40 uppercase tracking-widest">
                                 <span>Subtotal</span>
                                 <span className="text-white/60">{formatIDR(cartSubtotal)}</span>
                              </div>
                              {discountAmount > 0 && (
                                <div className="flex justify-between text-xs font-black text-green-400 uppercase tracking-widest bg-green-950/20 p-4 rounded-2xl border border-green-500/20 animate-pulse">
                                   <div className="flex items-center gap-2"><Tag size={14} /> <span>Diskon "{selectedVoucher?.code}"</span></div>
                                   <span>-{formatIDR(discountAmount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-4xl font-black text-white pt-8 border-t border-dashed border-white/10 mt-8 outfit tracking-tighter">
                                 <div className="flex flex-col">
                                    <span>Total.</span>
                                    {discountAmount > 0 && <span className="text-[10px] font-black text-green-500 uppercase">HEMAT BANGET</span>}
                                 </div>
                                 <span className="text-orange-500">{formatIDR(cartTotal)}</span>
                              </div>
                           </div>
                           <button onClick={handleCheckout} className="w-full bg-white text-slate-900 py-8 rounded-[3rem] font-black text-xl hover:bg-orange-600 hover:text-white transition-all shadow-2xl uppercase tracking-widest">
                            BAYAR DENGAN {PAYMENT_METHODS.find(p => p.id === selectedPayment)?.name}
                           </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
             </div>
          </aside>
        </div>

        {isChatOpen && (
          <div className="fixed bottom-32 right-10 z-[120] w-[450px] glass-v2 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-10">
             <div className="bg-white p-10 flex items-center justify-between text-slate-900">
                <div className="flex items-center gap-6">
                   <div className="bg-orange-600 w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white"><Sparkles size={32} /></div>
                   <div>
                      <h4 className="text-2xl font-black tracking-tight">Gemini Finder</h4>
                      <p className="text-[10px] text-slate-900/40 font-black uppercase tracking-widest mt-1">Smart Suggestions</p>
                   </div>
                </div>
                <button onClick={() => { playClickSound(); setIsChatOpen(false); }} className="text-slate-900/50"><X size={24} /></button>
             </div>
             <div className="p-10 max-h-[500px] overflow-y-auto space-y-8 hide-scrollbar">
                {aiRecs.map((rec, idx) => {
                  const item = MENU_ITEMS.find(i => i.id === rec.itemId);
                  if (!item) return null;
                  return (
                    <div key={idx} className="flex gap-6 p-6 glass-v2 rounded-[2.5rem] hover:bg-white/10 border border-white/5 transition-all duration-500 group">
                       <img 
                        id={`ai-item-img-${item.id}`}
                        src={item.image} 
                        className="w-24 h-24 rounded-[2rem] object-cover shadow-xl" 
                        alt={item.name}
                       />
                       <div className="flex-1">
                          <h5 className="font-black text-sm text-white mb-2">{item.name}</h5>
                          <p className="text-[11px] text-white/40 mb-4">{rec.reason}</p>
                          <button onClick={() => { addToCart(item); setIsChatOpen(false); }} className="w-full py-3 bg-white text-slate-900 text-[10px] font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-colors">ADD TO CART</button>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {!isChatOpen && (
          <button 
            onClick={() => {
              playClickSound();
              setIsChatOpen(true);
            }}
            className="fixed bottom-12 right-12 z-[110] group w-24 h-24 bg-white text-slate-900 rounded-full shadow-2xl hover:bg-orange-600 hover:text-white hover:scale-110 active:scale-90 transition-all duration-500 border-[10px] border-[#050505] flex items-center justify-center"
          >
             <Sparkles size={32} className="group-hover:rotate-12 transition-transform duration-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
