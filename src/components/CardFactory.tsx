import React from 'react';
import { CardProps } from './Interface/CardProps';
import SellCard from './SellCard';
import TradeCard from './TradeCard';


const CardFactory: React.FC<CardProps> = (props) => {
  return props.type === 'sell' ? <SellCard {...props} /> : <TradeCard {...props} />;
};

export default CardFactory;
