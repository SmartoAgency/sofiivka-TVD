import i18next from 'i18next';
import { gsap } from 'gsap';
import * as yup from 'yup';
// eslint-disable-next-line import/no-extraneous-depende
import FormMonster from '../../../pug/components/form/form';
import SexyInput from '../../../pug/components/input/input';


/*
 * form handlers start
 */
const forms = [
    '[data-contact-screen-form]',
    '[data-contact-screen-form-in-popup]',
  ];
  forms.forEach((form) => {
    const $form = document.querySelector(form);
    if ($form) {
      /* eslint-disable */
      new FormMonster({
        /* eslint-enable */
        elements: {
          $form,
          successAction: () => {
            const template = document.getElementById('succes-form-popup-template');
            let html = template.innerHTML;
            $form.insertAdjacentHTML('beforeend', html);
            // $form.insertAdjacentHTML('beforeend', `
            //   <div data-success style="
            //     position: absolute;
            //     left: 0;
            //     top: 0;
            //     width: 100%;
            //     height: 100%;
            //     background-color: var(--color-white);
            //     display: flex;
            //     align-items: center;
            //     justify-content: center;
            //     flex-direction: column;
            //     font-family: 'Inter Display';
            //     font-size: 21px;
            //     font-style: normal;
            //     line-height: 120%; /* 72px */
            //     text-transform: uppercase;
            //     z-index: 2;
            //     padding: 8px;
            //     color: rgba(7,34,47,1);
            //   ">
            //     <svg style="margin-bottom: 25px;" width="100" height="100"  xmlns="http://www.w3.org/2000/svg" width="100" height="101" viewBox="0 0 100 101" fill="none">
            //       <path d="M33.6855 86.5101C38.9992 89.3744 45.0792 91 51.5389 91C72.3487 91 89.2183 74.1303 89.2183 53.3205C89.2183 32.5107 72.3487 15.641 51.5389 15.641C30.7291 15.641 13.8594 32.5107 13.8594 53.3205C13.8594 62.78 17.3452 71.4253 23.1024 78.042L19.3487 90.3541L19.0686 91.2729L19.9819 90.9754L33.6855 86.5101Z" stroke="#1A1A1D"/>
            //       <path d="M48.7183 43.3205C48.7183 39.4101 45.4493 36.141 41.5389 36.141C37.6284 36.141 34.3594 39.41 34.3594 43.3205" stroke="#1A1A1D"/>
            //       <path d="M75.3852 43.3205C75.3852 39.4101 72.2329 36.141 68.4621 36.141C64.6914 36.141 61.5391 39.41 61.5391 43.3205" stroke="#1A1A1D"/>
            //       <path d="M63.0777 58.7053C63.0777 62.6157 59.8087 65.8848 55.8982 65.8848C51.9878 65.8848 48.7188 62.6157 48.7188 58.7053" stroke="#1A1A1D"/>
            //       <path d="M8.22657 21.6678L10.6045 24.0458L16.0082 18.6421" stroke="#1A1A1D" stroke-linecap="round" stroke-linejoin="round"/>
            //       <path d="M87.1406 23.8949L89.5186 26.2728L94.9222 20.8692" stroke="#1A1A1D" stroke-linecap="round" stroke-linejoin="round"/>
            //       <circle cx="80.385" cy="8.32051" r="3.32051" stroke="#1A1A1D"/>
            //       <circle cx="9.48653" cy="83.0642" r="3.32051" stroke="#1A1A1D"/>
            //       <circle cx="95.1291" cy="83.0642" r="3.32051" stroke="#1A1A1D"/>
            //     </svg>
            //     <div style="padding-left: 40px; padding-right: 40px; text-align: center; margin-bottom: 10px;"  class="text-uppercase text-style-1920-h-2">
            //       Повідомлення надіслано
            //     </div>
            //     <div class="text-style-1920-body" style="text-align: center; margin-bottom: 40px; max-width:500px; margin-left: auto; margin-right: auto; " >Дякуємо за звернення! Ми зв’яжемось з вами найближчим часом або час зазначиний вами</div>
            //     <button data-form-popup-close style="color: white; text-transform: uppercase; border-radius: 100px; background: var(--Black, #1A1A1D); display: flex;width: 100%;padding: 20px;justify-content: center;align-items: center;gap: 10px;" type="button" onclick="this.closest('[data-success]').remove()" class="button-30 button-30--success-popup text-style-1920-button">
            //       <span>Закрити</span>
            //     </button>
              
            //   </div>
            
            // `);
            
            setTimeout(() => {
                // $form.querySelector('[data-success]').remove();
            }, 6000);
          },
          $btnSubmit: $form.querySelector('[data-btn-submit]'),
          fields: {
            name: {
              inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-name]') }),
              rule: yup.string().required(i18next.t('required')).trim(),
              defaultMessage: i18next.t('name'),
              valid: false,
              error: [],
            },
  
            phone: {
              inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-phone]'), typeInput: 'phone' }),
              rule: yup
                .string()
                .required(i18next.t('required'))
                .min(17, i18next.t('field_too_short', { cnt: 17 - 5 })),
  
              defaultMessage: i18next.t('phone'),
              valid: false,
              error: [],
            },
          },
  
        },
      });
    }
});


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

const formState = useState(false);

// const [ fromPopup, setFormPopup, useSetPopupEffect ] = 
const fromPopup = formState[0];
const setFormPopup = formState[1];
const useSetPopupEffect = formState[2];

useSetPopupEffect(val => {
  if (val) {
    gsap.to('[data-form-popup]', {
      autoAlpha: 1,
      pointerEvents: 'all'
    });
    return;
  }
  gsap.to('[data-form-popup]', {
    autoAlpha: 0,
    pointerEvents: 'none'
  });
})


document.body.addEventListener('click', (evt) => {
  const target = evt.target.closest('[data-form-popup-call]');
  if (!target) return;
  setFormPopup(true);
})
document.body.addEventListener('click', (evt) => {
  const target = evt.target.closest('[data-form-popup-close]');
  if (!target) return;
  setFormPopup(false);
})