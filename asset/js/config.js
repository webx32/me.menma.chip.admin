/* 
 *
 *  路由管理
 *  功能：管理所有路由及加载各模块
 *  制作：何军
 *  时间：2014-09-25
 */
var menma = angular.module('memaApp', ['ngRoute', 'ngAnimate', 'ngResource', 'btford.socket-io', 'LocalStorageModule', 'mgcrea.ngStrap', 'mgcrea.ngStrap.popover', 'ngSanitize', 'ng.ueditor']); //['btford.socket-io']
var roles = {superUser: 0, admin: 1, user: 2};
// var adminuser = {isSuperUser:1,isAdministrator:1,isUser:1};
menma
    .config(['localStorageServiceProvider',
        function (localStorageServiceProvider) {
            localStorageServiceProvider.setPrefix('menma_'+document.domain.replace(/\./g, ""));
            localStorageServiceProvider.setStorageType('sessionStorage');
        }
    ])
    .config(function ($modalProvider) {
        angular.extend($modalProvider.defaults, {
            animation: 'am-slide-top'
        });
    })
    .factory('authorizationService', function ($resource, $q, $rootScope, $location, localStorageService,$socket) {
        return {
            permissionModel: localStorageService.get("userInfo") || { isPermissionLoaded: false},
            permissionCheck: function (roleCollection) {
                var deferred = $q.defer();
                var parentPointer = this;
                parentPointer.permissionModel=localStorageService.get("userInfo") || { isPermissionLoaded: false};
               // console.log(this.permissionModel.isPermissionLoaded);
//              console.log(parentPointer.permissionModel);

                if(parentPointer.permissionModel.isPermissionLoaded&&localStorageService.get("loginToken")){ //已经获取
                    parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);

                } else {
                    $location.path("/admin/login");
                    return false;
                }

                return deferred.promise;
            },
            getPermission: function (permissionModel, roleCollection, deferred) {
                var ifPermissionPassed = false;
              //  console.log(permissionModel);

                angular.forEach(roleCollection, function (role) {
                    switch (role) {
                        case roles.superUser:
                            if (!!permissionModel.permission.isSuperUser) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case roles.admin:
                            if (!!permissionModel.permission.isAdministrator) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case roles.user:
                            if (!!permissionModel.permission.isUser) {
                                ifPermissionPassed = true;
                            }
                            break;
                        default:
                            ifPermissionPassed = false;
                    }
                });
                if (!ifPermissionPassed) {
                    $location.path("/admin/login");
                    $rootScope.$on('$locationChangeSuccess', function (next, current) {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            }
        }
    })
    // $locationProvider.html5Mode(true);
    // 开启去除URL中的#
    // 需要服务器支持
    // 服务器把所有地址指向 /index.html 即可
//    .config(['$locationProvider', function($locationProvider) {
//        $locationProvider.html5Mode(true).hashPrefix('!');
//    }])
    .config(function ($routeProvider, $locationProvider) {




        $routeProvider
            .when('/admin/login', {
                templateUrl: '/template/adminlogin.html',
                controller: 'adminlogin'
            })
            .when('/admin/user/index', {
                templateUrl: '/template/user/index.html',
                controller: 'userindex',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })

            .when('/admin/index', {
                templateUrl: '/template/index.html',
                controller: 'index',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
//                    ,
//                    delay: function ($q) {  //需求js 延时加载
//                        var delay = $q.defer(),
//                            load = function () {
////                                $.getScript('/asset/js/jquery.cookie.js', function () {
////                                    delay.resolve();
////                                });
//                            };
//                        load();
//                        return delay.promise;
//                    }
                }
            })
            .when('/admin/activity', {
                templateUrl: '/template/activity/index.html',
                controller: 'activityindex',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })
            .when('/admin/activity/add', {
                templateUrl: '/template/activity/modify.html',
                controller: 'activityadd',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })
            .when('/admin/activity/show/:id', {
                templateUrl: '/template/activity/show.html',
                controller: 'activityshow',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })
            .when('/admin/activity/modify/:id', {
                templateUrl: '/template/activity/modify.html',
                controller: 'activitymodify',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })

            // added by huangxin at 2014-09-30 车位管理路由配置
            .when('/admin/carport/index', {
                templateUrl: '/template/carport/index.html',
                controller: 'carportmgr',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })
            .when('/admin/order/index', {
                templateUrl: '/template/order/index.html',
                controller: 'orderindex',
                caseInsensitiveMatch: true,
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.superUser]);
                    }
                }
            })
            .otherwise({
                caseInsensitiveMatch: false,
                redirectTo: '/admin/index'
            });
    })
    //socket
    .factory('$socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://192.168.2.110:9002'),
            prefix: ""
        });
    })
    //公共判断
    .factory('$check', function () {
        return check;
    })
    .factory('$errtofont', function () {
        return function(str){
        var temperrinfo=str.split(".");
        var lastinfo="";
        for (var key in temperrinfo){
            if(!lastinfo){
                lastinfo=menmaerrinfo[temperrinfo[key]]
            }
            else{
                lastinfo=lastinfo[temperrinfo[key]]
            }
        }
            return lastinfo||"未知错误";
          };

    })

    //公共警告框
    .factory('memaAlert', function ($alert) {
        return  function (title, content, duration, type) {
            $alert({
                title: title || '',
                content: content || '',
                placement: 'top',
                type: 'info',
                show: true,
                animation: 'am-fade-and-slide-top',
                duration: duration || 3,
                type: type || 'success'
            });
        };
    })
    //分页过滤
    .filter('offset', function () {
        return function (input, start) {
            start = parseInt(start, 10);
            return input.slice(start);
        };
    })
    .run(['$rootScope', '$location','$socket','localStorageService','$modal',
        function ($rootScope, $location, $socket, localStorageService,$modal) {
            $rootScope.path = $location.path();
            $rootScope.$on('$routeChangeSuccess', function (newVal) {
                $rootScope.path = $location.path();
            });
            $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
                if (eventObj.authenticated === false) {
                    $location.path("/admin/login");
                }
            });

                $rootScope.submit=function(){
                    angular.element('#adminlogintips').html("").addClass("hide");
                    var adminpw=angular.element('#topLoginBoxPw').val();
                    var admintel=angular.element('#topLoginBoxTel').val();
                    if (adminpw.length< 4) {
                        angular.element('#adminlogintips').addClass("alert-error");
                        angular.element('#adminlogintips').html("密码填写错误！").removeClass("hide");
                        return false;
                    }
                    angular.element('#adminlogintips').removeClass("alert-error").addClass("alert-success");
                    angular.element('#adminlogintips').html("正在提交...").removeClass("hide");
                    $socket.bind('admin.login',{
                        success: function (data) {
                        var tempuserInfo = data.data;
                        tempuserInfo.logintime = new Date();
                        tempuserInfo.permission = {
                            isSuperUser: true,
                            isUser: true,
                            isAdministrator: true
                        }

                        tempuserInfo.isPermissionLoaded = true;
                        localStorageService.add("userInfo", tempuserInfo);
                        localStorageService.add("loginToken", data.data.token);
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.hide();
                        });

                    },
                    err:function(data){


                    }})

                    var loginData = {
                        api: "admin.login",
                        data: {
                            admin: {
                                tel: admintel,
                                pwd : $.md5(adminpw)
                            }
                        }
                    };
                    $socket.emit(loginData,function(data){
                        console.log(1);
                        console.log(data);

                    });
                };

            $rootScope.topLoginBox=$modal({title: '需要验证登陆信息，请重新登陆', template: 'template/toploginbox.html', show: false,backdrop:false,keyboard:false,animation:"am-fade-and-slide-top",placement:"center"});

            $rootScope.logoutadmin = function() {
                localStorageService.clearAll();
                $location.path("/admin/login");
            };

            $socket.bind('session.restore', {
                // session过期时前端自动跳转至登录界面提示用户重新登录
                success: function(data) {
                    console.log(!angular.isArray(data.data.application.user));

                    if(!angular.isArray(data.data.application.businesses)){
                        localStorageService.clearAll();
//                        $location.path("/admin/login");
                        if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                            $rootScope.topLoginBox.$promise.then(function () {
                                $rootScope.topLoginBox.show();
                            });
                            angular.element("#sockettips,[role='progressbar']").hide();
                            angular.element("#topLoginBoxButton").removeClass('hide');
                        };
                        angular.element("#sockettips,[role='progressbar']").hide();
                        angular.element("#topLoginBoxButton").removeClass('hide');

                    }

                    else
                    {
                        localStorageService.set("loginToken",data.data.token);
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.hide();
                        });
                    }
                },
                err: function(data) {
                    localStorageService.clearAll();
                    if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.show();
                        });
                    };
                    angular.element("#sockettips,[role='progressbar']").hide();
//                    angular.element("#topLoginBoxButton").show();
                    angular.element("#sockettips").removeClass('hide');
                }
            });


                if (location.hash != "#/admin/login") {
                    // 发送重新连接的请求
                    var data = {
                        api: 'session.restore',
                        data: {
                            token: localStorageService.get("loginToken")
                        }
                    }

                    $socket.emit(data);
                }

        }
    ])

    .directive("clickToEdit", function () {
        var editorTemplate = '<div class="click-to-edit">' +
            '<div ng-hide="view.editorEnabled" ng-click="enableEditor()" title="点击编辑">' +
            '{{value}} ' +
            '</div>' +
            '<div ng-show="view.editorEnabled">' +
            '<input ng-model="view.editableValue" placeholder="请输入车位号">' +
            '<a ng-click="save()">保存</a>' +
            ' or ' +
            '<a ng-click="disableEditor()">取消</a>' +
            '</div>' +
            '</div>';

        return {
            restrict: "A",
            replace: true,
            template: editorTemplate,
            scope: {
                value: "=clickToEdit",
                id: "=clickToEditId",
                index: "=clickToEditIndex",
                allvalue: "=clickToEditAllvalue"
            },
            controller: function ($scope, $socket, memaAlert,$errtofont) {
                $scope.view = {
                    editableValue: $scope.value,
                    editorEnabled: false
                };

                $scope.enableEditor = function () {
                    $scope.view.editorEnabled = true;
                    $scope.view.editableValue = $scope.value;
                };

                $scope.disableEditor = function () {
                    $scope.view.editorEnabled = false;
                };
                $scope.save = function () {

                    //修改一个车位标题
                    $socket.bind("product.title.update", {
                        success: function (data) {
                            console.log(data);
                            memaAlert("", "车位号修改成功", 3, "");
                            $scope.view.editorEnabled = false;
                            $scope.allvalue[data.opt].title = data.data.title;

                        },
                        err: function (data) {
                            console.log(data);
                            $scope.view.editorEnabled = false;
                            memaAlert("", "车位号修改失败！失败原因："+$errtofont(data.err), 5, "error");
                        }
                    });
                    var sendData = {
                        "api": "product.title.update",
                        "data": {
                            "product": $scope.id,
                            "title": $scope.view.editableValue
                        },
                        "opt": $scope.index
                    };

                    $socket.emit(sendData);
                };
            }
        };
    })
    .directive("clickToEditExt", function () {
        var editorTemplate = '<div class="click-to-edit">' +
            '<div ng-hide="view.editorEnabled" ng-click="enableEditor()" title="点击编辑">' +
            '{{value}} ' +
            '</div>' +
            '<div ng-show="view.editorEnabled">' +
            '<input ng-model="view.editableValue" placeholder="请输入车位号">' +
            '<a ng-click="save()">保存</a>' +
            ' or ' +
            '<a ng-click="disableEditor()">取消</a>' +
            '</div>' +
            '</div>';

        return {
            restrict: "A",
            replace: true,
            template: editorTemplate,
            scope: {
                value: "=clickToEditExt",
                id: "=clickToEditId",
                index: "=clickToEditIndex",
                name:"=clickToEditName",
                allvalue: "=clickToEditAllvalue"
            },
            controller: function ($scope, $socket, memaAlert,$errtofont) {
                $scope.view = {
                    editableValue: $scope.value,
                    editorEnabled: false
                };

                $scope.enableEditor = function () {
                    $scope.view.editorEnabled = true;
                    $scope.view.editableValue = $scope.value;
                };

                $scope.disableEditor = function () {
                    $scope.view.editorEnabled = false;
                };
                $scope.save = function () {

                    //修改一个车位标题
                    $socket.bind("product.exts.update", {
                        success: function (data) {
                            console.log(data);
                            memaAlert("", "车位号修改成功", 3, "");
                            $scope.view.editorEnabled = false;
                            angular.forEach(data.data.product.exts, function(extsvalue) {
                                $scope.allvalue[$scope.index][extsvalue.ext_name]=extsvalue.ext_value;

                            });
//                            $scope.allvalue[data.opt].title = data.data[$scope.name];

                        },
                        err: function (data) {
                            console.log(data);
                            $scope.view.editorEnabled = false;
                            memaAlert("", "车位号修改失败！失败原因："+$errtofont(data.err), 5, "error");
                        }
                    });
                    var sendData = {
                        "api": "product.exts.update",
                        "data": {
                            "product": $scope.id,
                            "exts": {
//                                AREA:$scope.view.editableValue,
                           //    NUM:"asdasd"//$scope.allvalue[$scope.index].NUM
                            }
                        },
                        "opt": $scope.index
                    };
                    sendData.data.exts[$scope.name]=$scope.view.editableValue;
//                    if($scope.name=="AREA")
                    $socket.emit(sendData);
                };
            }
        };
    })
    .directive("clickToEditTags", function () {
        var editorTagsTemplate = '<div class="click-to-edit">' +
            '<div ng-hide="view.editorEnabledtag" title="点击编辑">' +
            ' <span class="label label-primary " ng-repeat="v in value" ng-click="deltag(v);" data-animation="am-fade-and-slide-top"  data-title="点击删除‘{{v}}’" bs-tooltip >{{v}}</span> ' +
            '<span class="label label-danger" ng-show="value.length<1"  ng-click="enableEditortag()" title="添加车位信息">+</span>'+
            '</div>' +
            '<div ng-show="view.editorEnabledtag">' +
            '<input ng-model="view.editableValue"  placeholder="添加车位信息">' +
            '<a ng-click="addtag()">保存</a>' +
            ' or ' +
            '<a ng-click="disableEditortag()">取消</a>' +
            '</div>' +
            '</div>';

        return {
            restrict: "A",
            replace: true,
            template: editorTagsTemplate,
            scope: {
                value: "=clickToEditTags",
                id: "=clickToEditId",
                index: "=clickToEditIndex",
                name: "=clickToEditName",
                tagnum: "=clickToEditTagnum" || 0,
                allvalue: "=clickToEditAllvalue"
            },
            controller: function ($scope, $socket, memaAlert) {
                $scope.view = {
                    editableValue: "",
                    editorEnabledtag: false
                };

                $scope.enableEditortag = function () {
                    $scope.view.editorEnabledtag = true;
                };

                $scope.disableEditortag = function () {
                    $scope.view.editorEnabledtag = false;
                };
                $scope.deltag=function(v){

                    $socket.bind("product.tag.update", {
                        success: function (data) {
                            console.log( data);
                            memaAlert("", "车位信息删除成功！", 3, "");
                            $scope.view.editorEnabledtag = false;
                            $scope.allvalue[$scope.index].tags=data.data.tags;

                        },
                        err: function (data) {
                            memaAlert("", "车位信息删除失败！请重试！", 5);
//                            console.log(data);
                        }
                    });
                    var tags=[];
                    angular.forEach($scope.allvalue[$scope.index].tags, function(tag) {
                        tags.push(tag);
                    });


                   // console.log(tags);
                   // var tags=$scope.allvalue[$scope.index].tags;
                    tags.splice(tags.indexOf(v),1);
                    var sendData = {
                        "api": "product.tag.update",
                        "data": {
                            "product": $scope.id,
                            "tags": tags
                        },
                        "opt": $scope.index
                    };

//                    console.log(sendData);
                    $socket.emit(sendData);

                };

                $scope.addtag = function () {

                    $socket.bind("product.tag.update", {
                        success: function (data) {
                            console.log( data);
                           memaAlert("", "车位信息添加成功！", 3, "");
                            $scope.view.editorEnabledtag = false;
//                            $scope.allvalue[data.opt].tags.push(data.data.tags[0]);
                            $scope.allvalue[$scope.index].tags=data.data.tags;

                        },
                        err: function (data) {
                            memaAlert("", "车位信息添加失败！请重试！", 5, "warning");
//                            console.log(data);
                        }
                    });
                    var tags=[];
                    angular.forEach($scope.allvalue[$scope.index].tags, function(tag) {
                        tags.push(tag);
                    });
                    tags.push($scope.view.editableValue);


                    var sendData = {
                        "api": "product.tag.update",
                        "data": {
                            "product": $scope.id,
                            "tags": tags
                        },
                        "opt": $scope.index
                    };
//                    console.log(sendData);
                    $socket.emit(sendData);

                };
            }
        };
   })
    .directive("clickToEditActivityTitle", function () {
        var editorTemplate = '<div class="click-to-edit">' +
            '<div ng-hide="activity.editorEnabled" ng-click="activitytitleenableEditor()" title="点击编辑">' +
            '{{value}} ' +
            '</div>' +
            '<div ng-show="activity.editorEnabled">' +
            '<input ng-model="activity.editableValue" placeholder="请输入活动名称">' +
            '<a ng-click="activitytitlesave()">保存</a>' +
            ' or ' +
            '<a ng-click="activitytitledisableEditor()">取消</a>' +
            '</div>' +
            '</div>';

        return {
            restrict: "A",
            replace: false,
            template: editorTemplate,
            scope: {
                value: "=clickToEditActivityTitle",
                id: "=clickToEditId",
                allvalue: "=clickToEditAllvalue"
            },
            controller: function ($scope, $socket, memaAlert) {
                $scope.activity = {
                    editableValue: $scope.value,
                    editorEnabled: false
                };

                $scope.activitytitleenableEditor = function () {
                    $scope.activity.editorEnabled = true;
                    $scope.activity.editableValue = $scope.value;

                };

                $scope.activitytitledisableEditor = function () {
                    console.log($scope.activity.editorEnabled);
                    $scope.activity.editorEnabled = false;

                };

                $scope.activitytitlesave = function () {
                    $socket.bind("activity.title.update", {
                        success: function (data) {

                            memaAlert("", "活动标题修改成功", 3, "");
                            $scope.activity.editorEnabled = false;
                            $scope.allvalue.title = $scope.activity.editableValue//=data.data.activity.title;

                        },
                        err: function (data) {

                            $scope.activity.editorEnabled = false;
                            memaAlert("", "活动标题修改失败！请重试！", 5, "warning");
                        }
                    });
                    var sendData = {
                        "api": "activity.title.update",
                        "data": {
                            activity:$scope.id,
                            title:$scope.activity.editableValue
                        },
                        "opt": ""
                    };


                   $socket.emit(sendData);
                };
            }
        };
    })


    .directive("clickToEditActivityOther", function () {
        var editorTemplate = '<div class="click-to-edit">' +
            '<div ng-hide="other.editorEnabled" class="inueditor"  style="width:320px;max-height:600px;padding:8px; margin-bottom:10px;overflow-x:hidden;overflow-y: auto; background-color: #fff; color:#000; border-radius: 5px;" ng-click="otherenableEditor()" title="点击编辑"ng-bind-html="thishtmlSnippet()">' +
            '</div>' +
            '<div ng-show="other.editorEnabled">' +
            '<div class="ueditor" ng-model="other.editableValue"  required></div>' +
            '<button type="button" class="btn btn-success" style="margin-top: 10px; margin-bottom: 10px;" ng-click="othersave()">保存</button>' +
            '&nbsp&nbsp' +
            '<button type="button" class="btn btn-primary" ng-click="otherdisableEditor()">取消</button>' +
            '</div>' +
            '</div>';

        return {
            restrict: "A",
            replace: true,
            template: editorTemplate,
            scope: {
                value: "=clickToEditActivityOther",
                id: "=clickToEditId",
                name:"=clickToEditName",
                allvalue: "=clickToEditAllvalue"
            },
            controller: function ($scope, $socket, memaAlert,$sce,$check) {
                $scope.ready = function(editor){
                   editor.setContent( $scope.value);
                }
                $scope.other = {
                    editableValue: $scope.value,
                    editorEnabled: false
                };
                $scope.thishtmlSnippet=function(){
                  return  $sce.trustAsHtml($scope.value);
                };
                $check.consoleLog($scope.Thishtml);

                console.log(1);
                console.log($scope.other.editableValue);
                $scope.otherenableEditor = function () {
                    $scope.other.editorEnabled = true;
                    $scope.other.editableValue = $scope.value;
                };

                $scope.otherdisableEditor = function () {
                    $scope.other.editorEnabled = false;
                };
                $scope.othersave = function () {
                    $socket.bind("activity."+$scope.name+".update", {
                        success: function (data) {

                            memaAlert("", "活动标题修改成功", 3, "");
                            $scope.other.editorEnabled = false;
                            $scope.allvalue[$scope.name] = data.data.activity[$scope.name];

                        },
                        err: function (data) {

                            $scope.other.editorEnabled = false;
                            memaAlert("", "活动标题修改失败！请重试！", 5, "warning");
                        }
                    });
                    var sendData = {
                        "api": "activity."+$scope.name+".update",
                        "data": {
                            activity:$scope.id
                        },
                        "opt": ""
                    };
                    sendData.data[$scope.name]=$scope.other.editableValue;

                    console.table(sendData);
                    $socket.emit(sendData);
                };
            }
        };
    })
