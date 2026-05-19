'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Button, Image, Input, notification } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP } from 'react-icons/fa6';
import { LiaShippingFastSolid } from 'react-icons/lia';

import BuyWithConfidence from '@/app/homepage/BuywithConfidence';
import { useHoneypot } from '@/hook/useHoneypot';
import { addSubmitSignUp, getCouponData } from '@/services/cartService';
import { useAppSelector } from '@/store';
import { isDisposableDomain, isValidEmailFormat } from '@/utils/emailValidation';

interface Props {
  className?: string;
}

export default function Footer({ ...props }: Props) {
  const { user } = useAppSelector((state) => state.auth.auth);
  const { introPopUpList } = useAppSelector((state) => state.introPopUpSlice);

  const [email, setEmail] = useState<any>();
  const [discountText, setDiscountText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [consentError, setConsentError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const desktopErrorRef = useRef<HTMLDivElement>(null);
  const mobileErrorRef = useRef<HTMLDivElement>(null);
  const { HoneypotField, isHoneypotClean } = useHoneypot('footer_website_confirm');

  const scrollErrorIntoView = () => {
    requestAnimationFrame(() => {
      const target =
        desktopErrorRef.current && desktopErrorRef.current.offsetParent !== null
          ? desktopErrorRef.current
          : mobileErrorRef.current && mobileErrorRef.current.offsetParent !== null
            ? mobileErrorRef.current
            : null;
      const rect = target?.getBoundingClientRect();
      if (rect && (rect.bottom > window.innerHeight || rect.top < 0)) {
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const validateEmail = (email: string): boolean => isValidEmailFormat(email);

  const runLiveEmailValidation = (value: string) => {
    if (!value) {
      setEmailError('');
      return;
    }
    if (!isValidEmailFormat(value)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (isDisposableDomain(value)) {
      setEmailError('Please enter a valid permanent email address');
      return;
    }
    setEmailError('');
  };

  const fetchCoupan = async (id: any) => {
    if (!id) {
      return;
    }
    try {
      const res = await getCouponData(id);

      if (res.status == 200) {
        const record = res.data.data;

        const test = `GET ${record?.discount_value}${record?.discount_type == 2 ? '%' : record?.discount_type == 1 ? '$' : ''} OFF`;
        setDiscountText(test);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (introPopUpList?.length > 0) {
      const currentDate = new Date();
      const validPopups = introPopUpList.filter((popup: any) => {
        return popup?.expiry_date ? new Date(popup?.expiry_date) > currentDate : true;
      });

      if (validPopups.length > 0) {
        if (introPopUpList?.length > 0) {
          if (introPopUpList[0]?.type == 'signup') {
            fetchCoupan(introPopUpList[0]?.coupon);
          } else {
            fetchCoupan(introPopUpList[1]?.coupon);
          }
        }
      }
    }
  }, [introPopUpList]);

  const handleFooterSubmit = async () => {
    if (!isHoneypotClean()) {
      return;
    }

    if (!isChecked) {
      setConsentError('Please accept the terms to continue');
      scrollErrorIntoView();
      return;
    }

    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      scrollErrorIntoView();
      return;
    }

    if (isDisposableDomain(email)) {
      setEmailError('Please enter a valid permanent email address');
      scrollErrorIntoView();
      return;
    }

    try {
      setLoading(true);
      setEmailError('');
      setConsentError('');
      const signupPopup = introPopUpList?.find((popup: any) => popup?.type === 'signup');
      const response = await addSubmitSignUp({
        email,
        coupon_id: signupPopup?.coupon || null,
      });

      if (response?.status === 201) {
        notification.success({
          message: 'Subscription Successful',
          description: 'Thanks! We have sent the offer details to your email address.',
        });
        setEmail('');
        setIsChecked(false);
      }
    } catch (error: any) {
      setEmailError(error?.response?.data?.message || 'Unable to submit right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer {...props} className={`${props.className} flex flex-col gap-[0px] sm:gap-[0px] lg:gap-[0px]`}>
      <HoneypotField />
      <BuyWithConfidence />
      <div className="mt-0 flex justify-center self-stretch sm:hidden">
        <div className="container-xs flex items-center justify-center 2xl:px-[50px] xl:px-[50px] lg:px-[20px] md:flex-col md:px-5 w-full">
          <div className="flex pt-10 w-full justify-between lg:gap-5">
            <div className="flex  flex-col gap-2.5">
              <div className="flex px-5"></div>
              <div className="flex flex-col items-start gap-[18px]">
                <div className="flex flex-col gap-3.5 self-stretch">
                  <div className="flex flex-col items-start gap-3">
                    <p className="tracking-[1.40px] flex flex-row gap-2 items-center text-[12px]">
                      <LiaShippingFastSolid className="text-[18px]" />
                      <span>WORLDWIDE SHIPPING</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3">
                    <div className="h-px w-[80%] bg-[#2f2f2f]" />
                    <p className="tracking-[1.40px] text-[14px] uppercase">Secure payment</p>
                    <div className="grid grid-cols-3 gap-2 w-[90%]">
                      <Image
                        src="/images/img_close_white_a700_01.svg"
                        className="payment-options grayscale md:grayscale-0 md:opacity-100 opacity-50 hover:opacity-100 transition-all ease-in-out duration-[100ms] hover:grayscale-0 "
                        alt="Close"
                        preview={false}
                      />
                      <Image
                        src="/images/img_television_white_a700_01.svg"
                        className="payment-options grayscale md:grayscale-0 md:opacity-100 opacity-50 hover:opacity-100 transition-all ease-in-out duration-[100ms] hover:grayscale-0"
                        preview={false}
                        alt="Television"
                      />
                      <Image
                        src="/images/img_television_white_a700_01_16x26.svg"
                        className="payment-options grayscale md:grayscale-0 md:opacity-100 opacity-50 hover:opacity-100 transition-all ease-in-out duration-[100ms] hover:grayscale-0"
                        preview={false}
                        alt="Television"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px bg-[#2f2f2f] mx-auto" />

            <div className=" w-[50%] pt-4 flex items-start justify-between gap-5   ">
              <ul className="flex w-1/3 flex-col items-start gap-3 md:w-full xl:w-fit 2xl:w-fit">
                <li>
                  <Link href="/faqs" rel="noreferrer">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">FAQs</p>
                  </Link>
                </li>
                <li>
                  <Link href="/returns-shipping">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">SHIPPING & RETURNS</p>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">PRIVACY POLICY</p>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions">
                    <p className="tracking-[1.40px] text-[14px] uppercase lg:text-[12px]">Terms and Conditions</p>
                  </Link>
                </li>
                <li>
                  <Link href="/custom-jewelry-design">
                    <p className="tracking-[1.40px] text-[14px] uppercase lg:text-[12px]">Custom Jewelry Design</p>
                  </Link>
                </li>
                <li>
                  <Link href="/design-your-ring-stack">
                    <p className="tracking-[1.40px] text-[14px] uppercase lg:text-[12px]">Design Your Ring Stack</p>
                  </Link>
                </li>
              </ul>
              <ul className="flex w-1/3 flex-col items-start gap-3 md:w-full xl:w-fit 2xl:w-fit">
                <li>
                  <Link href="/design-your-own">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">CUSTOM JEWELRY</p>
                  </Link>
                </li>
                <li>
                  <Link href="/wedding-bands" rel="noreferrer">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">WEDDING</p>
                  </Link>
                </li>
                <li>
                  <Link href="/engagement-rings" rel="noreferrer">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">ENGAGEMENT</p>
                  </Link>
                </li>
                <li>
                  <Link href="/giftguide">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">GIFT GUIDE</p>
                  </Link>
                </li>
              </ul>
              <ul className="flex w-1/4 flex-col items-start gap-3 self-start md:w-full xl:w-fit 2xl:w-fit">
                <li>
                  <Link href="/jewelry-care">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">JEWELRY CARE</p>
                  </Link>
                </li>
                <li>
                  <Link href="/about-us">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">ABOUT US</p>
                  </Link>
                </li>
                <li>
                  <Link href="/contactpage">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">CONTACT US</p>
                  </Link>
                </li>

                <li>
                  <Link href="/blog">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">OUR BLOG</p>
                  </Link>
                </li>
                <li>
                  <Link href="/education">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">EDUCATION</p>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="  w-px bg-[#2f2f2f] mx-auto" />
            <div className=" flex w-[20%] flex-col gap-5 ">
              {!user && (
                <div className="flex flex-col items-start gap-3">
                  <p className="tracking-[1.40px] text-[14px]">{discountText}</p>
                  <div className="flex flex-row lg:flex-col gap-2 w-full">
                    <Input
                      placeholder="Enter Email"
                      value={email}
                      size="small"
                      onChange={(e: any) => {
                        const v = e.target.value;
                        setEmail(v);
                        runLiveEmailValidation(v);
                        if (consentError) {
                          setConsentError('');
                        }
                      }}
                      className={`w-full !text-black ${emailError ? '!border-red-500' : ''}`}
                    />
                    <Button
                      onClick={handleFooterSubmit}
                      loading={loading}
                      className="self-stretch w-fit uppercase tracking-[2.00px] lg:w-full !h-[28px] !bg-secondary !text-text_w"
                    >
                      Submit
                    </Button>
                  </div>
                  {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
                  <div className={' flex items-start gap-[10px] !cursor-pointer'}>
                    <input
                      className={`!text-secondary`}
                      // ref={ref}
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setIsChecked(e.target.checked);
                        if (e.target.checked) {
                          setConsentError('');
                        }
                      }}
                      // name={name}
                      // onChange={handleChange}
                      id="footerCondition"
                      // {...restProps}
                    />
                    <label htmlFor="footerCondition" className="!text-[12px] !font-sans font-extralight tracking-[1.80px] sm:!text-[12px]">
                      By checking this box, you agree to receive automated personalized text messages from ASHCLAIR. Consent is not a condition of any
                      purchase. Reply HELP for help and STOP to cancel.{' '}
                      <Link className="underline !cursor-pointer" href="/terms-and-conditions">
                        View Terms & Privacy
                      </Link>
                      .
                    </label>
                  </div>
                  {consentError && (
                    <div ref={desktopErrorRef}>
                      <span className="text-red-500 text-sm">{consentError}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap justify-start gap-5 lg:gap-2">
                <p className="tracking-[1.0px] text-[14px]">Contact Us:</p>
                <a className="text-[14px]" href="mailto:service@ashclair.com">
                  service@ashclair.com
                </a>
              </div>
              <div className="flex flex-wrap justify-start gap-5 lg:gap-2">
                <p className="tracking-[1.0px] text-[14px]">Phone:</p>
                <p className="text-[14px]">213-622-3264</p>
              </div>
              <div className="flex flex-wrap justify-start gap-5 lg:gap-2">
                <p className="tracking-[0.0px]  text-[14px]">Service Hours:</p>
                <p className="text-[14px] uppercase">9am - 5pm PST Mon - Fri</p>
              </div>
              <div className="h-px bg-[#2f2f2f]" />
              <div className="flex items-center gap-6 ">
                <div className="flex items-center justify-between lg:flex-col gap-5">
                  <p className="tracking-[1.0px] text-[14px]">Follow Us:</p>
                  <div className="flex -ml-3 flex-1  md:w-48 justify-between gap-3 lg:justify-evenly">
                    <a href="https://www.facebook.com/ashclairjewelry" target="_blank" rel="noopener noreferrer">
                      <FaFacebookF className="h-5 w-5" />
                    </a>
                    <a href="https://www.instagram.com/ashclairjewelry/" target="_blank" rel="noopener noreferrer">
                      <FaInstagram className="h-5 w-5" />
                    </a>
                    <a href="https://www.pinterest.com/ashclairjewelry/" target="_blank" rel="noopener noreferrer">
                      <FaPinterestP className="h-5 w-5" />
                    </a>
                    {/* <Image src="/images/img_info.svg" preview={false} width={20} height={20} alt="Info" className="h-[14px] w-[14px]" /> */}
                    {/* <Image src="/images/img_settings.svg" preview={false} width={20} height={20} alt="Settings" className="h-[14px] w-[14px]" /> */}
                  </div>
                </div>
                <div className="flex items-center gap-1 border-l border-black">
                  <Image
                    src="/images/img_yotpo_badge.png"
                    width={70}
                    preview={false}
                    height={64}
                    alt="Yotpo Badge"
                    className="h-[60px] w-full md:w-20 flex justify-center object-cover md:h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile devices */}
      <div className="mt-3 sm:flex justify-center self-stretch hidden py-3 px-3">
        <div className="container-xs flex flex-col items-center justify-center w-full">
          <div className="flex flex-col w-full gap-3">
            <div className="flex flex-col gap-2.5 ">
              <div className="flex flex-col items-start gap-[18px]">
                <div className="flex gap-3.5 flex-col self-stretch">
                  <p className="tracking-[1.40px] flex flex-row w-full gap-2 items-center text-[12px]">
                    <LiaShippingFastSolid className="text-[14px]" />
                    WORLDWIDE SHIPPING
                  </p>

                  <div className="flex flex-row items-start gap-3">
                    <p className="tracking-[1.40px] text-[12px] uppercase">Secure payment</p>
                    <div className="flex gap-1.5">
                      <Image src="/images/img_close_white_a700_01.svg" width={26} height={18} alt="Close" />
                      <Image src="/images/img_television_white_a700_01.svg" width={26} height={18} alt="Television" />
                      <Image src="/images/img_television_white_a700_01_16x26.svg" width={26} height={18} alt="Television" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="  h-px bg-[#2f2f2f] " /> */}
            {!user && (
              <div className="flex flex-col my-2 items-start gap-3">
                <p className="tracking-[1.40px] text-[12px]">{discountText}</p>
                <div className="flex flex-row gap-2 w-full">
                  <Input
                    placeholder="Enter Email"
                    size="small"
                    value={email}
                    onChange={(e: any) => {
                      const v = e.target.value;
                      setEmail(v);
                      runLiveEmailValidation(v);
                      if (consentError) {
                        setConsentError('');
                      }
                    }}
                    className={`w-full !text-black ${emailError ? '!border-red-500' : ''}`}
                  />
                  <Button
                    onClick={handleFooterSubmit}
                    loading={loading}
                    className="self-stretch w-fit text-[12px] uppercase tracking-[2.00px] !h-[28px] !bg-secondary !text-text_w"
                  >
                    Submit
                  </Button>
                </div>
                {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
                <div className="flex items-start gap-[10px] !cursor-pointer">
                  <input
                    className={`!text-secondary`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      setIsChecked(e.target.checked);
                      if (e.target.checked) {
                        setConsentError('');
                      }
                    }}
                    id="footerConditionMobile"
                  />
                  <label htmlFor="footerConditionMobile" className="!text-[12px] !font-sans font-extralight tracking-[1.80px]">
                    By checking this box, you agree to receive automated personalized text messages from ASHCLAIR. Consent is not a condition of any
                    purchase. Reply HELP for help and STOP to cancel.{' '}
                    <Link className="underline !cursor-pointer" href="/terms-and-conditions">
                      View Terms & Privacy
                    </Link>
                    .
                  </label>
                </div>
                {consentError && (
                  <div ref={mobileErrorRef}>
                    <span className="text-red-500 text-sm">{consentError}</span>
                  </div>
                )}
              </div>
            )}

            <div className=" w-[100%] flex mt-2 flex-wrap gap-3 justify-between box-border gap-y-[20px]">
              <ul className="flex w-[48%] flex-col items-start gap-3">
                <li>
                  <Link href="/faqs" rel="noreferrer">
                    <p className="tracking-[1.2px] uppercase text-[11px]">FAQs</p>
                  </Link>
                </li>
                <li>
                  <Link href="/returns-shipping">
                    <p className="tracking-[1.2px] uppercase text-[11px]">SHIPPING & RETURNS</p>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    <p className="tracking-[1.2px] uppercase text-[11px]">PRIVACY POLICY</p>
                  </Link>
                </li>
                <li>
                  <Link href="terms-and-conditions">
                    <p className="tracking-[1.2px] uppercase text-[11px]">Terms and Conditions</p>
                  </Link>
                </li>
                <li>
                  <Link href="/custom-jewelry-design">
                    <p className="tracking-[1.2px] uppercase text-[11px]">Custom Jewelry Design</p>
                  </Link>
                </li>
                <li>
                  <Link href="/design-your-ring-stack">
                    <p className="tracking-[1.2px] uppercase text-[11px]">Design Your Ring Stack</p>
                  </Link>
                </li>
                <li>
                  <Link href="/design-your-own">
                    <p className="tracking-[1.2px] text-[11px]">CUSTOM JEWELRY</p>
                  </Link>
                </li>
                <li>
                  <Link href="/engagement-rings">
                    <p className="tracking-[1.2px] text-[11px]">ENGAGEMENT</p>
                  </Link>
                </li>
              </ul>
              <ul className="flex w-[48%] flex-col items-start gap-3">
                <li>
                  <Link href="/jewelry-care" rel="noreferrer">
                    <p className="tracking-[1.2px] text-[11px]">JEWELRY CARE</p>
                  </Link>
                </li>
                <li>
                  <Link href="/about-us">
                    <p className="tracking-[1.2px] text-[11px]">ABOUT US</p>
                  </Link>
                </li>
                <li>
                  <Link href="/contactpage">
                    <p className="tracking-[1.2px] text-[11px]">CONTACT US</p>
                  </Link>
                </li>

                <li>
                  <Link href="/blog">
                    <p className="tracking-[1.2px] text-[11px]">OUR BLOG</p>
                  </Link>
                </li>
                <li>
                  <Link href="/wedding-bands" rel="noreferrer">
                    <p className="tracking-[1.2px] text-[11px]">WEDDING</p>
                  </Link>
                </li>
                <li>
                  <Link href="/giftguide">
                    <p className="tracking-[1.2px] text-[11px]">GIFT GUIDE</p>
                  </Link>
                </li>
                <li>
                  <Link href="/education">
                    <p className="tracking-[1.40px] text-[14px] lg:text-[12px]">OUR EDUCATION</p>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="h-px bg-[#2f2f2f] " />

            <div className=" flex w-[100%] flex-wrap gap-2 box-border justify-start">
              <div className="flex flex-row w-full gap-2">
                <p className="text-[12px]">Contact Us:</p>
                <p className="text-[12px]">service@ashclair.com</p>
              </div>
              {/* <div className="h-px bg-[#2f2f2f]" /> */}
              <div className="w-full flex flex-row gap-2 items-center">
                <p className="text-[12px] ">Follow Us:</p>
                <div className="flex justify-start gap-3">
                  <a href="https://www.facebook.com/ashclairjewelry" target="_blank" rel="noopener noreferrer">
                    <FaFacebookF className="h-5 w-5" />
                  </a>
                  <a href="https://www.instagram.com/ashclairjewelry/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram className="h-5 w-5" />
                  </a>
                  <a href="https://www.pinterest.com/ashclairjewelry/" target="_blank" rel="noopener noreferrer">
                    <FaPinterestP className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap justify-start gap-5 lg:gap-2">
                <p className="tracking-[0.0px] text-[12px]">Service Hours:</p>
                <p className="text-[12px] uppercase">9am - 5pm PST Mon - Fri</p>
              </div>
              <div className="flex w-[48%] items-center justify-between gap-2 ">
                <div className="flex items-center gap-1">
                  <Image
                    src="/images/img_yotpo_badge.png"
                    width={70}
                    preview={false}
                    height={64}
                    alt="Yotpo Badge"
                    className="h-[60px] w-full md:w-20 flex justify-center object-cover md:h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center self-stretch bg-[#eceded] py-3">
        <Link href="/privacy-policy">
          <div className="container-xs flex justify-center gap-6 px-14 lg:px-20 md:px-5">
            <p className="uppercase tracking-[1.00px] text-[12px]">Privacy policy</p>
            <div className="h-[12px] w-px border border-solid border-[#707070] bg-[#ffffff]" />
            <p className="tracking-[1.00px] text-[12px]">© {dayjs().year()} ASHCLAIR</p>
          </div>
        </Link>
      </div>
    </footer>
  );
}
