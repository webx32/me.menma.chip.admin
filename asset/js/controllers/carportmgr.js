/**
 * @desc 车位管理控制器
 * @author 何军
 * @since 2014-10-23
 * @param $scope
 * @param $socket
 * @param $modal
 */
menma.controller('carportmgr', function ($scope, $socket, $modal,memaAlert, $check ,$errtofont,localStorageService ) {
    document.title="车位管理";
    $scope.viewtypes=1;
    // 默认车位
    $scope.cars = [];
   $scope.cars = [{id:"xx",tags:["xx","asd"],title:"dddd",status:"cancelled"},{id:"xx",tags:["xx","asd"],title:"dddd",status:"removed"}];
    $scope.statusToChinese=function(status){
       return status[status]||"创建";
    }



    //获取所有车位列表 从数据库中读取
    $socket.bind("business.product.list", {
        success: function (data) {
            console.log(data);
            $scope.cars = data.data.products;

            angular.forEach($scope.cars, function(carsvalue) {

                angular.forEach(carsvalue.exts, function(extsvalue) {
//                    console.log(value);
                    carsvalue[extsvalue.ext_name]=extsvalue.ext_value;


                });
            });

            //$scope.cars.splice(0, 12)
        },
        err: function (data) {
            memaAlert("", "车位信息获取失败，失败原因：" +$errtofont( data.err), 5,"error");
            // console.log(data);
        }
    });
    var allCarData = {
        api: "business.product.list",
        data: {
            business : localStorageService.get("userInfo").admin.businesses[0].id
        }
    };
    $socket.emit(allCarData);

    // 添加车位的蒙版模板控制
    var addCarPortmodal = $modal({
        scope: $scope,
        prefixEvent: "modal",
        backdrop: false,
        container: 'body',
        template: '/template/carport/add.html',
        controller: 'addcarctrl',
        show: false
    });

    // memaAlert("修改成功","增加车位成功",5);
    // memaAlert("修改成功2","增加车位成功2");
    // 删除
    $socket.bind("product.del", {
        success: function (data) {
            console.log(data);
            //$scope.cars = data.data;
            $scope.carssplice(data.opt, 1);
            memaAlert("删除成功", "删除车位成功，删除车位将不能恢复！", 5);
        },
        err: function (data) {
             console.log(data);

            memaAlert("删除失败", "失败原因：" +$errtofont( data.err), 5,"error");
        }
    });
    $scope.delCarFun = function (id,i) {
        var addCarData = {
            api: "product.del",
            data: {
                id: id
            },
            option:i
        };
        $socket.emit(addCarData);
    }

    //修改一个车位
    $socket.bind("product.get", {
        success: function (data) {
            console.log(data);
            addCarPortmodal.show();
            $scope.carAdd = [data.data];
        },
        err: function (data) {
            memaAlert("修改失败", "失败原因：" +$errtofont( data.err), 5,"error");
            // console.log(data);
        }
    });
    $scope.modifyCar = function (id) {
        var addCarData = {
            api: "product.get",
            data: {
                product: id
            }
        };
        $socket.emit(addCarData);
    }


    // 添加一个车位模态对话框
    $scope.addCarPort = function () {
        $scope.carAdd = {tags:[]};
        addCarPortmodal.show();
    }

    // 绑定添加一个车位回调事件
    $socket.bind("business.product.add", {
        success: function (data) {
            console.log(data);
            $scope.cars.push(data.data.product);
            console.table($scope.cars);
            addCarPortmodal.hide();
        },
        err: function (data) {
            memaAlert("", "车位信息获取失败，失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });
    // 绑定修改一个车位回调事件
    $socket.bind("product.update", {
        success: function (data) {
            console.log(data);
            $socket.emit(allCarData);
            addCarPortmodal.hide();
        },
        err: function (data) {
            memaAlert("修改失败", "失败原因：" +$errtofont( data.err), 5,"error");
            console.log(data);
        }
    });

    // 添加一个车位请求
    $scope.addCarPortOk = function () {


        // if ($scope.carform.title.$invalid) {
        //     alert("车位期数未选择");
        //     return false;
        // }
        // if ($scope.carform.tag.$invalid) {
        //     alert("车位分组标签");
        //     return false;
        // }
        // if ($scope.carform.num.$invalid) {
        //     alert("车位编号输入错误");
        //     return false;
        // }
//        {title:"xx"}

        console.log($scope.carAdd.title);
        // 设置添加车位的title


        $scope.carAdd.volume = 1;
        $scope.carAdd.price = 0;
        // console.log($scope.carAdd);
        // 发送请求
        var addCarData = {
            api: $scope.carAdd.id ? "product.update" : "business.product.add",

            data: {
                product: $scope.carAdd,
                business:localStorageService.get("userInfo").admin.businesses[0].id
            }
        }



        console.log(addCarData);
        $socket.emit(addCarData);

    }
});