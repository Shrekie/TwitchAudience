/*
	popup.js
	
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

//Everything was supposed to go inside this, but it doesn't really matter
var popupObject = {};

popupObject.port = chrome.runtime.connect({name: "mainBackgroundCommunication"});

function initOptionHTML(){
	$(".anOption").each(function(i, element){
		
		$(element).find(".SliderValue").html($(element).find("input[type=\"range\"]").val());
		
		$(element).find("input[type=\"range\"]").change(function(){
			$(element).find(".SliderValue").html($(element).find("input[type=\"range\"]").val());
		})
		
	});
	
	$("#automaticallyOpen").change(function(){
		save_options();
	});
	
	$(".pluginSize").change(function(){
		setSimpleSettings();
	});
	
	$(".jscolor").blur(function(){
		//save_options();
	});
}

function resetSettings(){
		chrome.storage.sync.set({
        amountCircles: 5,
		maxPixelSize: 300,
		minimumGraphicalSize: 70,
		timelimitforreset:15,
		automaticallyOpen:false,
		pluginSize:"medium",
		color:"FFFFFF",
    }, function () {
		alert("Settings have been successfully reset.\nChanges are automatically enabled.");
		restore_options();
    });
}
function setSimpleSettings(){
	
	var size = $("input[type='radio']:checked").val();
	console.log(size);
	if(size=="small"){
		$("#amountCircles").val("3");
		$("#maxpixelSize").val("200");
		$("#minimumGraphicalSize").val("50");
	}else if(size=="medium"){
		$("#amountCircles").val("5");
		$("#maxpixelSize").val("300");
		$("#minimumGraphicalSize").val("70");
		
	}else if(size=="large"){
		$("#amountCircles").val("10");
		$("#maxpixelSize").val("500");
		$("#minimumGraphicalSize").val("100");	
	}
	initOptionHTML();
}

function restore_options() {
	
    chrome.storage.sync.get({
        amountCircles: 5,
		maxPixelSize:300,
		minimumGraphicalSize:70,
		timelimitforreset:15,
		automaticallyOpen:false,
		pluginSize:"medium",
		color:"FFFFFF",
    }, function (items) {
        $("#amountCircles").val(items.amountCircles);
		$("#maxpixelSize").val(items.maxPixelSize);
		$("#minimumGraphicalSize").val(items.minimumGraphicalSize);
		$("#timelimitforreset").val(items.timelimitforreset);
		$("#automaticallyOpen").prop("checked",items.automaticallyOpen);
		$(".jscolor").val(items.color);
		$(".jscolor").css("background-color","#"+items.color);
		$("input[value=\""+items.pluginSize+"\"]").prop("checked",true);
		initOptionHTML();
    });
	

}

function save_options(){
	
	chrome.storage.sync.set({
        amountCircles: parseInt($("#amountCircles").val()),
		maxPixelSize: parseInt($("#maxpixelSize").val()),
		minimumGraphicalSize: parseInt($("#minimumGraphicalSize").val()),
		timelimitforreset:parseInt($("#timelimitforreset").val()),
		automaticallyOpen:$("#automaticallyOpen").is(':checked'),
		pluginSize:$("input[type='radio']:checked").val(),
		color:$(".jscolor").val(),
    }, function () {
	 alert("Settings have been successfully saved.\nChanges are automatically enabled.");
    });
	

}

//Click events for popup clicks
$("#Information").click(function(){
	
	if($("#InformationSection").is(":visible")){
		$("#InformationSection").hide();
		$("#Information").css("color","black");
		$("html").css("height","155px");
		$("body").css("height","155px");
	}else{
		$("#optionsSection").hide();
		$("#InformationSection").show();
		$("#Information").css("color","#FFB6A3");
		$("#Options").css("color","black");
	}

});

$("#Options").click(function(){

	if($("#optionsSection").is(":visible")){
		$("#optionsSection").hide();
		$("#Options").css("color","black");
		$("html").css("height","155px");
		$("body").css("height","155px");
	}else{
		$("#InformationSection").hide();
		$("#optionsSection").show();
		$("#Options").css("color","#FFB6A3");
		$("#Information").css("color","black");
	}
});

$(".resetOptions").click(function(){
	resetSettings();
});

$(".saveOptions").click(function(){
	save_options();
});

$("#openBackgroundPage").click(function(){
	popupObject.port.postMessage({order:"Create New Chart"})
});

$("#insertIntoChat").click(function(){
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {order: "insertIntoChat"}, function(response) {});  
	});
	
});

$("#quickOption").click(function(){
	if($("#simpleSettings").is(":visible")){
		$("#simpleSettings").hide();
		$("html").css("height","155px");
		$("body").css("height","155px");
	}else{
		$("#simpleSettings").show();

	}
});
	


//Donate thing
$("#donateToName").click(function(){
	window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVQY96ZEYM9UW', '_blank');
})

//too much vaporwave
$("#thankYouEaster").click(function(){
	window.open('https://www.youtube.com/watch?v=rTfa-9aCTYg', '_blank');
})

restore_options();