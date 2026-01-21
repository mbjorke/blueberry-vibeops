import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from './badge';
import { Card, CardContent } from './card';

interface Seller {
  name: string;
  avatar?: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  city: string;
  created_at: string;
  images?: string[];
  seller?: Seller;
}

interface ItemCardProps {
  item: Item;
  href?: string;
  className?: string;
  showSeller?: boolean;
  showFavorite?: boolean;
  onFavorite?: () => void;
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'NEW':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'LIKE_NEW':
      return 'bg-green-100 text-green-700 hover:bg-green-200';
    case 'GOOD':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'FAIR':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'POOR':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'SEK' ? 'kr' : '€';
  return `${price.toLocaleString()} ${symbol}`;
};

export function ItemCard({
  item,
  href,
  className = '',
  showSeller = true,
  showFavorite = true,
  onFavorite,
}: ItemCardProps) {
  const mainImage =
    item.images && item.images.length > 0
      ? item.images[0]
      : '/placeholder-image.jpg';

  const CardContentComponent = href ? (
    <Link href={href}>
      <CardContentInner />
    </Link>
  ) : (
    <CardContentInner />
  );

  function CardContentInner() {
    return (
      <Card className={`group cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] ${className}`}>
        {/* Image */}
        <div className='aspect-square relative bg-gray-100 overflow-hidden'>
          <img
            src={mainImage}
            alt={item.title}
            className='w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110'
          />

          {/* Condition Badge */}
          <div className='absolute top-2 left-2'>
            <Badge
              variant="secondary"
              className={`${getConditionColor(item.condition)} border-0 font-medium shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105`}
            >
              {item.condition.replace('_', ' ')}
            </Badge>
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite?.();
              }}
              className='absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg group/btn'
            >
              <svg
                className='w-4 h-4 text-gray-600 transition-colors duration-200 group-hover/btn:text-red-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
            </button>
          )}

          {/* Multiple Images Indicator */}
          {item.images && item.images.length > 1 && (
            <div className='absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded'>
              📷 {item.images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className='p-4 transition-colors duration-200 group-hover:bg-gray-50/50'>
          <h3 className='font-semibold text-gray-900 text-sm mb-1 line-clamp-2 transition-colors duration-200 group-hover:text-gray-800'>
            {item.title}
          </h3>

          <p className='text-gray-600 text-sm mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-gray-700'>
            {item.description}
          </p>

          <div className='flex items-center justify-between mb-2'>
            <span className='text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600'>
              {formatPrice(item.price, item.currency)}
            </span>
            <Badge
              variant="outline"
              className='text-xs transition-all duration-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:scale-105'
            >
              {item.category}
            </Badge>
          </div>

          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>📍 {item.city}</span>
            <span>
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {showSeller && item.seller && (
            <div className='mt-2 pt-2 border-t border-gray-100 flex items-center space-x-2 transition-colors duration-200 group-hover:border-gray-200'>
              <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-200'>
                {item.seller.avatar ? (
                  <img
                    src={item.seller.avatar}
                    alt={item.seller.name}
                    className='w-6 h-6 rounded-full object-cover'
                  />
                ) : (
                  <span className='text-xs text-gray-600'>
                    {item.seller.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className='text-xs text-gray-600 truncate transition-colors duration-200 group-hover:text-gray-800'>
                {item.seller.name}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return CardContentComponent;
}

export default ItemCard;
