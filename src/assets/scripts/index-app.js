import Headroom from 'headroom.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import './modules/form';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { lenis } from './modules/scroll/leniscroll';
import Swal from 'sweetalert2';

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);


const header = document.querySelector('.header');
const headroom = new Headroom(header, {
    offset : 100,
});
headroom.init();
header.headroom = headroom;

//data-popup

function useState(initialValue) {
    let value = initialValue;
    const subscribers = [];

    function setValue(newValue) {
        value = newValue;
        subscribers.forEach((subscriber) => subscriber(value));
    }

    function getState() {
        return value;
    }

    function subscribe(callback) {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    return [getState, setValue, subscribe];
}


const [formPopup, setFormPopup, useSetPopupEffect] = useState(false);

useSetPopupEffect(val => {
    const popup = document.querySelector('[data-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-call]');
    if (target) {
        setFormPopup(true);

    }
});
document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setFormPopup(false);
    }
});


const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    if (window.screen.width < 1025) return;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

const [menuState, setMenuState, useSetMenuEffect] = useState(false);

useSetMenuEffect(val => {
    const menu = document.querySelector('[data-menu]');
    menu.classList.toggle('active', val);
    if (val) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-menu-call]');
    if (target) {
        setMenuState(true);
    }
});

document.querySelectorAll('.menu__link').forEach(el => {
    el.addEventListener('click',function(evt){
        setMenuState(false);
    });
})

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-menu-close]');
    if (target || evt.target.classList.contains('menu')) {
        setMenuState(false);
    }
});


document.querySelectorAll('[data-up-arrow]').forEach(el => {
    el.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});



const [callbackPopupOpen, setCallbackPopupOpen, useSetCallbackPopupEffect] = useState(false);

useSetCallbackPopupEffect(val => {
    const popup = document.querySelector('[data-callback-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
    // data-callback-popup-close
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-callback-popup-call]');
    if (target) {
        setCallbackPopupOpen(true);
    }
});
document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-callback-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setCallbackPopupOpen(false);
    }
});


const [buildPopupOpen, setBuildPopupOpen, useSetBuildPopupEffect] = useState(false);

//data-build-popup

useSetBuildPopupEffect(val => {
    const popup = document.querySelector('[data-build-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
})

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-build-popup-open]');
    if (target) {
        evt.preventDefault();
        evt.stopPropagation();
        setBuildPopupOpen(true);
    }
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-build-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setBuildPopupOpen(false);
    }
});

/** Mobile callback popup */
function mobPopupHandler() {
    const popup = document.querySelector('[data-mobile-callback-popup]');
    const call = document.querySelectorAll('[data-call-mobile-callback-popup]');
    const closeEl = document.querySelectorAll('[data-mobile-callback-close]');
    closeEl.forEach(el => {
        el.addEventListener('click', (evt) => {
            popup.classList.remove('active');

        });
    })

    popup.addEventListener('click', ({ target }) => {
        target === popup ? close(popup) : null;
    })
    call.forEach(el => el.addEventListener('click', (evt) => {
        if (window.screen.width <= 1024) {
            evt.preventDefault();
            popup.classList.add('active');
        }
    }));
    // call.forEach(el => el.addEventListener('touchstart', () => open(popup)));
}

mobPopupHandler();


splitToLinesAndFadeUp('[data-split-lines]', gsap);

document.querySelectorAll('.installment-block__img-wrap img').forEach(el => {
    // gsap.set(el, { scale: 1.05 });
    gsap.timeline({
        scrollTrigger: {
            trigger: el,
            scrub: 1,
        }
    })
        .to(el, { scale: 1.1, ease: 'none' });
});



function innerPagesBgParalax() {
    // .construction-page-bg img
    if (window.screen.width < 600) return;
    const bgImg = document.querySelector('[data-inner-page-bg]');
    if (!bgImg) return;
    gsap.timeline({
        scrollTrigger: {
            trigger: bgImg,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        }
    })
        // .to(bgImg, { scale: 1.05, ease: 'none' })
        .to(bgImg, { scale: 1.05, y: window.innerHeight * 0.35, ease: 'none' });
}

innerPagesBgParalax();


//data-installment-popup-text
//data-installment-popup-open

document.body.addEventListener('click', function installmentPopupHandler(evt) {
    const target = evt.target.closest('[data-installment-popup-open]');
    if (!target) return;
    const text = document.querySelector('[data-installment-popup-text]').innerHTML;
    Swal.fire({
        html: text,
        showCloseButton: true,
        showConfirmButton: false,
        showCancelButton: false,
        closeButtonHtml: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00008 7.29297L8.35363 7.64652L12.5001 11.793L16.6465 7.64652L17.0001 7.29297L17.7072 8.00008L17.3536 8.35363L13.2072 12.5001L17.3536 16.6465L17.7072 17.0001L17.0001 17.7072L16.6465 17.3536L12.5001 13.2072L8.35363 17.3536L8.00008 17.7072L7.29297 17.0001L7.64652 16.6465L11.793 12.5001L7.64652 8.35363L7.29297 8.00008L8.00008 7.29297Z" fill="#1A1E21"/>
        </svg>
        `,
        width: 600,
        focusConfirm: false,
        customClass: {
            popup: 'installment-popup',
            container: 'installment-popup-container',
            closeButton: 'popup-close',
            confirmButton: 'btn btn--primary',
        },
    });
});

document.body.addEventListener('click', function closeInstallmentPopup(evt) {
    const target = evt.target.closest('[data-installment-popup-close]');
    if (!target) return;
    Swal.close();
});