$(function() {
    function game() {
        this.hostname = "http://182.92.82.188:8084";
        this.uid = "999999999999";
        this.token = "bed09ace-886e-4e8f-9aaa-c36fbc2e87ae";
        this.datas;
    }
    game.prototype = {
        // 获取参数fn
		getQueryString:function(name) {
			var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return unescape(r[2]);
			}
			return null;
		},
        init() {
            var that = this;
            that.uid = that.getQueryString("uid");
            that.token = that.getQueryString("token");

            $.get(that.hostname+"/yfax-htt-api/api/htt/queryChrismasActivityIndex",{"phoneNum": that.uid,"access_token": that.token}, function(res){
                console.log(res);
                if(res.code == 200) {
                
                    $(".inviteStudent").text(res.data.studentNum || 0);
                    $(".intoAccount").text(res.data.awardAmount || 0);
                    $(".offAccount").text(res.data.remainAmount || 0);

                    // 判断显示倒计时还是天数
                    if(res.data.redDay > 0) {
                        $(".total_price_title span").text(res.data.redDay);
                    }else {
                        if(Date.parse(new Date(res.data.redStartDate))-Date.parse(new Date(res.data.curTime)) <= 0) {
                            $(".total_price_title").html("12月25日 19:00-22:00瓜分<br>奖励瓜分中...");
                        }else {
                            $(".total_price_title font").hide();
                            $(".total_price_title span").countDown({
                                times: res.data.redStartDate,  //必填'2018/8/13 18:00:00或者 2(两分钟) 
                                ms: false,   //毫秒是否开启
                                Hour: true   //小时是否开启
                            });
                        }
                    }
                    

                    // 渲染所有按钮 && 禁止点击
                    var Len = res.data.curStep - 1;
                    for(var i = 0;i <= Len; i++) {
                        if(res.data.dataList[i].isDelete == 0) {
                            $(".redPacket").eq(i).find(".redBtn").attr("src","images/christmas_ready_btn.png");
                        }else {
                            $(".redPacket").eq(i).find(".redBtn").attr("src","images/christmas_already_btn.png");
                            $(".redPacket").eq(i).find(".redBtn").css("pointer-events","none");
                        }
                    } 
                    for(var j = Len+1; j <= 5; j++) {
                        $(".redPacket").eq(j).find(".redBtn").attr("src","images/christmas_before_btn.png");
                        $(".redPacket").eq(j).find(".redBtn").css("pointer-events","none");
                    }
                //    if(Date.parse(new Date(res.data.redStartDate))-Date.parse(new Date(res.data.curTime)) <= 68400000) {
                //        console.log('最后一天啦!');
                //    }
                    
                   that.datas = res.data;
                   that.priceAllFn();
                   that.ClickFn();
                   that.noTimeToastFn();
                }
            })
        },
        ClickFn() {
            var that = this;
            console.log(that.datas);
            $(".redPacket .redBtn").click(function() {
                var Index = $(this).parent().index();
                var Id = that.datas.dataList[Index].id;
                
                $.post(
                    that.hostname+"/yfax-htt-api/api/htt/doChrismasActivityReward",
                    {"id": Id,"access_token": that.token,"phoneNum": that.uid}, 
                    function(res){
                        
                        // console.log("拆红包奖励"+res.data.awardAmount);
                        // console.log("剩余奖励"+res.data.remainAwardAmount);
                        var allReward = parseFloat(res.data.awardAmount) + parseFloat(res.data.remainAwardAmount);
                        
                        $(".rewardFont1 span").text(allReward);
                        $(".rewardPrice1").text(res.data.awardAmount);
                        $(".rewardPrice2").text(res.data.remainAwardAmount);

                        $(".cover").show();
                        $(".reward").fadeIn(500);
                        
                        setTimeout(function() {
                            that.init();
                        },100)
                    }
                )
            });
        },
        priceAllFn() {
            var that = this;
            // that.datas.redTotal = 1000000;
            // 判断临界值
            if(that.datas.redTotal < 1000000) {
                setInterval(function() {
                    // console.log(that.datas.redTotal);
                    that.datas.redTotal = parseInt(that.datas.redTotal)+1;
                    var Num = that.datas.redTotal.toString().split('');
                    var addnum = 7 - Num.length;
                    if(addnum > 0){
                        for (var i=0;i<addnum;i++){
                            Num.unshift('0');
                        }
                    }
                    for(var j = 0; j < 7; j++) {
                        $(".numbs").eq(j).attr("class","numbs").addClass('numbs-'+Num[j]);
                    }
                },500);
            }else {
                $(".numbs").eq(0).attr("class","numbs").addClass('numbs-1');
            }
        },
        noTimeToastFn() {
            var that = this;
            
            $(".rightNowBtn").click(function() {
                var lastTime = Date.parse(new Date(that.datas.redStartDate));
                var nowTime = Date.parse(new Date(that.datas.curTime));
                if(lastTime-nowTime < 0) {
                    if(that.datas.curStep > 0) {
                        that.divideFn();
                        $(".cover").show();
                        $(".Divide").fadeIn(500);
                    }
                }else {
                    if(that.datas.curStep == 0) {
                        $(".noTimeFont1").html("邀请好友2名以上<br/>即可获得瓜分资格"); 
                    }else {
                        $(".noTimeFont1").html("恭喜您<br/>已具备瓜分资格");
                    }
                    $(".cover").show();
                    $(".noTimeToast").fadeIn(500);
                }
                
            });
            $(".close").click(function() {
                $(".cover").hide();
                $(".noTimeToast").hide();
            });

            // rewardFN
            $(".rewardClose").click(function() {
                $(".cover").hide();
                $(".reward").hide();
            });

            // 瓜分弹窗
            $(".DivideClose").click(function() {
                $(".cover,.Divide").hide();
            });
        },
        // 瓜分fn
        divideFn() {
            var that = this;
            $.post(
                that.hostname+"/yfax-htt-api/api/htt/doChrismasActivityRedReward",
                {"access_token": that.token,"phoneNum": that.uid}, 
                function(res){
                    console.log(res);
                    console.log(res.data.redAmountRankingList);
                    for(var i = 0; i < res.data.redAmountRankingList.length; i++) {
                        $(".DivideList").eq(i).find(".DivideListPic").attr("src",res.data.redAmountRankingList[i].headUrl);
                        $(".DivideList").eq(i).find(".nickName").text(res.data.redAmountRankingList[i].nickName);
                        $(".DivideList").eq(i).find(".DivideMoney span").text(res.data.redAmountRankingList[i].redAmount);
                    }
                    
                    $(".DivideFont2").text(res.data.redAmount);
                }
            )
        },
        scollFn() {
            $(window).scroll(function() {
                if($(".inviteTitle").offset().top - $(window).scrollTop() < 0) {
                    $(".footerBtn").slideDown();
                }else {
                    $(".footerBtn").slideUp();
                }
            })
        },
        start() {
            this.init();
            this.scollFn();
            // this.ClickFn();
        }
    }
    var go = new game().start();
});