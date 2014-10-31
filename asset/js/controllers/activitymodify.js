/* 
 *
 * 控制器
 * 功能：首页管理
 *  制作：何军
 *  时间：2014-09-28
 */
menma.controller('activitymodify', function($scope, $socket,$routeParams, memaAlert,localStorageService ,$errtofont) {
    document.title="活动修改";

    $scope.activity = {id:"x",title:"测试标题",desc:"活动说明",disclaimer:"免责声明",description:"测试描述",announcement:"测试公告",agreement:"test 协议"};
   $scope.id=$routeParams.id;
    $socket.bind('activity.get', {
        success: function(data) {
            console.log(data);
            $scope.activity =data.data.activity

        },
        err: function(data) {
            memaAlert("活动详情获取失败", "失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });
    var data= {
        api: "activity.get",
        data:{activity:$routeParams.id},// $scope.item,
        option: "单个活动详情获取"
    };
   // console.log(data);
  $socket.emit(data);

    $socket.bind('activity.update', {
        success: function(data) {
            memaAlert("","修改成功",3,"");
            location.hash="#/admin/activity/show/"+$scope.id;
            console.log(data);
        },
        err: function(data) {
          //  memaAlert("","修改失败!",3,"error");
            memaAlert("修改失败", "失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });
    $scope.complete = function() {
        data = {
            api: "activity.update",
            data: {
                activity:{
                    id:$scope.activity.id,
                    title:$scope.activity.title,
                    description:$scope.activity.description,
                    announcement:$scope.activity.announcement,
                    agreement:$scope.activity.agreement
                }
            },
            option: "活动更新"
        };
       // delete  data.data.updata.id

        console.log(data);
       $socket.emit(data);

    }
});