
export interface BaseCardProps {
    id_post: number;
    title: string;
    description: string;
    image: string;
    acc_name: string;
    created_at: string;
    hashtags: string[];
    isFavorite: boolean;
    onToggleFavorite: (id_post: number) => void;
  }
  
  export interface SellCardProps extends BaseCardProps {
    type: 'sell';
    price: number; 
  }
  
  export interface TradeCardProps extends BaseCardProps {
    type: 'trade';
    hashtags_want: string[];
  }
  
  export type CardProps = SellCardProps | TradeCardProps;
  