/*
	ChatContent.js
	
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


TwitchAudience = {};

TwitchAudience.chatContent = function(){


	var hasSiteChat = false;
	var enabledStream = false;
	var embernumber = 0;
	var port = chrome.runtime.connect({name: "mainBackgroundCommunication"});

	var config = {
		automaticallyOpen:false
	}

	var initConfig = function(){
		
		chrome.storage.sync.get({
		automaticallyOpen:false,
		}, function (items) {
			config.automaticallyOpen = items.automaticallyOpen;
		});
		
	}

	//Check for the presence of chat, if so send new message to background script
	setInterval(function(){
		if($(".chat-lines").length > 0){
			if(enabledStream){
				
				if(!hasSiteChat){
					initConfig();
					if(config.automaticallyOpen)insertIntoChat();	
				}
				
				newMessage();
				
			}else{
				var stream_name = $(".channel-name").html();
				var enableplugin = {};
				enableplugin.order = "EnablePlugin";
				enableplugin.stream_name = stream_name;
				port.postMessage(enableplugin);
				
				enableplugin = null;
			}

		}else{
			// No chat disable plugin
			hasSiteChat = false;
			enabledStream = false;
			embernumber = 0;
		}	
	},2000);

	chrome.extension.onMessage.addListener(function(backMessage, sender, sendResponse) {
		
		//Insert chat into twitch page
		
		
		if (backMessage.order == 'insertIntoChat') {
			insertIntoChat(backMessage);
		} 
		
		if (backMessage.order == 'enabledThis') {
			initConfig();
			enabledStream = true;
		} 
		
	});

	var insertIntoChat = function(backMessage){
		//	Insert diagram into twithc site
		
		if(hasSiteChat == false){
			
			hasSiteChat = true;
			
			
			$(".chat-room").append("<div id=\"TWITCHAUDIENCEpluginArea\">"+
			"<div id=\"TWITCHAUDIENCEdiagramContent\">"+
			"<div id=\"TWITCHAUDIENCEremovePluginFromPage\">X</div>"+
			"<div id=\"TWITCHAUDIENCEnoMessage\">Loading TwitchAudience</div>"+
			"</div>"+
			"</div>");
			
			$("#TWITCHAUDIENCEremovePluginFromPage").click(function(){
				$("#TWITCHAUDIENCEpluginArea").fadeOut( "slow", function() {
					$(this).remove();
					hasSiteChat = false;
				});
			});
			
			TwitchAudience.circleChart = new TwitchAudience.CircleChart($(".ember-chat").find("#TWITCHAUDIENCEpluginArea"),false);
			TwitchAudience.circleChart.streamName = $(".channel-name").html();
			
		}


		
	}
	var newMessage = function(){
		//Sends message to background enabling plugin button
		// also sends message to all diagrams.

		
		var stream_name = $(".channel-name").html();
		
		//console.log(stream_name)

		var msg = {};
		msg.stream_name = stream_name;
		msg.order = "New Message";
		msg.emberMessages = [];
		
		$(".chat-line").each(function(i,li){
			
			
			if(!($(li).find('.message').attr("checkedthis") == "yes")){
				var msgData = {};
				embernumber++;
				msgData.ember = embernumber;
				msgData.message = {message_content:$(li).find('.message').html()};
				$(li).find('.message').attr("checkedthis","yes");
				msg.emberMessages.push(msgData);	
			}
			
			
		});
		
		port.postMessage(msg);
		
		msg = null;
	}



};

TwitchAudience.chatContent();
