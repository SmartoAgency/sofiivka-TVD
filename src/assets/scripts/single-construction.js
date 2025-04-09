import Swiper, { Navigation } from 'swiper';

new Swiper('[data-single-construction-slider]', {
    modules: [Navigation],
    loop: true,
    slidesPerView: "auto",
    spaceBetween: 30,
    navigation: {
        nextEl: '[data-gallery="next"]',
        prevEl: '[data-gallery="prev"]',
    },
});


function initVideo() {
    if (!document.querySelector('[data-construction-video]')) return;
    const video = document.querySelector('[data-construction-video]');
    const playButton = document.querySelector('[data-construction-video-play]');
    playButton.addEventListener('click', function () {
        video.play();
        video.setAttribute('controls', '');
        // video.removeAttribute('poster');
        this.classList.add('hidden');
    });

    video.addEventListener('pause',function(evt){
        playButton.classList.remove('hidden');
    });
    video.addEventListener('play',function(evt){
        playButton.classList.add('hidden');
    });
    video.addEventListener('ended',function(evt){
        playButton.classList.remove('hidden');
    });
}

initVideo();