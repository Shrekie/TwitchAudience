/*
	initCircleChartBackground.js
	
	Thomas Lindauer
	thomaslindauer@mail.com
	
	© 2016
	
	This file is part of TwitchAudience.

    TwitchAudience is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TwitchAudience is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    see http://www.gnu.org/licenses/.
*/

TwitchAudience.circleChart = new TwitchAudience.CircleChart($("#TWITCHAUDIENCEpluginArea"),true);

$(window).load(function(){
	
	//Construct clickable stream name, display a selectable list when clicked.
	
	$("#TWITCHAUDIENCEstreamName").on("click",function(){
		if($("#TWITCHAUDIENCEallStreamList").is(":visible")){
			$("#TWITCHAUDIENCEallStreamList").hide();
		}else{
			$("#TWITCHAUDIENCEallStreamList").show();
		}
	});
	
	$("body").on("click","div.TWITCHAUDIENCEaStream",function(){
		TwitchAudience.circleChart.streamName = $(this).html();
		$("#TWITCHAUDIENCEallStreamList").hide();
	});
	
	//Enable plugin here too
	chrome.tabs.query({currentWindow: true, active: true},function(tabArray) 
	{
		if (tabArray && tabArray[0])chrome.pageAction.show(tabArray[0].id);
	});
	
	
});