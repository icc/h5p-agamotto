(function (Agamotto) {
  'use strict';

  /**
   * Images object
   *
   * @class H5P.Agamotto.Images
   * @param {Object} images - Array containing the images.
   * @param {number} id - ID of this H5P content.
   * @param {string} selector - Class name of parent node.
   */
   Agamotto.Images = function (paths, id, selector) {
     this.paths = paths;
     this.id = id;
     this.selector = selector;

     this.images = [];
     this.imagesLoaded = 0;
     this.ratio = 0;

     this.imageTop = document.createElement('img');
     this.imageTop.className = 'h5p-agamotto-image-top';
     this.imageTop.src = '#';
     this.imageTop.setAttribute('draggable', 'false');
     this.imageTop.setAttribute('tabindex', 0);

     this.imageBottom = document.createElement('img');
     this.imageBottom.className = 'h5p-agamotto-image-bottom';
     this.imageBottom.src = '#';
     this.imageBottom.setAttribute('draggable', 'false');

     this.container = document.createElement('div');
     this.container.className = 'h5p-agamotto-images-container';
     this.container.appendChild(this.imageTop);
     this.container.appendChild(this.imageBottom);
   };

   Agamotto.Images.prototype = {
     getDOM: function getDOM () {
       return this.container;
     },
     setImage: function setImage (index, opacity) {
       this.imageTop.src = this.images[index].src;
       this.imageBottom.src = this.images[Agamotto.constrain(index + 1, 0, this.images.length - 1)].src;
       this.imageTop.style.opacity = opacity;
     },
     resize: function resize () {
       this.container.style.height = this.container.offsetWidth / this.ratio + 'px';
     },
     loadImages: function loadImages() {
       var that = this;

       /*
        * Wait for images to be loaded before triggering some stuff
        * This could be done more nicely with Promises, but IE isn't ready for that ...
        */
       var loadImagesDispatcher = function () {
         that.imagesLoaded++;
         if (that.imagesLoaded === 1) {
           // We can now determine the render height and image aspect ratio
           that.imageTop.src = that.images[0].src;
           that.ratio = that.images[0].naturalWidth / that.images[0].naturalHeight;
           that.container.style.height = that.container.offsetWidth / that.ratio + 'px';
           document.querySelector(that.selector).dispatchEvent(new CustomEvent('loaded first'));
         }
         else if (that.imagesLoaded === 2) {
           // We can now set the bottom image
           that.imageBottom.src = that.images[1].src;
         }
         if (that.imagesLoaded === that.paths.length) {
           // We can now activate the slider
           document.querySelector(that.selector).dispatchEvent(new CustomEvent('loaded all'));
         }
       };

       for (var i = 0; i < this.paths.length; i++) {
         this.images[i] = new Image();
         this.images[i].onload = loadImagesDispatcher;
         this.images[i].src = H5P.getPath(this.paths[i], this.id);
       }
     },
     getRatio: function getRatio() {
       return this.ratio;
     }
   };

   // Polyfill for "the one" browser that has hiccups ...
   (function () {
     if ( typeof window.CustomEvent === 'function' ) return false;

     function CustomEvent (event, params) {
       params = params || {bubbles: false, cancelable: false, detail: undefined};
       var evt = document.createEvent('CustomEvent');
       evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
       return evt;
      }
     CustomEvent.prototype = window.Event.prototype;
     window.CustomEvent = CustomEvent;
   })();

})(H5P.Agamotto);
