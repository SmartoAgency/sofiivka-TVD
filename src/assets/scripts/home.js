import Swiper, { EffectFade, Mousewheel, Navigation, Autoplay } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Headroom from 'headroom.js';
import { pad, useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import Accordion from "accordion-js";
import googleMap from './modules/map/map';
import './modules/gallery/gallerySlider';
import { debounce } from 'lodash';

const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);

if (new URLSearchParams(window.location.search).get('debug') != 'true') {
  googleMap();
}


function frontScreenSlider() {
    const slider = document.querySelector('[data-front-screen-slider]');
    if (!slider) return;
    const speed = 500;
    const delay = 5000;
    const swiper = new Swiper(slider, {
      modules: [EffectFade, Autoplay],
      effect: 'fade',
      loop: true,
      autoplay: { delay: delay - speed },
      speed, 
      init: false,
    });
    swiper.on('afterInit', animateOnInit);
    swiper.on('slideChange', () => {
      animate(swiper, delay / 1000);
    });
    swiper.init();

    function animateOnInit() {
      gsap.fromTo(slider.querySelector('.swiper-slide-active img'), {
        scale: 1
      },{
        scale: 1.1, duration: delay / 1000, ease: 'none',
      })
    }

    function animate(swipe, duration = 0) {
      const slide = slider.querySelector('.swiper-slide-next img');

      if (swipe.realIndex % 2 == 0) {
        const scale = gsap.utils.mapRange(delay, 0, 1, 1.1, duration);
        gsap.fromTo(slide, {
          scale: 1
        },{
          scale: scale, duration, ease: 'none',
        })
      } else{
        const scale = gsap.utils.mapRange(0, delay, 1.1, 1, duration);
        gsap.fromTo(slide, {
          scale: scale
        },{
          scale: 1, duration, ease: 'none',
        })
      }
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          swiper.autoplay.resume();
          animate(swiper, swiper.autoplay.timeLeft / 1000);
        } else {
          swiper.autoplay.pause();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(slider);

}

frontScreenSlider();


document.querySelectorAll('.home-front-screen__arrow').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.home-about-screen').scrollIntoView({ behavior: 'smooth' });
  });
});

function applyScrollTriggerAnimation(selectors) {
  document.querySelectorAll(selectors).forEach(el => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: '50% bottom',
          // end: 'bottom center',
          once: true,
        },
      })
      .fromTo(
        Array.from(el.children),
        { y: 25, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, clearProps: 'all', duration: 1.25, ease: 'power4.out', stagger: 0.1 },
      );
  });
}

applyScrollTriggerAnimation(
  '.contact-screen__table-item, .contact-screen .contact-screen-form, .home-sticky-block__item, .home-video-block__decor, .home-advantages-block__title, .home-location-screen__slogan, .home-location-screen__light, .home-about-screen__items',
);

Swiper.use([Mousewheel, Navigation]);




document.querySelectorAll('.home-advantages-block__item').forEach(el => {
  el.addEventListener('click', ()=>{
    el.classList.toggle('active');
  })
});

const advSwiper = new Swiper('[data-home-advantages-slider]', {
  modules: [EffectFade],
  effect: 'fade',
  // speed: 5000,
  fadeEffect: {
    crossFade: true,

  },
  loop: true,
  // navigation: {
  //   nextEl: '[data-home-advantages-slider-next]',
  //   prevEl: '[data-home-advantages-slider-prev]'
  // },
  on: {
    init: function () {
      // setSlideIndex(this.realIndex);
    },
    'slideChange': function () {
      // setSlideIndex(this.realIndex);
    }
  }
})


const [ slideIndex, setSlideIndex, subscribeSlideIndex ] = useState(0);

subscribeSlideIndex((index) => {
  document.querySelector('[data-home-advantages-slider-current]').textContent = pad(index + 1);
  document.querySelectorAll('[data-home-advantages-item]').forEach((el, i) => {
    el.classList.toggle('active', i === index);
    // scroll into view
    if (i === index) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  advSwiper.slideTo(index);
});

document.body.addEventListener('click', (e) => {
  //data-home-advantages-item
  const target = e.target.closest('[data-home-advantages-item]');
  if (!target) return;
  setSlideIndex(+target.dataset.homeAdvantagesItem);
});
document.querySelector('[data-home-advantages-slider-next]').addEventListener('click', () => {
  const nextIndex = slideIndex() == advSwiper.slides.length - 1 ?  0 : slideIndex() + 1;
  setSlideIndex(nextIndex);
});
document.querySelector('[data-home-advantages-slider-prev]').addEventListener('click', () => {
  const nextIndex = slideIndex() == 0 ? advSwiper.slides.length - 1 : slideIndex() - 1;
  setSlideIndex(nextIndex);
});
setSlideIndex(0);

function handleInfraFilter() {
  const [ filter, setFilter, subscribeFilter ] = useState();
  // data-infra-filter
  document.querySelector('[data-infra-filter-open]').addEventListener('click', () => {
    setFilter(true);
  });
  document.querySelector('[data-infra-filter-close]').addEventListener('click', () => {
    setFilter(false)
  });

  subscribeFilter((value) => {
    const block = document.querySelector('[data-infra-filter]');
    // document.querySelector('[data-infra-filter]').classList.toggle('active', value);
    if (value) {
      gsap.timeline()
        .add(() => {
          const filter = document.querySelector('[data-infra-filter]');
          filter.classList.add('active');
        })
        .fromTo(block, { autoAlpha: 0 },{ autoAlpha: 1, duration: 0.5, ease: 'power4.out' })
        .fromTo('[data-infra-filter]>*', { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.25, ease: 'power4.out', stagger: 0.1 }, '<')
    } else {
      gsap.timeline()
        .fromTo('[data-infra-filter]>*', { y: 0, autoAlpha: 1 }, { y: 25, autoAlpha: 0, duration: 1.25, ease: 'power4.out', stagger: 0.1 })
        .fromTo(block, { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.25, ease: 'power4.out' }, '<')
        .add(() => {
          const filter = document.querySelector('[data-infra-filter]');
          filter.classList.remove('active');
        })

    }
  });
}

handleInfraFilter();


function homeMenuHandler() {
  const links = document.querySelectorAll('[data-home-menu-link]');
  const blockFromLinks = Array.from(links).map(link => link.getAttribute('data-home-menu-link'));
  const debouncedLinksHandler = debounce(linksHandler, 300);
  
  const pageBlocks = blockFromLinks.map(el => {
    return document.querySelector(el);
  });

  pageBlocks.forEach(section => {
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {debouncedLinksHandler(links, section)},
        onEnterBack: () => {debouncedLinksHandler(links, section)},
      },
    })
  });
  
  function linksHandler(links, section) {
    links.forEach(el => el.classList.toggle('active', el.getAttribute('data-home-menu-link') === `#${section.id}`));
  }
  //data-home-menu

  document.querySelectorAll('[data-home-menu-link]').forEach(el => {
    el.addEventListener('click',function(evt){
      // match media query
      const mediaQuery = window.matchMedia('(max-width: 1024px)');
      if (mediaQuery.matches) {
        document.querySelector('[data-home-menu]').classList.remove('active');
      }
    });
  })

  const $menu = document.querySelector('[data-home-menu]');
  document.querySelectorAll('[data-home-menu-open]').forEach(el => {
    el.addEventListener('click', () => {
      $menu.classList.add('active');
    });
  });
  document.querySelectorAll('[data-home-menu-close]').forEach(el => {
    el.addEventListener('click', () => {
      $menu.classList.remove('active');
    });
  });

}

homeMenuHandler();

document.querySelectorAll('[data-home-down]').forEach(el => {
  el.addEventListener('click', () => {
    const target = document.querySelector('.home-about-screen');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


function aboutScreenSwipeImageHandler() {
  const swipeBlock = document.querySelector('[data-mobile-image-swipe]');
  if (!swipeBlock) return;

  const [scrollValue, setScrollValue, subscribeScrollValue] = useState(0);

  const input = swipeBlock.querySelector('[data-mobile-image-swipe-input]');
  const icon = swipeBlock.querySelector('[data-mobile-image-swipe-icon]');
  const image = swipeBlock.querySelector('[data-mobile-image-swipe-image]');
  const svg = swipeBlock.querySelector('[data-mobile-image-swipe-svg]');
  const svgWidth = svg.getAttribute('viewBox').split(' ')[2];
  const slideSvgButtonRadius = +icon.querySelector('circle').getAttribute('r');

  input.setAttribute('max', image.scrollWidth - window.innerWidth);

  subscribeScrollValue((value) => {
    const scrollWidth = image.scrollWidth - image.clientWidth;
    // image.scrollLeft = value * scrollWidth / 100;
    // icon.style.transform = `translateX(${value * scrollWidth / 100}px)`;
    input.value = value;

    const swipeXoffset = gsap.utils.mapRange(
      0,
      input.getAttribute('max'),
      0, svgWidth-slideSvgButtonRadius * 2,
      value
    );

    // icon.style.transform = `translateX(${value}px)`;
    // icon.setAttribute('transform', `tr
    // anslate(${swipeXoffset - (slideSvgButtonRadius * 2)} ,0)`)
    icon.setAttribute('transform', `translate(${swipeXoffset} ,0)`)
  });

  image.addEventListener('scroll', () => {
    setScrollValue( image.scrollLeft);
  })

  input.addEventListener('input', (e) => {
    const value = e.target.value;
    image.scrollLeft = value;
    setScrollValue(value);
    
  })
  //data-mobile-image-swipe-icon
  setScrollValue((image.scrollWidth - window.innerWidth) / 2);
  image.scrollLeft = (image.scrollWidth - window.innerWidth) / 2;
}

aboutScreenSwipeImageHandler();




document.querySelectorAll('[data-bg-paralax]').forEach(el => {
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        scrub: 1,
      }
    })
      .fromTo(el, { y: 0, scale: 1 }, { scale: 1.2, y: -100, ease: 'none' });
});


function homeCharacteristicAnimation() {
  // anim with gsap fadeInFromDown .home-characteristics__content>div
  const items = document.querySelectorAll('.home-characteristics__content>div');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: items[0],
      start: 'top 80%',
      end: 'bottom 50%',
      once: true,
    },
  })
  tl.fromTo(items, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.25, ease: 'power4.out', stagger: 0.1 });
}
homeCharacteristicAnimation();


function developerBlockParalax() {
  gsap.timeline({
    scrollTrigger: {
      trigger: '.home-gallery-screen',
      scrub: true,
      end: '70% bottom'
    }
  })
  .to('.home-double-screen__developer-image:last-child', {
    yPercent: '80'
  })
  .to('.home-double-screen__developer-image:nth-child(4)', {
    yPercent: '100'
  }, '<')
  // .to('.home-double-screen__text-wrap .developer-link', {
  //   yPercent: '50'
  // }, '<')
}

developerBlockParalax();