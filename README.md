# Bootstrap Responsive Tabs

Bootstrap Responsive Tabs is a jQuery plugin to make Bootstrap tabs more responsive and mobile friendly. 


## Demo
[View the demo](http://home.golden.net/~tomescu/bootstrap-responsive-tabs/demo/)


## Requirements
- Bootstrap: 3+
- jQuery: 1.9+

## Installation
Bootstrap Responsive Tabs is available on [Bower](https://github.com/bower/bower):

```bower install bootstrap-responsive-tabs```

## Usage
The JS:
```
$(".js-tabs-example").bootstrapResponsiveTabs({
    minTabWidth: "100",
    maxTabWidth: "200"
});
```

The HTML:
```
<ul class="nav nav-tabs js-tabs-example">
  <li class="active"><a href="#tab1" data-toggle="tab">Tab1</a></li>
  <li><a href="#tab2" data-toggle="tab">Tab2</a></li>
  <li><a href="#tab3" data-toggle="tab">Tab3</a></li>
  <li><a href="#tab4" data-toggle="tab">Tab4</a></li>
  <li><a href="#tab5" data-toggle="tab">Tab5</a></li>
</ul>
```

## Options
A tab can have minimum and maximum width, when the screen stretches more than 480px. 

```minTabWidth```: The minimum width of each tab.

```maxTabWidth```: The maximum width of each tab.


## Credits
Many thanks for [Dylan Robinson](https://github.com/Robinson7D) for help with creating a debouncing function when resizing the tabs.

## License
The Bootstrap Responsive Tabs plugin is licensed under the MIT license. See the LICENSE file for full details.
