/* 
 *
 *  路由管理
 *  功能：管理所有路由及加载各模块
 *  制作：何军
 *  时间：2014-09-25
 */
var x=angular.module('memaApp',[]);

    x.controller('Allapp', function ($scope) {
    $scope.tabs=["a","b",0];
    var tabactiveindex=$scope.tabactiveindex=0;
        $scope.changetab= function (i) {
            $scope.tabactiveindex=i;
        };

        });