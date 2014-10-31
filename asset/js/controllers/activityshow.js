/* 
 *
 * 控制器
 * 功能：首页管理
 *  制作：何军
 *  时间：2014-09-28
 */
menma.controller('activityshow', function($scope, $socket,$routeParams, memaAlert,localStorageService ,$errtofont) {
    document.title="活动修改";
    /**
     * 活动信息默认数据 上线时修改为[]
     * @type {{id: string, title: string, disclaimer: string, description: string, announcement: string, agreement: string}}
     */
//    $scope.activity = {id:"x",title:"测试标题",disclaimer:"免责声明",description:'<ol class="custom_num1 list-paddingleft-1"><li class="list-num-2-1 list-num1-paddingleft-1"><p>测试<span style="color: rgb(149, 55, 52);">描述</span></p></li><li class="list-num-2-2 list-num1-paddingleft-1"><p><span style="color: rgb(149, 55, 52);">678678</span></p></li><li class="list-num-2-3 list-num1-paddingleft-1"><p><span style="color: rgb(79, 129, 189);">的法国恢复规划​</span></p></li></ol>',announcement:"测试公告",agreement:"test 协议"};

   $scope.id=$routeParams.id;

    $socket.bind('activity.get', {
        success: function(data) {
            $scope.activity =data.data.activity
        },
        err: function(data) {
            memaAlert("", "活动信息获取失败，失败原因：" +$errtofont( data.err), 5,"error");
        }
    });
    var data= {
        api: "activity.get",
        data:{activity:$routeParams.id},// 活动id,
        option: "单个活动详情获取"
    };
  $socket.emit(data);

});