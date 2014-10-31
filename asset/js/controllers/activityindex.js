/* 
 *
 * 控制器
 * 功能：首页管理
 *  制作：何军
 *  时间：2014-09-28
 */
menma.controller('activityindex', function($scope, $socket,  memaAlert,$check,localStorageService,$errtofont,$location,$timeout) {
    document.title="活动管理";
    /**
     * 进度条
     */
    $timeout(function(){
        $scope.progress={
            css:{width:"10%"},
            value:10
        };
    },100);
    /**
     * 默认数据
     */
    $scope.activities = [{id:"x",title:"测试标题",desc:"活动说明",disclaimer:"免责条款",description:"测试描述",announcement:"测试announcement",agreement:"test agreement"}];


    $socket.bind('business.activity.list', {
        success: function(data) {
            /**
             * 进度条
             */
            $scope.progress={
                css:{width:"100%"},
                value:100
            };

            /**
             * 更新数据
             */
            $timeout(function(){
                $location.path("/admin/activity/show/"+data.data.activities[0].id);
                $scope.activities=data.data.activities;
            },1500);

        },
        err: function(data) {
            $scope.progress={
                css:{width:"100%"},
                value:100
            };
            memaAlert("", "活动信息获取失败，失败原因：" +$errtofont( data.err), 5,"error");

        }
    });

    /**
     * 活动获取
     *api business.activity.list
     */
    var activitydata= {
        api: "business.activity.list",
        data:{
            business:localStorageService.get("userInfo").admin.businesses[0].id
        },// $scope.item,
        option: "活动获取"
    };
    $socket.emit(activitydata);
    $timeout(function(){
        $scope.progress={
            css:{width:"50%"},
            value:50
        };
    },200);


    /**
     * 进度条
     */



    /**
     * 分页组件
     * @type {number}
     */

    $scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.pageCount = function() {
        return Math.ceil($scope.activities.length / $scope.itemsPerPage) - 1;
    };
    $scope.range = Math.ceil($check.jsonLength($scope.activities) / $scope.itemsPerPage) - 1;

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }
    };
    $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    };
});