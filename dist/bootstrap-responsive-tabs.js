(function($) {
  $.fn.bootstrapResponsiveTabs = function(options) {

    var settings = $.extend({
      // These are the defaults.
      minTabWidth: "80",
      maxTabWidth: "150"
    }, options );

    // Helper function to debounce window resize events
    var wait_for_repeating_events = (function () {
      var timers = {};
      return function (callback, timeout, timer_name) {
        if (!timer_name) {
          timer_name = "default timer"; //all calls without a uniqueID are grouped as "default timer"
        }
        if (timers[timer_name]) {
          clearTimeout(timers[timer_name]);
        }
        timers[timer_name] = setTimeout(callback, timeout);
      };
    })();

    // Helper function to sort tabs base on their original index positions
    var sort_tabs = function ($tabsContainer) {
      var $tabs = $tabsContainer.find(".js-tab");
      $tabs.sort(function(a,b){
        return +a.getAttribute('tab-index') - +b.getAttribute('tab-index');
      });
      $tabsContainer.detach(".js-tab").append($tabs);
    }


    // Main functions for each instantiated responsive tabs
    this.each(function() {

      $container = $(this);
      
      var ResponsiveTabs;
      ResponsiveTabs = (function () {
        function ResponsiveTabs() {

          TABS_OBJECT = this;
          TABS_OBJECT.activeTabId = 1;
          TABS_OBJECT.tabsHorizontalContainer = $container;
          
          TABS_OBJECT.tabsHorizontalContainer.addClass("responsive-tabs").wrap("<div class='responsive-tabs-container clearfix'></div>");

          // Update tabs
          var update_tabs = function () {

            var menuWidth = TABS_OBJECT.tabsHorizontalContainer.width();

            // Determine which tabs to show/hide
            var $tabs = TABS_OBJECT.tabsHorizontalContainer.children('li');
            $tabs.width("100%");

            // Set min and max widths for tabs
            // On mobile devices smaller than 480px wide, remove min/max width restriction
            if (window.innerWidth < 480) {
              $tabs.each(function(i) {
                $(this)
                  .css("min-width", 0)
                  .css("max-width", "none");
              });
            } else {
              $tabs.each(function(i) {
                $(this)
                  .css("min-width", settings.minTabWidth + "px")
                  .css("max-width", settings.maxTabWidth + "px");
              });
            }
            
            var defaultTabWidth = $tabs.first().width();
            var numTabs = $tabs.length;

            var numVisibleHorizontalTabs = (Math.ceil(menuWidth / defaultTabWidth));
            var numVisibleVerticalTabs = numTabs - numVisibleHorizontalTabs;

            for(var i = 0; i < $tabs.length; i++){
              var horizontalTab = $tabs.eq(i);
              var tabId = horizontalTab.attr("tab-id");
              var verticalTab = TABS_OBJECT.tabsVerticalContainer.find(".js-tab[tab-id=" + tabId + "]");
              var isVisible = i < numVisibleHorizontalTabs;

              horizontalTab.toggleClass('hidden', !isVisible);
              verticalTab.toggleClass('hidden', isVisible);
            }

            // Set new dynamic width for each tab based on calculation above
            var tabWidth = 100 / numVisibleHorizontalTabs;
            var tabPercent = tabWidth + "%";
            $tabs.width(tabPercent);

            // Toggle the Tabs dropdown if there are more tabs than can fit in the tabs horizontal container
            var hasVerticalTabs = (numVisibleVerticalTabs > 0)
            TABS_OBJECT.tabsVerticalContainer.toggleClass("hidden", !hasVerticalTabs)
            TABS_OBJECT.tabsVerticalContainer.siblings(".dropdown-toggle").find(".count").text("Tabs " + "(" + numVisibleVerticalTabs + ")");

            // Make 'active' tab always visible in horizontal container
            // and hidden in vertical container

            activeTab = TABS_OBJECT.tabsHorizontalContainer.find(".js-tab[tab-id=" + TABS_OBJECT.activeTabId + "]");
            activeTabCurrentIndex = activeTab.index();
            activeTabDefaultIndex = activeTab.attr("tab-index");
            lastVisibleHorizontalTab = TABS_OBJECT.tabsHorizontalContainer.find(".js-tab:visible").last(); 
            lastVisibleTabIndex = lastVisibleHorizontalTab.index()

            lastHiddenVerticalTab = TABS_OBJECT.tabsVerticalContainer.find(".js-tab.hidden").last();
            activeVerticalTab = TABS_OBJECT.tabsVerticalContainer.find(".js-tab[tab-index=" + activeTabCurrentIndex + "]");

            if (activeTabCurrentIndex >= numVisibleHorizontalTabs) {
              activeTab.insertBefore(lastVisibleHorizontalTab);
              activeTab.removeClass("hidden");
              lastVisibleHorizontalTab.addClass("hidden");

              lastHiddenVerticalTab.removeClass("hidden");
              activeVerticalTab.addClass("hidden");
            }

            if ((activeTabCurrentIndex < activeTabDefaultIndex) && (activeTabCurrentIndex < lastVisibleTabIndex)) {
              activeTab.insertAfter(lastVisibleHorizontalTab);  
            }
          }

          // SETUP
          var setup = function () {
            // Reset all tabs for calc function
            var totalWidth = 0;
            var $tabs      = TABS_OBJECT.tabsHorizontalContainer.children('li');

            // Stop function if there are no tabs in container
            if ($tabs.length === 0) {
              return;
            }

            // Mark each tab with a 'tab-id' for easy access
            $tabs.each(function(i) {
              tabIndex = $(this).index();
              $(this)
                .addClass("js-tab")
                .attr("tab-id", i+1)
                .attr("tab-index", tabIndex);
            });

            // Attach a dropdown to the right of the tabs bar
            // This will be toggled if tabs can't fit in a given viewport size

            TABS_OBJECT.tabsHorizontalContainer.after("<div class='nav navbar-nav navbar-right dropdown tabs-dropdown js-tabs-dropdown'> \
              <a href='#' class='dropdown-toggle' data-toggle='dropdown'><span class='count'>Tabs </span><b class='caret'></b></a> \
              <ul class='dropdown-menu' role='menu'> \
              <div class='dropdown-header visible-xs'>\
                <p class='count'>Tabs</p> \
                <button type='button' class='close' data-dismiss='dropdown'><span aria-hidden='true'>&times;</span></button> \
                <div class='divider visible-xs'></div> \
              </div> \
              </ul> \
            </div>");

            // Clone each tab into the dropdown
            TABS_OBJECT.tabsVerticalContainer = TABS_OBJECT.tabsHorizontalContainer.siblings(".tabs-dropdown").find(".dropdown-menu");
            $tabs.clone().appendTo(TABS_OBJECT.tabsVerticalContainer);

            // Update tabs
            update_tabs();
          }()


          /** 
           * Change Tab
           */
          change_tab = function (e) {
            TABS_OBJECT.tabsHorizontalContainer.parents(".responsive-tabs-container").on("click", ".js-tab", function(e) {

              // Set 'activeTabId' property from clicked tab
              var target = $(e.target);
              TABS_OBJECT.activeTabId = $(this).attr("tab-id");

              // Update tab 'active' class for horizontal container if tab is clicked
              // from dropdown. Otherwise Bootstrap handles the normal 'active' class placement.
              var verticalTabSelected = target.parents(".dropdown-menu").length > 0
              if (verticalTabSelected) {
                TABS_OBJECT.tabsHorizontalContainer.find(".js-tab").removeClass("active");
                TABS_OBJECT.tabsHorizontalContainer.find(".js-tab[tab-id=" + TABS_OBJECT.activeTabId + "]").addClass("active");
              }

              TABS_OBJECT.tabsVerticalContainer.find(".js-tab").removeClass("active");
              
              // Call 'sort_tabs' to re-arrange tabs based on their original index positions
              // Call 'update_tabs' to resize tabs and determine which one to show/hide 
              sort_tabs(TABS_OBJECT.tabsHorizontalContainer);
              sort_tabs(TABS_OBJECT.tabsVerticalContainer);
              update_tabs();
            });
          }()

          // Update tabs on window resize
          $(window).resize(function() {
            wait_for_repeating_events(function(){
              update_tabs();
            }, 300, "Resize Tabs");
          });
        }

        return ResponsiveTabs();
      })();
    });
  };
})(jQuery);
