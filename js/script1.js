(function () {
    "use strict";

    // Define the main moodie object
    var moodie = {
        // Initialization function
        init: function () {
            this.cacheDom(); // Caching DOM elements
            this.bindEvents(); // Binding events
            this.initSlider(); // Initialize slider
            this.totopButton(); // Setup 'to top' button
            this.enablePopupGallery(); // Enable popup galleries
            this.initAccordion(); // Initialize accordion functionality
        },

        // Caching DOM elements for later use
        cacheDom: function () {
            this.toTop = $('.totop');
            this._body = $('body');
            this.moodieHomepageSlider = $('.moodie-slider');
            this.moodieInstaCarouselSlider = $('.insta-carousel-slider');
            this.moodieInstaSlider = $('.moodie-insta-slider');
            this.moodieGalleryTabs = $('.moodie-toolbar-item');
            this.moodieGalleryItem = $('.moodie-gallery-item');
        },

        // Binding events to DOM elements
        bindEvents: function () {
            this.moodieGalleryTabs.on('click', () => this.changeActiveTab());
            this.moodieGalleryTabs.on('click', () => this.addGalleryFilter());
            $(window).on('load', () => this.enablePreloader());
        },

        // Popup gallery initialization
        enablePopupGallery: function () {
            $('.moodie-popup-gallery').each(function () {
                $(this).magnificPopup({
                    delegate: 'a',
                    type: 'image',
                    gallery: {
                        enabled: true
                    }
                });
            });
        },

        // Preloader functionality
        enablePreloader: function () {
            var preloader = $('#moodie-page-loading').delay(500);
            if (preloader.length > 0) {
                preloader.fadeOut("slow", function () {
                    preloader.remove();
                });
            }
        },

        // Changing the active tab in the gallery
        changeActiveTab: function () {
            $(this).closest('.moodie-gallery-toolbar').find('.active').removeClass('active');
            $(this).addClass('active');
        },

        // Gallery filter functionality
        addGalleryFilter: function () {
            var value = $(this).attr('data-filter');
            if (value === 'all') {
                moodie.moodieGalleryItem.show('3000');
            } else {
                moodie.moodieGalleryItem.not('.' + value).hide('3000');
                moodie.moodieGalleryItem.filter('.' + value).show('3000');
            }
        },

        // Slider initialization
        initSlider: function () {
            this.moodieHomepageSlider.slick({
                infinite: true,
                dots: true,
                arrows: false,
                autoplay: true,
                speed: 2000,
                slidesToShow: 1,
                slidesToScroll: 1,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        speed: 1000
                    }
                }]
            });
        },

        // 'To top' button functionality
        totopButton: function () {
            $(window).scroll(function () {
                var toTopOffset = this.toTop.offset().top;
                var toTopHidden = 1000;
                if (toTopOffset > toTopHidden) {
                    this.toTop.addClass('totop-vissible');
                } else {
                    this.toTop.removeClass('totop-vissible');
                }
            }.bind(this)); // Binding this to the function

            if (this.toTop && this.toTop.length > 0) {
                this.toTop.on('click', function (e) {
                    e.preventDefault();
                    $('html, body').animate({
                        scrollTop: 0
                    }, 'slow');
                });
            }
        },

        // Initialize Magnific Popup for specific selectors
        initializeMagnificPopup: function (selector) {
            $(selector).magnificPopup({
                type: "image",
                closeOnContentClick: true,
                mainClass: "mfp-fade",
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    preload: [0, 1]
                }
            });
        },

        // Accordion functionality
        initAccordion: function () {
            $(".accordion").on("click", ".title", function () {
                var content = $(this).next('.accordion-info').html();
                $('#fullScreenContainer').html(content + '<button class="close-btn">Close</button>').fadeIn();
                this.initializeMagnificPopup('#fullScreenContainer .img-zoom');
                $(this).parent(".item").toggleClass("active");
                $(".accordion .item").not($(this).parent(".item")).removeClass("active");
            }.bind(this)); // Bind this function to maintain context
            $(document).on('click', '.close-btn', function() {
                $('#fullScreenContainer').fadeOut();
            });
        },
    };

    // Document on load.
    $(function () {
        moodie.init();
    });

    // Initialize Magnific Popup for already available .img-zoom elements
    moodie.initializeMagnificPopup(".img-zoom");

    // Popup Video initialization
    $('.popup-youtube, .popup-vimeo, .popup-gmaps, .popup-custom').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
    });

    // Initialize moodie functionalities
    moodie.init();


// Contact Form
    var form = $('.contact__form'),
        message = $('.contact__msg'),
        form_data;
    // success function
    function done_func(response) {
        message.fadeIn().removeClass('alert-danger').addClass('alert-success');
        message.text(response);
        setTimeout(function () {
            message.fadeOut();
        }, 2000);
        form.find('input:not([type="submit"]), textarea').val('');
    }
    // fail function
    function fail_func(data) {
        message.fadeIn().removeClass('alert-success').addClass('alert-success');
        message.text(data.responseText);
        setTimeout(function () {
            message.fadeOut();
        }, 2000);
    }
    form.submit(function (e) {
        e.preventDefault();
        form_data = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: form_data
        })
        .done(done_func)
        .fail(fail_func);
    });

document.addEventListener('DOMContentLoaded', function () {
    var weddingDate = new Date("2024-09-01T17:00:00"); // Replace with your wedding date and time
    var daysSpan = document.getElementById('days');
    var hoursSpan = document.getElementById('hours');
    var minutesSpan = document.getElementById('minutes');
    var secondsSpan = document.getElementById('seconds');

    function updateTimer() {
        var now = new Date();
        var distance = weddingDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysSpan.innerHTML = days;
        hoursSpan.innerHTML = hours;
        minutesSpan.innerHTML = minutes;
        secondsSpan.innerHTML = seconds;

        if (distance < 0) {
            clearInterval(timer);
            document.getElementById('timer').innerHTML = "The wedding has started!";
        }
    }

    updateTimer();
    var timer = setInterval(updateTimer, 1000);
});

})();