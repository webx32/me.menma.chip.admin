/* 
 *
 * 控制器
 * 功能：用户管理
 * 制作：何军
 * 时间：2014-09-28
 */
menma.controller('userindex', function($scope, $socket, $check, $modal,memaAlert,localStorageService,$errtofont) {
    document.title="用户管理";
    $scope.users = [];
    $scope.viewtype = 0;
    // 获取用户信息列表接口监听回调函数
    $socket.bind("business.customer.list",{
        success : function(data){
            console.log(data);
            $scope.users = data.data.customers;
            $scope.businessId = localStorageService.get("userInfo").admin.businesses[0].id;
            $scope.range = Math.ceil($check.jsonLength($scope.users) / $scope.itemsPerPage) - 1;
        },
        err : function(data){
            memaAlert("", "用户列表，失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });

    console.log(localStorageService.get("userInfo").admin);


    // 获取用户信息列表
    var customerListData = {
        api : "business.customer.list",
        data : {
            business : localStorageService.get("userInfo").admin.businesses[0].id
        }
    }

    console.log(customerListData);

    // 发送数据
    $socket.emit(customerListData);

    $scope.addUsermodal = $modal({
        scope: $scope,
        prefixEvent: "modal",
        backdrop: false,
        container: 'body',
        template: '/template/user/add.html',
        controller: 'adduserctrl',
        show: false
    });

    // 添加一个用户
    $scope.addUser = function() {
       $scope.addUsermodal.show();
       // 初始化一个添加用户信息的对象数据
       $scope.userAdd = { real : "" , tel : "" , pw : ""}
    };
    $socket.bind("business.customer.add",{
        success : function(data){
            console.log(data);
            // 获取服务器返回的新增的用户信息，然后添加至$scope.users数组中
            $scope.users.push(data.data.customer);
            memaAlert("", "新增用户成功", 5,"");
            $scope.addUsermodal.hide();
        },
        err : function(data){
//            memaAlert("", "新增用户失败！请重试", 5,"error");
            memaAlert("", "新增用户失败，失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });

    // 删除用户对话框
    $scope.delUser = function(tel) {
        $scope.delusertel = tel; 
    };

    // 删除用户完成
    $scope.delUserOk = function(businessId,userId,$index) {
        $socket.bind('business.customer.remove',{
            success : function(data){
                memaAlert("", "删除用户成功", 5,"");
                $scope.users.splice($index,1);
                $scope.range = Math.ceil($check.jsonLength($scope.users) / $scope.itemsPerPage) - 1;

            },
            err : function(data){
//                memaAlert("", "删除用户失败！请重试", 5,"error");
                memaAlert("", "删除用户失败，失败原因：" +$errtofont( data.err), 5,"error");
                console.log(data);
            }
        });

        var customerRemoveData = {
            api  : 'business.customer.remove',
            data : {
                business : businessId,
                customer : userId
            }
        }
        $socket.emit(customerRemoveData);
    };

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
        console.log($scope.users);
        return Math.ceil($scope.users.length / $scope.itemsPerPage) - 1;
    };
    $scope.range = Math.ceil($check.jsonLength($scope.users) / $scope.itemsPerPage) - 1;

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }
    };
    $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    };
});
menma.controller('userreg', function($scope, $socket,memaAlert,localStorageService) {
    // 添加一个用户完成
    $scope.addUserOk = function() {
        var errinfo=[];
        console.log($scope.userreg.tel.$invalid);
        // 添加一个普通用户
        if($scope.userreg.real.$invalid){
            errinfo.push("<li>用户姓名不能为空。</li>")
        }
        if($scope.userreg.tel.$invalid){
            errinfo.push("<li>用户手机号码必须为11位国内手机号码。</li>")
        }
        if($scope.userreg.pw.$invalid){
            errinfo.push("<li>用户密码长度为在6-16位。</li>")
        }
        if(errinfo.length>0){
            memaAlert("错误提示", "<ul>"+errinfo.join("")+"</ul>", 5,"error");
            return false;
        }

        var addUserData = {
            api : "business.customer.add",
            data : {
                business : localStorageService.get("userInfo").admin.businesses[0].id,
                customer : {
                    real : $scope.userAdd.real,
                    tel : $scope.userAdd.tel,
                    pwd: $.md5($scope.userAdd.pw)
                }
            }
        };

        // 发送添加用户数据
        console.log(addUserData);
      $socket.emit(addUserData);
    }

});