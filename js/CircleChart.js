/*
	CircleChart.js
	
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


TwitchAudience =

{
	CircleChart:function(jqueryObjectToDisplay, backGroundOrFront){
		/*
			Calculates circle size based on percentage of max size of circle chart.
			Generates html to be inserted that renders the circle graph.
		*/
		
		var private_var = {};
		
		
		var calculateData = function(){
			
			$(private_var.topMessages).each(function(i, message) {
				private_var.totalRankingNumber += message.ranking;
			});
			
			for(var i = 0;i<private_var.topMessages.length;i++){		
				if(private_var.topMessages[i].ranking > 0){
					
					var circle = {};
					circle.message_content = private_var.topMessages[i].message_content;
					circle.ranking = private_var.topMessages[i].ranking;

					var percentageTotalRanking = ((circle.ranking/private_var.totalRankingNumber) * 100).toFixed(2);
					//console.log(percentageTotalRanking);
					circle.percentageTotalRanking = percentageTotalRanking;
					
					circle.circleSize = (percentageTotalRanking / 100) * private_var.maxSize;
					
					if(circle.circleSize < private_var.minimum_size)
						circle.circleSize = private_var.minimum_size;
					
					// Set text size
					if(circle.percentageTotalRanking > 50){
						circle.textSize = "20px";
					}else if(circle.percentageTotalRanking > 35){
						circle.textSize = "15px";
					}else{
						circle.textSize = "10px";
					}
						
					private_var.circleData.push(circle);
				}
			}
			
		};
		
		var setIncrease = function(circleElement,circle){
			
			/*
				If there is a increase of size a green tint is added,
				otherwise a red one is added
				if same size yellow
				if you're a mellow fellow
			*/
			
			var currentSize = parseInt($(circleElement).find(".TWITCHAUDIENCEcircleRanking").html());
			
			/*
			if(circle.ranking > currentSize){
				$(circleElement).css("background","linear-gradient(to right, rgba(25, 25, 31, 1), rgba(25,255,31,0.5))");
			}else if(circle.ranking == currentSize){
				$(circleElement).css("background","linear-gradient(to right, rgba(25, 25, 31, 1), rgba(255,255,31,0.5))");
			}
			else{
				$(circleElement).css("background","linear-gradient(to right, rgba(25, 25, 31, 1), rgba(255,25,31,0.5))");
			}
			*/
		
			
			if(circle.ranking > currentSize){
				$(circleElement).css("border","3px solid rgba(0,100,0,"+((circle.ranking-currentSize)/currentSize)+")");
			}else if(circle.ranking == currentSize){
				$(circleElement).css("border","3px solid rgba(192,192,192,0.1)");
			}
			else{
				$(circleElement).css("border","3px solid rgba(190,0,0,"+((currentSize-circle.ranking)/circle.ranking)+")");
			}
			
		}
		
		var addcircleHTML = function(circle){
			private_var.circleHTML = "<div class=\"TWITCHAUDIENCEcircle\" style=\"font-size:"+circle.textSize+";width:"+circle.circleSize+"px;height:"+circle.circleSize+"px;background:#"+private_var.circle_color+"\"><div class=\"TWITCHAUDIENCEcircleText\">"
			+ circle.message_content+"</div><div class=\"TWITCHAUDIENCEcirclePercent\">"+circle.percentageTotalRanking+"%</div><div class=\"TWITCHAUDIENCEcircleRanking\">"+circle.ranking+"</div></div>";
			
			private_var.jqueryObject.append(private_var.circleHTML);
		};
		
		var changeCircle = function(circleElement,circle){
			
			$(circleElement).animate({
				width: circle.circleSize,
				height: circle.circleSize,
				fontSize: circle.textSize
			}, 500 );
			
			setIncrease(circleElement,circle);
			
			$(circleElement).find(".TWITCHAUDIENCEcircleText").attr("width",circle.circleSize);
			
			$(circleElement).find(".TWITCHAUDIENCEcirclePercent").html(circle.percentageTotalRanking+"%");
			
			$(circleElement).find(".TWITCHAUDIENCEcircleRanking").html(circle.ranking);
			
		};
		
		var checkCircles = function(){
			
			$(private_var.circleData).each(function(i, circle) {
				//If it finds circle already on page just modify that one, if it doesn't find it create new.
				var seen = false;
				var elementToChange = 0;
				private_var.jqueryObject.find(".TWITCHAUDIENCEcircle").each(function(y, circleElement){
					
					//console.log(circle.message_content + " ||| " + $(circleElement).find(".circleText").html())
					
					if(circle.message_content == $(circleElement).find(".TWITCHAUDIENCEcircleText").html()){
						seen = true;
						elementToChange = $(circleElement);
					}
				});
				//console.log (seen);
				if(seen){
					changeCircle(elementToChange,circle);
				}else{
					addcircleHTML(circle);
				}
				
			});
			
			private_var.jqueryObject.find(".TWITCHAUDIENCEcircle").each(function(i, circleElement) {
				//If it doesnt find the circle in circleArray remove from page.
				var seen = false;
				
				$(private_var.circleData).each(function(y, circle) {
					
					if(circle.message_content == $(circleElement).find(".TWITCHAUDIENCEcircleText").html()){
						seen = true;
					}
					
				})
				
				if(!seen){
					$(circleElement).fadeOut('slow', function(){ $(this).remove(); });
				}
				
			});
			
		};
		
		var noTopMessages = function (){
			
			var hasItem = false;
			
			for(var i = 0;i<private_var.topMessages.length;i++){
				if(private_var.topMessages[i].ranking > 0)hasItem=true;
			}
			
			if(hasItem){
				$("#TWITCHAUDIENCEnoMessage").hide();
			}else{
				$("#TWITCHAUDIENCEnoMessage").html("Cannot find repeated chat data within a timespan of " + private_var.time_limit_for_reset + " seconds. </br>" +
																				"TwitchAudience works best on streams with a lot of chat traffic.");
				
				$("#TWITCHAUDIENCEnoMessage").show();
			}
			
		}
		
		var updateStreamFinder = function(name, nameArray){
			$("#TWITCHAUDIENCEstreamName").html(name);
			
			var streamArrayHTML = "";
			
			$(nameArray).each(function(i, stream_Name){
				streamArrayHTML += "<div class=\"TWITCHAUDIENCEaStream\">"+stream_Name+"</div>";
			});
			
			$("#TWITCHAUDIENCEallStreamList").html(streamArrayHTML);
			
		};
		
		var initBackCommunication = function (){
			chrome.runtime.onConnect.addListener(function(port) {
	
				if(port.name == "mainBackgroundCommunication"){
					port.onMessage.addListener(function(msg) {	
					if(msg.order == "NewSortedMessages"){
						
						//console.log(msg);
						if(TwitchAudience.circleChart.streamName == "Unassigned"){
							TwitchAudience.circleChart.streamName = msg.stream_name;
						}
						
						if(TwitchAudience.circleChart.streamName == msg.stream_name){
							TwitchAudience.circleChart.drawData(msg, jqueryObjectToDisplay);	
						}		
					}
					
					});
				}	

			});
		}
		
		var initFrontCommunication = function () {
				
				chrome.extension.onMessage.addListener(function(backMessage, sender, sendResponse) {
					
				if (backMessage.order == 'NewSortedMessages') {
					//console.log(backMessage);
					if(TwitchAudience.circleChart.streamName == "Unassigned"){
						TwitchAudience.circleChart.streamName = backMessage.stream_name;
					}
		
					if(TwitchAudience.circleChart.streamName == backMessage.stream_name){
						TwitchAudience.circleChart.drawData(backMessage, jqueryObjectToDisplay);	
					}
				} 
				
			});
		}
		
		//If script added on front do front communication, else do back.
		
		if(backGroundOrFront){
			initBackCommunication();
		}else{
			initFrontCommunication();
		}

		
		return {
			streamName:"Unassigned",
			allStreams:[],
			drawData:function(chatMetadata, jquerySelector){

					private_var = {
						topMessages:chatMetadata.top_twitch_messages,
						maxSize:chatMetadata.max_size,
						minimum_size:chatMetadata.minimum_size,
						jqueryObject:jquerySelector.find("#TWITCHAUDIENCEdiagramContent"),
						totalRankingNumber:0,
						circleData:[],
						time_limit_for_reset:chatMetadata.time_limit_for_reset,
						circleHTML:"",
						circle_color: chatMetadata.circle_color
					}
					
					noTopMessages();
					
					calculateData();
					checkCircles();
					
					if(backGroundOrFront)
						updateStreamFinder(this.streamName, chatMetadata.allStreams);
				
					chatMetadata = null;
			
			}
			
		}

		
	}
}



