/* 
 *
 * 控制器
 * 功能：首页管理
 *  制作：何军
 *  时间：2014-09-28
 */
menma.controller('activityadd', function($scope, $socket,$routeParams, memaAlert) {
    document.title="活动添加";

    $scope.activity = {title:"测试标题",desc:"活动说明",disclaimer:"免责声明",description:"测试描述",announcement:"测试公告",agreement:"test 协议"};
   $scope.id='';
    $socket.bind('business.activity.add', {
        success: function(data) {
            memaAlert("","增加成功",3,"");
            location.hash = "#/admin/activity";
            console.log(data);
        },
        err: function(data) {
            memaAlert("","增加失败",3,"error");
            console.log(data);
        }
    });
    $scope.complete = function() {
        data = {
            api: "business.activity.add",
            data: {activity:$scope.activity},
            option: "活动添加"
        };
        console.log(data);
        $socket.emit(data);

    }
});