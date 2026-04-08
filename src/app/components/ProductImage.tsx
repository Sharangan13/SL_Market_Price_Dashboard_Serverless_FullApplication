'use client';
import { useMemo } from 'react';

interface Props {
  item: string;
  category: string;
  size?: number;
  className?: string;
}

const PRODUCT_IMAGES: Record<string, string> = {
  // Vegetables
  beans: "/products/beans.png",
  carrot: "/products/carrot.png",
  cabbage: "/products/cabbage.png",
  tomato: "/products/tomato.png",
  brinjal: "/products/brinjal.png",
  pumpkin: "/products/pumpkin.png",
  snakegourd: "/products/snakegourd.png",
  greenchilli: "/products/greenchilli.png",
  lime: "/products/lime.png",

  // Onions / Potato
  redonionlocal: "/products/redonionlocal.png",
  redonionimp: "/products/redonionimp.png",
  bigonionlocal: "/products/bigonionlocal.png",
  bigonionimp: "/products/bigonionimp.png",
  potatolocal: "/products/potatolocal.png",
  potatoimp: "/products/potatoimp.png",

  // Dry / Grocery
  driedchilliimp: "/products/driedchilli.png",
  coconutavg: "/products/coconut.png",
  coconutoil: "/products/coconutoil.png",
  reddhal: "/products/reddhal.png",
  sugarwhite: "/products/sugar.png",
  eggwhite: "/products/egg.png",
  kattaimp: "/products/kattafish.png",
  spratimp: "/products/sprat.png",

  // Fruits
  bananasour: "/products/banana.png",
  papaw: "/products/papaw.png",
  pineapple: "/products/pineapple.png",
  appleimp: "/products/apple.png",
  orangeimp: "/products/orange.png",
};

export default function ProductImage({
  item,
  category,
  size = 64,
  className = '',
}: Props) {

  const imageUrl = useMemo(() => {
    if (!item) return "/products/default.png";

    // normalize item name
    const key = item
      .toLowerCase()
      .replace(/\s+/g, '')       // remove spaces
      .replace(/[^a-z]/g, '');   // remove special chars

    return PRODUCT_IMAGES[key] || "/products/default.png";
  }, [item]);

  return (
    <img
      src={imageUrl}
      alt={item}
      loading="lazy"
      className={`rounded-xl object-cover bg-slate-100 ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/products/default.png";
      }}
    />
  );
}