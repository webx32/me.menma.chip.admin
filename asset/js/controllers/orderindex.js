/**
 * 订单管理
 *
 *
 */

menma.controller('orderindex', function ($scope, $socket, $modal, $check,memaAlert,localStorageService ,$errtofont) {
    document.title="订单管理";
    $scope.orderby="";
//    memaAlert("", "c123123123c",3000, "");
    $scope.orderlist=[];
    //获取所有订单列表 从数据库中读取
    $socket.bind("business.purchase.list", {
        success: function (data) {
            console.log(data);
            $scope.orderlist = data.data.purchases;

        },
        err: function (data) {
            memaAlert("订单列表获取失败", "失败原因：" +$errtofont( data.err), 5,"error");
             console.log(data);
        }
    });
    var sendlistData = {
        api: "business.purchase.list",
        data: {
            business:localStorageService.get("userInfo").admin.businesses[0].id
        },
        opt:"订单列表获取"
    };
    console.log(sendlistData);
    $socket.emit(sendlistData);

    $socket.bind("business.purchase.update", {
        success: function (data) {
            console.log(data);
            $scope.orderlist = data.data;

//            console.log($scope.orderlist)

        },
        err: function (data) {
            memaAlert("订单更新失败", "失败原因：" +$errtofont( data.err), 5,"error");
            // console.log(data);
        }
    });
    var sendlistData = {
        api: "business.purchase.list",
        data: {
            id:"xx",
            business:localStorageService.get("userInfo").admin.businesses[0].id

        }
    };
//    console.log(data);
//    $socket.emit(sendlistData);


})