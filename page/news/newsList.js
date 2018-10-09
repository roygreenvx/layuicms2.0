layui.use(['form','layer','laydate','table','laytpl','element'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        element = layui.element;
        table = layui.table;

    //新闻列表
    var tableIns = table.render({
        elem: '#newsList',
        //url : '../../testdata/LoadNews.json',
        url:'http://localhost:12136/DataServer/TreeData.aspx?method=LoadNews',
        request: {
            pageName: 'pageIndex', //页码的参数名称，默认：page
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        where:{
            fdnodeid: 'f729396dac5a48e9bf289d4d1a85eab3',
            //fdaproveflag_slt:1,
            sortOrder:''
        },
        parseData: function(res){
            debugger;
            return{
                "code": 0, //解析接口状态
                "msg": '', //解析提示文本
                "count": res.total, //解析数据长度
                "data": res.data //解析数据列表
            };
        },
        cellMinWidth : 95,
        page : true,
        height : "full-170",
        limit : 20,
        limits : [10,15,20,25],
        id : "newsListTable",
        cols : [[
            {type: "checkbox", fixed:"left", width:50},
            {field: 'fdid', title: 'ID', width:60, align:"center"},
            {field: 'fdarticletitle', title: '名称', width:350},
            {field: 'fdareaname', title: '地区', align:'center'},
            {field: 'fdpublishtime', title: '发布时间', align:'center', minWidth:110, templet:function(d){
                return d.fdpublishtime.substring(0,10);
            }},
            {field: 'fdimportance', title: '正负面',  align:'center',templet:function(d){
                var flag="未设置";
                switch(d.fdimportance){
                    case 1:
                        flag="未设置";
                        break;
                    case 2:
                        flag="优良";
                        break;
                    case 3:
                        flag="不良";
                        break;
                }
                return flag;
            }},
            {field: 'fdapproveflag', title: '审核',  align:'center',templet:function(d){
                var flag="未审核";
                switch(d.fdapproveflag){
                    case 0:
                        flag="未审核";
                        break;
                    case 1:
                        flag="未审核";
                        break;
                    case 2:
                        flag="审核通过";
                        break;
                    case 3:
                        flag="审核未通过";
                        break;
                    case 4:
                        flag="待审核";
                        break;
                    case 5:
                        flag="待编辑";
                        break;
                    case 7:
                        flag="编辑完";
                        break;
                }
                return flag;
            }},
            {field: 'fdchannel', title: '所属栏目', align:'center'},
            // {field: 'newsTop', title: '是否置顶', align:'center', templet:function(d){
            //     return '<input type="checkbox" name="newsTop" lay-filter="newsTop" lay-skin="switch" lay-text="是|否" '+d.newsTop+'>'
            // }},
            
            {title: '操作', width:170, templet:'#newsListBar',fixed:"right",align:"center"}
        ]]
    });

    //是否置顶
    form.on('switch(newsTop)', function(data){
        var index = layer.msg('修改中，请稍候',{icon: 16,time:false,shade:0.8});
        setTimeout(function(){
            layer.close(index);
            if(data.elem.checked){
                layer.msg("置顶成功！");
            }else{
                layer.msg("取消置顶成功！");
            }
        },500);
    })

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        if($(".searchVal").val() != ''){
            table.reload("newsListTable",{
                page: {
                    curr: 1 //重新从第 1 页开始
                },
                where: {
                    key: $(".searchVal").val()  //搜索的关键字
                }
            })
        }else{
            layer.msg("请输入搜索的内容");
        }
    });

    //添加文章
    function addNews(edit){
        var index = layui.layer.open({
            title : "添加文章",
            type : 2,
            content : "newsAdd.html",
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                if(edit){
                    body.find(".newsName").val(edit.newsName);
                    body.find(".abstract").val(edit.abstract);
                    body.find(".thumbImg").attr("src",edit.newsImg);
                    body.find("#news_content").val(edit.content);
                    body.find(".newsStatus select").val(edit.newsStatus);
                    body.find(".openness input[name='openness'][title='"+edit.newsLook+"']").prop("checked","checked");
                    body.find(".newsTop input[name='newsTop']").prop("checked",edit.newsTop);
                    form.render();
                }
                setTimeout(function(){
                    layui.layer.tips('点击此处返回文章列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        layui.layer.full(index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(index);
        })
    }
    $(".addNews_btn").click(function(){
        addNews();
    })

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('newsListTable'),
            data = checkStatus.data,
            newsId = [];
        if(data.length > 0) {
            for (var i in data) {
                newsId.push(data[i].newsId);
            }
            layer.confirm('确定删除选中的文章？', {icon: 3, title: '提示信息'}, function (index) {
                // $.get("删除文章接口",{
                //     newsId : newsId  //将需要删除的newsId作为参数传入
                // },function(data){
                tableIns.reload();
                layer.close(index);
                // })
            })
        }else{
            layer.msg("请选择需要删除的文章");
        }
    })

    //列表操作
    table.on('tool(newsList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;

        if(layEvent === 'edit'){ //编辑
            addNews(data);
        } else if(layEvent === 'del'){ //删除
            layer.confirm('确定删除此文章？',{icon:3, title:'提示信息'},function(index){
                // $.get("删除文章接口",{
                //     newsId : data.newsId  //将需要删除的newsId作为参数传入
                // },function(data){
                    tableIns.reload();
                    layer.close(index);
                // })
            });
        } else if(layEvent === 'look'){ //预览
            layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问")
        }
    });

})