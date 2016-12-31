
var H5Loading=function(images,firstpage){

	var imageCount=images.length;
	var imgLoaded=0;
	window.id=this;
	for (var i = 0; i < imageCount; i++) {
		var img=new Image;
		img.src=images[i];
		img.onload=function(){
			imgLoaded++;
			$('#process').text('载入中...'+Math.round(imgLoaded/imageCount*100)+'%');
			if (imgLoaded==imageCount) {
				$('.loading').css('display','none');
				window.id.elem.fullpage({
					onLeave:function(index,nextindex,dir){
						$(this).find('.h5-component').trigger('onLeave');
					},
					afterLoad:function(anchorLink,index){
						$(this).find('.h5-component').trigger('onLoad');
					}
				});				
				window.id.elem.show();
				if (firstpage) {
					$.fn.fullpage.moveTo(firstpage);
				}
			}
		}		
	}
}