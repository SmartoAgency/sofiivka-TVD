import { BehaviorSubject } from 'rxjs';
import isEmpty from 'lodash/isEmpty.js';
import FilterModel from './modules/filter/filterModel.js';
import FilterController from './modules/filter/filterController.js';
import FilterView from './modules/filter/filterView.js';
import mockFlats from './modules/filter/flats.json';
import { pushParams, removeParamsByRegExp } from './modules/history/history.js';
import gsap from 'gsap';

const SEARCH_PARAMS_FILTER_PREFIX = 'filter_';
const currentFilteredFlatIds$ = new BehaviorSubject([]);

const flats = mockFlats.reduce((acc, flat) => {
    acc[flat.id] = flat;
    return acc;
}, {})

currentFilteredFlatIds$.subscribe((ids) => {
    const $container = document.querySelector('[data-planning-list]');
    gsap.timeline()
        .to('[data-planning-list]>*', {
            autoAlpha: 0,
            duration: 0.5,
        })
        .add(() => {
            if (!ids.length) {
                return $container.innerHTML = `
                    <div class="text-style-1920-h-2">
                        ${$container.getAttribute('data-not-found-title')}
                    </div>
                `;
            }
            $container.innerHTML = ids.map(id => {
                const flat = flats[id];
                return $card(flat);
            }).join('');
        })
});

// mark checked checkboxes from default URL search params
const filterDefaultSearchParams = new URLSearchParams(window.location.search);
Array.from(filterDefaultSearchParams.entries()).forEach(([key, value]) => {
    if (key.startsWith(SEARCH_PARAMS_FILTER_PREFIX)) {
        const [ _, name, valueName ] = key.split('_');     
        document.querySelectorAll(`input[data-${name}="${valueName}"]`).forEach((el) => {
            el.checked = true;
        })
    }
});

const filterModel = new FilterModel(
    {
        flats: mockFlats,
        currentFilteredFlatIds$: currentFilteredFlatIds$,
        onChangeFilterState: (state, filterConfig) => {
            if (isEmpty(filterConfig)) return;

            const filterSearchParamsPrefix = SEARCH_PARAMS_FILTER_PREFIX;

            const searchParamsOfFilterState = Object.entries(state).reduce((acc, [key, value]) => {
                const filterName = value[0];
                const filterType = value[1].type;
                switch (filterType) {
                    case 'range':
                        const rangeInstance = filterConfig[filterName].elem;
                        if (rangeInstance.result.from !== rangeInstance.result.min) {
                            acc[`${filterSearchParamsPrefix}${filterName}_min`] = value[1].min;
                        }
                        if (rangeInstance.result.to !== rangeInstance.result.max) {
                            acc[`${filterSearchParamsPrefix}${filterName}_max`] = value[1].max;
                        }
                        break;
                    case 'checkbox':
                        value[1].value.forEach(val => {
                            acc[`${filterSearchParamsPrefix}${filterName}_${val}`] = val;
                        });
                        break;
                    case 'text':
                        if (value[1].value) {
                            acc[`${filterSearchParamsPrefix}${filterName}`] = value[1].value;
                        }
                        break;
                }
                return acc;
            }, {});

            const regExp = new RegExp(`${SEARCH_PARAMS_FILTER_PREFIX}`);

            removeParamsByRegExp(regExp);

            pushParams(searchParamsOfFilterState);
        },
    },
);
const filterView = new FilterView(filterModel, {});
const filterController = new FilterController(filterModel, filterView);

filterModel.init();





function $card(flat) {

    const { area, rooms, floor, section, build, img_big, id } = flat;
    const areaStr = area ? `${area} м²` : 'N/A';
    const eoselya = flat.eoselya ? `
        <img class="planning-card__image-label" src="./assets/images/eoselya.svg">
        ` : '';

    return `
        <a class="planning-card" href="/single-flat?id=${id}" data-id="${id}">
            <div class="planning-card__top">${rooms}-к / ${areaStr}</div>
            <div class="planning-card__image">
                ${eoselya}
                <div class="planning-card__image-wrap">
                    <img src="${img_big}" loading="lazy" alt="" srcset="">
                </div>
            </div>
            <div class="planning-card__bottom">
                <div class="planning-card__bottom-group">
                    Будинок:&nbsp;
                    <span class="text-color-body-description">
                        ${build}
                    </span>
                </div>
                <div class="planning-card__bottom-group">
                    Секція:&nbsp;
                    <span class="text-color-body-description">${section}</span>
                </div>
                <div class="planning-card__bottom-group">
                    Поверх:&nbsp;
                    <span class="text-color-body-description">${floor}</span>
                </div>
            </div>
        </a>
    `;
}