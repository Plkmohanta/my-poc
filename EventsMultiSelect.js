
/**
 * LSPMS-1709 - Revert changes promoted for VIP levels - remove this file
 * 
 * Adds event to a jquery multi-select for VIP options.  The OBOP
 * project needs to replace only the display value of the PSPG code
 * to 'PMBV'.
 * 
 * Add the class of "vip-multiselect" to the HTML select element of
 * a multiselect control.
 * 
 * Example:
 * blockedRoomChart.jsp
 * <select class="comboClas vip-multiselect" id="vipType" multiple="multiple" size="1">
 *        <%=vipOption%>
 * </select>
 */

var VIP_CODE_PSPG = 'PSPG';
var VIP_CODE_PMBV = 'PMBV';

function loadMultiSelectEvents()
{
	$(".vip-multiselect").on("multiselectclick", function(event, ui) {
		if(ui.value === VIP_CODE_PSPG)
	    {
			event.originalEvent.target.value = VIP_CODE_PMBV;
	    }
	});
}