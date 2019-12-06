/**
 * Copyright (c) 2003-2014 Starwood Hotels & Resorts. All rights reserved Copyright (c) 2003-2014 Galaxy Hotel Systems.
 * All rights reserved
 * 
 * @author stevmai
 * @since 07/25/2014
 * 
 * Helps create a custom group multi-select dropdown. This is used in conjunction with the jquery multiselect library. A
 * dropdown list with a subgroup may be created. This is a separate item in the options list which can be selected. When
 * it is selected all items are selected in that group. When it is unselected all items are unselected in that group.
 * The options listed is backed by a json object array which is updated to reflected all changes to the dropdown options
 * list.
 * <p>
 * 
 * The jsonArray must be structured as follows (example): <code>
 *		[
 *			{ 
 *			  "code": "LWR",
 *			  "desc": "Lower Floor",
 *			  "type": "spg"
 *			 },
 *			{ 
 *			  "code": "ACC",
 *			  "desc": "AccessibleRM.",
 *			  "type": ""
 *			 },
 *			{
 *			  "code": "50MN",
 *			  "desc": "50 Min Spa Massg",
 *			  "type": ""
 *			 }
 *		]
 * </code>
 * <p>
 * Dropdown will use "code" as the option value and create the option list text value in the following format "code" -
 * "desc". (without quotes). The "type" key is used to identify if the option item is part of the subgroup.
 * <p>
 * If array is empty, the multiselect control will be disabled.
 * <p>
 * Use multiselect property 'selectedText', setting it to 'removeGrpCodes' if you wish to remove the grp codes from
 * the displayed selected text.  Currently handles only one group code.
 * <p>
 * To retrieve the values selected by the multiselect dropdown without getting the additional custom group code
 * you must do the following ...
 * 
 * <pre>
 * 	var ssrMulti = $("#multiselect_id").multiselect("getChecked").map(function(){
		if(this.value !== "GRP CODE")
			return this.value;
	}).get();
 * </pre>
 * 
 * 
 * @constructor
 * @param {object[]}
 *            jsonArray - Pre-filled object array that represents the options list, including subgroup items but not the
 *            subgroup checkbox item itself. Will be cloned.
 * @param {string}
 *            multiSelectId - div id of multiselect widget
 * @param {string}
 *            code - Custom option code value to be added to backing json object array
 * @param {string}
 *            desc - Custom option description value to be added to backing json object array
 * @param {string}
 *            grpType - an indicator value that determines if an item is part of the custom group
 * @returns {CustomGrpMultiSelect}
 */

/*
 * group custom code value - used to compare values set in selectedText property
 * of multiselect js code.
 */
var gCustOpCodeValue = "";

function CustomGrpMultiSelect(jsonArray, multiSelectId, code, desc, grpType)
{

	// private variables
	this.selectId = multiSelectId;
	this.custOpCodeValue = code;
	this.grpType = grpType;
	
	// global variables
	gCustOpCodeValue = code;
	
	/*
	 * Clone the array so there are no side-effects from reusing the same array with other multi-selects. Clone is valid
	 * only for these simple type of object arrays.
	 */
	this.jsonObjectArray = clone(jsonArray);

	/*
	 * Initializes the backing array before the multiselect is created. Specifically this adds the new subgroup to the
	 * options list. The new subgroup comes from the 'code' and 'desc' values provided by the constructor arguments.
	 */
	this.init = function()
	{
		if ((this.jsonObjectArray !== undefined) && (this.jsonObjectArray !== null)
				&& (this.jsonObjectArray.length !== 0))
		{
			// Adds the new subgroup checkbox item to the json backing array.
			this.jsonObjectArray = CustomGrpMultiSelect.prototype.addCustomOptionsGrp(this.jsonObjectArray, code, desc, grpType);

			// Create options list from json array
			CustomGrpMultiSelect.prototype.createOptionsFromJson(this.jsonObjectArray, multiSelectId, false);
		}
	};

	/**
	 * Must be called AFTER the multiselect is created. This function binds the various events to the multiselect
	 * dropdown.
	 */
	this.bindEvents = function()
	{
		if ((this.jsonObjectArray === undefined) || (this.jsonObjectArray === null)
				|| (this.jsonObjectArray.length === 0))
		{
			// disable control if json object is empty
			$("#" + this.selectId).multiselect("disable");
		}

		/*
		 * Event executed when any option is toggled in the multiselect dropdown. The multiselect dropdown options are
		 * backed by an object array. This array is updated first then the array is used to create the options list.
		 */
		$("#" + this.selectId)
				.bind(
						"multiselectclick",
						{
							arrayInstance : this.jsonObjectArray,
							selectId : this.selectId,
							custOpCodeValue : this.custOpCodeValue,
							grpType : this.grpType
						},
						function(event, ui)
						{

							// get data properties from event passed in
							var arrayInstance = event.data.arrayInstance;
							var selectId = event.data.selectId;
							var custOpCodeValue = event.data.custOpCodeValue;
							var grpType = event.data.grpType;

							if (ui.value === custOpCodeValue)
							{
								/*
								 * Executed when toggling the subgroup checkbox. If type is checked - select all codes
								 * that are of that type If type is unchecked - unselect all codes that are of that type
								 */
								CustomGrpMultiSelect.prototype.updateOptionsInMultiSelect(arrayInstance, selectId,
										grpType, ui.checked);
							}
							else
							{
								/*
								 * Executed when toggling something other than subgroup checkbox
								 */
								// get type of option that was toggled
								var typeValue = CustomGrpMultiSelect.prototype.searchJsonArray(arrayInstance, "code",
										ui.value, "type");

								var arrLen = arrayInstance.length
								for ( var i = 0; i < arrLen; i++)
								{
									// run through backing array and update the
									// item that was toggled
									if (arrayInstance[i].code === ui.value)
									{
										arrayInstance[i].selected = !arrayInstance[i].selected;
										break;
									}
								}

								/*
								 * If it was a sub-group checkbox that was toggled, ensure the proper state of all of
								 * the sub-group's type.
								 */
								if (typeValue === grpType)
								{
									var isAllSpgOptionsSelected = true;
									var spgCheckBoxIndex = 0;

									var arrLen = arrayInstance.length;
									for ( var i = 0; i < arrLen; i++)
									{
										if(arrayInstance[i].code === custOpCodeValue)
										{
											/*
											 * subgroup item has been found, remember location
											 */
											spgCheckBoxIndex = i;
										}
										
										if ((i === spgCheckBoxIndex) && (arrayInstance[i].selected === true))
										{
											/*
											 * subgroup item has been found, unselect it because
											 * you've just unselected an item from that subgroup
											 */
											arrayInstance[i].selected = false;
											
										}

										if ((arrayInstance[i].type === grpType)
												&& (isAllSpgOptionsSelected) && (i !== spgCheckBoxIndex)
												&& ((arrayInstance[i].selected === false) || (arrayInstance[i].selected === undefined)))
										{
											isAllSpgOptionsSelected = false;
										}
									}

									if (isAllSpgOptionsSelected)
									{
										arrayInstance[spgCheckBoxIndex].selected = true;
									}

									// done - create options from backing array
									CustomGrpMultiSelect.prototype.createOptionsFromJson(arrayInstance, selectId, true);
								}
							}
						});

		/**
		 * Event executed when check All selection is made. This updates the backing array's selected value to true.
		 */
		$("#" + this.selectId).bind("multiselectcheckall",
		{
			jsonObjectArray : this.jsonObjectArray,
			selectId : this.selectId
		}, function(event, ui)
		{

			var jsonObjectArray = event.data.jsonObjectArray;
			var selectId = event.data.selectId;

			$("#" + selectId + " option").each(function(index, value)
			{
				var arrLen = jsonObjectArray.length;
				for ( var i = 0; i < arrLen; i++)
				{
					jsonObjectArray[i].selected = true;
				}
			});
		});

		/**
		 * Event executed when uncheck All selection is made. This updates the backing array's selected value to false.
		 */
		$("#" + this.selectId).bind("multiselectuncheckall",
		{
			jsonObjectArray : this.jsonObjectArray,
			selectId : this.selectId
		}, function(event, ui)
		{

			var jsonObjectArray = event.data.jsonObjectArray;
			var selectId = event.data.selectId;

			$("#" + selectId + " option").each(function(index, value)
			{
				var arrLen = jsonObjectArray.length;
				for ( var i = 0; i < arrLen; i++)
				{
					jsonObjectArray[i].selected = false;
				}
			});
		});

	}

	/**
	 * Search an object array for a specific key/value pair. The key/value pair will identify the specific index of
	 * interest. At which point the value of the keyValueToReturn key will be returned.
	 * <p>
	 * Usage:
	 * <p>
	 * <code>
	 *		array: [{"code":"s10", "desc":"3,500 Star Points", "type":""},{"code":"FAN", "desc":"Guest request fan in room.", "type":"spg"}]
	 *		call:  searchJsonArray(array, "code", "FAN", "type") will return 'spg'
	 *  </code>
	 * 
	 * @param {Object[]}
	 *            objArray - object array to search
	 * @param {string}
	 *            key - key to search for
	 * @param {string}
	 *            value - value to search for, used with key
	 * @param {string}
	 *            keyValueToReturn - key whose value will be returned
	 * @returns {string}
	 */
	CustomGrpMultiSelect.prototype.searchJsonArray = function(objArray, key, value, keyValueToReturn)
	{
		if ((objArray !== undefined) && (objArray !== null))
		{
			var arrLen = objArray.length
			for ( var i = 0; i < arrLen; ++i)
			{
				var elem = objArray[i];
				if (elem[key] === value)
				{
					return elem[keyValueToReturn];
				}
			}
		}
	}

	/**
	 * Updates the backing array, creates the html options, refreshes the multiselect widget.
	 * 
	 * @param {object[]}
	 *            objArray - object array to search
	 * @param {string}
	 *            selectId - id of html div of multiselect widget
	 * @param {string}
	 *            grpType - type of group option is part of, used to determine if this will be toggled
	 * @param {boolean}
	 *            isChecked - boolean value to be set on optionValue and type
	 */
	CustomGrpMultiSelect.prototype.updateOptionsInMultiSelect = function(objArray, selectId, grpType,
			isChecked)
	{
		$.each(objArray, function(i, val)
		{

			if (objArray[i].type === grpType)
			{
				objArray[i].selected = isChecked;
			}
		});

		CustomGrpMultiSelect.prototype.createOptionsFromJson(objArray, selectId, true);
	}

	/**
	 * Add options to customGrpMultiSelect from the json backing array and refreshes the multi-select widget.
	 * 
	 * @param {object[]}
	 *            objArray - object array to search
	 * @param {string}
	 *            selectId - id of html div of multiselect widget
	 * @param {boolean}
	 *            refresh - boolean value to refresh the multiselect widget (use true only after its been initialized)
	 */
	CustomGrpMultiSelect.prototype.createOptionsFromJson = function(objArray, selectId, refresh)
	{
		var $select = $('#' + selectId);
		$select.find("option").remove();

		$.each(objArray, function(i, val)
		{
			var v = objArray[i].code;
			var txt = objArray[i].code + " - " + objArray[i].desc;
			var sel = objArray[i].selected;

			if (sel)
			{
				$select.append($('<option />',
				{
					value : v,
					text : txt,
					selected : true
				}));
			}
			else
			{
				$select.append($('<option />',
				{
					value : v,
					text : txt
				}));
			}
		});

		if (refresh)
		{
			$("#" + selectId).multiselect("refresh");
		}
	}

	/**
	 * Adds a custom options group to the beginning of the backing array.  This group has with it
	 * a type that shared with its other subgroup members.
	 * <p>
	 * Backing array format
	 * <p>
	 * <code>
	 *		[{code, desc, type, selected}]
	 * 		code - used in value of select options
	 *		desc - used in text of select options
	 *		type - used to determine if part of a group to be selected or not
	 *		selected - boolean flag indicating if its checked or not
	 * </code>
	 * 
	 * @param {object[]}
	 *            objArray - object array to add group option to
	 * @param {string}
	 *            codeValue - value to be added for the new group option
	 * @param {string}
	 *            descValue - text to be added for the new group option
	 * @param {string} grpType - an indicator value that determines if an item is part of the custom group 
	 * @returns {object[]}
	 */
	CustomGrpMultiSelect.prototype.addCustomOptionsGrp = function(objArray, codeValue, descValue, grpType)
	{

		var newItem =
		[
		{
			code : codeValue,
			desc : descValue,
			type : grpType
		} ];

		return newItem.concat(objArray);
	}

	/**
	 * Clone for simple object arrays. Replace if you find something better.
	 * 
	 * @param {object[]}
	 *            obj Object to clone (works with Array, Object)
	 * @returns {object[]}
	 * @throws {Error}
	 */
	function clone(obj)
	{
		if (null == obj || "object" != typeof obj)
			return obj;

		if (obj instanceof Array)
		{
			var copy = [];
			for ( var i = 0, len = obj.length; i < len; i++)
			{
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		if (obj instanceof Object)
		{
			var copy = {};
			for ( var attr in obj)
			{
				if (obj.hasOwnProperty(attr))
					copy[attr] = clone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

}

/**
 * Function that may be used when setting the 'selectedText' property of a multiselect dropdown.
 * Using this function for this property will remove the given custom group code provided
 * in the constructor.  Without calling using this function, the default of displaying all
 * codes, even the group code, will be used.
 * 
 * Set function to be called with the multiselect property above, but function is called from multiselect lib.
 *  
 * @param multiSelObj
 * @param numChecked
 * @param selChkBoxes
 * @param checked
 * @returns
 */
function removeGrpCodes(multiSelObj, numChecked,selChkBoxes, checked)
{
	var selArr = [];
	var finalText = null;
	if(null != typeof(selChkBoxes))
	{
		for( var i= 0; i < selChkBoxes.length ; i++ )
		{
			if( selChkBoxes[i].value != gCustOpCodeValue )
			{
				selArr.push(selChkBoxes[i].value);
			}
		}
		finalText = selArr.join(", ");
		if(finalText.substring(0, 1) == ',')
		{
			finalText = finalText.substring(2);
		}
	}
	return finalText;
}

