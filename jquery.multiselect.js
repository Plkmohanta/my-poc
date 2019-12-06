/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 1.14pre
 * Copyright (c) 2012 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery 1.4.2+
 *   - jQuery UI 1.8 widget factory
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function($, undefined) {

  var multiselectID = 0;
  var $doc = $(document);
  var winHeight = 0;
  var isMenuOpen = false;//This variable is added to stop mouse wheel while menu is expanded.
  
  $.widget("ech.multiselect", {

    // default options
    options: {
      header: true,
      height: 175,
      minWidth: 150,
      classes: '',
      checkAllText: 'Check all',
      uncheckAllText: 'Uncheck all',
      noneSelectedText: 'Select options',
      selectedText: 'codesOnly',
      showSelectAll: true,
      selectedList: 0,
      show: null,
      hide: null,
      autoOpen: false,
      autoResize: false,
      createOnStart: true,//SWDTS00286745
      multiple: true,
      position: {},
      appendTo: "body",
      toolTipLen: 512,//512 is the limit for html title/tooltip
      allSelectedToolTip: "All selected.",
      menuLeft: "right",//SWDTS00269384
      menuToExpand: "down",
      editableName: null,
      isEditable: false,
      accessKey: null,
      onChange: null,
      isItemSelected: false,
      //This variable is added to stop mouse wheel while menu is expanded.
      isMenuExpanded: function() {
    	  return isMenuOpen;
      }
    },

    _create: function() {
      var el = this.element.hide();
      var o = this.options;
      winHeight = $(document).height();
      this.speed = $.fx.speeds._default; // default speed for effects
      this._isOpen = false; // assume no

      // create a unique namespace for events that the widget
      // factory cannot unbind automatically. Use eventNamespace if on
      // jQuery UI 1.9+, and otherwise fallback to a custom string.
      this._namespaceID = this.eventNamespace || ('multiselect' + multiselectID);
      var buttonDivTxt = '<button type="button" style="padding:0;height:20px;"><span class="ui-icon ui-icon-triangle-1-s"></span></button>';
      if (o.isEditable)
      {
    	  buttonDivTxt = '<div style="padding:0;height:20px;"><span class="ui-icon ui-icon-triangle-1-s"></span></div>';
      }
      var button = (this.button = $(buttonDivTxt))
        .addClass('ui-multiselect ui-widget ui-state-default ui-corner-all')
        .addClass(o.classes)
        .attr({ 'title':el.attr('title'), 'aria-haspopup':true, 'tabIndex':el.attr('tabIndex')})
        .insertAfter(el), 
        buttonlabel = (this.buttonlabel = $('<input id="nonSelectedInputID" type="text" tabindex="-1" style= "position:absolute;left:'+(this.button.offset().left - button.width)+'px; border:0; background:transparent;text-overflow:ellipsis" readonly/>')) 
          .val(o.noneSelectedText)
          .addClass('ui-multiselect-buttonlabel')
          .attr({'accesskey': o.accessKey })
          .appendTo(button),
          
        menu = (this.menu = $('<div />'))
          .addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all')
          .addClass(o.classes)
          .appendTo($(o.appendTo)),

        header = (this.header = $('<div />'))
          .addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
          .appendTo(menu),

        headerLinkContainer = (this.headerLinkContainer = $('<ul />'))
          .addClass('ui-helper-reset')
          .html(function() {
            if(o.header === true && o.showSelectAll === false){ //Added for Select All checkBox
              return '<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
            } else if(typeof o.header === "string") {
              return '<li>' + o.header + '</li>';
            } else {
              return '';
            }
          })
          .append((o.header === true && o.showSelectAll === false)?'':'<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
          .appendTo(header),

        checkboxContainer = (this.checkboxContainer = $('<ul />'))
          .addClass('ui-multiselect-checkboxes ui-helper-reset')
          .appendTo(menu);
      

      if (o.isEditable && null != o.editableName)
      {
    	  buttonlabel.val("");
    	  buttonlabel.css({'z-index': '1000', 'text-transform' : 'capitalize'})
    	  .removeAttr('readonly').attr({"tabindex": 0, "name": o.editableName, "placeholder": o.noneSelectedText});
    	  button.attr("tabindex", -1);
      }

        // perform event bindings
        this._bindEvents();

        // build menu
        if (o.createOnStart)//SWDTS00286745
        {
        	this.refresh(true);
        }

        // some addl. logic for single selects
        if(!o.multiple) {
          menu.addClass('ui-multiselect-single');
        }

        // bump unique ID
        multiselectID++;
    },
    //Added for IE9 and above starts
    _resizeBtnWidth: function()
    {
    	 try
         {
   	       var btmW = this.button.width();
   	       var iconW = $(this.button[0].firstChild).width();
   	       this.buttonlabel.width(btmW - iconW - 5);
         }
         catch(e)
         {
       	  //Fail silently
         }
    },
    //Added for IE9 and above ends
    _init: function() {
      //Added for IE9 and above starts
      this._resizeBtnWidth();
      //Added for IE9 and above ends
      if(this.options.header === false) {
        this.header.hide();
      }
      if(!this.options.multiple) {
        this.headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none').hide();
      }
      if(this.options.autoOpen) {
        this.open();
      }
      if(this.element.is(':disabled')) {
        this.disable();
      }
    },
    refresh: function(init) {
      var el = this.element;
      var o = this.options;
      var menu = this.menu;
      var checkboxContainer = this.checkboxContainer;
      var optgroups = [];
      var html = "";
      var id = el.attr('id') || multiselectID++; // unique ID for the label & option tags
      //Added to apply resize of the menu starts
      if(o.autoResize)
      {
    	  checkboxContainer.scrollTop(0).height(0);
      }
      //Added to apply resize of the menu ends
      // build items
      el.find('option').each(function(i) {
        var $this = $(this);
        var parent = this.parentNode;
        var description = this.innerHTML;
        var title = this.title;
        var value = this.value;
        var inputID = 'ui-multiselect-' + (this.id || id + '-option-' + i);
        var isDisabled = this.disabled;
        var isSelected = this.selected;
        var labelClasses = [ 'ui-corner-all' ];
        var liClasses = (isDisabled ? 'ui-multiselect-disabled ' : ' ') + this.className;
        var optLabel;
        // Added Newly for select all starts
        // Select All added to here to 
        // make look and feel same as that of other options
        if(o.header === false && o.showSelectAll === true && i == 0)
        {
        	var sellAllID = "";
        	sellAllID = 'ui-multiselect-' + (this.id || id + '-sell-all-chk');
        	html += '<li class="' + liClasses + '" style="border:0;border-bottom:1pt; border-style:dotted;">';
        	if(isDisabled) 
        	{
                labelClasses.push('ui-state-disabled');
            }
        	if(isSelected && !o.multiple) 
        	{
                labelClasses.push('ui-state-active');
            }
        	html += '<label for="' + sellAllID + '" class="' + labelClasses.join(' ') + '">';
        	html += '<input id="' + sellAllID + '" name="multiselect_' + sellAllID + '" class= "multi-select-all-checkbox" type="checkbox" value="" ';
           	html += ' /><span>' + o.checkAllText + '</span></label></li>';
        }
        // Added Newly for select all ends
        // is this an optgroup?
        if(parent.tagName === 'OPTGROUP') {
          optLabel = parent.getAttribute('label');

          // has this optgroup been added already?
          if($.inArray(optLabel, optgroups) === -1) {
            html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><a href="#">' + optLabel + '</a></li>';
            optgroups.push(optLabel);
          }
        }

        if(isDisabled) {
          labelClasses.push('ui-state-disabled');
        }

        // browsers automatically select the first option
        // by default with single selects
        if(isSelected && !o.multiple) {
          labelClasses.push('ui-state-active');
        }

        html += '<li class="' + liClasses + '">';

        // create the label
        html += '<label for="' + inputID + '" title="' + title + '" class="' + labelClasses.join(' ') + '">';
        html += '<input id="' + inputID + '" name="multiselect_' + id + '" type="' + (o.multiple ? "checkbox" : "radio") + '" value="' + value + '" title="' + title + '"';

        // pre-selected?
        if(isSelected) {
          html += ' checked="checked"';
          html += ' aria-selected="true"';
        }

        // disabled?
        if(isDisabled) {
          html += ' disabled="disabled"';
          html += ' aria-disabled="true"';
        }

        // add the title and close everything off
        html += ' /><span>' + description + '</span></label></li>';
      });

      // insert into the DOM
      checkboxContainer.html(html);
      //SWDTS00262280 start
      if(null!=checkboxContainer && o.multiple)
      {
    	  var checkedLength = checkboxContainer.find("input:checkbox[class!=multi-select-all-checkbox]:checked").length;
    	  var totalLength = checkboxContainer.find("input:checkbox[class!=multi-select-all-checkbox]").length;
    	  if(checkedLength==totalLength)
    	  {
    		  var allCheckBox = checkboxContainer.find("input:checkbox[class=multi-select-all-checkbox]")[0];
    		  if(null!=allCheckBox)
    		  {
    			  allCheckBox.checked="checked";
    		  }
    	  }
      }
    //SWDTS00262280 end
      // cache some moar useful elements
      this.labels = menu.find('label');
      this.inputs = this.labels.children('input');

      // set widths
      this._setButtonWidth();
      this._setMenuWidth();

      // remember default value
      this.button[0].defaultValue = this.update();

      // broadcast refresh event; useful for widgets
      if(!init) {
        this._trigger('refresh');
      }
    },
    setfous: function(){
    	var button = this.button;
    	if(!button.hasClass('ui-state-disabled')) {
    		button.addClass('ui-state-focus');
    		if (this.options.isEditable)
    		{
    			this.buttonlabel.focus();
    		}
    		else
    		{
    			button.focus();
    		}
          }
    },
    isDisable: function(){
    	var button = this.button;
    	return button.hasClass('ui-state-disabled');
    },
    // updates the button text. call refresh() to rebuild
    update: function() {
      var o = this.options;
      var $inputs = this.inputs;
      var $checked = $inputs.filter(':checked');
      var numChecked = $checked.length;
      var value;
      var tooltip = "";
      var bAllSelected = false;
      var selAllChkBox = false;
      if(numChecked === 0) {
        value = o.noneSelectedText;
      } else {
        if($.isFunction(o.selectedText)) {
          value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
        }
        else if(o.selectedText == "codesOnly") {
        	/* This new code for only showing the code-starts*/
        	var textCodes = [];
        	var codeDesc = [];
        	$checked.each(function(){
        		selAllChkBox = $(this).hasClass('multi-select-all-checkbox');
        		if( selAllChkBox || $(this).val() == '' )
        	    {
        			if( selAllChkBox )
        			{
        				bAllSelected = true;
        			}
        			return;
        	    }
        		if( !bAllSelected )
        		{
        			codeDesc.push($(this)[0].parentNode.innerText);
        		}
        		textCodes.push($(this)[0].value);
        	});
        	value = textCodes.join(", ");
        	if(bAllSelected)
        	{
        		tooltip = o.allSelectedToolTip;
        	}
        	else
        	{
        		tooltip = codeDesc.join(", ");
        		if( tooltip.length > o.toolTipLen )
        		{
        			tooltip = tooltip.substring( 0, o.toolTipLen - 6 ) + "...";//Adding elipses if length exceeds
        		}
        	}
        	/* This new code for only showing the code - ends*/
          } 
        else if(/\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList) {
          value = $checked.map(function() { return $(this).next().html(); }).get().join(', ');
        } else {
          value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
        } 
      }
      this.button[0].tooltip = tooltip;
      this._setButtonValue(value);
      if(value != o.noneSelectedText) {
    	  o.isItemSelected = true;
      } else {
    	  o.isItemSelected = false;
      }
      return value;
    },

    // this exists as a separate method so that the developer 
    // can easily override it.
    _setButtonValue: function(value) {
    	if (this.options.isEditable)
    	{
			if (value == this.options.noneSelectedText)
			{
				this.buttonlabel.css("text-transform", "");
			}
			else
			{
				this.buttonlabel.css("text-transform", "capitalize");
			}
    	}
      this.buttonlabel.val(value);
    },

    // binds events
    _bindEvents: function() {
      var self = this;
      var button = this.button;

      function clickHandler() {
        self[ self._isOpen ? 'close' : 'open' ]();
        return false;
      }

      // webkit doesn't like it when you click on the span :(
      button
        .find('span')
        .bind('click.multiselect', clickHandler);
      var o = self.options;
      if (o.isEditable)
      {
    	  this.buttonlabel.bind({
      	  	focus: function(e) 
      	  	{
  	  			setTimeout(function()
  	  			{
  	  				if($.trim(self.buttonlabel.val()) == self.options.noneSelectedText)
        	  		{
        	  			self.buttonlabel.val("");
        	  		}
  	  			}, 50);
      	  	},
      	  	click: function(e) 
      	  	{
      	  	   self.open();
      	  	},
      	  	change: function(e) 
      	  	{
  	  			self.close();
      	  	},
      	  	blur: function(e) 
      	  	{
	      	  	if($.trim(self.buttonlabel.val()) == "")
		  		{
		  			self.buttonlabel.val(self.options.noneSelectedText);
		  		}
      	  	},
      	  	keyup: function(e) 
      	  	{
      	  	  switch(e.which) 
      	  	  {
      	  	  	case 9: // tab
      	  	  	case 27: // esc
                case 38: // up
                  self.close();
                  break;
                case 40: // down
                  self.open();
                  break;
                default:
                  self.matchKeyTyped(self.buttonlabel.val());
	          	  setTimeout(function()
	  			  {
	          		   if (typeof(self.inputs) == "undefined" || self.inputs == null)	    	          		   
          			   {
	          			 self.open();
	          			 self.buttonlabel.focus();
          			   }
	  			  }, 50);
                break;
      	  	  }
      	  	}
      	  });
      }
      else
      {
    	  this.buttonlabel.bind({
              blur: function(e) {
            	  button.focus();
              }});
      }
      
      
      // button events
      this.menu.bind({
          /*keyup: function(e) {
            switch(e.which) {
              case 27: // esc
                case 37: // left
                self.close();
                e.stopPropagation();
                e.preventDefault();
              break;
            }
          }*/
    	  onblur: function(e) {
    		  self.close();
            },
    	  keydown: function(e) {
    		  isMenuActive = true;
    		  var stopProp = false;
              switch(e.which) {
                case 27: // esc
                  case 37: // left
                  case 9:
                  self.close();
                  button.focus();
                  stopProp = true;
                break;
                default:
                	if (!o.isEditable)
                	{
                		self.autoSelect(e); //Added for auto select first character
                	}
	            break;
              }
              if(stopProp)
              {
            	  e.stopPropagation();
                  e.preventDefault();
                  return false;
              }
            }
      });
      button.bind({
    	click: function(e)
    	{
    		if (!o.isEditable)
    		{
    			return clickHandler();
    		}
    	},
        keydown: function(e) {
          var stopProp = false;
          switch(e.which) {
          	  case 37: // left
          		if (o.isEditable)
            	{
            		break;
            	}
              case 38: // up 
              stopProp = true;
              self.close();
              button.focus();
            break;
            case 27: // esc
            	self.close();
            	button.focus();
            	break;
            case 39: // right
            	if (o.isEditable)
            	{
            		break;
            	}
            case 40: // down
              self.open();
              stopProp = true;
              break;
            default: 
            	if (!o.isEditable)
            	{
            		self.autoSelect(e); //Added for auto select first character
            	}
            break;
          }
          if(stopProp)
          {
        	  e.stopPropagation();
              e.preventDefault();
              return false;
          }
        },
        mouseenter: function() {
          if(!button.hasClass('ui-state-disabled')) {
        	if (!o.isEditable)
          	{
        		$(this).addClass('ui-state-hover');
          	}
          }
          //Added for multiselect tooltip starts
          var tooltip = button[0].tooltip;
          if(typeof(showTip) == "function" && typeof(tooltip) != "undefined" && tooltip != null && $.trim(tooltip) != "")
          {
        	  try
        	  {
        		  showTip(tooltip);
        	  }
        	  catch(e)
        	  {
        		  //fail silently
        		  button[0].title = tooltip;
        	  }
          }
          else if(typeof(tooltip) != "undefined" && tooltip != null)
          {
        	  button[0].title = tooltip;
          }
          else
    	  {
        	  button[0].title = "";
    	  }
          //Added for multiselect tooltip ends
        },
        mouseleave: function() {
          $(this).removeClass('ui-state-hover');
          //Added for multiselect tooltip starts
          if(typeof(hideTip) == "function")
          {
        	  try
        	  {
        		  hideTip();
        	  }
        	  catch(e)
        	  {
        		  //fail silently
        	  } 
          }
          //Added for multiselect tooltip ends
        },
        focus: function() {
          if(!button.hasClass('ui-state-disabled')) {
            $(this).addClass('ui-state-focus');
          }
          if (o.isEditable)
          {
        	  self.buttonlabel.focus();
          }
        },
        blur: function() {
          $(this).removeClass('ui-state-focus');
        }
      });

      // header links
      this.header.delegate('a', 'click.multiselect', function(e) {
        // close link
        if($(this).hasClass('ui-multiselect-close')) {
          self.close();

          // check all / uncheck all
        } else {
          self[$(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll']();
        }

        e.preventDefault();
      });

      // optgroup label toggle support
      this.menu.delegate('li.ui-multiselect-optgroup-label a', 'click.multiselect', function(e) {
        e.preventDefault();

        var $this = $(this);
        var $inputs = $this.parent().nextUntil('li.ui-multiselect-optgroup-label').find('input:visible:not(:disabled)');
        var nodes = $inputs.get();
        var label = $this.parent().text();

        // trigger event and bail if the return is false
        if(self._trigger('beforeoptgrouptoggle', e, { inputs:nodes, label:label }) === false) {
          return;
        }

        // toggle inputs
        self._toggleChecked(
          $inputs.filter(':checked').length !== $inputs.length,
          $inputs
        );

        self._trigger('optgrouptoggle', e, {
          inputs: nodes,
          label: label,
          checked: nodes[0].checked
        });
      })
      .delegate('label', 'mouseenter.multiselect', function() {
        if(!$(this).hasClass('ui-state-disabled')) {
          self.labels.removeClass('ui-state-hover');
          $(this).addClass('ui-state-hover').find('input').focus();
        }
      })
      .delegate('label', 'keydown.multiselect', function(e) {
        e.preventDefault();

        switch(e.which) {
          case 9: // tab
            case 27: // esc
            self.close();
          break;
            case 37: // left
            case 39: // right
            	if (o.isEditable)
            	{
            		break;
            	}
            case 38: // up
            case 40: // down
            self._traverse(e.which, this);
          break;
          case 32: // space
          case 13: // enter
            $(this).find('input')[0].click();
          break;
        }
      })
      .delegate('input[type="checkbox"], input[type="radio"]', 'click.multiselect', function(e) {
        var $this = $(this);
        var val = this.value;
        var checked = this.checked;
        var tags = self.element.find('option');

        // bail if this input is disabled or the event is cancelled
        if(this.disabled || self._trigger('click', e, { value: val, text: this.title, checked: checked }) === false) {
          e.preventDefault();
          return;
        }

        //Added for multi select all
        if($this.hasClass('multi-select-all-checkbox'))
        {
	         if(checked)
	         {
	        	 self.checkAll();
	         }
	         else
	         {
	        	 self.uncheckAll();
	         }   
        }
        else
        {
        	self.checkOrUncheckAll(checked);
        }
        //Added for multi select all
        // make sure the input has focus. otherwise, the esc key
        // won't close the menu after clicking an item.
        $this.focus();

        // toggle aria state
        $this.attr('aria-selected', checked);

        // change state on the original option tags
        tags.each(function() {
          if(this.value === val) {
            this.selected = checked;
          } else if(!self.options.multiple) {
            this.selected = false;
          }
        });

        // some additional single select-specific logic
        if(!self.options.multiple) {
          self.labels.removeClass('ui-state-active');
          $this.closest('label').toggleClass('ui-state-active', checked);

          // close menu
          self.close();
        }

        // fire change on the select box
        self.element.trigger("change");

        // setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
        // http://bugs.jquery.com/ticket/3827
        setTimeout($.proxy(self.update, self), 10);
      });

      // close each widget when clicking on any other element/anywhere else on the page
      $doc.bind('mousedown.' + this._namespaceID, function(event) {
        var target = event.target;

        if(self._isOpen
            && target !== self.button[0]
            && target !== self.menu[0]
            && !$.contains(self.menu[0], target)
            && !$.contains(self.button[0], target)
          ) {
          self.close();
        }
      });
      // deal with form resets.  the problem here is that buttons aren't
      // restored to their defaultValue prop on form reset, and the reset
      // handler fires before the form is actually reset.  delaying it a bit
      // gives the form inputs time to clear.
      $(this.element[0].form).bind('reset.multiselect', function() {
        setTimeout($.proxy(self.refresh, self), 10);
      });
    },
    //Added for select all checkbox
    checkOrUncheckAll:function(bChecked){
	     var $inputs = this.inputs;
	     var $checked = $inputs.filter(':checked');
	     var numOption = $inputs.length;
	     var numChecked = $checked.length;
	     var bCheckAllChkBox = false;
	     if(numOption == (numChecked + 1))
	     {
	    	 bCheckAllChkBox = true;
	     }
	     if(bChecked && bCheckAllChkBox)
	     {
	    	$inputs.each(function()
	    	{
	    		 if($(this).hasClass('multi-select-all-checkbox'))
	    		 {
	    			 $(this)[0].checked = true;
	    			 return false;
	    		 }
	    	});
	     }
     	else
     	{
     		$checked.each(function()
     		{
     			if($(this).hasClass('multi-select-all-checkbox'))
     			{
     				if(!bChecked)
     				{
     					$(this)[0].checked = false;
     					return false;
     				}
     			}
     		});
     	}
    },
    // set button width
    _setButtonWidth: function() {
      var width = this.element.outerWidth();
      var o = this.options;

      if(/\d/.test(o.minWidth) && width < o.minWidth) {
        width = o.minWidth;
      }

      // set widths of button
      this.button.outerWidth(width);
      // set width of button label
      this.buttonlabel.outerWidth(width-23);
    },

    // set menu width
    _setMenuWidth: function() {
      var m = this.menu;
      if(!this.options.autoResize)
      {
    	  m.outerWidth(this.button.outerWidth());
    	  m.css("height",this.options.height+"px");
    	  m.css("width",this.options.menuWidth+"px");
      }
      else
      {
    	  if(!this.options.menuWidth)
    	  {
    		  m.outerWidth(this.button.outerWidth() + 10);
    	  }
    	  else
    	  {
    		  m.css("width",this.options.menuWidth+"px");
    	  }
      }
      
    },

    // move up or down within the menu
    _traverse: function(which, start) {
      var $start = $(start);
      var moveToLast = which === 38 || which === 37;

      // select the first li that isn't an optgroup label / disabled
      var $next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)').first();

      // if at the first/last element
      if(!$next.length) {
        var $container = this.menu.find('ul').last();

        // move to the first/last
        this.menu.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');

        // set scroll position
        $container.scrollTop(moveToLast ? $container.height() : 0);

      } else {
        $next.find('label').trigger('mouseover');
      }
    },

    // This is an internal function to toggle the checked property and
    // other related attributes of a checkbox.
    //
    // The context of this function should be a checkbox; do not proxy it.
    _toggleState: function(prop, flag) {
      return function() {
        if(!this.disabled) {
          this[ prop ] = flag;
        }

        if(flag) {
          this.setAttribute('aria-selected', true);
        } else {
          this.removeAttribute('aria-selected');
        }
      };
    },

    _toggleChecked: function(flag, group) {
      var $inputs = (group && group.length) ?  group : this.inputs;
      var self = this;

      // toggle state on inputs
      $inputs.each(this._toggleState('checked', flag));

      // give the first input focus
      $inputs.eq(0).focus();

      // update button text
      this.update();

      // gather an array of the values that actually changed
      var values = $inputs.map(function() {
        return this.value;
      }).get();
      
      // toggle state on original option tags
      this.element
        .find('option')
        .each(function() {
          if(!this.disabled && $.inArray(this.value, values) > -1) {
            self._toggleState('selected', flag).call(this);
          }
        });

      // trigger the change event on the select
      if($inputs.length) {
        this.element.trigger("change");
      }
    },

    _toggleDisabled: function(flag) {
      this.button.attr({ 'disabled':flag, 'aria-disabled':flag })[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');
	  this.buttonlabel.attr({'disabled': flag});
      var inputs = this.menu.find('input');
      var key = "ech-multiselect-disabled";

      if(flag) {
        // remember which elements this widget disabled (not pre-disabled)
        // elements, so that they can be restored if the widget is re-enabled.
        inputs = inputs.filter(':enabled').data(key, true)
      } else {
        inputs = inputs.filter(function() {
        	if($.data(this, key)) return $.data(this, key) === true;
        	return true;
        }).removeData(key);
      }

      inputs
        .attr({ 'disabled':flag, 'arial-disabled':flag })
        .parent()[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

      this.element.attr({
        'disabled':flag,
        'aria-disabled':flag
      });
    },

    // open the menu
    open: function(e) {
      var self = this;
      var button = this.button;
      var menu = this.menu;
      var speed = this.speed;
      var o = this.options;
      var args = [];
      isMenuOpen = true;
      // bail if the multiselectopen event returns false, this widget is disabled, or is already open
      if(this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen) {
        return;
      }
      
      if (self.loaded != true && o.createOnStart === false)//SWDTS00286745
      {
    	  self.refresh(true);
    	  self.loaded = true;
      }
     //CQ-SWDTS00285393
      if (o.isEditable)
      {
    	  var valueSel = this.buttonlabel.val();
    	  self.refresh(false);
    	  this.buttonlabel.val(valueSel);
      }
      var $container = menu.find('ul').last();
      var effect = o.show;

      // figure out opening effects/speeds
      if($.isArray(o.show)) {
        effect = o.show[0];
        speed = o.show[1] || self.speed;
      }

      // if there's an effect, assume jQuery UI is in use
      // build the arguments to pass to show()
      if(effect) {
        args = [ effect, speed ];
      }

      // set the scroll of the checkbox container
      if(!o.autoResize)
      {
          $container.scrollTop(0).height(o.height);
      }

      if(o.menuToExpand==='down')
      {
    	  // positon
    	  this.position();
      }
      
      // show the menu, maybe with a speed/effect combo
      $.fn.show.apply(menu, args);
      if(o.autoResize)
      {
	      var selfTop = $container.offset().top;
	      var containerH = $container.scrollTop(0).height();
	      var wasZeroContH = false;
	      //Added for IE9 and above starts
	      if(containerH <= 0)
	      {
	    	  containerH = $container[0].scrollHeight;
	    	  wasZeroContH = true;
	      }
	      //Added for IE9 and above ends
	      var avilableHeight = winHeight - selfTop - 30;
	      if(o.menuToExpand==='down')
	      {
	    	  if(avilableHeight < containerH && avilableHeight > 0)
	    	  {
	    		  $container.scrollTop(0).height(avilableHeight);
	    	  }
	    	  //Added for IE9 and above starts
	    	  else if(wasZeroContH)
	    	  {
	    		  $container.scrollTop(0).height(containerH);	    	  
	    	  }
	    	  //Added for IE9 and above ends
	      }
	      else
	      {
	    	  avilableHeight = this.button.offset().top -30;
	    	  if (containerH < avilableHeight && containerH > 0)
	    	  {
	    		  $container.scrollTop(0).height(containerH);
	    	  }
	    	  else
	    	  {
	    		  $container.scrollTop(0).height(avilableHeight);	    		  
	    	  }
	      }
      }
      
      if(o.menuToExpand==='up')
      {
    	  // positon
    	  this.position();
      }
      
      // select the first not disabled option
      // triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
      // will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
      this.labels.filter(':not(.ui-state-disabled)').eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

      button.addClass('ui-state-active');
      this._isOpen = true;
      this._trigger('open');
    },

    // close the menu
    close: function() {
      if(this._trigger('beforeclose') === false) {
        return;
      }

      var o = this.options;
      var effect = o.hide;
      var speed = this.speed;
      var args = [];

      // figure out opening effects/speeds
      if($.isArray(o.hide)) {
        effect = o.hide[0];
        speed = o.hide[1] || this.speed;
      }

      if(effect) {
        args = [ effect, speed ];
      }

      $.fn.hide.apply(this.menu, args);
      this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
      this._isOpen = false;
      this._trigger('close');
      if (!o.isEditable)
      {
    	  this.button.focus();
      }
      isMenuOpen = false;
      if(typeof o.onChange == 'function') {
	  o.onChange(o.isItemSelected);
      }
    },

    enable: function() {
      this._toggleDisabled(false);
    },

    disable: function() {
      this._toggleDisabled(true);
    },

    checkAll: function(e) {
      this._toggleChecked(true);
      this._trigger('checkAll');
    },

    uncheckAll: function() {
      this._toggleChecked(false);
      this._trigger('uncheckAll');
    },

    getChecked: function() {
      return this.menu.find('input').filter(':checked');
    },
    getAll: function() {
        return this.menu.find('input');
      },

    destroy: function() {
      // remove classes + data
      $.Widget.prototype.destroy.call(this);

      // unbind events
      $doc.unbind(this._namespaceID);

      this.button.remove();
      this.menu.remove();
      this.element.show();

      return this;
    },

    isOpen: function() {
      return this._isOpen;
    },

    widget: function() {
      return this.menu;
    },

    getButton: function() {
      return this.button;
    },

    position: function() {
      var o = this.options;

      // use the position utility if it exists and options are specifified
      if($.ui.position && !$.isEmptyObject(o.position)) {
        o.position.of = o.position.of || this.button;

        this.menu
          .show()
          .position(o.position)
          .hide();

        // otherwise fallback to custom positioning
      } else {
        var pos = this.button.offset();

        if(o.menuToExpand==='down')
        {
        	var diffW = 0;
        	//SWDTS00269384 starts
        	if(o.menuLeft==='left')
	        {
	        	var menuW = this.menu.outerWidth();
	        	var btmW = this.button.outerWidth();
	        	var diffW = menuW - btmW;
	        	if(diffW < 0)
	        	{
	        		diffW = 0;
	        	}
	        }
        	//SWDTS00269384 ends
        	
	        this.menu.css({
	          top: pos.top + this.button.outerHeight(),
	          left: pos.left - diffW
	        });
        }
        else
        {
        	this.menu.css({ 
        		top: pos.top - this.menu.outerHeight(),        
        		left: pos.left        
        	});
        }
      }
    },

    // react to option changes after initialization
    _setOption: function(key, value) {
      var menu = this.menu;

      switch(key) {
        case 'header':
          menu.find('div.ui-multiselect-header')[value ? 'show' : 'hide']();
          break;
        case 'checkAllText':
          menu.find('a.ui-multiselect-all span').eq(-1).text(value);
          break;
        case 'uncheckAllText':
          menu.find('a.ui-multiselect-none span').eq(-1).text(value);
          break;
        case 'height':
          menu.find('ul').last().height(parseInt(value, 10));
          break;
        case 'minWidth':
          this.options[key] = parseInt(value, 10);
          this._setButtonWidth();
          this._setMenuWidth();
          break;
        case 'selectedText':
        case 'selectedList':
        case 'noneSelectedText':
          this.options[key] = value; // these all needs to update immediately for the update() call
          this.update();
          break;
        case 'classes':
          menu.add(this.button).removeClass(this.options.classes).addClass(value);
          break;
        case 'multiple':
          menu.toggleClass('ui-multiselect-single', !value);
          this.options.multiple = value;
          this.element[0].multiple = value;
          this.refresh();
          break;
        case 'position':
          this.position();
      }

      $.Widget.prototype._setOption.apply(this, arguments);
    },
    
    //Added for auto select first character starts
    autoSelect : function(e){
    var o = this.options;
    var charCode = String.fromCharCode(e.keyCode).toUpperCase();
    var labels = this.menu.find('label');
    var len = labels.length;
	if(!this._isOpen || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 
			|| e.keyCode == 39 || e.keyCode == 32  || e.keyCode == 13)
	{
		return;
	}
	//First gets the index of the option for the typed character
	for(var i=0; i<len; i++)
	{
		var labelVal = labels[i].innerText;
		if(labelVal != o.selectedText && labelVal != o.noneSelectedText && labelVal != "Select All" 
			&& labelVal.substring(0,1).toUpperCase() == charCode)
		{	
			this.menu.find('label').removeClass('ui-state-hover');
			hoverLabel = labels[i];
			if(null != hoverLabel)
			{
				//If any option/item found, scroll to that item and change the style class for that	
				//hoverLabel.scrollIntoView();
				var jObject = $(hoverLabel);
			  	jObject.trigger('mouseover');
				hoverLabel.className = hoverLabel.className + " ui-state-hover";
			}
			break;
		}
	}
  },
  //Added for auto select first character ends
  //CQ-SWDTS00285393
  matchKeyTyped : function(txt)
  {
	    var currVal = this.buttonlabel.val();
	    if (txt == currVal)
	    {
    		var optns = currVal.replace(/\s/g,'').toUpperCase().split(",");
	    	this.close();
	    	this.element.val(optns);
	    } 
	 }
  });
})(jQuery);
