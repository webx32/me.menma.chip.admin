/* 
 *  控制器
 *  功能：登陆管理
 *  制作：何军
 *  时间：2014-09-28
 */

menma.controller('adminlogin', function($scope, $socket, $check,$window,$modal, localStorageService,$errtofont,$location) {

    document.title="管理员登陆";
    $scope.tel = "18888888888";
    $scope.pw  = "12345";

    //绑定回调事件
    $socket.bind('admin.login', {
        success: function(data) {
            console.log(data);
            localStorageService.remove("userInfo");
            localStorageService.remove("loginToken");

            var tempuserInfo = data.data;
            if(tempuserInfo.admin.status=="disabled")
            {
                $scope.adminloginclass = "alert-error";
                $scope.adminlogintips ="账号不可用";

            }
            else if(tempuserInfo.admin.status=="removed"){
                $scope.adminloginclass = "alert-error";
                $scope.adminlogintips ="账号已被删除";
            }
            else{
            $scope.adminlogintips = "登陆成功";
            tempuserInfo.logintime = new Date();
            tempuserInfo.permission = {
                isSuperUser: true,
                isUser: true,
                isAdministrator: true
            };
            tempuserInfo.isPermissionLoaded = true;
            localStorageService.set("userInfo", tempuserInfo);
            localStorageService.add("loginToken", data.data.token);
            $location.path("/admin/index");
            }

        },
        err: function(data) {
            $scope.adminloginclass = "alert-error";
            $scope.adminlogintips =$errtofont(data.err);
        }
    });

//    $socket.bind("admin.business.select",{
//        success : function(data){
//
//        },
//        err : function(data){
//
//        }
//    });

    $scope.adminloginsub = function() {

        $scope.adminlogintips = "";
        // if (!$check.checkMobile($scope.tel)) {
        //     $scope.adminloginclass = "alert-error";
        //     $scope.adminlogintips = "手机号码填写错误！";
        //     return false;
        // }
        if ($scope.pw.length < 4) {
            $scope.adminloginclass = "alert-error";
            $scope.adminlogintips = "密码填写错误！";
            return false;
        }
        $scope.adminloginclass = "alert-success";
        $scope.adminlogintips = "正在提交...";

        var loginData = {
            api: "admin.login",
            data: {
                admin: {
                  tel: $scope.tel,
                  pwd : $.md5($scope.pw)
               }
            }
        };

        console.log(loginData);

        $socket.emit(loginData, function(data) {
            $scope.adminlogintips = "登陆中...";
        });
    };
});
