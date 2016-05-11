/*
	TwitchChat.js
	
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

if(typeof TwitchAudience == 'undefined') {
	window.TwitchAudience = {};
}

TwitchAudience = 
	{
		twitchChat: (function(){
		
		var config = {
			// selector of element containing twitch stream messages
			chat_selector:".chat-lines li",
			// x seconds messages get forfeit
			time_limit_for_reset:15,
			max_graphical_size:300,
			minimum_graphical_size:60,
			elements_to_display:5,
			circle_color:"FFFFFF"
		};
		
		var private_var = {
			currentStream:0,
			enabledStreams:[],
			messages:[],
			newMessages:0,
			last_ember:0,
			sorted_messages:[],
			//chrome message connect to background page
			port:chrome.runtime.connect({name: "mainBackgroundCommunication"}),
			//Array to save all front facing tabs to send messages too
			frontFacingTabs:[]
			
		}
		
		var initConfig = function(){
			// Sets config settings based on saved options values.
			chrome.storage.sync.get({
			amountCircles: 5,
			maxPixelSize:300,
			minimumGraphicalSize:60,
			timelimitforreset:15,
			color:"FFFFFF",
			
			}, function (items) {
				config.elements_to_display = parseInt(items.amountCircles);
				config.max_graphical_size = parseInt(items.maxPixelSize);
				config.minimum_graphical_size = parseInt(items.minimumGraphicalSize);
				config.time_limit_for_reset = parseInt(items.timelimitforreset);
				config.circle_color = items.color;
			});
		}
		
		var prepareSortedMessages = function(){
			
			/*
				Prepares sorted messages array for graphical display.
				The elements to display.
				Max size.
			*/
			var chatMetadata = {
				max_size:config.max_graphical_size,
				minimum_size:config.minimum_graphical_size,
				stream_name:private_var.currentStream.stream_name,
				time_limit_for_reset:config.time_limit_for_reset,
				circle_color:config.circle_color
			};
			
			
			// If sorted messages array has less than max elements to display
			if(private_var.currentStream.sorted_messages.length>config.elements_to_display){
				
				chatMetadata.top_twitch_messages = private_var.currentStream.sorted_messages.slice(0,config.elements_to_display);
				
			}else{
				chatMetadata.top_twitch_messages = private_var.currentStream.sorted_messages;
			}
			
			var allStreams = [];
			
			$.each(private_var.enabledStreams,function(i,stream){
				allStreams.push(stream.stream_name);
			})
			
			chatMetadata.allStreams = allStreams;
			
			chatMetadata.order = "NewSortedMessages";
			
			private_var.port = chrome.runtime.connect({name: "mainBackgroundCommunication"});
			
			private_var.port.postMessage(chatMetadata);

			
			/*Send to front end*/
			if(private_var.frontFacingTabs.length > 0){
				for(var i = 0; i<private_var.frontFacingTabs.length;i++){
					chrome.tabs.sendMessage(private_var.frontFacingTabs[i].id, chatMetadata, function(response) {});  
				}
			}
			
			private_var.port = null;
			allStreams = null;
			chatMetadata = null;
			
			
			
		};
		
		var sortMessages = function(){
			/* 
				Go through all messages, check if message exists in sorted_messages.
				If not, add it, if it already does exist increase the ranking parameter on that message object in sorted_messages.
				Then sort sorted_messages from lowest to highest based on ranking parameter on objects in that array.
			*/
			
			// Reset sorted messages
			private_var.currentStream.sorted_messages = [];
			
			for(var i = 0;i < private_var.currentStream.messages.length;i++){
				currentMessage = private_var.currentStream.messages[i];
				var seen = false;
				nextSortedMessage:
				for(var y = 0;y < private_var.currentStream.sorted_messages.length;y++){
					
					var currentSortedMessage = private_var.currentStream.sorted_messages[y];
					
					if(currentMessage.message_content == currentSortedMessage.message_content){
						seen=true;
						currentSortedMessage.ranking++;
						continue nextSortedMessage;
					} 
				}
				if(!seen){
					private_var.currentStream.sorted_messages.push({message_content:currentMessage.message_content,ranking:0});
				}
			}
			
			private_var.currentStream.sorted_messages.sort(function(a,b){
				return a.ranking-b.ranking;
			});
			
			private_var.currentStream.sorted_messages.reverse();
			
			prepareSortedMessages();
		};
		
		var messageTextParser = function(messageTextDate){
			
			/*
				Parses text retrieved from twitch messages.
				***Deals with case sensitivity.
				Changes <a> elements to display emoticon.
			*/
			
			// adds https:// front of src tag
			if((/src="\/\//g).test(messageTextDate.message_content)){
				messageTextDate.message_content = messageTextDate.message_content.replace(/src="\/\//g,'src="https://');
			}
			
			// removes classes from emoticon for removing of hover bug
			if((/class="emoticon tooltip\"/g).test(messageTextDate.message_content)){
				messageTextDate.message_content = messageTextDate.message_content.replace(/ class="emoticon tooltip\"/g,'');
			}
			
	
			
			//messageTextDate.message_content_lowerCase = messageTextDate.message_content.toLowerCase();
			
			return messageTextDate;
			
		};
		
		var enablePlugin = function(message){
			
			/*
				Runs stuff to be done when plugin is enabled on site,
				Add to front facing tabs,
				reset last ember if it is same stream.
			*/
			
			chrome.tabs.query({currentWindow: true, active: true},function(tabArray){
				if (tabArray && tabArray[0]){
					
					//Check if tab is already indexed
						if(tabArray[0].url.indexOf('https://www.twitch.tv') == 0 ){
							
							var hasUrl = false;
							if(private_var.frontFacingTabs.length > 0){
								for(var i = 0; i<private_var.frontFacingTabs.length;i++){
									if(private_var.frontFacingTabs[i].id == tabArray[0].id)hasUrl=true;
								}
							}
							
							for(var i = 0; i<private_var.enabledStreams.length;i++){
								if(private_var.enabledStreams[i].stream_name == message.stream_name){
									//Reset ember, window was updated with a stored stream.
									private_var.enabledStreams[i].last_ember = 0;
								}
							}
							
							chrome.pageAction.show(tabArray[0].id);
							chrome.tabs.sendMessage(tabArray[0].id, {order:"enabledThis"}, function(response) {});
							
							// Seen, add into front facing tab
							if(!hasUrl)private_var.frontFacingTabs.push(tabArray[0]);
						};

					}
				});
		}
		
		var splitMessages = function(messages){
			
			/*Saves each messages in seperate stream object array*/
			var seen = false;
			for(var i = 0; i<private_var.enabledStreams.length;i++){
				if(private_var.enabledStreams[i].stream_name == messages.stream_name){
					seen = true;
					private_var.currentStream = private_var.enabledStreams[i];
					break;
				}
			}
			
			if(!seen){
				var newStream = {stream_name:messages.stream_name,new_messages:messages.emberMessages,messages:[],last_ember:0,sorted_messages:[]};
				private_var.enabledStreams.push(newStream);
				private_var.currentStream = newStream;
			}else{
				private_var.currentStream.new_messages = messages.emberMessages;
			}
			
			//Starts message process
			getNewMessages();
			
		}
		
		var getNewMessages = function(){
			
			/* Goes through twitch messages saves messages that are newer than the old ones in an array based on an interval of seconds */
			
			
			$.each(private_var.currentStream.new_messages,function(i,data){
				// if the ember number is higher than last, save it to messages array.
				//console.log(data.ember + " " + private_var.last_ember);
				if (data.ember > private_var.currentStream.last_ember){
					private_var.currentStream.last_ember = data.ember;
					
					//Object containing both the message text, current time, message text lowercased
					var messageTextDate = {message_content:data.message.message_content,message_date:Date.now()};
					
					//Check if comment is deleted
					if(messageTextDate.message_content != null){
						private_var.currentStream.messages.push(messageTextParser(messageTextDate));	
					}

				}
				
			});
			
			
			$(private_var.currentStream.messages).each(function(i, message) {
				
				// If message is older than config.time_limit_for_reset seconds then delete it from message array
				if (message.message_date < (Date.now() - (config.time_limit_for_reset*1000)))
				{
					private_var.currentStream.messages.splice(i, 1);
				}
			
			})
			
			sortMessages();
		}
		

		
		return{
			
			init:function(){
					
			chrome.runtime.onConnect.addListener(function(port) {
				
				if(port.name == "mainBackgroundCommunication"){
					
					port.onMessage.addListener(function(msg) {
						
						
						if(msg.order == "EnablePlugin"){
							enablePlugin(msg);	
						}
					
						if(msg.order == "New Message")
						{
							initConfig();
							splitMessages(msg);

						}

						if(msg.order == "Create New Chart"){
							
							chrome.tabs.create({url: chrome.extension.getURL('StreamPage.html')},function(tab){});
							
						}
					
					
					});
				}	

			});

			}
		}

	
	}())
}

TwitchAudience.twitchChat.init();

