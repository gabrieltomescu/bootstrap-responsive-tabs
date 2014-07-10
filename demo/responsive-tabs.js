(function($) {
  $.fn.responsiveTabs = function(options) {
    // Defaults
    var defaults = {
      minTabWidth: "100",
      maxTabWidth: "200",
      draggable: true
    };

    var settings = $.extend( {}, defaults, options );

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

    // Helper function to sort tabs
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
      $container.addClass("responsive-tabs").wrap("<div class='responsive-tabs-container'></div>");
      var menuWidth = $container.width();

      // Update tabs
      var update_tabs = function () {
        var menuWidth = $container.width();

        // DOM getters
        var tabsHorizontalContainer   = $container;
        var tabsVerticalContainer     = $container.parents(".responsive-tabs-container").find(".tabs-dropdown")

        // Determine which tabs to show/hide
        var $tabs = tabsHorizontalContainer.children('li');
        $tabs.width("100%");
        
        var defaultTabWidth = $tabs.first().width();
        var numTabs = $tabs.length;

        var numVisibleHorizontalTabs = (Math.floor(menuWidth / defaultTabWidth)) + 1; // Offset by 1 to catch half cut-off tabs
        var numVisibleVerticalTabs = numTabs - numVisibleHorizontalTabs;

        for(var i = 0; i < $tabs.length; i++){
          var horizontalTab = $tabs.eq(i);
          var tabId = horizontalTab.attr("tab-id");
          var verticalTab = tabsVerticalContainer.find('.js-tab-'+tabId);
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
        tabsVerticalContainer.toggleClass("hidden", !hasVerticalTabs)
        tabsVerticalContainer.find(".count").text("Tabs " + "(" + numVisibleVerticalTabs + ")");

        // Ensure 'active' tab is always visible in horizontal container
        // and it maintains its index position
        activeTab = tabsHorizontalContainer.find(".js-tab.active");
        activeTabCurrentIndex = activeTab.index();
        activeTabDefaultIndex = activeTab.attr("tab-index");
        lastVisibleTab = tabsHorizontalContainer.find(".js-tab:visible").last(); 
        lastVisibleTabIndex = lastVisibleTab.index()
        
        if (activeTabCurrentIndex >= numVisibleHorizontalTabs) {
          activeTab.insertBefore(lastVisibleTab);
          activeTab.removeClass("hidden");
          lastVisibleTab.addClass("hidden");
        }

        if ((activeTabCurrentIndex < activeTabDefaultIndex) && (activeTabCurrentIndex < lastVisibleTabIndex)) {
          activeTab.insertAfter(lastVisibleTab);  
        }
      }
      
      // Update tabs
      setup = function () {
        // Reset all tabs for calc function
        var totalWidth = 0;
        var $tabs      = $container.children('li');

        // Stop function if there are no tabs in container
        if ($tabs.length === 0) {
          return;
        }

        // Mark each tab with a 'tab-id' for easy access
        $tabs.each(function(i) {
          tabIndex = $(this).index();
          $(this).addClass("js-tab js-tab-" + (i+1)).attr("tab-id", i+1).attr("tab-index", tabIndex);
        });

        // Attach a dropdown to the right of the tabs bar
        // This will be toggled if tabs can't fit in a given viewport size
        $container.after("<div class='nav navbar-nav navbar-right dropdown tabs-dropdown js-tabs-dropdown'> \
          <a href='#' id='myTabDrop1' class='dropdown-toggle' data-toggle='dropdown'><span class='count'>Tabs </span><b class='caret'></b></a> \
          <ul class='dropdown-menu' role='menu' aria-labelledby='myTabDrop1'> \
          <div class='dropdown-header visible-xs'>\
            <p class='count'>Tabs</p> \
            <button type='button' class='close' data-dismiss='dropdown'><span aria-hidden='true'>&times;</span></button> \
            <div class='divider visible-xs'></div> \
          </div> \
          </ul> \
        </div>");

        // Clone each tab into the dropdown
        $tabs.clone().appendTo($container.siblings(".js-tabs-dropdown").find(".dropdown-menu"));

        // Update tabs
        update_tabs();
      }()


      // Change tab
      change_tab = function (e) {
        $container.parents(".responsive-tabs-container").on("click", ".js-tab", function(e) {
          e.preventDefault();

          // Remove 'active' class for all tabs
          $(this).closest(".responsive-tabs-container").find(".js-tab").removeClass("active")

          // Add 'active' class for clicked tab in both horizontal and vertical tab containers
          tabId = $(this).attr("tab-id");
          $(this).closest(".responsive-tabs-container").find(".js-tab-" + tabId).addClass("active");

          // Update the Tabs order
          var target = $(e.target);
          var selectedTabIsInDropdown = target.parents(".dropdown-menu").length > 0;

          if (selectedTabIsInDropdown) {
            var tabsHorizontalContainer = target.parents(".js-tabs-dropdown").siblings(".responsive-tabs");
            var tabsVerticalContainer = target.parents(".js-tabs-dropdown");

            // Make active tab last 'visible' tab in the horizontal tab container
            var selectedTabHorizontal     = tabsHorizontalContainer.find(".js-tab.active");
            var firstHiddenTabHorizontal  = tabsHorizontalContainer.find(".js-tab.hidden").first();
            var lastVisibleTabHorizontal  = tabsHorizontalContainer.find(".js-tab:visible").last();

            selectedTabHorizontal.insertAfter(lastVisibleTabHorizontal).removeClass("hidden");
            lastVisibleTabHorizontal.insertBefore(firstHiddenTabHorizontal).addClass("hidden");

            // Re-sort and update
            var $tabsContainer = $(this).closest(".dropdown-menu");
            sort_tabs($tabsContainer);
            update_tabs();

          } else {
            // Re-sort and update
            sort_tabs($container);
            update_tabs();
          }
        });
      }()

      // Update tabs on window resize
      $(window).resize(function() {
        wait_for_repeating_events(function(){
          update_tabs();
        }, 300, "Resize Tabs");
      });
    });
  };
})(jQuery);