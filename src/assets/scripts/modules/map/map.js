import { fetchMarkersData } from "./getMarkers";
import mapStyle from "./map-style";



export default function googleMap() {
  global.initMap = initMap
}

async function func() {
  const script = document.createElement('script');
  let key = document.documentElement.dataset.key ? document.documentElement.dataset.key : '';
  // if (window.location.href.match(/localhost|smarto/)) key = '';
  // const key = '';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap&language=${document.documentElement.getAttribute('lang')}&libraries=marker`;
  document.getElementsByTagName('head')[0].appendChild(script);
}
// setTimeout(func, 1000);
const maps = document.querySelectorAll('.map');
const options = {
  rootMargin: '0px',
  threshold: 0.1,
};

maps.forEach((image) => {
  const callback = (entries, observer) => {
    /* Content excerpted, show below */
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
        observer.unobserve(image);
        func();
      }
    });
  };
  const observer = new IntersectionObserver(callback, options);
  const target = image;
  observer.observe(target);
});

// eslint-disable-next-line no-unused-vars
function initMap() {
  const gmarkers1 = [];
  //28.4600074, 49.2384203
  const center = {
    lat: 49.810250222382344, 
    lng: 24.0418943600124,
  };
  /** Массив, куда записываются выбраные категории */
  let choosedCategories = new Set();
  choosedCategories.add('main');
  /** Елементы, при клике на который будет происходить фильтрация */
  const filterItems = document.querySelectorAll('[data-marker]');
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center,
    scrollwheel: false,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    draggable: true,
    // gestureHandling: 'cooperative',
    language: document.documentElement.getAttribute('lang') || 'en',
    styles: mapStyle()
  });
  window.googleMap = map;
  const baseFolder = window.location.href.match(/localhost/) 
    ? './assets/images/markers/'
    : '/wp-content/themes/forest-home/assets/images/markers/';

  iniCircleWithTooltip({
    map,
    radius: 500,
    tooltipImgUrl: `${baseFolder}500m.svg`,
    center
  })
  iniCircleWithTooltip({
    map,
    radius: 1000,
    tooltipImgUrl: `${baseFolder}1km.svg`,
    center
  });

  iniCircleWithTooltip({
    map,
    radius: 1500,
    tooltipImgUrl: `${baseFolder}1_5km.svg`,
    center
  });

  google.maps.event.addDomListener(window, "resize", function() {
    console.log('resize');
    
    google.maps.event.trigger(map, "resize");
    map.fitBounds(bounds);
  });


  const filterMarkers = function (category, categoriesArray) {
    gmarkers1.forEach((el) => {
      if (categoriesArray.has(el.category) || categoriesArray.size <= 1) {
        el.setMap(map);
        el.setAnimation(google.maps.Animation.DROP);
      } else {
        el.setMap(null);
      }
    });
  };

  document.querySelectorAll('[data-marker-reset]').forEach((el) => {

    el.addEventListener('click', () => {
      choosedCategories = new Set();
      choosedCategories.add('main');
      filterItems.forEach((item) => {
        item.classList.remove('active');
      });
      filterMarkers('main', choosedCategories);
    });
  });

  filterItems.forEach((item) => {
    item.addEventListener('click', (evt) => {
      evt.stopImmediatePropagation();
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        choosedCategories.add(item.dataset.category);
        if (item.dataset.multicategory) {
          const innerCategories = item.dataset.multicategory.split('~');
          innerCategories.forEach(el => choosedCategories.add(el));
        }
      } else {
        choosedCategories.delete(item.dataset.category);
        if (item.dataset.multicategory) {
          const innerCategories = item.dataset.multicategory.split('~');
          innerCategories.forEach(el => choosedCategories.delete(el));
        }
      }
      filterMarkers('main', choosedCategories);
      console.log('choosedCategories', choosedCategories);
      
    });
  });

  
  const ajaxMarkers = fetchMarkersData(google);
  
  ajaxMarkers.then(result => {
    putMarkersOnMap(result, map);
    console.log('ajaxMarkers', result);
  })

  function putMarkersOnMap(markers, map) {
    const infowindow = new google.maps.InfoWindow({
      content: '',
      maxWidth: 200,
    });
    const initedMarkers = [];
    markers.forEach((marker) => {
      const category = marker.type;

      // console.log('marker.icon', marker.icon);
      
  
      const mapMarker = new google.maps.Marker({
        map,
        category,
        zIndex: marker.zIndex || 1,
        icon: marker.icon,
        dataId: +marker.id,
        content: marker.content,
        position: new google.maps.LatLng(marker.position.lat, marker.position.lng),
      });
      mapMarker.dataId = +marker.id;
      initedMarkers.push(mapMarker);
  
      google.maps.event.addListener(mapMarker, 'click', function () {
        infowindow.setContent(marker.content);
        infowindow.open(map, mapMarker);
        map.panTo(this.getPosition());
      });
      mapMarker.name = marker.type;
      gmarkers1.push(mapMarker);
    });
    map.initedMarkers = initedMarkers;
    markersHightlight(google, map, infowindow);
  }
  
  
}



function markersHightlight(google, map, infowindow) {
  const $markerLinks = document.querySelectorAll('[data-marker-id]');
  // const infowindow = new google.maps.InfoWindow({
  //   content: '',
  //   maxWidth: 280,
  // });
  querySelectorWithNodeList('[data-marker-id]', (item) => {
    item.addEventListener('click', () => {

      const marker = map.initedMarkers.find(el => {
        return el.dataId === +item.dataset.markerId
      });
      if (marker === undefined) return;
      infowindow.setContent(marker.content);
      infowindow.open(map, marker);
      // console.log(marker);
    })
  })
}


function querySelectorWithNodeList(selector, cb = () => { }) {
  const $list = document.querySelectorAll(selector);
  $list.forEach(el => cb(el));
}


function markersHandler() {
  document.querySelector('.map-wrapper')
    .addEventListener('click', ({ target }) => {
      const map = window.googleMap;
      if (target.closest('[data-marker-id]') === null || !map) return;
      const markerId = target.closest('[data-marker-id]').dataset.markerId;
      const marker = map.initedMarkers.find(marker => marker.dataId == markerId);
      marker && map.setCenter(marker.getPosition());
      console.log(map.initedMarkers.find(marker => marker.dataId == markerId));
      console.log(map);
    })
}

function iniCircleWithTooltip({
  map, 
  radius, 
  tooltipImgUrl,
  circleParams = {},
  tooltipParams = {},
  center

}) {
  // const center = {
  //   lat: 49.237055962508656,
  //   lng: 28.4270179805356,
  // };

  const tooltip1MeterOffset = 0.00001374;

  const circle = new google.maps.Circle({
    strokeColor: "#717386",
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: "#FF0000",
    fillOpacity: 0,
    map: map,
    center,
    ...circleParams,
    radius, // в метрах
  });

  const tooltipOnLeft = new google.maps.Marker({
    position: {
      lat: center.lat,
      lng: center.lng - (tooltip1MeterOffset * radius), // 28.42702 - 0.01374 (≈ 1 км захід)
    },
    map,
    icon: {
      url: tooltipImgUrl,
      scaledSize: new google.maps.Size(56,28),
    },
    ...tooltipParams
  });
  const tooltipOnRight = new google.maps.Marker({
    position: {
      lat: center.lat,
      lng: center.lng + (tooltip1MeterOffset * radius), // 28.42702 + 0.01374 (≈ 1 км схід)
    },
    map,
    icon: {
      url: tooltipImgUrl,
      scaledSize: new google.maps.Size(56,28),
    },
    ...tooltipParams
  });

  return {
    left: tooltipOnLeft,
    right: tooltipOnRight,
    circle,
  }
}