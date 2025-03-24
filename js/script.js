(function () {
    "use strict";
    var moodie = {
    init: function () {
            this.cacheDom();
            this.bindEvents();
            this.initSlider();
            this.totopButton();
            this.enablePopupGallery();
        }
    , cacheDom: function () {
            this.toTop = $('.totop');
            this._body = $('body');
            this.moodieHomepageSlider = $('.moodie-slider');
            this.moodieInstaCarouselSlider = $('.insta-carousel-slider');
            this.moodieInstaSlider = $('.moodie-insta-slider');
            this.moodieGalleryTabs = $('.moodie-toolbar-item');
            this.moodieGalleryItem = $('.moodie-gallery-item');
        }
    , bindEvents: function () {
            var self = this;
            this.moodieGalleryTabs.on('click', self.changeActiveTab);
            this.moodieGalleryTabs.on('click', self.addGalleryFilter);
            $(window).on('load', self.enablePreloader);
        }
    , /* popup gallery */
    enablePopupGallery: function () {
            $('.moodie-popup-gallery').each(function () {
                $(this).magnificPopup({
                    delegate: 'a'
                    , type: 'image'
                    , gallery: {
                        enabled: true
                    }
                });
            });
        }
    , /* preloader */
    enablePreloader: function () {
            var preloader = $('#moodie-page-loading').delay(500);
            if (preloader.length > 0) {
                preloader.fadeOut("slow", function () {
                    preloader.remove();
                });
            }
        }
    , /* gallery tab */
    changeActiveTab: function () {
            $(this).closest('.moodie-gallery-toolbar').find('.active').removeClass('active');
            $(this).addClass('active');
        }
    , /* gallery filter */
    addGalleryFilter: function () {
            var value = $(this).attr('data-filter');
            if (value === 'all') {
                moodie.moodieGalleryItem.show('3000');
            }
            else {
                moodie.moodieGalleryItem.not('.' + value).hide('3000');
                moodie.moodieGalleryItem.filter('.' + value).show('3000');
            }
        }
    , /* slider */
    initSlider: function () {
            var self = this;
            /* homepage slider */
            self.moodieHomepageSlider.slick({
                infinite: true
                , dots: true
                , arrows: false
                , autoplay: true
                , speed: 2000
                , slidesToShow: 1
                , slidesToScroll: 1
                , responsive: [
                    {
                        breakpoint: 768
                        , settings: {
                            slidesToShow: 1
                            , slidesToScroll: 1
                            , speed: 1000
                        }
			}
			]
            });
        }
    , /* ======= toTop ======= */
    totopButton: function () {
            var self = this;
            /* Show totop button*/
            $(window).scroll(function () {
                var toTopOffset = self.toTop.offset().top;
                var toTopHidden = 1000;
                if (toTopOffset > toTopHidden) {
                    self.toTop.addClass('totop-vissible');
                }
                else {
                    self.toTop.removeClass('totop-vissible');
                }
            });
            /* totop button animation */
            if (self.toTop && self.toTop.length > 0) {
                self.toTop.on('click', function (e) {
                    e.preventDefault();
                    $('html, body').animate({
                        scrollTop: 0
                    }, 'slow');
                });
            }
        }
    };
    
    // Main footer 
    var footer = $("footer").outerHeight();
    $("main").css("marginBottom", footer);
    

    // Burger Menu 
    var burgerMenu = function () {
        $('.js-cmoodie-nav-toggle').on('click', function (event) {
            event.preventDefault();
            var $this = $(this);
            if ($('body').hasClass('offcanvas')) {
                $this.removeClass('active');
                $('body').removeClass('offcanvas');
            }
            else {
                $this.addClass('active');
                $('body').addClass('offcanvas');
            }
        });
    };
    
    // Click outside of offcanvass
    var mobileMenuOutsideClick = function () {
        $(document).click(function (e) {
            var container = $("#cmoodie-aside, .js-cmoodie-nav-toggle");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                if ($('body').hasClass('offcanvas')) {
                    $('body').removeClass('offcanvas');
                    $('.js-cmoodie-nav-toggle').removeClass('active');
                }
            }
        });
        $(window).scroll(function () {
            if ($('body').hasClass('offcanvas')) {
                $('body').removeClass('offcanvas');
                $('.js-cmoodie-nav-toggle').removeClass('active');
            }
        });
    };
    
    // Sub Menu 
    $('.cmoodie-main-menu li.cmoodie-sub>a').on('click', function () {
        $(this).removeAttr('href');
        var element = $(this).parent('li');
        if (element.hasClass('open')) {
            element.removeClass('open');
            element.find('li').removeClass('open');
            element.find('ul').slideUp();
        }
        else {
            element.addClass('open');
            element.children('ul').slideDown();
            element.siblings('li').children('ul').slideUp();
            element.siblings('li').removeClass('open');
            element.siblings('li').find('li').removeClass('open');
            element.siblings('li').find('ul').slideUp();
        }
    });
    $('.cmoodie-main-menu>ul>li.cmoodie-sub>a').append('<span class="holder"></span>');
    
    // Document on load.
    $(function () {
        burgerMenu();
        mobileMenuOutsideClick();
    });
    
    var wind = $(window);

    
    // Navbar scrolling background 
    wind.on("scroll", function () {
        var bodyScroll = wind.scrollTop()
            , navbar = $(".navbar")
            , logo = $(".navbar:not(.nav-box) .logo> img");
        if (bodyScroll > 100) {
            navbar.addClass("nav-scroll");
            logo.attr('src', 'img/logo.png');
        }
        else {
            navbar.removeClass("nav-scroll");
            logo.attr('src', 'img/logo.png');
        }
    });
    
    // close navbar-collapse when a clicked
    $(".navbar-nav a").on('click', function () {
        $(".navbar-collapse").removeClass("show");
    });
    
    // Sections Background Image
    var pageSection = $(".bg-img, section");
    pageSection.each(function (indx) {
        if ($(this).attr("data-background")) {
            $(this).css("background-image", "url(" + $(this).data("background") + ")");
        }
    });
    // Clients owlCarousel
    $('.clients .owl-carousel').owlCarousel({
        loop: true
        , margin: 30
        , mouseDrag: true
        , autoplay: true
        , dots: false
        , responsiveClass: true
        , responsive: {
            0: {
                margin: 10
                , items: 2
            }
            , 600: {
                items: 3
            }
            , 1000: {
                items: 5
            }
        }
    });
    // Testimonials owlCarousel
    $('.testimonials .owl-carousel').owlCarousel({
        loop: true
        , margin: 30
        , mouseDrag: true
        , autoplay: true
        , autoplayTimeout: 20000
        , dots: true
        , nav: false
        , navText: ["<i class='lnr ti-angle-left'></i>", "<i class='lnr ti-angle-right'></i>"]
        , responsiveClass: true
        , responsive: {
            0: {
                items: 1
            , }
            , 600: {
                items: 1
            }
            , 1000: {
                items: 1
            }
        }
    });
    // Animations
    var contentWayPoint = function () {
        var i = 0;
        $('.animate-box').waypoint(function (direction) {
            if (direction === 'down' && !$(this.element).hasClass('animated')) {
                i++;
                $(this.element).addClass('item-animate');
                setTimeout(function () {
                    $('body .animate-box.item-animate').each(function (k) {
                        var el = $(this);
                        setTimeout(function () {
                            var effect = el.data('animate-effect');
                            if (effect === 'fadeIn') {
                                el.addClass('fadeIn animated');
                            }
                            else if (effect === 'fadeInLeft') {
                                el.addClass('fadeInLeft animated');
                            }
                            else if (effect === 'fadeInRight') {
                                el.addClass('fadeInRight animated');
                            }
                            else {
                                el.addClass('fadeInUp animated');
                            }
                            el.removeClass('item-animate');
                        }, k * 200, 'easeInOutExpo');
                    });
                }, 100);
            }
        }, {
            offset: '85%'
        });
    };
    $(function () {
        contentWayPoint();
    });

  // Image Zoom with Magnific Popup
    $(".img-zoom").magnificPopup({
        type: "image",
        closeOnContentClick: true,
        mainClass: "mfp-fade",
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Preload the next and previous images
        }
    });
    
$(".accordion").on("click", ".title", function () {
    var content = $(this).next(".accordion-info");
    var textBulk = $('.textbulk');

    // Check if there's a URL specified in the data-url attribute
    var urlToOpen = $(this).data('url');

    // If there's a URL, open it in a new tab
    if (urlToOpen) {
        window.open(urlToOpen, '_blank');

        // Close the accordion and remove the blur effect
        content.slideUp();
        $(this).parent(".item").removeClass("active");
        textBulk.removeClass('textbulk-blurred'); 
        return; // Exit the function to prevent further execution
    }

    // Existing accordion toggle logic
    if (content.is(":visible")) {
        content.slideUp();
        $(this).parent(".item").removeClass("active");
        textBulk.removeClass('textbulk-blurred'); // Remove blur when closing
    } else {
        $(".accordion-info").slideUp();
        content.slideDown();
        $(".item").removeClass("active");
        $(this).parent(".item").addClass("active");
        textBulk.addClass('textbulk-blurred'); // Add blur when opening
    }
});
// Popup Video and moodie.init() remain unchanged

    $(document).ready(function() {
        $('.popup-youtube, .popup-vimeo, .popup-gmaps, .popup-custom').magnificPopup({
          disableOn: 700,
          type: 'iframe',
          mainClass: 'mfp-fade',
          removalDelay: 160,
          preloader: false,
          fixedContentPos: false
        });
      });
    moodie.init();
})();


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

$(".accord").on("click", ".title", function () {
    var content = $(this).next(".accord-info");
    var textBulk = $('.textbulk');

    // Check if there's a URL specified in the data-url attribute
    var urlToOpen = $(this).data('url');

    // If there's a URL, open it in a new tab
    if (urlToOpen) {
        window.open(urlToOpen, '_blank');

        // Close the accordion and remove the blur effect
        content.slideUp();
        $(this).parent(".item").removeClass("active");
        return; // Exit the function to prevent further execution
    }

    // Existing accordion toggle logic
    if (content.is(":visible")) {
        content.slideUp();
        $(this).parent(".item").removeClass("active");
    } else {
        $(".accord-info").slideUp();
        content.slideDown();
        $(".item").removeClass("active");
        $(this).parent(".item").addClass("active");
    }
});