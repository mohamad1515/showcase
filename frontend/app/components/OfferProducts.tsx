import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const bgOffer = [
  {
    id: 1,
    label: 'MASS GAINER',
    path: '/images/slider/h2_bg1.jpg',
    price: '830',
  },
  {
    id: 2,
    label: 'EXPLOSIVE ENERGY',
    path: '/images/slider/h2_bg2.jpg',
    price: '500',
  },
  {
    id: 3,
    label: 'MAXIMUM POTENCY',
    path: '/images/slider/h2_bg3.jpg',
    price: '560',
  },
];

const itemOnBox = [
  {
    id: 1,
    alt: 'img1',
    path: '/images/slider/h2_img3.png',
  },
  {
    id: 2,
    alt: 'img2',
    path: '/images/slider/h2_img2.png',
  },
  {
    id: 3,
    alt: 'img3',
    path: '/images/slider/h2_img1.png',
  },
];

const OfferProducts = () => {
  return (
    <section id="offer" className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {bgOffer.map((item, index) => {
          const product = itemOnBox[index];

          return (
            <div key={item.id} className="group relative h-[316px] overflow-hidden rounded-xl">
              {/* Background */}
              <Image
                src={item.path}
                alt={item.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Content */}
              <div className="relative z-10 flex h-full items-center justify-between px-5">
                {/* Product */}
                <div className="relative h-full w-[50%]">
                  <Image
                    src={product.path}
                    alt={product.alt}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Text + Button */}
                <div className="flex w-[50%] flex-col items-end gap-4">
                  <span className="flex text-left text-5xl font-extrabold text-white">
                    {item.label.split(' ').map((word, index) => (
                      <React.Fragment key={index}>
                        {word}
                        <br />
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="text-lg font-bold text-white">
                    شروع قیمت <span className="text-red-600">{item.price} تومان</span>
                  </span>

                  <Link
                    href="#"
                    className="mt-2 rounded-full border-2 border-white px-7 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-black"
                  >
                    خرید آسان
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OfferProducts;
