import { BehaviorSubject } from 'rxjs';
import isEmpty from 'lodash/isEmpty.js';
import FilterModel from './modules/filter/filterModel.js';
import FilterController from './modules/filter/filterController.js';
import FilterView from './modules/filter/filterView.js';
import mockFlats from './modules/filter/flats.json';
import { pushParams, removeParamsByRegExp } from './modules/history/history.js';

planningsGallery();

async function planningsGallery() {

    const SEARCH_PARAMS_FILTER_PREFIX = 'filter_';
    const currentFilteredFlatIds$ = new BehaviorSubject([]);

    const fetchedFlats = await getFlats();

    const flats = fetchedFlats.reduce((acc, flat) => {
        acc[flat.id] = flat;
        return acc;
    }, {});   


    let paginationData = [];
    let currentPage$ = new BehaviorSubject(1);
    let totalPages = 0;
    const portion = 42;

    function preparePgination(flats = []) {
        const portionedFlats = [];
        const length = flats.length;
        const totalPages = Math.ceil(length / portion);

        flats.forEach((flat, index) => {
            const page = Math.floor(index / portion) + 1;
            if (!portionedFlats[page]) {
                portionedFlats[page] = [];
            }
            portionedFlats[page].push(flat);
        });        

        return { portionedFlats, totalPages };
    }

    currentPage$.subscribe((page) => {
        const $container = document.querySelector('[data-planning-list]');
        document.querySelector('[data-more]').classList.toggle('hidden', currentPage$.value >= totalPages);
        if (!paginationData[page]) return;
        $container.insertAdjacentHTML('beforeend', paginationData[page].map(id => {
            const flat = flats[id];
            // return $card(flat);
            return renderTemplate('flat-card-template', flat);
        }).join(''));
    })

    currentFilteredFlatIds$.subscribe((ids) => {
        const idsSortedByArea = ids.sort((a, b) => {
            const areaA = flats[a].area || 0;
            const areaB = flats[b].area || 0;
            return areaA - areaB > 0 ? 1 : -1;
        })
        paginationData = preparePgination(idsSortedByArea).portionedFlats;
        totalPages = preparePgination(idsSortedByArea).totalPages;
        const $container = document.querySelector('[data-planning-list]');
        window.scrollTo({
            top: 0,
            // behavior: 'smooth',
        });
        $container.innerHTML = '';
        if (ids.length === 0) {
            const template = document.getElementById('empty-planning-list');
            $container.innerHTML = template.innerHTML;
            return;
        }
        
        currentPage$.next(1);


    });

    document.querySelector('[data-more]').addEventListener('click', (e) => {
        currentPage$.next(currentPage$.value + 1);
    })

    // mark checked checkboxes from default URL search params
    const filterDefaultSearchParams = new URLSearchParams(window.location.search);
    Array.from(filterDefaultSearchParams.entries()).forEach(([key, value]) => {
        if (key.startsWith(SEARCH_PARAMS_FILTER_PREFIX)) {
            const [_, name, valueName] = key.split('_');
            document.querySelectorAll(`input[data-${name}="${valueName}"]`).forEach((el) => {
                el.checked = true;
            })
        }
    });

    const filterModel = new FilterModel(
        {
            flats: flats,
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
}

async function getFlats() {
    if (window.location.href.match(/localhost|verstka|192/)) {
        return Promise.resolve(mockFlats);
    }
    const fd = new FormData();
    fd.append('action', 'getFlats');
    const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: fd,
    });
    const data = await response.json();
    return data;
}

function $card(flat = {}) {

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
                    <img src="${img_big}" loading="lazy" alt="" srcset="" onerror="this.style.opacity = 0;">
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


function renderTemplate(templateId, data) {
    const template = document.getElementById(templateId);
    let html = template.innerHTML;

    // Підставляємо дані в шаблон
    for (const key in data) {
        const value = data[key];
        if (key === 'eoselya' && value) {
            //<img class="planning-card__image-label" src="./assets/images/eoselya.svg">
            html = html.replaceAll(`{{${key}}}`, `<img class="planning-card__image-label" src="/wp-content/themes/3d/assets/images/eoselya.svg">`);
        } else {
            html = html.replaceAll(`{{${key}}}`, value);
        }
    }

    // Створюємо елемент
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.firstElementChild.outerHTML;
}