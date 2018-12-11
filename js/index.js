$(function() {
    function game() {
        this.hostname = "http://182.92.82.188:8084";
        this.uid = "999999999999";
        this.token = "ddd0ceb4-1950-4d77-a9bd-6a0f5029420e";
        this.datas;
    }
    game.prototype = {
        init() {
            var that = this;
            $.get(that.hostname+"/yfax-htt-api/api/htt/queryChrismasActivityIndex",{"phoneNum": that.uid,"access_token": that.token}, function(res){
                console.log(res);
                if(res.code == 200) {
                
                    $(".inviteStudent").text(res.data.studentNum || 0);
                    $(".intoAccount").text(res.data.awardAmount || 0);
                    $(".offAccount").text(res.data.remainAmount || 0);

                    $(".total_price_title span").text(res.data.redDay);

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
                   that.datas = res.data;
                    that.ClickFn();
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
                        console.log("拆红包奖励"+res.data.awardAmount);
                        console.log("剩余奖励"+res.data.remainAwardAmount);
                        setTimeout(function() {
                            that.init();
                        },100)
                    }
                )
            });
        },
        start() {
            this.init();
            // this.ClickFn();
        }
    }
    var go = new game().start();
});