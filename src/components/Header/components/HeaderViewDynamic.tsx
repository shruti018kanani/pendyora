'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import MenuPreview from './MenuPreview';

const HeaderViewDynamic = ({ headerData }: any) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<any>(null);
  const path = usePathname();
  const handleMouseEnter = (title: string) => {
    const id = setTimeout(() => {
      setActiveMenu(title);
    }, 100);
    setTimeoutId(id);
  };
  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setActiveMenu(null);
  };
  const generatePath = (title: string) => {
    return `${title.trim().replace(/\s+/g, '-').toLowerCase()}`;
  };
  return (
    <ul className="flex justify-around w-full text-[13px] ">
      {headerData?.length > 0 &&
        headerData?.map((item: any, index: number) => {
          const formattedPath = `${generatePath(item.main_menu_title)}`;
          let isActive = false;
          if (typeof window !== 'undefined') {
            isActive = path.includes(formattedPath)
              ? path.includes(formattedPath)
              : path.includes(window.location.pathname)
                ? path.includes(window.location.pathname)
                : false;
          }
          if (item?.is_web_visible == true) {
            return (
              <li key={index} className=" lg:mx-2  md:mx-0 ">
                <div onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={() => handleMouseLeave()}>
                  <p className={`tracking-[1.00px] uppercase  lg:text-[12px]  leading-normal pb-[14px] `}>
                    {item?.main_menu_title_link ? (
                      <Link href={item?.main_menu_title_link}>
                        <span className={`${activeMenu === item.id ? '!font-normal border-b border-black' : ''}`}>{item.main_menu_title}</span>
                      </Link>
                    ) : (
                      <span className={`${activeMenu === item.id ? '!font-normal border-b border-black' : ''}`}>{item.main_menu_title}</span>
                    )}
                  </p>
                  {activeMenu == item.id && (
                    <div
                      className={`absolute left-0 w-[100%] bg-white shadow-lg z-50 transition-opacity duration-300 ease-in-out transform${
                        activeMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
                    >
                      <MenuPreview Details={item} setActiveMenu={setActiveMenu} />
                    </div>
                  )}
                </div>
              </li>
            );
          }
        })}
    </ul>
  );
};

export default HeaderViewDynamic;
