import React, { useCallback, useMemo, useState } from 'react'
import styles from './index.module.less'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import { Controller } from 'swiper';




export interface DoubleSwiperProps {

}

const DoubleSwiper: React.FC<DoubleSwiperProps> = (props) => {

  const {

  } = props;

  const [currentTab, setCurrent] = useState<number>(0);
  const [controlledSwiperTop, setControlledSwiperTop] = useState<any>(null);
  const [controlledSwiperBottom, setControlledSwiperBottom] = useState<any>(null);
  const swiper = useSwiper();

  const tabOptions = ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10'];

  const computedCurrentClassName = useCallback((index: number) => {
    let res = ''
    if (index === currentTab) {
      res = 'active'
    }
    if (index + 1 === currentTab) {
      res = 'prev1'
    }
    if (index + 2 === currentTab) {
      res = 'prev2'
    }
    if (index - 1 === currentTab) {
      res = 'next1'
    }
    if (index - 2 === currentTab) {
      res = 'next2'
    }
    console.log(styles[res])
    return res;
  }, [currentTab]);

  const computedYOffset = (progress: number) => {
    const radius = 1800;
    const angle = ( 10 * Math.PI / 4600 ) * Math.abs(progress);
    return  radius * Math.sin(angle)
  }

  return (
    <>
      <div className={styles.tab}>
        <div className={styles.tabInner}>
          <Swiper
            spaceBetween={50}
            slidesPerView={5}
            speed={1000}
            onSlideChange={(params) => {
              setCurrent(params?.activeIndex);

              console.log('slide change', params)
            }}
            onSwiper={(swiper) => {
              setControlledSwiperBottom(swiper)
            }}
            className={styles.tabSwiperInner}
            modules={[Controller]}
            controller={{ control: controlledSwiperTop }}
            initialSlide={0}
            centeredSlides
            style={{
              padding: '0 16px'
            }}
            watchSlidesProgress
            onSetTranslate={(swiper) => {
              // console.log('onSetTranslate',{swiper});
              let slides = swiper.slides
              for (let i = 0; i < slides.length; i++) {
                let slide = slides[i]
                let progress:number = slide?.progress as number;
                let progressRound = Math.trunc(Math.abs(progress));
                slide.style.opacity = '';
                slide.style.background = '';
                slide.style.opacity =  `${(1 - Math.abs(progress) / 5)}`;

                if(i == 0) {
                  console.log('progress',progressRound)
                }

                slide.style.transform = `translate3d(0,${computedYOffset(progress)}px, 0) rotate(${-(progress * 4)}deg)`;
              }	
            }}
            onSetTransition={(swiper, transition) => {
              for (var i = 0; i < swiper.slides.length; i++) {
                var slide = swiper.slides[i];
                slide.style.transition = `${transition}`;
              }
            }}
          >
            {
              tabOptions.map((item, index) => {
                return (
                  <SwiperSlide key={item} virtualIndex={index}>
                    <div
                      className={`
                                ${styles.tabItem} 
                                ${styles[computedCurrentClassName(index)]}
                              `}
                    >
                      {item}
                      {/* {} */}
                    </div>
                  </SwiperSlide>
                )
              })
            }
          </Swiper>
        </div>
        
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          speed={1000}
          onSlideChange={() => console.log('slide change')}
          onSwiper={(swiper) => setControlledSwiperTop(swiper)}
          modules={[Controller]}
          controller={{ control: controlledSwiperBottom }}
        >
          {
            tabOptions.map((item, index) => {
              return (
                <SwiperSlide key={item} virtualIndex={index}>
                  <div
                    className={`${styles.tabItemCard}`}
                  >
                    {item}
                  </div>
                </SwiperSlide>
              )
            })
          }
        </Swiper>
      </div>
    </>
  )
}
export default DoubleSwiper

