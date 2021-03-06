Drupal.locale = { 'pluralFormula': function ($n) { return Number(($n!=1)); }, 'strings': {"":{"Log in":"\ub85c\uadf8\uc778","Close":"\ub2eb\uae30","@count days":"@count \uc77c","@count hours":"@count \uc2dc\uac04","1 day":"1\uc77c","expand to see more tags...":"\ud0dc\uadf8 \ub354 \ubcf4\uae30","Get started":"\uc2dc\uc791\ud558\uae30"}} };
;/*})'"*/
;/*})'"*/
(function($, Drupal) {
  "use strict";

  // Overrides for pfe-nav / pfe-icon which adds a custom
  // contact icon.
  customElements.whenDefined('pfe-icon').then(function() {
    // PfeIcon is provided by webrh.webcomponents.min.js and isn't available
    // until after `pfe-icon` is defined.
    PfeIcon.addIconSet(
      "local",
      "/profiles/rh/themes/redhatdotcom/img/",
      function(name, iconSetName, iconSetPath) {
        var regex = new RegExp("^" + iconSetName + "-(.*)");
        var match = regex.exec(name);
        return iconSetPath + match[1] + ".svg";
      }
    );
  });

  Drupal.behaviors.redhat_www_menu = {
    attach: function(context, settings) {

      function getCookie(name) {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
          var cookieKeyValue = cookies[i].split('=');

          if (name === cookieKeyValue[0].trim()) {
            return decodeURIComponent(cookieKeyValue[1]);
          }
        }
        return null;
      }

      function setCookie(name, value, options) {
        if (typeof document === 'undefined') {
          return;
        }

        if (typeof options.expires === 'number') {
          options.expires = new Date(new Date() * 1 + options.expires * 864e+5);
        }

        // Using "expires" because "max-age" is not supported by IE
        options.expires = options.expires ? options.expires.toUTCString() : '';

        var optionsString = '';

        for (var optionKey in options) {
          if(options.hasOwnProperty(optionKey)) {
            if (!options[optionKey]) {
              continue;
            }
            optionsString += '; ' + optionKey;

            if (options[optionKey] === true) {
              continue;
            }

            optionsString += '=' + options[optionKey];
          }
        }

        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + optionsString;
      }

      function languageCookieHandler() {
        var languageCode = Drupal.settings.pathPrefix.replace(/\//, "").trim();

        if (languageCode.length === 0) {
          languageCode = 'en';
        }

        var options = {
          domain: '.redhat.com',
          path: '/',
          hostOnly: false,
          httpOnly: false,
          secure: false
        };

        var cookieName = 'rh_locale';
        var cookieValue = getCookie('rh_locale');

        // If there is not a value for the cookie.
        if (cookieValue === null || cookieValue !== languageCode) {
          cookieValue = encodeURIComponent(languageCode);
          setCookie(cookieName, cookieValue, options);
        }
      }

      //Ensure that this behaviour is only attached once to the window.
      $(document.body, context).once('redhat_www_menu', function() {
        var $subnav = $('pfe-navigation-main pfe-navigation-item div[slot="tray"]', context),
          $window = $(window),
          urlBase = window.location.protocol + '//' + window.location.hostname + Drupal.settings.basePath + Drupal.settings.pathPrefix;

        // Handle the language cookie
        languageCookieHandler();

        var ranAjaxForMainMenu = false;
        var ranAjaxForLanguage = false;
        // Handle click event for main menu.
        document.addEventListener('pfe-navigation-item:open', function(event) {
          if (!event.target.slot) {
            // If subnav container is empty, make ajax call
            // It's possible for `$subnav.children().length` to contain a single
            // nav item already. If so, we _still_ need to grab the rest of the menu items via ajax.
            if ($subnav.children().length <= 1 && !ranAjaxForMainMenu) {
              $.ajax({
                url: urlBase + 'redhat_www_menu/ajax/menus-nav2',
                method: 'GET',
                dataType: 'html',
                success: function (data) {
                  if (!data || typeof data === 'undefined') {
                    return;
                  }
                  // Convert AJAX response to HTML element.
                  var $data = $('<div>' + data + '</div>');
                  // Insert each subnav into the appropriate tray.
                  $subnav.each( function ( index ) {
                    var $this = $(this),
                        column = $this.data('column'),
                        $content = $('div.pfe-navigation-item__tray--container[data-column="' + column + '"]', $data);
                    if ($content.length > 0) {
                      // Remove column IDs from markup.
                      $content.removeAttr('data-column');
                      $this.removeAttr('data-column').append($content);
                    }
                  });
                }
              });
              ranAjaxForMainMenu = true;
            }
          }
        });

        // Ensure modal opens when language trigger is clicked on
        $('#pfe-modal--trigger').click(function(event) {
          event.stopPropagation();
          // TODO - hidden attribute will be removed automatically once PFE PR #924 is merged
          $('#language-picker').removeAttr('hidden').get( 0 ).open();
        }).keyup(function(event) {
            let key = event.key || event.keyCode;
            switch (key) {
              case 'Enter':
              case 13:
              case ' ':
              case 32:
                event.stopPropagation();
                $('#language-picker').removeAttr('hidden').get( 0 ).open();
            }
      });

         // -- Set up the utilities
         var helper = {
             //--- Global utility variables
             lg: function () {
                 return $window.width() >= 1200;
             },
             md: function () {
                 return $window.width() >= 992 && $window.width() < 1200;
             },
             sm: function () {
                 return $window.width() >= 768 && $window.width() < 992;
             },
             xs: function () {
                 return $window.width() >= 480 && $window.width() < 768;
             },
             xxs: function () {
                 return $window.width() < 480;
             },
             getHeight: function () {
                 return $window.height();
             },
             getWidth: function () {
                 return $window.width();
             },
             getElHeight: function( element ) {
                 var height = 0;
                 if ( $(element).length > 0 ) {
                      height = $(element).outerHeight();
                 }
                 return height;
             },
             breakpoints: [ "xxs", "xs", "sm", "md", "lg" ],
             isAtBreakpoint: function ( bpString ) {
                 // This function tests to see the current breakpoint exists in the allowed bp strings provided as input
                 var atBreakpoint = true;
                 // If the breakpoint string exists and is not empty
                 if ( bpString ) {
                     // Test that our current breakpoint is in this list of support breakpoints
                     var bps = bpString.split( " " );
                     atBreakpoint = false;
                     // If the first array value is not empty
                     $.each( bps, function ( idx, bp ) {
                         // Check that the bp value is one of the supported breakpoints
                         if ( $.inArray( bp, helper.breakpoints ) >= 0 && helper[ bp ]()) {
                             atBreakpoint = true;
                         }
                     } );
                 }
                 return atBreakpoint;
             },
             url: {
                 root: window.location.hostname,
                 path: window.location.pathname.split( "/" )
             }
         };

         // -- Set up the toggle functionality
         var toggle = {
           attr: {
               toggleID: "data-rc-toggle-id",
               toggleTarget: "data-rc-toggle-target",
               state: "data-rc-state",
               expanded: "aria-expanded"
           },
           get: {
               target: function ( $trigger ) {
                   var $target,
                       bps,
                       toggleID = $trigger.attr( toggle.attr.toggleID );
                   // If the elements are connected using a shared ID, use that first
                   if ( typeof toggleID !== "undefined" && toggleID !== "" ) {
                       $target = $( "#" + toggleID, context );
                       if ( $target.length < 1 ) {
                           $target = undefined;
                       }
                   }
                   // Else, look for a sibling element that has the toggle-target attribute
                   if ( typeof $target === "undefined" ) {
                       $target = $trigger.siblings( "[" + toggle.attr.toggleTarget + "]" );
                       if ( $target.length < 1 ) {
                           $target = undefined;
                       }
                   }
                   // Else, look for a child element that has the toggle-target attribute
                   if ( typeof $target === "undefined" ) {
                       $target = $trigger.children( "[" + toggle.attr.toggleTarget + "]" );
                       if ( $target.length < 1 ) {
                           $target = undefined;
                       }
                   }
                   if ( typeof $target !== "undefined" ) {
                       bps = $target.attr( toggle.attr.toggleTarget );
                   }
                   return {
                       trigger: $trigger,
                       target: $target,
                       breakpoints: bps
                   };
               },
               state: function ( $el ) {
                   var state = $el.attr( toggle.attr.state );
                   if ( typeof state === "undefined" ) {
                       state = $el.attr( "aria-expanded" ) ? "open" : "closed";
                   }
                   return state;
               }
           },
           state: {
               set: function ( $els, state ) {
                   $.each( $els, function ( idx, $el ) {
                       if ( state === "open" ) {
                           $el.attr( toggle.attr.state, "open" ).attr( "aria-expanded", true );
                       } else {
                           $el.attr( toggle.attr.state, "closed" ).attr( "aria-expanded", false );
                       }
                   } );
               },
               check: function ( $el ) {
                   var status = $el.attr( toggle.attr.state );
                   if ( status === "" ) {
                       status = $el.attr( toggle.attr.expanded ) ? "open" : "closed";
                   }
                   return status;
               }
           },
           event: {
               reveal: function ( props ) {
                   toggle.state.set( [ props.target, props.trigger ], "open" );
               },
               hide: function ( props ) {
                   toggle.state.set( [ props.target, props.trigger ], "closed" );
               },
               change: function ( props, change ) {
                   var state = toggle.get.state( props.target );
                   // If we are approved to toggle
                   if ( helper.isAtBreakpoint( props.breakpoints ) ) {
                       if ( state === "closed" ) {
                           // If the state is closed, reveal
                           change ? this.reveal( props ) : this.hide( props );
                       } else if ( state === "open" ) {
                           // If the state is open, hide
                           change ? this.hide( props ) : this.reveal( props );
                       } else {
                           // If state is an empty string or undefined, always opt to reveal content
                           this.reveal( props );
                       }
                   } else {
                       // Make sure it's visible if not at a supported breakpoints
                       this.reveal( props );
                   }
               }
           }
         };

         // On load, trigger the closing of any open accordions that have a state of closed set and attach click event
         $( "[" + toggle.attr.state + "]", context ).each( function ( idx, val ) {
             var props = toggle.get.target( $( val ) );
             // If the target element exists
             if ( typeof props.target !== "undefined" ) {
                 // Activate reset
                 toggle.event.change( props, false );

                 // On click change current state and data attribute
                 props.trigger.click( function () {
                     toggle.event.change( props, true );
                 } );
                 // On keyboard event change current state and data attribute.
                 // This event is triggered by two keys, Enter (13) and spacebar (32).
                 props.trigger.keydown( function (event) {
                      if (event.which === 13 || event.which === 32) {
                          toggle.event.change( props, true );
                      }
                 } );
             }
         } );

         // Create debounce function to only trigger calls one time after it finishes resizing,
         // instead of hundreds of times while it is updated
         var resizeTimer;
         $window.on( "resize", function () {
             resizeTimer && clearTimeout( resizeTimer );
             resizeTimer = setTimeout( function () {
                 // Reset any element that have been triggered before resizing and need to be reset.
                 $( "[" + toggle.attr.state + "]", context ).each( function ( idx, val ) {
                     var props = toggle.get.target( $( val ) );
                     if ( typeof props.target !== "undefined" ) {
                         helper.isAtBreakpoint( props.breakpoints ) ? toggle.event.change( props, false ) : toggle.event.reveal( props );
                     }
                 } );
             }, 250 );
         } );
      });
    }
  };
})(jQuery, Drupal);

;/*})'"*/
;/*})'"*/
!function(){function e(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function t(t){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?e(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):e(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function a(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}!function(e,a){"use strict";e.appEventData=e.appEventData||[],e.digitalData=e.digitalData||[];var r=e.location.pathname.split("/"),n={event:"Page Load Started",page:t(t(t(t({contentType:digitalData.page.category.contentType,pageTitle:digitalData.page.pageInfo.title,siteLanguage:digitalData.page.pageInfo.language},digitalData.page.pageInfo),digitalData.page.attributes),{},{gated:digitalData.page.attributes.gated||!1},digitalData.page.category),{},{pageCategory:r[2]||"",subsection:r[3]||"",subsection2:r[4]||"",subsection3:r[5]||"",pageSubType:e.Drupal.settings.rh_analytics_subtype||""})};if(a.referrer){var i=a.createElement("a");i.href=a.referrer,n.page.previousPage=i.href}n.page.siteExperience=e.innerWidth<=768?"tablet":"desktop",appEventData.push(n)}(window,document)}();
;/*})'"*/
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_share/js/rh_share.js. */
(function($){Drupal.behaviors.rh_sharePopup={attach:function(context,settings){if(typeof settings.redhat_www_share!=='undefined')$.each(settings.redhat_www_share,function(key,popup){$(context).on('click','a.redhat_www_share-'+key,function(e){$this=$(this);var options='';options+="width="+popup.window.width;options+=",height="+popup.window.height;options+=",menubar=no,resizeable=no,scrollbars=no,titlebar=no,toolbar=no,status=no,location=no";window.open($this.attr('href'),"redhat_www_share-"+key,options);e.preventDefault()})})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_share/js/rh_share.js. */
;/*})'"*/
/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});
;/*})'"*/
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_solr/js/rh_solr.js. */
(function($){'use strict';Drupal.behaviors.rh_solr={attach:function(context,settings){$('a.resource-link, p.rh-article-teaser-link-view a',context).each(function(){$(this).text(this.origin+this.pathname)})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_solr/js/rh_solr.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_solr/js/redhat_www_solr_suggestions.js. */
(function($,Drupal){"use strict";Drupal.behaviors.redhat_www_solr_suggestions={attach:function(context,settings){$('body').once('redhat_www_solr_suggestions',function(){suggestionsInit('#redhat-www-solr-search-box','.form-wrapper','keys')});$('form[slot="mobile-search"] input[name="keys"]').one('keypress',function(){suggestionsInit('form[slot="mobile-search"]','.form-wrapper','keys')});$('#block-redhat-www-search-results-listing > form').once('redhat_www_solr_suggestions_internal',function(){suggestionsInit('#block-redhat-www-search-results-listing > form','.rh-search--component','search')})
function suggestionsInit(formSelector,wrapperSelector,inputName){var $form=$(formSelector),$wrapper=$form.find(wrapperSelector).first(),$input=$form.find('input[name="'+inputName+'"]'),$container=$wrapper.find('.search-autocomplete__container'),$overlay=$form.find('.search-autocomplete__overlay'),xhr;if(!$overlay.length)$overlay=$('<div>').addClass('search-autocomplete__overlay').appendTo($form.parent());if(!$container.length)$container=$('<div>').addClass('search-autocomplete__container').appendTo($wrapper);$input.on('keyup',function(e){var keys=$(this).val().trim(),lang=Drupal.settings.basePath+Drupal.settings.pathPrefix,url=lang+'search/autocomplete/'+encodeURIComponent(keys);if(keys&&keys.length>=3&&keys!==$container.data('keys')){$container.data('keys',keys);if(xhr&&xhr.abort)xhr.abort();xhr=$.getJSON(url);xhr.then(function(data){var items=[];if(data&&data.results&&data.results.length){showSuggestions();for(var i=0;i<data.results.length;i++){var row=data.results[i],$div=$('<div>').addClass('search-autocomplete__item'),href=lang+'search/'+encodeURIComponent(row);$('<a>').attr('href',href).text(row).appendTo($div);items.push($div)};$container.empty().append(items)}else $container.data('keys',false)})}}).on('focus',function(e){if($container.data('keys')===$(this).val().trim())showSuggestions()}).on('blur',function(e){if(!$container.hasClass('search-autocomplete-container--active'))hideSuggestions()});$overlay.on('click',function(e){hideSuggestions()});$container.on('mouseenter',function(e){$(this).addClass('search-autocomplete-container--active')}).on('mouseleave',function(e){$(this).removeClass('search-autocomplete-container--active');if(!$input.is(':focus'))hideSuggestions()})
function hideSuggestions(){$overlay.fadeOut();$container.slideUp()}
function showSuggestions(){var $panel=$container.closest('#search-panel'),height=$panel.height(),timeout=$panel.length&&height===0?600:0;setTimeout(function(){if(height||height===0)$panel.data('height',height).height('auto');$container.slideDown();$overlay.fadeIn()},timeout)}}}}}(jQuery,Drupal));;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/modules/redhat_www_solr/js/redhat_www_solr_suggestions.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.pushmenu.js. */
(function($){$.fn.pushmenu=function(options){options=$.extend({open_easing:'easeOutCirc',open_height:250,open_speed:500,close_speed:500,close_easing:'easeOutCirc',slide_speed:300,slide_easing:'swing'},options);return this.each(function(){var $this=$(this),o=$.metadata?$.extend({},options,$this.metadata()):options,wraph=$(this).height();$this.find('.nav-links').each(function(i){var $thiseach=$(this),$subi=$this.find('.main-subnav').find(".container").find('.sub-menu:nth-child('+(i+1)+')').has('.sub-container');$thiseach.bind('click',function(){var $current=(i+1);if($this.find('#main-nav ul').has('li:nth-child('+$current+').main-active').length){$subi.animate({left:'-1000px'},{duration:o.slide_speed,easing:o.slide_easing});$this.stop(true,false).animate({height:wraph+'px'},{duration:o.close_speed,easing:o.close_easing});$subi.removeClass('group');$('body').removeClass('nav-open');$thiseach.removeClass('main-active');return false}else{$('body').addClass('nav-open');var subheight=$subi.outerHeight(true);if($subi.length){$this.animate({height:(subheight+50)+'px'},{duration:o.open_speed,easing:o.open_easing});$this.find('.main-subnav').find(".container").find('.sub-menu').not('.sub-menu:nth-child('+(i+1)+')').stop(true,false).animate({left:'-1000px'},{duration:o.slide_speed,easing:o.slide_easing,complete:function(){$this.find('.main-subnav').find('.container').find('.sub-menu').removeClass('group');$this.find('.nav-links').removeClass('main-active');$subi.addClass('group');$thiseach.addClass('main-active');if($subi.position().left<0)$subi.stop(true,false).animate({left:'0px'},{duration:o.slide_speed,easing:o.slide_easing});$(window).bind('scroll',function(){$('body').removeClass('nav-open');$this.removeClass('group');$this.stop(true,false).animate({height:wraph+'px'},{duration:10,easing:o.close_easing});$subi.animate({left:'-1000px'},{duration:o.slide_speed,easing:o.slide_easing});$this.find('.nav-links').removeClass('main-active')})},queue:false})}else $this.stop(true,false).animate({height:wraph+'px'},{duration:o.close_speed,easing:o.close_easing});return false}})});var $thissub=$this.find('.main-subnav').find('.container').find('.sub-menu')})}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.pushmenu.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery-scrolltofixed.js. */
(function($){$.isScrollToFixed=function(el){return!!$(el).data('ScrollToFixed')};$.ScrollToFixed=function(el,options){var base=this;base.$el=$(el);base.el=el;base.$el.data('ScrollToFixed',base);var isReset=false,target=base.$el,position,originalPosition,originalOffset,offsetTop=0,offsetLeft=0,originalOffsetLeft=-1,lastOffsetLeft=-1,spacer=null,spacerClass,className
function resetScroll(){target.trigger('preUnfixed.ScrollToFixed');setUnfixed();target.trigger('unfixed.ScrollToFixed');lastOffsetLeft=-1;offsetTop=target.offset().top;offsetLeft=target.offset().left;if(base.options.offsets)offsetLeft+=(target.offset().left-target.position().left);if(originalOffsetLeft==-1)originalOffsetLeft=offsetLeft;position=target.css('position');isReset=true;if(base.options.bottom!=-1){target.trigger('preFixed.ScrollToFixed');setFixed();target.trigger('fixed.ScrollToFixed')}}
function getLimit(){var limit=base.options.limit;if(!limit)return 0;if(typeof limit==='function')return limit.apply(target);return limit}
function isFixed(){return position==='fixed'}
function isAbsolute(){return position==='absolute'}
function isUnfixed(){return!(isFixed()||isAbsolute())}
function setFixed(){if(!isFixed()){spacer.css({display:target.css('display'),width:target.outerWidth(true),height:target.outerHeight(true),'float':target.css('float')});cssOptions={position:'fixed',top:base.options.bottom==-1?getMarginTop():'',bottom:base.options.bottom==-1?'':base.options.bottom,'margin-left':'0px'};if(!base.options.dontSetWidth)cssOptions.width=target.width();target.css(cssOptions);target.addClass('scroll-to-fixed-fixed');if(base.options.className)target.addClass(base.options.className);position='fixed'}}
function setAbsolute(){var top=getLimit(),left=offsetLeft;if(base.options.removeOffsets){left=0;top=top-offsetTop};cssOptions={position:'absolute',top:top,left:left,'margin-left':'0px',bottom:''};if(!base.options.dontSetWidth)cssOptions.width=target.width();target.css(cssOptions);position='absolute'}
function setUnfixed(){if(!isUnfixed()){lastOffsetLeft=-1;spacer.css('display','none');target.css({width:'',position:originalPosition,left:'',top:originalOffset.top,'margin-left':''});target.removeClass('scroll-to-fixed-fixed');if(base.options.className)target.removeClass(base.options.className);position=null}}
function setLeft(x){if(x!=lastOffsetLeft){target.css('left',offsetLeft-x);lastOffsetLeft=x}}
function getMarginTop(){var marginTop=base.options.marginTop;if(!marginTop)return 0;if(typeof marginTop==='function')return marginTop.apply(target);return marginTop}
function checkScroll(){if(!$.isScrollToFixed(target))return;var wasReset=isReset;if(!isReset)resetScroll();var x=$(window).scrollLeft(),y=$(window).scrollTop(),limit=getLimit();if(base.options.minWidth&&$(window).width()<base.options.minWidth){if(!isUnfixed()||!wasReset){postPosition();target.trigger('preUnfixed.ScrollToFixed');setUnfixed();target.trigger('unfixed.ScrollToFixed')}}else if(base.options.bottom==-1){if(limit>0&&y>=limit-getMarginTop()){if(!isAbsolute()||!wasReset){postPosition();target.trigger('preAbsolute.ScrollToFixed');setAbsolute();target.trigger('unfixed.ScrollToFixed')}}else if(y>=offsetTop-getMarginTop()){if(!isFixed()||!wasReset){postPosition();target.trigger('preFixed.ScrollToFixed');setFixed();lastOffsetLeft=-1;target.trigger('fixed.ScrollToFixed')};setLeft(x)}else if(!isUnfixed()||!wasReset){postPosition();target.trigger('preUnfixed.ScrollToFixed');setUnfixed();target.trigger('unfixed.ScrollToFixed')}}else if(limit>0){if(y+$(window).height()-target.outerHeight(true)>=limit-(getMarginTop()||-getBottom())){if(isFixed()){postPosition();target.trigger('preUnfixed.ScrollToFixed');if(originalPosition==='absolute'){setAbsolute()}else setUnfixed();target.trigger('unfixed.ScrollToFixed')}}else{if(!isFixed()){postPosition();target.trigger('preFixed.ScrollToFixed');setFixed()};setLeft(x);target.trigger('fixed.ScrollToFixed')}}else setLeft(x)}
function getBottom(){if(!base.options.bottom)return 0;return base.options.bottom}
function postPosition(){var position=target.css('position');if(position=='absolute'){target.trigger('postAbsolute.ScrollToFixed')}else if(position=='fixed'){target.trigger('postFixed.ScrollToFixed')}else target.trigger('postUnfixed.ScrollToFixed')};var windowResize=function(event){if(target.is(':visible')){isReset=false;checkScroll()}},windowScroll=function(event){checkScroll()},isPositionFixedSupported=function(){var container=document.body;if(document.createElement&&container&&container.appendChild&&container.removeChild){var el=document.createElement('div');if(!el.getBoundingClientRect)return null;el.innerHTML='x';el.style.cssText='position:fixed;top:100px;';container.appendChild(el);var originalHeight=container.style.height,originalScrollTop=container.scrollTop;container.style.height='3000px';container.scrollTop=500;var elementTop=el.getBoundingClientRect().top;container.style.height=originalHeight;var isSupported=(elementTop===100);container.removeChild(el);container.scrollTop=originalScrollTop;return isSupported};return null},preventDefault=function(e){e=e||window.event;if(e.preventDefault)e.preventDefault();e.returnValue=false};base.init=function(){base.options=$.extend({},$.ScrollToFixed.defaultOptions,options);base.$el.css('z-index',base.options.zIndex);spacer=$('<div />');position=target.css('position');originalPosition=target.css('position');originalOffset=$.extend({},target.offset());if(isUnfixed())base.$el.after(spacer);$(window).bind('resize.ScrollToFixed',windowResize);$(window).bind('scroll.ScrollToFixed',windowScroll);if(base.options.preFixed)target.bind('preFixed.ScrollToFixed',base.options.preFixed);if(base.options.postFixed)target.bind('postFixed.ScrollToFixed',base.options.postFixed);if(base.options.preUnfixed)target.bind('preUnfixed.ScrollToFixed',base.options.preUnfixed);if(base.options.postUnfixed)target.bind('postUnfixed.ScrollToFixed',base.options.postUnfixed);if(base.options.preAbsolute)target.bind('preAbsolute.ScrollToFixed',base.options.preAbsolute);if(base.options.postAbsolute)target.bind('postAbsolute.ScrollToFixed',base.options.postAbsolute);if(base.options.fixed)target.bind('fixed.ScrollToFixed',base.options.fixed);if(base.options.unfixed)target.bind('unfixed.ScrollToFixed',base.options.unfixed);if(base.options.spacerClass)spacer.addClass(base.options.spacerClass);target.bind('resize.ScrollToFixed',function(){spacer.height(target.height())});target.bind('scroll.ScrollToFixed',function(){target.trigger('preUnfixed.ScrollToFixed');setUnfixed();target.trigger('unfixed.ScrollToFixed');checkScroll()});target.bind('detach.ScrollToFixed',function(ev){preventDefault(ev);target.trigger('preUnfixed.ScrollToFixed');setUnfixed();target.trigger('unfixed.ScrollToFixed');$(window).unbind('resize.ScrollToFixed',windowResize);$(window).unbind('scroll.ScrollToFixed',windowScroll);target.unbind('.ScrollToFixed');base.$el.removeData('ScrollToFixed')});windowResize()};base.init()};$.ScrollToFixed.defaultOptions={marginTop:1,limit:0,bottom:-1,zIndex:1e3};$.fn.scrollToFixed=function(options){return this.each(function(){(new $.ScrollToFixed(this,options))})}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery-scrolltofixed.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/rh-chrome.js. */
(function($){function rh_on_load(context){$('html').removeClass('no-js');var buttonSlideTo=$('body').position().top;$('.btn_slideto',context).on({click:function(){$('html,body').animate({scrollTop:buttonSlideTo+'px'},1200,'easeInOutExpo',function(){});return false}});var $utilityLinks=$('#utility-nav a',context),$utilityPanels=$('.utility-panel',context),resetUtility=function(){$utilityLinks.removeClass('open');$utilityPanels.css('height',"");$utilityPanels.removeClass('open');$(window).off("resize.PanelResize")};if(context==document){var account_cooke=$.cookie('rh_user');if(account_cooke){account_cooke=account_cooke.split('|');$('.rh-user-loggedout',context).remove();$('.rh-name',context).text(account_cooke[1])}else $('.rh-user-loggedin',context).remove();var utilityPanelResize=function($panel){$panel.css('height',$panel.find('.utility-content').outerHeight())},openTargetUtilityNavLink=function($target){$target.addClass('open');resetNavigation()},openTargetUtilityPanel=function($panel){if($panel.is('#search-panel'))$panel.find('.form-text').focus();$panel.addClass('open');utilityPanelResize($panel);$(window).on("resize.PanelResize",function(){utilityPanelResize($panel)})};$utilityLinks.on('click',function(){var $this=$(this),$index=$this.parent().index(),$utilityPanel=$utilityPanels.eq($index);if($this.hasClass('open')){resetUtility()}else{resetUtility();openTargetUtilityPanel($utilityPanel);openTargetUtilityNavLink($this)}})};if($(window).height()>=600)$('#main-nav-wrap',context).scrollToFixed({fixed:function(){resetUtility();$('#to-top').fadeIn(function(){$(this).show});$('body').addClass('scroll-to-fixed-menu')},postFixed:function(){$('#to-top').fadeOut(function(){$(this).hide;$('body').removeClass('scroll-to-fixed-menu')})},minWidth:768});var enableGridView=function(){$container=$('.rset1.list-view');$eqHeightContainer=$container.find('section');$container.removeClass('list-view');$container.addClass('grid-view');$eqHeightContainer.addClass('equal-height');equalheight('.equal-height > *')},enableListView=function(){$container=$('.rset1.grid-view');$eqHeightContainer=$container.find('section');$container.removeClass('grid-view');$eqHeightContainer.removeClass('equal-height').children('article').css('height','auto');$container.addClass('list-view')};$('#grid-view',context).on('click',function(e){e.preventDefault();enableGridView()});$('#list-view',context).on('click',function(e){e.preventDefault();enableListView()});$('.view-filter-container div.taxonomy-group li a',context).on('click',function(){var href=$(this).attr('href');if(href){var format=($('.rset1.list-view').length>0)?'list':'grid';if(href.indexOf('rset1_format')!=-1){href=href.replace(/rset1_format=\w+/,'rset1_format='+format)}else href+=(href.match(/\?/)?'&':'?')+'rset1_format='+format;$(this).attr('href',href).toggleClass('facetapi-active')}});$('#view-filter-container',context).detach().appendTo('body');var pathName=window.location.pathname,close_text=Drupal.t('Close'),filters_text=$('#view-filter-toggle').text();$('body',context).on('click',function(e){if($('body').hasClass('view-filter-toggle-open'))if(e.target.id=='view-filter-container'||$(e.target).parents('#view-filter-container').length>0){return true}else{$('body').removeClass('view-filter-toggle-open');$('#view-filter-toggle').text(filters_text);sessionStorage.setItem(pathName,"closed")}});$('#view-filter-toggle, .view-filter-container-x, .view-filter-container-close',context).on('click',function(e){e.preventDefault();e.stopPropagation();$toggle=$("#view-filter-toggle");$('body').toggleClass('view-filter-toggle-open');if(sessionStorage.getItem(pathName)!='open'){sessionStorage.setItem(pathName,"open");$toggle.text(close_text)}else{sessionStorage.setItem(pathName,"closed");$toggle.text(filters_text)}});if(sessionStorage.getItem(pathName)=='open'){$('body').addClass('view-filter-toggle-open');$('#view-filter-toggle',context).text(close_text)};$('.facetapi-active').closest('.taxonomy-group').addClass('taxonomy-group-open');$('.taxonomy-group button',context).on('click',function(){var $this=$(this),number=$this.closest('.taxonomy-group').index();if(sessionStorage.getItem(pathName+':taxonomy-group-'+number)!='open'){sessionStorage.setItem(pathName+':taxonomy-group-'+number,"open")}else sessionStorage.setItem(pathName+':taxonomy-group-'+number,"closed");$(this).closest('.taxonomy-group').toggleClass('taxonomy-group-open')});$active_facets=$('.resource-listing-view-filter-container').find('.facetapi-active');if($active_facets.length<1)$('.resource-listing-view-filter-container .taxonomy-group.facetapi-type',context).each(function(){$(this).closest('.taxonomy-group').toggleClass('taxonomy-group-open')});$('.taxonomy-group button',context).each(function(){var $this=$(this),$group=$this.closest('.taxonomy-group');number=$group.index();if(sessionStorage.getItem(pathName+':taxonomy-group-'+number)=='open')$group.addClass('taxonomy-group-open')});if(context==document){var $body=$('body');$('.expand-mobile-search',context).click(function(e){e.preventDefault();resetNavigation();$body.removeClass('mobile-nav-open');$body.toggleClass('mobile-search-open');$("#search-panel").find('.form-text').focus()});$('.expand-mobile-nav',context).click(function(e){e.preventDefault();resetNavigation();$body.removeClass('mobile-search-open');$body.toggleClass('mobile-nav-open')})};if(context==document)var resetNavigation=function(){var $subnav=$('.main-subnav',context);$subnav.find('.subnav-open').removeClass('subnav-open');$('#main-nav li',context).removeClass('main-active');$subnav.removeAttr('style');$('body',context).removeClass('nav-open')};$('.body2 article > ul a',context).on('click',function(e){$('.body2 article > section').addClass('hideo');$(this).tab('show');$('.body2 article > ul a').removeClass('on');$(this).addClass('on');e.preventDefault()});$('.body2 article > ul li:first-child a').click();if(context==document)$(window).resize(function(){if($(window).width()<768){resetUtility();$(".panel-nav").css("display","")}else $("#to-top").css("display","")});$('.item:first-child').addClass('active');$('[id^="promo-slider"]').each(function(){sliderCheckitem(this)}).on('slid.bs.carousel',function(){sliderCheckitem(this)})
function sliderCheckitem(el){var $this=$(el),$current=$this.find('.active'),$control=$this.find('.rh-carousel-control'),$prevLink=$this.find('.left.rh-carousel-control'),$nextLink=$this.find('.right.rh-carousel-control'),prevTitle=$current.prev().find('.promo1-title').html(),nextTitle=$current.next().find('.promo1-title').html();$prevLink.html(prevTitle);$nextLink.html(nextTitle);$this.find('.rh-carousel-control').attr('data-text-color',$current.find('section').attr('data-text-color'));$control.show();if($('.carousel-inner .item',$this).length==1){$control.hide()}else if($('.carousel-inner .item:first',$this).hasClass('active')){$prevLink.hide()}else if($('.carousel-inner .item:last',$this).hasClass('active'))$nextLink.hide()};equalheight=function(container){var currentTallest=0,currentRowStart=0,rowDivs=new Array(),$el,topPosition=0;$(container).each(function(){$el=$(this);$($el).height('auto');topPostion=$el.offset().top;if(currentRowStart!=topPostion){for(currentDiv=0;currentDiv<rowDivs.length;currentDiv++)rowDivs[currentDiv].height(currentTallest);rowDivs.length=0;currentRowStart=topPostion;currentTallest=$el.height();rowDivs.push($el)}else{rowDivs.push($el);currentTallest=(currentTallest<$el.height())?($el.height()):currentTallest};for(currentDiv=0;currentDiv<rowDivs.length;currentDiv++)rowDivs[currentDiv].height(currentTallest)})};if(context==document){$(window).load(function(){equalheight('.equal-height > *')});$(window).resize(function(){equalheight('.equal-height > *')})};equalheight('.equal-height > *');$(".c-tabs .nav-tabs li a",context).click(function(event){$(".narrative.c-tabs").removeClass("in").addClass("collapse")});$(".c-tabs .nav-tabs li a",context).click(function(event){$(".resources.c-tabs").removeClass("in").addClass("collapse")});$(".c-tabs .nav-tabs li a",context).click(function(event){$(".vertical-tabs .c-tabs").removeClass("in").addClass("collapse")});if(typeof fitVids=='function'){$(".training_taste .media-youtube-video",context).fitVids();$(".fwvd1 .content",context).fitVids()};$('.body2 article > ul a',context).on('click',function(e){$('.body2 article > section').addClass('hideo');$(this).tab('show');$('.body2 article > ul a').removeClass('on');$(this).addClass('on');e.preventDefault()});$('.body2 article > ul li:first-child a',context).click();if(!!$(".edit-country").length){function trainingListChangeCountry(selected){if(!trainingListChangeCountry.hasOwnProperty('xpath_target')){trainingListChangeCountry.xpath_target=false;trainingListChangeCountry.xpath_target_clear=false;trainingListChangeCountry.page_type_key=false;if(!!$('section.training_list').length){trainingListChangeCountry.xpath_target='tr.class-%key% > td.views-field:last';trainingListChangeCountry.xpath_target_clear='tr.class-training > td.views-field:last-child';trainingListChangeCountry.page_type_key='t'}else if(!!$('section.training-by-curriculum').length){trainingListChangeCountry.xpath_target='div.class-%key%';trainingListChangeCountry.xpath_target_clear='div.class-training';trainingListChangeCountry.page_type_key='c'}};if(false!==trainingListChangeCountry.xpath_target)if(selected.length>0){var cid=selected;setCidItems(cid,trainingListChangeCountry.xpath_target,trainingListChangeCountry.xpath_target_clear,trainingListChangeCountry.page_type_key);$('.training_list tbody, .training_list thead').show();$('.training_list tbody ul.country-'+selected).show()}else{$('.course-listing-empty').show();$('.training_list tbody, .training_list thead').hide()}};$('.edit-country').change(function(){country_id=$(this).val();country=$(this).children("option[value='"+country_id+"']").text();$('#edit-countrySelectBoxItText').text(country);trainingListChangeCountry(country_id);$('.course-listing-empty').hide()})};$("#training-listing select").selectBoxIt({native:true})
function setCidItems(cid,xpath_target,xpath_target_clear,page_type_key){if(!Drupal.settings.hasOwnProperty('redhat_www_type_training')){Drupal.settings.redhat_www_type_training={countrycache:{}}}else if(!Drupal.settings.redhat_www_type_training.hasOwnProperty('countrycache'))Drupal.settings.redhat_www_type_training.countrycache={};if(false!=Drupal.settings.redhat_www_type_training.countrycache[cid]){setCidItems.lastCid=cid;if(Drupal.settings.redhat_www_type_training.countrycache.hasOwnProperty(cid)){$(xpath_target_clear).empty();$.each(Drupal.settings.redhat_www_type_training.countrycache[cid],function(key,val){$(xpath_target.replace('%key%',key)).html(val[page_type_key])});$('.training_list table').addClass('waystotrain-loaded')}else{Drupal.settings.redhat_www_type_training.countrycache[cid]=false;$.getJSON(Drupal.settings.basePath+Drupal.settings.pathPrefix+'training/'+cid+'/json',function(data){Drupal.settings.redhat_www_type_training.countrycache[cid]=data;if(cid==setCidItems.lastCid)setCidItems(cid,xpath_target,xpath_target_clear,page_type_key)})}}};$('select.select-box-it',context).each(function(){$(this).selectBoxIt({native:true,autoWidth:false});var $selectBoxCont=$(this).parent('.selectboxit-wrapper');$(this).css({width:$selectBoxCont.width(),height:$selectBoxCont.height()})});$('select.switch-it',context).each(function(){$(this).switchIt()});if($('#block-views-training-list-block-training table').length)$('#block-views-training-list-block-training table tbody tr').on('mouseover',function(){$(this).addClass('hover');$(this).children('td').children('a').addClass('hover')}).on('mouseout',function(){$(this).removeClass('hover');$(this).children('td').children('a').removeClass('hover')}).on('click',function(){window.location.href=$(this).children('td').children('a').attr('href')});$('.search-google-appliance-search-form .form-text',context).focus();if($('body').hasClass('success-detail')&&typeof $.fn['stat1Band']!=='undefined')$('.stat1 section').stat1Band();if($('#rh_toggle_admin',context).length)$('#rh_toggle_admin',context).on('click',function(e){e.preventDefault();$('ul.tabs.primary, #block-workbench-block').toggle()})};if(typeof Drupal!=='undefined'&&Drupal.behaviors){Drupal.behaviors.rhchrome={attach:function(context,settings){rh_on_load(context)}}}else $(document).ready(function(){rh_on_load(document)})})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/rh-chrome.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.fitvids.js. */
(function($){"use strict";$.fn.fitVids=function(options){var settings={customSelector:null};if(!document.getElementById('fit-vids-style')){var div=document.createElement('div'),ref=document.getElementsByTagName('base')[0]||document.getElementsByTagName('script')[0],cssStyles='&shy;<style>.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>';div.className='fit-vids-style';div.id='fit-vids-style';div.style.display='none';div.innerHTML=cssStyles;ref.parentNode.insertBefore(div,ref)};if(options)$.extend(settings,options);return this.each(function(){var selectors=["iframe[src*='player.vimeo.com']","iframe[src*='youtube.com']","iframe[src*='youtube-nocookie.com']","iframe[src*='kickstarter.com'][src*='video.html']","object","embed"];if(settings.customSelector)selectors.push(settings.customSelector);var $allVideos=$(this).find(selectors.join(','));$allVideos=$allVideos.not("object object");$allVideos.each(function(){var $this=$(this);if(this.tagName.toLowerCase()==='embed'&&$this.parent('object').length||$this.parent('.fluid-width-video-wrapper').length)return;var height=(this.tagName.toLowerCase()==='object'||($this.attr('height')&&!isNaN(parseInt($this.attr('height'),10))))?parseInt($this.attr('height'),10):$this.height(),width=!isNaN(parseInt($this.attr('width'),10))?parseInt($this.attr('width'),10):$this.width(),aspectRatio=height/width;if(!$this.attr('id')){var videoID='fitvid'+Math.floor(Math.random()*999999);$this.attr('id',videoID)};$this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top',(aspectRatio*100)+"%");$this.removeAttr('height').removeAttr('width')})})}})(window.jQuery||window.Zepto);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.fitvids.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.switchIt.js. */
(function($){var pluginName='switchIt',defaults={key:'id'}
function switchIt(element,options){this.element=element;this.options=$.extend({},defaults,options);this._defaults=defaults;this._name=pluginName;this.init()};switchIt.prototype.toggle=function($container,value){var onClass=".switchable-"+value;$container.children("[class*='switchable-']:not("+onClass+")").hide();$container.children(onClass).show()};switchIt.prototype.init=function(){$el=$(this.element);this.key=$el.attr(this.options.key);var switchContainer=this.key+'-switchable';_this=this;$el.on('change',function(e){_this.toggle($("[id|='"+switchContainer+"']"),this.value)});$el.trigger('change')};$.fn[pluginName]=function(options){return this.each(function(){if(!$.data(this,'plugin_'+pluginName))$.data(this,'plugin_'+pluginName,new switchIt(this,options))})}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.switchIt.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.selectBoxIt/jquery.selectBoxIt.js. */
(function(selectBoxIt){"use strict";selectBoxIt(window.jQuery,window,document)}(function($,window,document,undefined){"use strict";$.widget("selectBox.selectBoxIt",{VERSION:"3.8.1",options:{showEffect:"none",showEffectOptions:{},showEffectSpeed:"medium",hideEffect:"none",hideEffectOptions:{},hideEffectSpeed:"medium",showFirstOption:true,defaultText:"",defaultIcon:"",downArrowIcon:"",theme:"default",keydownOpen:true,isMobile:function(){var ua=navigator.userAgent||navigator.vendor||window.opera;return/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(ua)},"native":false,aggressiveChange:false,selectWhenHidden:true,viewport:$(window),similarSearch:false,copyAttributes:["title","rel"],copyClasses:"button",nativeMousedown:false,customShowHideEvent:false,autoWidth:true,html:true,populate:"",dynamicPositioning:true,hideCurrent:false},getThemes:function(){var self=this,theme=$(self.element).attr("data-theme")||"c";return{bootstrap:{focus:"active",hover:"",enabled:"enabled",disabled:"disabled",arrow:"caret",button:"btn",list:"dropdown-menu",container:"bootstrap",open:"open"},jqueryui:{focus:"ui-state-focus",hover:"ui-state-hover",enabled:"ui-state-enabled",disabled:"ui-state-disabled",arrow:"ui-icon ui-icon-triangle-1-s",button:"ui-widget ui-state-default",list:"ui-widget ui-widget-content",container:"jqueryui",open:"selectboxit-open"},jquerymobile:{focus:"ui-btn-down-"+theme,hover:"ui-btn-hover-"+theme,enabled:"ui-enabled",disabled:"ui-disabled",arrow:"ui-icon ui-icon-arrow-d ui-icon-shadow",button:"ui-btn ui-btn-icon-right ui-btn-corner-all ui-shadow ui-btn-up-"+theme,list:"ui-btn ui-btn-icon-right ui-btn-corner-all ui-shadow ui-btn-up-"+theme,container:"jquerymobile",open:"selectboxit-open"},"default":{focus:"selectboxit-focus",hover:"selectboxit-hover",enabled:"selectboxit-enabled",disabled:"selectboxit-disabled",arrow:"selectboxit-default-arrow",button:"selectboxit-btn",list:"selectboxit-list",container:"selectboxit-container",open:"selectboxit-open"}}},isDeferred:function(def){return $.isPlainObject(def)&&def.promise&&def.done},_create:function(internal){var self=this,populateOption=self.options["populate"],userTheme=self.options["theme"];if(!self.element.is("select"))return;self.widgetProto=$.Widget.prototype;self.originalElem=self.element[0];self.selectBox=self.element;if(self.options["populate"]&&self.add&&!internal)self.add(populateOption);self.selectItems=self.element.find("option");self.firstSelectItem=self.selectItems.slice(0,1);self.documentHeight=$(document).height();self.theme=$.isPlainObject(userTheme)?$.extend({},self.getThemes()["default"],userTheme):self.getThemes()[userTheme]?self.getThemes()[userTheme]:self.getThemes()["default"];self.currentFocus=0;self.blur=true;self.textArray=[];self.currentIndex=0;self.currentText="";self.flipped=false;if(!internal)self.selectBoxStyles=self.selectBox.attr("style");self._createDropdownButton()._createUnorderedList()._copyAttributes()._replaceSelectBox()._addClasses(self.theme)._eventHandlers();if(self.originalElem.disabled&&self.disable)self.disable();if(self._ariaAccessibility)self._ariaAccessibility();self.isMobile=self.options["isMobile"]();if(self._mobile)self._mobile();if(self.options["native"])this._applyNativeSelect();self.triggerEvent("create");return self},_createDropdownButton:function(){var self=this,originalElemId=self.originalElemId=self.originalElem.id||"",originalElemValue=self.originalElemValue=self.originalElem.value||"",originalElemName=self.originalElemName=self.originalElem.name||"",copyClasses=self.options["copyClasses"],selectboxClasses=self.selectBox.attr("class")||"";self.dropdownText=$("<span/>",{id:originalElemId&&originalElemId+"SelectBoxItText","class":"selectboxit-text",unselectable:"on",text:self.firstSelectItem.text()}).attr("data-val",originalElemValue);self.dropdownImageContainer=$("<span/>",{"class":"selectboxit-option-icon-container"});self.dropdownImage=$("<i/>",{id:originalElemId&&originalElemId+"SelectBoxItDefaultIcon","class":"selectboxit-default-icon",unselectable:"on"});self.dropdown=$("<span/>",{id:originalElemId&&originalElemId+"SelectBoxIt","class":"selectboxit "+(copyClasses==="button"?selectboxClasses:"")+" "+(self.selectBox.prop("disabled")?self.theme["disabled"]:self.theme["enabled"]),name:originalElemName,tabindex:self.selectBox.attr("tabindex")||"0",unselectable:"on"}).append(self.dropdownImageContainer.append(self.dropdownImage)).append(self.dropdownText);self.dropdownContainer=$("<span/>",{id:originalElemId&&originalElemId+"SelectBoxItContainer","class":'selectboxit-wrapper '+self.theme.container+' '+(copyClasses==="container"?selectboxClasses:"")}).append(self.dropdown);return self},_createUnorderedList:function(){var self=this,dataDisabled,optgroupClass,optgroupElement,iconClass,iconUrl,iconUrlClass,iconUrlStyle,currentItem="",originalElemId=self.originalElemId||"",createdList=$("<ul/>",{id:originalElemId&&originalElemId+"SelectBoxItOptions","class":"selectboxit-options",tabindex:-1}),currentDataSelectedText,currentDataText,currentDataSearch,currentText,currentOption,parent;if(!self.options["showFirstOption"]){self.selectItems.first().attr("disabled","disabled");self.selectItems=self.selectBox.find("option").slice(1)};self.selectItems.each(function(index){currentOption=$(this);optgroupClass="";optgroupElement="";dataDisabled=currentOption.prop("disabled");iconClass=currentOption.attr("data-icon")||"";iconUrl=currentOption.attr("data-iconurl")||"";iconUrlClass=iconUrl?"selectboxit-option-icon-url":"";iconUrlStyle=iconUrl?'style="background-image:url(\''+iconUrl+'\');"':"";currentDataSelectedText=currentOption.attr("data-selectedtext");currentDataText=currentOption.attr("data-text");currentText=currentDataText?currentDataText:currentOption.text();parent=currentOption.parent();if(parent.is("optgroup")){optgroupClass="selectboxit-optgroup-option";if(currentOption.index()===0)optgroupElement='<span class="selectboxit-optgroup-header '+parent.first().attr("class")+'"data-disabled="true">'+parent.first().attr("label")+'</span>'};currentOption.attr("value",this.value);currentItem+=optgroupElement+'<li data-id="'+index+'" data-val="'+this.value+'" data-disabled="'+dataDisabled+'" class="'+optgroupClass+" selectboxit-option "+($(this).attr("class")||"")+'"><a class="selectboxit-option-anchor"><span class="selectboxit-option-icon-container"><i class="selectboxit-option-icon '+iconClass+' '+(iconUrlClass||self.theme["container"])+'"'+iconUrlStyle+'></i></span>'+(self.options["html"]?currentText:self.htmlEscape(currentText))+'</a></li>';currentDataSearch=currentOption.attr("data-search");self.textArray[index]=dataDisabled?"":currentDataSearch?currentDataSearch:currentText;if(this.selected){self._setText(self.dropdownText,currentDataSelectedText||currentText);self.currentFocus=index}});if((self.options["defaultText"]||self.selectBox.attr("data-text"))){var defaultedText=self.options["defaultText"]||self.selectBox.attr("data-text");self._setText(self.dropdownText,defaultedText);self.options["defaultText"]=defaultedText};createdList.append(currentItem);self.list=createdList;self.dropdownContainer.append(self.list);self.listItems=self.list.children("li");self.listAnchors=self.list.find("a");self.listItems.first().addClass("selectboxit-option-first");self.listItems.last().addClass("selectboxit-option-last");self.list.find("li[data-disabled='true']").not(".optgroupHeader").addClass(self.theme["disabled"]);self.dropdownImage.addClass(self.selectBox.attr("data-icon")||self.options["defaultIcon"]||self.listItems.eq(self.currentFocus).find("i").attr("class"));self.dropdownImage.attr("style",self.listItems.eq(self.currentFocus).find("i").attr("style"));return self},_replaceSelectBox:function(){var self=this,height,originalElemId=self.originalElem.id||"",size=self.selectBox.attr("data-size"),listSize=self.listSize=size===undefined?"auto":size==="0"||"size"==="auto"?"auto":+size,downArrowContainerWidth,dropdownImageWidth;self.selectBox.css("display","none").after(self.dropdownContainer);self.dropdownContainer.appendTo('body').addClass('selectboxit-rendering');height=self.dropdown.height();self.downArrow=$("<i/>",{id:originalElemId&&originalElemId+"SelectBoxItArrow","class":"selectboxit-arrow",unselectable:"on"});self.downArrowContainer=$("<span/>",{id:originalElemId&&originalElemId+"SelectBoxItArrowContainer","class":"selectboxit-arrow-container",unselectable:"on"}).append(self.downArrow);self.dropdown.append(self.downArrowContainer);self.listItems.removeClass("selectboxit-selected").eq(self.currentFocus).addClass("selectboxit-selected");downArrowContainerWidth=self.downArrowContainer.outerWidth(true);dropdownImageWidth=self.dropdownImage.outerWidth(true);if(self.options["autoWidth"]){self.dropdown.css({width:"auto"}).css({width:self.list.outerWidth(true)+downArrowContainerWidth+dropdownImageWidth});self.list.css({"min-width":self.dropdown.width()})};self.dropdownText.css({"max-width":self.dropdownContainer.outerWidth(true)-(downArrowContainerWidth+dropdownImageWidth)});self.selectBox.after(self.dropdownContainer);self.dropdownContainer.removeClass('selectboxit-rendering');if($.type(listSize)==="number")self.maxHeight=self.listAnchors.outerHeight(true)*listSize;return self},_scrollToView:function(type){var self=this,currentOption=self.listItems.eq(self.currentFocus),listScrollTop=self.list.scrollTop(),currentItemHeight=currentOption.height(),currentTopPosition=currentOption.position().top,absCurrentTopPosition=Math.abs(currentTopPosition),listHeight=self.list.height(),currentText;if(type==="search"){if(listHeight-currentTopPosition<currentItemHeight){self.list.scrollTop(listScrollTop+(currentTopPosition-(listHeight-currentItemHeight)))}else if(currentTopPosition<-1)self.list.scrollTop(currentTopPosition-currentItemHeight)}else if(type==="up"){if(currentTopPosition<-1)self.list.scrollTop(listScrollTop-absCurrentTopPosition)}else if(type==="down")if(listHeight-currentTopPosition<currentItemHeight)self.list.scrollTop((listScrollTop+(absCurrentTopPosition-listHeight+currentItemHeight)));return self},_callbackSupport:function(callback){var self=this;if($.isFunction(callback))callback.call(self,self.dropdown);return self},_setText:function(elem,currentText){var self=this;if(self.options["html"]){elem.html(currentText)}else elem.text(currentText);return self},open:function(callback){var self=this,showEffect=self.options["showEffect"],showEffectSpeed=self.options["showEffectSpeed"],showEffectOptions=self.options["showEffectOptions"],isNative=self.options["native"],isMobile=self.isMobile;if(!self.listItems.length||self.dropdown.hasClass(self.theme["disabled"]))return self;if((!isNative&&!isMobile)&&!this.list.is(":visible")){self.triggerEvent("open");if(self._dynamicPositioning&&self.options["dynamicPositioning"])self._dynamicPositioning();if(showEffect==="none"){self.list.show()}else if(showEffect==="show"||showEffect==="slideDown"||showEffect==="fadeIn"){self.list[showEffect](showEffectSpeed)}else self.list.show(showEffect,showEffectOptions,showEffectSpeed);self.list.promise().done(function(){self._scrollToView("search");self.triggerEvent("opened")})};self._callbackSupport(callback);return self},close:function(callback){var self=this,hideEffect=self.options["hideEffect"],hideEffectSpeed=self.options["hideEffectSpeed"],hideEffectOptions=self.options["hideEffectOptions"],isNative=self.options["native"],isMobile=self.isMobile;if((!isNative&&!isMobile)&&self.list.is(":visible")){self.triggerEvent("close");if(hideEffect==="none"){self.list.hide()}else if(hideEffect==="hide"||hideEffect==="slideUp"||hideEffect==="fadeOut"){self.list[hideEffect](hideEffectSpeed)}else self.list.hide(hideEffect,hideEffectOptions,hideEffectSpeed);self.list.promise().done(function(){self.triggerEvent("closed")})};self._callbackSupport(callback);return self},toggle:function(){var self=this,listIsVisible=self.list.is(":visible");if(listIsVisible){self.close()}else if(!listIsVisible)self.open()},_keyMappings:{"38":"up","40":"down","13":"enter","8":"backspace","9":"tab","32":"space","27":"esc"},_keydownMethods:function(){var self=this,moveToOption=self.list.is(":visible")||!self.options["keydownOpen"];return{down:function(){if(self.moveDown&&moveToOption)self.moveDown()},up:function(){if(self.moveUp&&moveToOption)self.moveUp()},enter:function(){var activeElem=self.listItems.eq(self.currentFocus);self._update(activeElem);if(activeElem.attr("data-preventclose")!=="true")self.close();self.triggerEvent("enter")},tab:function(){self.triggerEvent("tab-blur");self.close()},backspace:function(){self.triggerEvent("backspace")},esc:function(){self.close()}}},_eventHandlers:function(){var self=this,nativeMousedown=self.options["nativeMousedown"],customShowHideEvent=self.options["customShowHideEvent"],currentDataText,currentText,focusClass=self.focusClass,hoverClass=self.hoverClass,openClass=self.openClass;this.dropdown.on({"click.selectBoxIt":function(){self.dropdown.trigger("focus",true);if(!self.originalElem.disabled){self.triggerEvent("click");if(!nativeMousedown&&!customShowHideEvent)self.toggle()}},"mousedown.selectBoxIt":function(){$(this).data("mdown",true);self.triggerEvent("mousedown");if(nativeMousedown&&!customShowHideEvent)self.toggle()},"mouseup.selectBoxIt":function(){self.triggerEvent("mouseup")},"blur.selectBoxIt":function(){if(self.blur){self.triggerEvent("blur");self.close();$(this).removeClass(focusClass)}},"focus.selectBoxIt":function(event,internal){var mdown=$(this).data("mdown");$(this).removeData("mdown");if(!mdown&&!internal)setTimeout(function(){self.triggerEvent("tab-focus")},0);if(!internal){if(!$(this).hasClass(self.theme["disabled"]))$(this).addClass(focusClass);self.triggerEvent("focus")}},"keydown.selectBoxIt":function(e){var currentKey=self._keyMappings[e.keyCode],keydownMethod=self._keydownMethods()[currentKey];if(keydownMethod){keydownMethod();if(self.options["keydownOpen"]&&(currentKey==="up"||currentKey==="down"))self.open()};if(keydownMethod&&currentKey!=="tab")e.preventDefault()},"keypress.selectBoxIt":function(e){var currentKey=e.charCode||e.keyCode,key=self._keyMappings[e.charCode||e.keyCode],alphaNumericKey=String.fromCharCode(currentKey);if(self.search&&(!key||(key&&key==="space")))self.search(alphaNumericKey,true,true);if(key==="space")e.preventDefault()},"mouseenter.selectBoxIt":function(){self.triggerEvent("mouseenter")},"mouseleave.selectBoxIt":function(){self.triggerEvent("mouseleave")}});self.list.on({"mouseover.selectBoxIt":function(){self.blur=false},"mouseout.selectBoxIt":function(){self.blur=true},"focusin.selectBoxIt":function(){self.dropdown.trigger("focus",true)}});self.list.on({"mousedown.selectBoxIt":function(){self._update($(this));self.triggerEvent("option-click");if($(this).attr("data-disabled")==="false"&&$(this).attr("data-preventclose")!=="true")self.close();setTimeout(function(){self.dropdown.trigger('focus',true)},0)},"focusin.selectBoxIt":function(){self.listItems.not($(this)).removeAttr("data-active");$(this).attr("data-active","");var listIsHidden=self.list.is(":hidden");if((self.options["searchWhenHidden"]&&listIsHidden)||self.options["aggressiveChange"]||(listIsHidden&&self.options["selectWhenHidden"]))self._update($(this));$(this).addClass(focusClass)},"mouseup.selectBoxIt":function(){if(nativeMousedown&&!customShowHideEvent){self._update($(this));self.triggerEvent("option-mouseup");if($(this).attr("data-disabled")==="false"&&$(this).attr("data-preventclose")!=="true")self.close()}},"mouseenter.selectBoxIt":function(){if($(this).attr("data-disabled")==="false"){self.listItems.removeAttr("data-active");$(this).addClass(focusClass).attr("data-active","");self.listItems.not($(this)).removeClass(focusClass);$(this).addClass(focusClass);self.currentFocus=+$(this).attr("data-id")}},"mouseleave.selectBoxIt":function(){if($(this).attr("data-disabled")==="false"){self.listItems.not($(this)).removeClass(focusClass).removeAttr("data-active");$(this).addClass(focusClass);self.currentFocus=+$(this).attr("data-id")}},"blur.selectBoxIt":function(){$(this).removeClass(focusClass)}},".selectboxit-option");self.list.on({"click.selectBoxIt":function(ev){ev.preventDefault()}},"a");self.selectBox.on({"change.selectBoxIt, internal-change.selectBoxIt":function(event,internal){var currentOption,currentDataSelectedText;if(!internal){currentOption=self.list.find('li[data-val="'+self.originalElem.value+'"]');if(currentOption.length){self.listItems.eq(self.currentFocus).removeClass(self.focusClass);self.currentFocus=+currentOption.attr("data-id")}};currentOption=self.listItems.eq(self.currentFocus);currentDataSelectedText=currentOption.attr("data-selectedtext");currentDataText=currentOption.attr("data-text");currentText=currentDataText?currentDataText:currentOption.find("a").text();self._setText(self.dropdownText,currentDataSelectedText||currentText);self.dropdownText.attr("data-val",self.originalElem.value);if(currentOption.find("i").attr("class")){self.dropdownImage.attr("class",currentOption.find("i").attr("class")).addClass("selectboxit-default-icon");self.dropdownImage.attr("style",currentOption.find("i").attr("style"))};self.triggerEvent("changed")},"disable.selectBoxIt":function(){self.dropdown.addClass(self.theme["disabled"])},"enable.selectBoxIt":function(){self.dropdown.removeClass(self.theme["disabled"])},"open.selectBoxIt":function(){var currentElem=self.list.find("li[data-val='"+self.dropdownText.attr("data-val")+"']"),activeElem;if(!currentElem.length)currentElem=self.listItems.not("[data-disabled=true]").first();self.currentFocus=+currentElem.attr("data-id");activeElem=self.listItems.eq(self.currentFocus);self.dropdown.addClass(openClass).removeClass(hoverClass).addClass(focusClass);self.listItems.removeClass(self.selectedClass).removeAttr("data-active").not(activeElem).removeClass(focusClass);activeElem.addClass(self.selectedClass).addClass(focusClass);if(self.options.hideCurrent){self.listItems.show();activeElem.hide()}},"close.selectBoxIt":function(){self.dropdown.removeClass(openClass)},"blur.selectBoxIt":function(){self.dropdown.removeClass(focusClass)},"mouseenter.selectBoxIt":function(){if(!$(this).hasClass(self.theme["disabled"]))self.dropdown.addClass(hoverClass)},"mouseleave.selectBoxIt":function(){self.dropdown.removeClass(hoverClass)},destroy:function(ev){ev.preventDefault();ev.stopPropagation()}});return self},_update:function(elem){var self=this,currentDataSelectedText,currentDataText,currentText,defaultText=self.options["defaultText"]||self.selectBox.attr("data-text"),currentElem=self.listItems.eq(self.currentFocus);if(elem.attr("data-disabled")==="false"){currentDataSelectedText=self.listItems.eq(self.currentFocus).attr("data-selectedtext");currentDataText=currentElem.attr("data-text");currentText=currentDataText?currentDataText:currentElem.text();if((defaultText&&self.options["html"]?self.dropdownText.html()===defaultText:self.dropdownText.text()===defaultText)&&self.selectBox.val()===elem.attr("data-val")){self.triggerEvent("change")}else{self.selectBox.val(elem.attr("data-val"));self.currentFocus=+elem.attr("data-id");if(self.originalElem.value!==self.dropdownText.attr("data-val"))self.triggerEvent("change")}}},_addClasses:function(obj){var self=this,focusClass=self.focusClass=obj.focus,hoverClass=self.hoverClass=obj.hover,buttonClass=obj.button,listClass=obj.list,arrowClass=obj.arrow,containerClass=obj.container,openClass=self.openClass=obj.open;self.selectedClass="selectboxit-selected";self.downArrow.addClass(self.selectBox.attr("data-downarrow")||self.options["downArrowIcon"]||arrowClass);self.dropdownContainer.addClass(containerClass);self.dropdown.addClass(buttonClass);self.list.addClass(listClass);return self},refresh:function(callback,internal){var self=this;self._destroySelectBoxIt()._create(true);if(!internal)self.triggerEvent("refresh");self._callbackSupport(callback);return self},htmlEscape:function(str){return String(str).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},triggerEvent:function(eventName){var self=this,currentIndex=self.options["showFirstOption"]?self.currentFocus:((self.currentFocus-1)>=0?self.currentFocus:0);self.selectBox.trigger(eventName,{selectbox:self.selectBox,selectboxOption:self.selectItems.eq(currentIndex),dropdown:self.dropdown,dropdownOption:self.listItems.eq(self.currentFocus)});return self},_copyAttributes:function(){var self=this;if(self._addSelectBoxAttributes)self._addSelectBoxAttributes();return self},_realOuterWidth:function(elem){if(elem.is(":visible"))return elem.outerWidth(true);var self=this,clonedElem=elem.clone(),outerWidth;clonedElem.css({visibility:"hidden",display:"block",position:"absolute"}).appendTo("body");outerWidth=clonedElem.outerWidth(true);clonedElem.remove();return outerWidth}});var selectBoxIt=$.selectBox.selectBoxIt.prototype;selectBoxIt._updateMobileText=function(){var self=this,currentOption,currentDataText,currentText;currentOption=self.selectBox.find("option").filter(":selected");currentDataText=currentOption.attr("data-text");currentText=currentDataText?currentDataText:currentOption.text();self._setText(self.dropdownText,currentText);if(self.list.find('li[data-val="'+currentOption.val()+'"]').find("i").attr("class"))self.dropdownImage.attr("class",self.list.find('li[data-val="'+currentOption.val()+'"]').find("i").attr("class")).addClass("selectboxit-default-icon")};selectBoxIt._applyNativeSelect=function(){var self=this;self.dropdownContainer.append(self.selectBox);self.dropdown.attr("tabindex","-1");self.selectBox.css({display:"block",visibility:"visible",width:self._realOuterWidth(self.dropdown),height:self.dropdown.outerHeight(),opacity:"0",position:"absolute",top:"0",left:"0",cursor:"pointer","z-index":"999999",margin:self.dropdown.css("margin"),padding:"0","-webkit-appearance":"menulist-button"});if(self.originalElem.disabled)self.triggerEvent("disable");return this};selectBoxIt._mobileEvents=function(){var self=this;self.selectBox.on({"changed.selectBoxIt":function(){self.hasChanged=true;self._updateMobileText();self.triggerEvent("option-click")},"mousedown.selectBoxIt":function(){if(!self.hasChanged&&self.options.defaultText&&!self.originalElem.disabled){self._updateMobileText();self.triggerEvent("option-click")}},"enable.selectBoxIt":function(){self.selectBox.removeClass('selectboxit-rendering')},"disable.selectBoxIt":function(){self.selectBox.addClass('selectboxit-rendering')}})};selectBoxIt._mobile=function(callback){var self=this;if(self.isMobile){self._applyNativeSelect();self._mobileEvents()};return this}}));;
/* Source and licensing information for the above line(s) can be found at https://www.redhat.com/profiles/rh/themes/redhatdotcom/js/jquery.selectBoxIt/jquery.selectBoxIt.js. */
;/*})'"*/

(function($){$.belowthefold=function(element,settings){var fold=$(window).height()+$(window).scrollTop();return fold<=$(element).offset().top-settings.threshold;};$.abovethetop=function(element,settings){var top=$(window).scrollTop();return top>=$(element).offset().top+$(element).height()-settings.threshold;};$.rightofscreen=function(element,settings){var fold=$(window).width()+$(window).scrollLeft();return fold<=$(element).offset().left-settings.threshold;};$.leftofscreen=function(element,settings){var left=$(window).scrollLeft();return left>=$(element).offset().left+$(element).width()-settings.threshold;};$.inviewport=function(element,settings){return!$.rightofscreen(element,settings)&&!$.leftofscreen(element,settings)&&!$.belowthefold(element,settings)&&!$.abovethetop(element,settings);};$.extend($.expr[':'],{"below-the-fold":function(a,i,m){return $.belowthefold(a,{threshold:0});},"above-the-top":function(a,i,m){return $.abovethetop(a,{threshold:0});},"left-of-screen":function(a,i,m){return $.leftofscreen(a,{threshold:0});},"right-of-screen":function(a,i,m){return $.rightofscreen(a,{threshold:0});},"in-viewport":function(a,i,m){return $.inviewport(a,{threshold:0});}});})(jQuery);
;/*})'"*/
;/*})'"*/
