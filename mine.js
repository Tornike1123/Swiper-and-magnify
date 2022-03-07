
const mySwiper = new Swiper(".swiper", {
    // If swiper loop is true set photoswipe counterEl: false (line 175 her)
    loop: true,
    /* slidesPerView || auto - if you want to set width by css - 
    in this case width:80% */
    slidesPerView: "auto",
    spaceBetween: 10,
    centeredSlides: true,
    slideToClickedSlide: false,
    autoplay: { /* remove/comment to stop autoplay  */
      delay: 3000,
      disableOnInteraction: false /* true by deafult */
    },
    // If we need pagination
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function(index, className) {
        return '<span class="' + className + '">' + (index + 1) + "</span>";
      }
    },
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    // keyboard control
    keyboard: {
      enabled: true,
    }
  });
  
  // 2 of 4 : PHOTOSWIPE #######################################
  // https://photoswipe.com/documentation/getting-started.html //
  
  var initPhotoSwipeFromDOM = function(gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
      var thumbElements = el.childNodes,
          numNodes = thumbElements.length,
          items = [],
          figureEl,
          linkEl,
          size,
          item;
  
      for (var i = 0; i < numNodes; i++) {
        figureEl = thumbElements[i]; // <figure> element
  
        // include only element nodes
        if (figureEl.nodeType !== 1) {
          continue;
        }
  
        linkEl = figureEl.children[0]; // <a> element
  
        size = linkEl.getAttribute("data-size").split("x");
  
        // create slide object
        item = {
          src: linkEl.getAttribute("href"),
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10)
        };
  
        if (figureEl.children.length > 1) {
          // <figcaption> content
          item.title = figureEl.children[1].innerHTML;
        }
  
        if (linkEl.children.length > 0) {
          // <img> thumbnail element, retrieving thumbnail url
          item.msrc = linkEl.children[0].getAttribute("src");
        }
  
        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
      }
  
      return items;
    };
  
    // find nearest parent element
    var closest = function closest(el, fn) {
      return el && (fn(el) ? el : closest(el.parentNode, fn));
    };
  
    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  
      var eTarget = e.target || e.srcElement;
  
      // find root element of slide
      var clickedListItem = closest(eTarget, function(el) {
        return el.tagName && el.tagName.toUpperCase() === "LI";
      });
  
      if (!clickedListItem) {
        return;
      }
  
      // find index of clicked item by looping through all child nodes
      // alternatively, you may define index via data- attribute
      var clickedGallery = clickedListItem.parentNode,
          childNodes = clickedListItem.parentNode.childNodes,
          numChildNodes = childNodes.length,
          nodeIndex = 0,
          index;
  
      for (var i = 0; i < numChildNodes; i++) {
        if (childNodes[i].nodeType !== 1) {
          continue;
        }
  
        if (childNodes[i] === clickedListItem) {
          index = nodeIndex;
          break;
        }
        nodeIndex++;
      }
  
      if (index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe(index, clickedGallery);
      }
      return false;
    };
  
    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
      var hash = window.location.hash.substring(1),
          params = {};
  
      if (hash.length < 5) {
        return params;
      }
  
      var vars = hash.split("&");
      for (var i = 0; i < vars.length; i++) {
        if (!vars[i]) {
          continue;
        }
        var pair = vars[i].split("=");
        if (pair.length < 2) {
          continue;
        }
        params[pair[0]] = pair[1];
      }
  
      if (params.gid) {
        params.gid = parseInt(params.gid, 10);
      }
  
      return params;
    };
  
    var openPhotoSwipe = function(
    index,
     galleryElement,
     disableAnimation,
     fromURL
    ) {
      var pswpElement = document.querySelectorAll(".pswp")[0],
          gallery,
          options,
          items;
  
      items = parseThumbnailElements(galleryElement);
  
      // #################### 3/4 define photoswipe options (if needed) #################### 
      // https://photoswipe.com/documentation/options.html //
      options = {
        /* "showHideOpacity" uncomment this If dimensions of your small thumbnail don't match dimensions of large image */
        //showHideOpacity:true,
  
        // Buttons/elements
        closeEl: true,
        captionEl: true,
        fullscreenEl: true,
        zoomEl: true,
        shareEl: false,
        counterEl: false,
        arrowEl: true,
        preloaderEl: true,
        // define gallery index (for URL)
        galleryUID: galleryElement.getAttribute("data-pswp-uid"),
        getThumbBoundsFn: function(index) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          var thumbnail = items[index].el.getElementsByTagName("img")[0], // find thumbnail
              pageYScroll =
              window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect();
  
          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        }
      };
  
      // PhotoSwipe opened from URL
      if (fromURL) {
        if (options.galleryPIDs) {
          // parse real index when custom PIDs are used
          // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
          for (var j = 0; j < items.length; j++) {
            if (items[j].pid == index) {
              options.index = j;
              break;
            }
          }
        } else {
          // in URL indexes start from 1
          options.index = parseInt(index, 10) - 1;
        }
      } else {
        options.index = parseInt(index, 10);
      }
  
      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }
  
      if (disableAnimation) {
        options.showAnimationDuration = 0;
      }
  
      // Pass data to PhotoSwipe and initialize it
      gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
      gallery.init();
  
      /* ########### PART 4 - EXTRA CODE  ########### */
      /* EXTRA CODE (NOT FROM photoswipe CORE) - 
      1/2. UPDATE SWIPER POSITION TO THE "CURRENT" ZOOM_IN IMAGE (BETTER UI) */
      // photoswipe event: Gallery unbinds events
      // (triggers before closing animation)
      gallery.listen("unbindEvents", function() {
        // The index of the current photoswipe slide
        let getCurrentIndex = gallery.getCurrentIndex();
        // Update position of the slider
        mySwiper.slideTo(getCurrentIndex, 0, false);
        // 2/2. Start swiper autoplay (on close - if swiper autoplay is true)
        mySwiper.autoplay.start();
      });
      // 2/2. Extra Code (Not from photoswipe) - swiper autoplay stop when image in zoom mode (When lightbox is open) */
      gallery.listen('initialZoomIn', function() {
        if(mySwiper.autoplay.running){
          mySwiper.autoplay.stop();
        }
      });
    };
  
    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll(gallerySelector);
  
    for (var i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute("data-pswp-uid", i + 1);
      galleryElements[i].onclick = onThumbnailsClick;
    }
  
    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid) {
      openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
    }
  };
  
  // execute above function
  initPhotoSwipeFromDOM(".my-gallery");
  


  /////////////////////////////////////
  ////////////////////////////////////
  //magnify


  function magnify(imgID, zoom) {
    var img, glass, w, h, bw;
    img = document.getElementById(imgID);
    /*create magnifier glass:*/
    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");
    /*insert magnifier glass:*/
    img.parentElement.insertBefore(glass, img);
    /*set background properties for the magnifier glass:*/
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;
    /*execute a function when someone moves the magnifier glass over the image:*/
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);
    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e) {
      var pos, x, y;
      /*prevent any other actions that may occur when moving over the image*/
      e.preventDefault();
      /*get the cursor's x and y positions:*/
      pos = getCursorPos(e);
      x = pos.x;
      y = pos.y;
      /*prevent the magnifier glass from being positioned outside the image:*/
      if (x > img.width - (w / zoom)) {x = img.width - (w / zoom);}
      if (x < w / zoom) {x = w / zoom;}
      if (y > img.height - (h / zoom)) {y = img.height - (h / zoom);}
      if (y < h / zoom) {y = h / zoom;}
      /*set the position of the magnifier glass:*/
      glass.style.left = (x - w) + "px";
      glass.style.top = (y - h) + "px";
      /*display what the magnifier glass "sees":*/
      glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }
    function getCursorPos(e) {
      var a, x = 0, y = 0;
      e = e || window.event;
      /*get the x and y positions of the image:*/
      a = img.getBoundingClientRect();
      /*calculate the cursor's x and y coordinates, relative to the image:*/
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /*consider any page scrolling:*/
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      return {x : x, y : y};
    }
  }




  magnify("myimage", 3);





  ///////////////////////
  /////////////////////////////
  //range slider
  $(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 1,
      max: 14,
      values: [ 1, 14 ],
      slide: function( event, ui ) {
      $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
      " - $" + $( "#slider-range" ).slider( "values", 1 ) );
  });










