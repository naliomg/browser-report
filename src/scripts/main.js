

$(function(){

	// H5Page对象
	var H5=function(){
		this.id = ( 'h5-'+ Math.random() ).replace('.','');
		this.elem=$('<div class="h5" id="'+this.id+'"></div>').hide();
		$('body').append(this.elem);
		this.pages=[];
		/**
		 * 新增一个页面
		 * @param {string} name 页面的名称,会添加到页面的class类中
		 * @param {string} text 页面的默认文本
		 * @return {H5} 返回一个H5对象，方便重复添加页面
		 */
		this.addPage=function(name,text){
			var page=$('<div class="h5-page section"></div>');
			if(name!=undefined){
				page.addClass('h5-page-'+name);
			}
			if(text!=undefined){
				page.text(text);
			}
			this.elem.append(page); 
			this.pages.push(page);
			if (this.whenAddPage!=undefined) {
				this.whenAddPage();
			}
			return this;
		}
		//新增一个组件
		this.addComponent=function(name,cfg){
			var cfg=cfg||{};
			cfg=$.extend({
				type:'base'
			},cfg);
			var component=null;
			switch(cfg.type){
				case 'base':{
					component=new H5ComponentBase(name,cfg);
					break;
				}
				case 'point':{
					component=new H5ComponentPoint(name,cfg);
					break;
				}
				case 'bar':{
					component=new H5ComponentBar(name,cfg);
					break;
				}
				case 'polyline':{
					component=new H5ComponentPolyline(name,cfg);
					break;
				}
				case 'radar':{
					component=new H5ComponentRadar(name,cfg);
					break;
				}
				case 'pie':{
					component=new H5ComponentPie(name,cfg);
					break;
				}
				case 'ring':{
					component=new H5ComponentRing(name,cfg);
					break;
				}
				default:;
			}				
			var page=this.pages.slice(-1)[0];
			page.append(component);
			return this;
		}
		//加载H5页面，添加fullpage的JS动画
		this.loader=function( firstpage ){
			this.elem.fullpage({
				onLeave:function(index,nextindex,dir){
					$(this).find('.h5-component').trigger('onLeave');
				},
				afterLoad:function(anchorLink,index){
					$(this).find('.h5-component').trigger('onLoad');
				}
			});				
			this.elem.show();
			if (firstpage) {
				$.fn.fullpage.moveTo(firstpage);
			}
		}
		this.loader=typeof H5Loading ==='function'?H5Loading:this.loader;
		return this;
	}


	// H5ComponentBase 区域
	// h5-component 构造函数
	var H5ComponentBase=function(name,cfg){
		var cfg = cfg || {};
		var id = ( 'h5-c-'+ Math.random() ).replace('.','');
		var cls = 'h5-c-type-'+ cfg.type + ' h5-c-name-'+name;
		var component = $('<div class="h5-component '+cls+'" id="'+id+'"></div>');
		cfg.text && component.text(cfg.text);
		cfg.width && component.width(cfg.width/2);
		cfg.height && component.height(cfg.height/2);
		cfg.css && component.css(cfg.css);
		cfg.backgroundImage && component.css('backgroundImage','url("'+cfg.backgroundImage+'")');
		if (cfg.center===true) {
			component.css({
				marginLeft:(cfg.width/4*-1)+'px',
				left:'50%'
			});
		}
		// h5-component绑定事件
		component.on('onLeave',function(){
			setTimeout(function(){
				component.addClass('h5-c-'+cfg.type+'-leave').removeClass('h5-c-'+cfg.type+'-load');
				cfg.animateOut && component.css(cfg.animateOut);
			},cfg.delay||0);
			return false;
		});
		component.on('onLoad',function(){
			setTimeout(function(){
				component.addClass('h5-c-'+cfg.type+'-load').removeClass('h5-c-'+cfg.type+'-leave');
				cfg.animateIn && component.animate(cfg.animateIn);				
			},cfg.delay||0);
			return false;
		});
		//回调
		if(cfg.fn!=undefined){
			component.on(cfg.fn.evName,cfg.fn.f);
		}
		return component;
	}
	var H5ComponentPoint=function(name,cfg){
		var component=new H5ComponentBase(name,cfg);
		var base=cfg.data[0][1];  //面积大小基础
		$.each(cfg.data,function(index,item){
			var point=$('<div class="point"></div>');
			var name=$('<div class="name">'+item[0]+'</div>');
			var rate=$('<div class="rate">'+(item[1]*100)+'%'+'</div>');
			name.append(rate);
			point.append(name);
			var per=(item[1]/base*100)+'%';
			point.width(per).height(per).css({
				background:item[2]
			});
			point.data('left',item[3]).data('top',item[4]); //存储点的位置
			point.css('zIndex',100-index).css('left',0).css('top',0);
			point.css({
				'transition':'all 1s '+index*0.5+'s',
				'-webkit-transition':'all 1s '+index*0.5+'s',
				'-moz-transition':'all 1s '+index*0.5+'s'
			});
			component.append(point);

			component.on('onLoad',function () {
				component.find('.point').each(function (index,item) {
					$(item).css('left',$(item).data('left')).css('top',$(item).data('top')); 
				})
			})
			component.on('onLeave',function () {
				component.find('.point').each(function (index,item) {
					$(item).css('left',0).css('top',0); 
				})
			})
			//点击每个点时的圈层动画
			component.find('.point').on('click',function(){
				component.find('.point').removeClass('point_focus');
				$(this).addClass('point_focus');
				return false;
			}).eq(0).addClass('point_focus');
		});
		return component;
	}
	var H5ComponentBar=function(name,cfg){
		var component=new H5ComponentBase(name,cfg);
		$.each(cfg.data,function(index,item){
			var item_bar=$('<div class="item-bar">');
			var name=$('<div class="name">');
			var rate=$('<div class="rate">');
			var per=$('<div class="per">');
			var bg=$('<div class="bg">');
			name.text(item[0]);
			var width=item[1]*55+'%';
			bg.css('background',item[2]);
			rate.css('width',width).append(bg);
			per.text(item[1]*100+'%');
			item_bar.append(name).append(rate).append(per);
			component.append(item_bar);
		});
		return component;
	}
	var H5ComponentPolyline=function(name,cfg){
		var component=new H5ComponentBase(name,cfg);
		// 绘制网格线-背景层,并添加项目文本信息
		var width=cfg.width;
		var height=cfg.height;
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		context.beginPath();
		context.lineWidth=1;
		context.strokeStyle='#AAA';
		var step=10;
		for (var i = 0; i < step+1; i++) {				
			var y=context.height/step*i;
			context.moveTo(0,y);
			context.lineTo(context.width,y);				
		}
		step=cfg.data.length+1;
		for (var i = 0; i < step+1; i++) {
			var x=context.width/step*i;
			context.moveTo(x,0);
			context.lineTo(x,context.height);
			if (cfg.data[i]) {
				var text=$('<div class="text">'+cfg.data[i][0]+'</div>');
				text.css({
					width:context.width/step/2,
					left:x/2+context.width/step/4
				});
				component.append(text);
			}
		}
		context.stroke();
		// 绘制折线-数据层
		var width=cfg.width;
		var height=cfg.height;
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		cfg.delay=cfg.delay||0;
		component.on('onLoad',function(){
			var rate=0;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate+=0.01;
					drawer(rate);
				},i*10+500+cfg.delay);
			}
		});
		component.on('onLeave',function(){
			var rate=1;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate-=0.01;
					drawer(rate);
				},i*10+500+cfg.delay);
			}
		});
		/**
		 * 数据点线绘制函数，通过连续调用，连续绘制产生动画效果
		 * @param  {float} rate 0~1之间的小数，控制数据对应比例的缩放大小
		 */
		function drawer(rate){				
			context.clearRect(0,0,context.width,context.height);
			context.beginPath();
			context.lineWidth=3;
			context.strokeStyle='#FF8878';
			var x=0;
			var y=0;
			step=cfg.data.length+1;
			var temp=context.width/step;
			//画点
			for ( i in cfg.data) {
				var item=cfg.data[i];
				x=temp*i+temp;
				y=context.height*(1-item[1]*rate);
				context.moveTo(x,y);
				context.arc(x,y,5,0,2*Math.PI);
			}
			//点连线
			context.moveTo(temp,context.height*(1-cfg.data[0][1]*rate));
			for (i in cfg.data) {
				var item=cfg.data[i];
				x=temp*i+temp;
				y=context.height*(1-item[1]*rate);
				context.lineTo(x,y);
			}
			context.stroke();
			//绘制阴影
			context.strokeStyle='transparent';
			context.lineTo(x,context.height);
			context.lineTo(temp,context.height);
			context.fillStyle='rgba(255,188,188,0.4)';
			context.fill();
			//数据文本书写
			context.font='bold 24px Arial';
			context.textAlign='center';
			context.textBaseline='middle';
			for ( i in cfg.data) {
				var item=cfg.data[i];
				var str=(item[1]*100>>0)+'%';
				x=temp*i+temp;
				y=context.height*(1-item[1]*rate)-20;
				context.fillStyle=item[2]?item[2]:'#595959';				
				context.fillText(str,x,y);
			}
			context.stroke();
		}

		return component;
	}
	var H5ComponentRadar=function(name,cfg){
		var component=new H5ComponentBase(name,cfg);
		// 绘制网格线-背景层
		var width=cfg.width;
		var height=cfg.height;
		var step=cfg.data.length;
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		context.lineWidth=1;
		var r=width/2;
		//画最外围的边
		//由圆心坐标(a,b)和半径r,弧度rad求得各顶点(x,y)；
		//rad=(2*Math.PI/360)*(360/step)*i;
		//x=a+Math.cos(rad)*r;
		//y=b+Math.sin(rad)*r;
		for (var j = 10; j >= 0; j--) {
			context.beginPath();
			moveTo(2*r,0);
			for (var i = 0; i < step; i++) {
				var rad=(2*Math.PI/360)*(360/step)*i;
				var x=r+Math.cos(rad)*r*j/10;
				var y=r+Math.sin(rad)*r*j/10;
				context.lineTo(x,y);			
			}
			context.closePath();
			context.fillStyle=j%2?'#f1f9ff':'#99c0ff';
			context.fill();
		}
		//绘制伞骨
		for (var i = 0; i < step; i++) {
			var rad=(2*Math.PI/360)*(360/step)*i;
			var x=r+Math.cos(rad)*r;
			var y=r+Math.sin(rad)*r;
			context.beginPath();
			context.moveTo(r,r);
			context.lineTo(x,y);
			context.strokeStyle="#e0e0e0";
			context.stroke();
			// 输出项目文本信息
			var text=$('<div class="text">'+cfg.data[i][0]+'</div>');
			if(x>r){
				text.css('left',x/2+5);
			}else{
				text.css('right',(width-x)/2+5);
			}
			if (y>r) {
				text.css('top',y/2+5);
			}else{
				text.css('bottom',(height-y)/2+5);
			}
			if (cfg.data[i][2]) {
				text.css('color',cfg.data[i][2]);
			}
			component.append(text);
		}
		
		
		// 绘制折线-数据层
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		
		/**
		 * 数据点线绘制函数，通过连续调用，连续绘制产生动画效果
		 * @param  {float} rate 0~1之间的小数，控制数据对应比例的缩放大小
		 */
		function drawer(rate){
			context.clearRect(0,0,width,height);
			context.beginPath();	
			for (var i = 0; i < step; i++) {
				var rad=(2*Math.PI/360)*(360/step)*i;
				var x=r+Math.cos(rad)*r*cfg.data[i][1]*rate;
				var y=r+Math.sin(rad)*r*cfg.data[i][1]*rate;
				context.lineTo(x,y);
			}				
			context.closePath();
			context.strokeStyle="#f00";
			context.fillStyle="rgba(255,0,0,0.2)";
			context.stroke();
			context.fill();
			context.fillStyle="#f00";
			for (var i = 0; i < step; i++) {
				var rad=(2*Math.PI/360)*(360/step)*i;
				var x=r+Math.cos(rad)*r*cfg.data[i][1]*rate;
				var y=r+Math.sin(rad)*r*cfg.data[i][1]*rate;
				context.beginPath();
				context.arc(x,y,5,0,2*Math.PI);
				context.fill();
			}				
		}			
		cfg.delay=cfg.delay||0;
		component.on('onLoad',function(){
			var rate=0;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate+=0.01;
					drawer(rate);
				},i*10+500+cfg.delay);
			}
		});
		component.on('onLeave',function(){
			var rate=1;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate-=0.01;
					drawer(rate);
				},i*10+500+cfg.delay);
			}
		});	

		return component;		
	}
	var H5ComponentPie=function(name,cfg){
		var component=new H5ComponentBase(name,cfg);
		cfg.delay=cfg.delay||0; 
		// 绘制网格线-背景层
		var width=cfg.width;
		var height=cfg.height;
		var step=cfg.data.length;
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		context.lineWidth=1;
		var r=width/2;
		context.beginPath();
		context.fillStyle='#eee';
		context.strokeStyle='#eee';
		context.arc(r,r,r,0,2*Math.PI);
		context.stroke();
		context.fill();

		//绘制数据层
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		var color=['red','green','blue','darkred','orange'];//颜色备用
		var sAng=1.5*Math.PI;  //start angel
		var eAng=0;  //end engel
		var aAng=2*Math.PI;  //full circle angel

		for (var i = 0; i < step; i++) {
			var item=cfg.data[i];
			var nColor=item[2] || (color.pop());
			eAng=sAng+aAng*item[1];
			context.beginPath();
			context.fillStyle=nColor;
			context.strokeStyle=nColor;
			context.moveTo(r,r);
			context.arc(r,r,r-1,sAng,eAng);
			context.stroke();
			context.fill();
			
			//加入项目文本信息
			var text=$('<div class="text">');
			text.text(item[0]);
			var p=$('<div class="per">');
			p.text(Math.round((item[1]*100)*100)/100+'%');
			text.append(p);
			var x=r+Math.cos(sAng)*r;
			var y=r+Math.sin(sAng)*r;
			if(x>=width/2-0.1){
				text.css('left',x/2+5);
			}else{
				text.css('right',(width-x)/2+5);
			}
			if(y>=height/2){
				text.css('top',y/2+5);
			}else{
				text.css('bottom',(height-y)/2+5);
			}
			if (item[2]!=undefined) {
				text.css('color',item[2]);
			}				
			text.css('opacity',0);
			component.append(text);
			sAng=eAng;
		}
		//绘制遮罩层-动画层
		var canvas=document.createElement('canvas');
		if(canvas.getContext){
			var context=canvas.getContext('2d');
		}			
		canvas.width=context.width=width;
		canvas.height=context.height=height;
		component.append(canvas);
		context.lineWidth=1;
		var r=width/2;
		context.beginPath();
		context.fillStyle='#eee';
		context.strokeStyle='#eee';			
		/**
		 * 遮罩层擦除函数，通过连续调用，连续绘制产生动画效果
		 * @param  {float} rate 0~1之间的小数，控制数据对应比例的缩放大小
		 */
		function drawer(rate){
			context.clearRect(0,0,width,height);
			context.beginPath();
			context.moveTo(r,r);
			if (rate<=0) {
				context.arc(r,r,r,0,2*Math.PI);
				component.find('.text').css('opacity',0);
			}else{
				context.arc(r,r,r,1.5*Math.PI,1.5*Math.PI+2*Math.PI*rate,true);
			}				
			context.fill();
			context.stroke();	
			if (rate>=1) {
				component.find('.text').css('opacity',1);
			}							
		}
		drawer(0);

		component.on('onLoad',function(){
			var rate=0;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate+=0.01;
					drawer(rate);
				},i*10+300+cfg.delay);
			}
		});
		component.on('onLeave',function(){
			var rate=1;
			for (var i = 0; i < 100; i++) {
				setTimeout(function(){
					rate-=0.01;
					drawer(rate);
				},i*10+300+cfg.delay);
			}
		});	

		return component;
	}
	var H5ComponentRing=function(name,cfg){
		if (cfg.data.length>1) {
			cfg.data=[cfg.data[0]];
		}   //防止多个数据绘出多个段
		cfg.type='pie';
		var component=new H5ComponentPie(name,cfg);		//利用绘制饼图为基础，在饼图上添加一个遮罩，产生环	
		component.addClass('h5-c-type-ring');
		var mask=$('<div class="mask">');
		component.append(mask);
		var text1=component.find('.text');
		text1.html(Math.round((cfg.data[0][1]*100)*100)/100+'%'); //重写项目数据
		text1.attr('style','');
		var text2=$('<div class="text">');
		text2.text(cfg.data[0][0]);
		text2.css({
			top:'105%'
		});


		if (cfg.data[0][2]) {
			text1.css('color',cfg.data[0][2]);
			text2.css('color',cfg.data[0][2]);
		}
		mask.append(text1);
		component.append(text2);

		return component;
	}


	// H5对象实例化的使用
	var h5=new H5();
	h5.whenAddPage=function(){
		this.addComponent('footer',{
			text:'↑ 向上滑动观看　',
			height:40,
			css:{
				textAlign:'right',
				fontSize:'12px',
				lineHeight:'20px',
				color:'#fff',
				background:'rgba(0,0,0,0.3)',
				left:0,
				bottom:-20,
				width:'100%',
				opacity:0,
				zIndex:999
			},
			animateIn:{opacity:1,bottom:0},
			animateOut:{opacity:0,bottom:-20},
			delay:1000
		});
	}
	h5
	.addPage('face')
		.addComponent('logo',{
			type:'base',
			center:true,
			width: 395,
			height:130,
			backgroundImage:'images/face_logo.png',
			css:{
				opacity:0,
				top:0
			},
			animateIn:{top:'20%',opacity:1},
			animateOut:{top:0,opacity:0}
		})
		.addComponent('slogan',{
			type:'base',
			center:true,
			width: 364,
			height:100,
			backgroundImage:'images/face_slogan.png',
			css:{
				opacity:0,
				top:'37%'
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:500
		})
		.addComponent('face-image-left',{
			type:'base',
			width: 370,
			height: 493,
			backgroundImage:'images/face_img_left.png',
			css:{
				opacity:0,
				bottom:-50,
				left:-50
			},
			animateIn:{opacity:1,bottom:0,left:0},
			animateOut:{opacity:0,bottom:-50,left:-50},
			delay:900
		})
		.addComponent('face-image-right',{
			type:'base',
			width: 276,
			height: 449,
			backgroundImage:'images/face_img_right.png',
			css:{
				opacity:0,
				bottom:-50,
				right:-50
			},
			animateIn:{opacity:1,bottom:0,right:0},
			animateOut:{opacity:0,bottom:-50,right:-50},
			delay:900
		})
	.addPage('intro')
		.addComponent('title',{
			text:'概述',
			css:{
				top:'12%'
			}
		})
		.addComponent('text',{
			type:'base',
			text:'2016浏览器杂乱点评',
			center:true,
			width:500,
			height:30,
			css:{
				top:'7%',
				opacity:0,
				textAlign:'center',
				color:'#ff4343',
				fontSize:'26px'
			},
			animateIn:{top:'27%',opacity:1},
			animateOut:{top:'7%',opacity:0}
		})
		.addComponent('description',{
			text:'2016又要过去了，接下来跟大家分享2016年10月份全球主流浏览器市场份额排行，今天咱们就看一下在忙碌的2016浏览器市场又发生了哪些变化。(本数据来源于StatCounter)',
			center:true,
			width:521,
			height:335,
			backgroundImage:'images/description_bg.gif',
			css:{
				top:'15%',
				opacity:0,
				boxSizing:'border-box',
				'-moz-box-sizing':'border-box',
				'-webkit-box-sizing':'border-box',
				padding:'15px 15px 15px 15px',
			},
			animateIn:{opacity:1,top:'35%'},
			animateOut:{opacity:0,top:'15%'},
			delay:1000
		})
		.addComponent('people',{
			center:true,
			width:515,
			height:305,
			backgroundImage:'images/p1_people.png',
			css:{
				opacity:0,
				bottom:0
			},
			animateIn:{opacity:1,bottom:'6.6%'},
			animateOut:{opacity:0,bottom:0},
			delay:500
		})
	.addPage('wwt')
		.addComponent('title',{
			text:'全球浏览器占比',
			css:{
				top:'12%'
			}
		})
		.addComponent('pie',{
			type:'pie',
			width:400,
			height:400,
			center:true,
			data:[
				['Chrome',0.5924,'orange'],
				['FireFox',0.1329,'darkred'],
				['Safari',0.1023,'blue'],
				['IE',0.089,'green'],
				['other',0.0834,'red']
			],
			css:{
				top:'34.86%',
				opacity:1
			}
		})
		.addComponent('header',{
			text:'2016年10月，全球统计Chrome浏览器以巨大优势胜出',
			css:{
				height:'30px',
				width:'90%',
				padding:'5%',
				lineHeight:'30px',
				fontSize:'16px',
				fontWeight:'bold',
				textAlign:'center',
				top:'79%',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
	.addPage('cnt')
		.addComponent('title',{
			text:'中国浏览器占比',
			css:{
				top:'12%'
			}
		})
		.addComponent('bar',{
			type:'bar',
			width:530,
			height:600,				
			center:true,
			data:[
				['Chrome',0.5261,'#ca402d'],
				['IE',0.197,'#dc8323'],
				['Sogou',0.0661,'#dca523'],
				['FireFox',0.0462,'#87dc23'],
				['Safari',0.0492,'#23dc2b'],
				['QQ',0.045,'#235bdc'],
				['other',0.0701]
			],
			css:{
				top:'32.5%',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0}
		})
	.addPage('wwmoblie')
		.addComponent('title',{
			text:'移动端全球占比',
			css:{
				top:'12%'
			}
		})
		.addComponent('Chrome',{
			type:'ring',
			width:300,
			height:300,
			center:true,
			data:[
				['',0.4316,'#ff7676']
			],
			css:{
				top:'24.5%',
				fontSize:'22px',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:0
		})
		.addComponent('description',{
			text:'移动端Chrome以43.16%份额居首',
			css:{
				top:'53%',
				opacity:0,
				color:'#ff7676',
				fontSize:'20px',
				textAlign:'center',
				width:'100%'
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1000
		})
		.addComponent('Safari',{
			type:'ring',
			width:120,
			height:120,
			data:[
				['Safari',0.1741,'#ff7676']
			],
			css:{
				top:'59.6%',
				left:'calc(20% - 30px)',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
		.addComponent('UC',{
			type:'ring',
			width:120,
			height:120,
			center:true,
			data:[
				['UC',0.1679,'#ff7676']
			],
			css:{
				top:'59.6%',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
		.addComponent('Opera',{
			type:'ring',
			width:120,
			height:120,
			data:[
				['Opera',0.0833,'#ff7676']
			],
			css:{
				top:'59.6%',
				left:'calc(80% - 30px)',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
		.addComponent('Samsung',{
			type:'ring',
			width:120,
			height:120,
			data:[
				['Samsung',0.066,'#ff7676']
			],
			css:{
				top:'74.47%',
				left:'calc(33.33% - 30px)',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
		.addComponent('other',{
			type:'ring',
			width:120,
			height:120,
			data:[
				['other',0.0755,'#ff7676']
			],
			css:{
				top:'74.47%',
				left:'calc(66.66% - 30px)',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1300
		})
	.addPage('wwchrome')
		.addComponent('title',{
			text:'12-16年Chrome占比',
			css:{
				top:'12%'
			}
		})
		.addComponent('header',{
			text:'Chrome市场占比持续上升',
			css:{
				height:'30px',
				width:'100%',
				lineHeight:'30px',
				fontSize:'16px',
				fontWeight:'bold',
				textAlign:'center',
				top:'12.4%',
				opacity:0
			},
			animateIn:{opacity:1,top:'32.4%'},
			animateOut:{opacity:0,top:'12.4%'},
			delay:1500
		})
		.addComponent('polyline',{
			type:'polyline',
			width:530,
			height:300,
			center:true,
			data:[
				['2012',0.0982],
				['2013',0.2742],
				['2014',0.444],
				['2015',0.5369],
				['2016',0.5382]
			],
			css:{
				top:'25%',
				opacity:0
			},
			animateIn:{opacity:1,top:'45%'},
			animateOut:{opacity:0,top:'25%'}
		})
	.addPage('wwie')
		.addComponent('title',{
			text:'12-16年IE占比',
			css:{
				top:'12%'
			}
		})
		.addComponent('header',{
			text:'IE市场占比持续下降',
			css:{
				height:'30px',
				width:'100%',
				lineHeight:'30px',
				fontSize:'16px',
				fontWeight:'bold',
				textAlign:'center',
				top:'12.4%',
				opacity:0
			},
			animateIn:{opacity:1,top:'32.4%'},
			animateOut:{opacity:0,top:'12.4%'},
			delay:1500
		})
		.addComponent('polyline',{
			type:'polyline',
			width:530,
			height:300,
			center:true,
			data:[
				['2012',0.6842],
				['2013',0.5153],
				['2014',0.3102],
				['2015',0.2068],
				['2016',0.1769]
			],
			css:{
				top:'25%',
				opacity:0
			},
			animateIn:{opacity:1,top:'45%'},
			animateOut:{opacity:0,top:'25%'}
		})
	.addPage('chrome')
		.addComponent('title',{
			text:'Chrome优点列举',
			css:{
				top:'12%'
			}
		})
		.addComponent('radar',{
			type:'radar',
			width:400,
			height:400,
			center:true,
			data:[
				['与Google服务整合',0.3],
				['后台同步',0.4],
				['更新快',0.65,'orange'],
				['简洁',0.7,'green'],
				['快',0.95,'red']				
			],
			css:{
				top:'22.75%',
				opacity:0
			},
			animateIn:{opacity:1,top:'32.75%'},
			animateOut:{opacity:0,top:'22.75%'}
		})
		.addComponent('header',{
			text:'Chrome无疑以速度优势获得大多数用户的芳心',
			css:{
				height:'30px',
				width:'90%',
				padding:'0 5%',
				lineHeight:'30px',
				fontSize:'16px',
				fontWeight:'bold',
				textAlign:'center',
				top:'80.3%',
				opacity:0
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0},
			delay:1500
		})
	.addPage('ff')
		.addComponent('title',{
			text:'FireFox优点列举',
			css:{
				top:'12%'
			}
		})
		.addComponent('point',{
			type:'point',
			width:300,
			height:300,
			center:true,
			data:[
				['扩展性' , 0.45 , '#ff7676'],
				['稳定性' , 0.3 , '#ffa3a4', -55 , '-60%'],
				['内存管理' , 0.35 , '#99c1ff', 60 ,'-100%']
			],
			css:{
				bottom:'15%'
			},
			animateIn:{opacity:1},
			animateOut:{opacity:0}
		})
	.addPage('tail')
		.addComponent('logo',{
			type:'base',
			center:true,
			width:398,
			height:90,
			backgroundImage:'images/tail_logo.png',
			css:{
				opacity:0,
				top:'15.5%'
			},
			animateIn:{opacity:1,top:'35.5%'},
			animateOut:{opacity:0,top:0}
		})
		.addComponent('slogan',{
			type:'base',
			center:true,
			width:183,
			height:50,
			backgroundImage:'images/tail_slogan.png',
			css:{
				opacity:0,
				top:'30.3%'
			},
			animateIn:{opacity:1,top:'50.3%'},
			animateOut:{opacity:0,top:'30.3%'},
			delay:500
		})
		.addComponent('share',{
			type:'base',
			width:128,
			height:120,
			backgroundImage:'images/tail_share.png',
			css:{
				opacity:0,
				top:'2%',
				right:'0%'
			},
			animateIn:{opacity:1,right:'5%'},
			animateOut:{opacity:0,right:'0%'},
			delay:500
		})
		.addComponent('back',{
			type:'base',
			center:true,
			width:52,
			height:50,
			backgroundImage:'images/tail_back.png',
			css:{
				opacity:0,
				top:'-2%'
			},
			animateIn:{opacity:1,top:'5%'},
			animateOut:{opacity:0,top:'-2%'},
			delay:500,
			fn:{evName:'click',
				f:function(){$.fn.fullpage.moveTo(1);}
			}
		})
	
	.loader([ 'images/tail_slogan.png',
			  'images/tail_share.png',
			  'images/tail_back.png',
			  'images/page_bg.png',
			  'images/page-title.png',
			  'images/p1_people.png',
			  'images/face_slogan.png',
			  'images/face_logo.png',
			  'images/face_img_right.png',
			  'images/face_img_left.png',
			  'images/face_bg.png',
			  'images/description_bg.gif'
			]);



	// 仅点击body调试用
	// var leave=true;
	// $('body').click(function(){
	// 	leave=!leave;
	// 	$('.h5-component').trigger(leave?'onLoad':'onLeave');
	// });
})