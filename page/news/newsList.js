layui.config({
    base: '../../js/' //此处路径请自行处理, 可以使用绝对路径
}).extend({
    tableSelect: 'tableSelect',
    yutons_sug: 'yutons_sug'
});
layui.use(['form','layer','laydate','table','laytpl','element','tableSelect','yutons_sug'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        element = layui.element,
        table = layui.table,
        tableSelect=layui.tableSelect,
        yutons_sug=layui.yutons_sug;

    $(document).ready(function(){
        AreaCity_load();//加载地区选项
        BackUserload();//加载编辑人员选项
    })

    //新闻列表
    var tableIns = table.render({
        elem: '#newsList',
        request: {
            pageName: 'pageIndex', //页码的参数名称，默认：page
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        parseData: function(res){
            return{
                "code": 0, //解析接口状态
                "msg": '', //解析提示文本
                "count": res.total, //解析数据长度
                "data": res.data //解析数据列表
            };
        },
        done: function(res, curr, count){
            layui.each(res.data,function(index,data){
                data['ischange']=0;
            })
        },
        cellMinWidth : 95,
        page : true,
        height : "full-170",
        limit : 20,
        limits : [10,15,20,25],
        id : "newsListTable",
        cols : [[
            {type: "checkbox", fixed:"left", width:50},
            {title: '操作', width:120, templet:'#newsListBar',fixed:"left",align:"center"},
            {field: 'fdid', title: 'ID', width:60, align:"center"},
            {field: 'fdarticletitle', title: '名称', width:350},
            {field: 'fdareaname', title: '地区', align:'center',event:'change-fdarea'},
            {field: 'fdpublishtime', title: '发布时间', align:'center',event: 'change-fdpublishtime', minWidth:110, templet:function(d){
                return d.fdpublishtime.substring(0,10);
            }},
            {field: 'fdimportance', title: '正负面',  align:'center' ,event: 'change-fdimportance',templet:function(d){
                var flag="";
                if(d.fdimportance=='1'){
                    flag="未设置";
                }else if(d.fdimportance=='2'){
                    flag="优良";
                }else if(d.fdimportance=='3'){
                    flag="不良";
                }else {
                    flag="未设置";
                }
                return flag;
            }},
            {field: 'fdapproveflag', title: '审核',event: 'change-fdapproveflag',  align:'center',templet:function(d){
                var flag="";
                if(d.fdapproveflag=='0'){
                    flag="未审核";
                }else if(d.fdapproveflag=='1'){
                    flag="未审核";
                }else if(d.fdapproveflag=='2'){
                    flag="审核通过";
                }else if(d.fdapproveflag=='3'){
                    flag="审核未通过";
                }else if(d.fdapproveflag=='4'){
                    flag="待审核";
                }else if(d.fdapproveflag=='5'){
                    flag="待编辑";
                }else if(d.fdapproveflag=='7'){
                    flag="编辑完";
                }else {
                    flag="未审核";
                }
                return flag;
            }},
            {field: 'fdchannel', title: '所属栏目', align:'center',event:'change-fdchannel'},
            {field: 'ischange', title: '是否修改', hide:true},
            // {field: 'newsTop', title: '是否置顶', align:'center', templet:function(d){
            //     return '<input type="checkbox" name="newsTop" lay-filter="newsTop" lay-skin="switch" lay-text="是|否" '+d.newsTop+'>'
            // }},
        ]]
    });

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
        }else if (layEvent=='change-fdimportance'){//正负面修改
            var offsettop=$(this).offset().top+'px';
            var offsetleft=$(this).offset().left+'px';
            layui.layer.open({
                type:1,
                title: false,
                btn: ['确定', '取消'],
                btnAlign: 'c',
                closeBtn:0,
                skin: 'layer-overflow',
                offset: [offsettop, offsetleft],
                content: $("#div-zhengfumian"),
                success:function(){
                    form.val('form-zhengfumian',{
                        'select-zhengfumian':data.fdimportance
                    })
                },
                yes:function(index,layerdom){
                    obj.update({
                        ischange: 1,
                        fdimportance:layerdom.find('select').val()
                    });
                    layer.close(index);
                }
            });  
        }else if (layEvent=='change-fdapproveflag'){//审核状态修改
            var offsettop=$(this).offset().top+'px';
            var offsetleft=$(this).offset().left+'px';
            layui.layer.open({
                type:1,
                title: false,
                btn: ['确定', '取消'],
                btnAlign: 'c',
                closeBtn:0,
                skin: 'layer-overflow',
                offset: [offsettop, offsetleft],
                content: $("#div-fdapproveflag"),
                success:function(){
                    form.val('form-fdapproveflag',{
                        'select-fdapproveflag':data.fdapproveflag
                    })
                },
                yes:function(index,layerdom){
                    obj.update({
                        ischange: 1,
                        fdapproveflag:layerdom.find('select').val()
                    });
                    layer.close(index);
                }
            });  
        }else if (layEvent=='change-fdpublishtime'){//发布时间修改
            var offsettop=$(this).offset().top+'px';
            var offsetleft=$(this).offset().left+'px';
            layui.layer.open({
                type:1,
                title: false,
                btn: ['确定', '取消'],
                //area:['280px','330px'],
                btnAlign: 'c',
                closeBtn:0,
                skin: 'layer-overflow',
                offset: [offsettop, offsetleft],
                content: $("#div-fdpublishtime"),
                success:function(layero, index){
                    laydate.render({
                        elem: '#div-fdpublishtime input',
                        //elem: '#div-fdpublishtime div',
                        show:true,
                        value: data.fdpublishtime.substring(0,10)
                    });
                },
                yes:function(index,layerdom){
                    obj.update({
                        ischange: 1,
                        fdpublishtime:layerdom.find('input').val()
                    });
                    layer.close(index);
                }
            });  
        }else if (layEvent=='change-fdarea'){//发布地区修改
            var offsettop=$(this).offset().top+'px';
            var offsetleft=$(this).offset().left+'px';
            layui.layer.open({
                type:1,
                title: false,
                btn: ['确定', '取消'],
                //area:['280px','330px'],
                btnAlign: 'c',
                closeBtn:0,
                skin: 'layer-overflow',
                offset: [offsettop, offsetleft],
                content: $("#div-fdarea"),
                success:function(layero, index){
                    //table.reload("fdareaListTable");
                },
                yes:function(index,layerdom){
                    obj.update({
                        ischange: 1,
                        fdarea:layerdom.find('input').attr('areaid'),
                        fdareaname:layerdom.find('input').val()
                    });
                    layerdom.find('input').removeAttr('areaid');
                    layerdom.find('input').val('');
                    layer.close(index);
                }
            });  
        }else if (layEvent=='change-fdchannel'){//栏目修改
            var offsettop=$(this).offset().top+'px';
            var offsetleft=$(this).offset().left+'px';
            layui.layer.open({
                type:1,
                title: false,
                btn: ['确定', '取消'],
                //area:['280px','330px'],
                btnAlign: 'c',
                closeBtn:0,
                skin: 'layer-overflow',
                offset: [offsettop, offsetleft],
                content: $("#div-fdchannel"),
                success:function(layero, index){
                    
                },
                yes:function(index,layerdom){
                    obj.update({
                        ischange: 1,
                        fdchannelid:layerdom.find('input').attr('channelid'),
                        fdchannel:layerdom.find('input').val()
                    });
                    layerdom.find('input').removeAttr('channelid');
                    layerdom.find('input').val('');
                    layer.close(index);
                }
            });  
        }
    });

    tableSelect.render({
		elem: '#select-infosource',
		searchKey: 'key',
		searchPlaceholder: '',
		table: {
            url:'http://localhost:13389/DataServer/GetChannelAjax.aspx?method=searchInfosource&sortOrder=',
            request: {
                pageName: 'pageIndex', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            parseData: function(res){
                return{
                    "code": 0, //解析接口状态
                    "msg": '', //解析提示文本
                    "count": res.total, //解析数据长度
                    "data": res.data //解析数据列表
                };
            },
			cols: [[
                { type: 'checkbox' },
                { field: 'text', title: '信源名称' },
			]]
		},
		done: function (elem, data) {
			var NEWJSON = []
			layui.each(data.data, function (index, item) {
				NEWJSON.push(item.text)
			});
			elem.val(NEWJSON.join(","));
		}
    });

    tableSelect.render({
        elem: '#div-fdarea input',
        searchKey: 'key',
        searchPlaceholder: '',
        table: {
            id : "fdareaListTable",
            url:'http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetCitySearchListJson',
            //url:'../../testdata/LoadNews.json',
            page:false,
            width:380,
            height:260,
            parseData: function(res){
                return{
                    "code": 0, //解析接口状态
                    "msg": '', //解析提示文本
                    "count": res.total, //解析数据长度
                    "data": res.data //解析数据列表
                };
            },
            cols: [[
                { type: 'radio' },
                { field: 'rfdname', title: '地区' },
                { field: 'rfdid', title: '编码' },
            ]]
        },
        done: function (elem, data) {
            if(data.data.length>0){
                elem.attr('areaid',data.data[0].rfdid);
                elem.val(data.data[0].rfdname);
            }
        }
    });

    tableSelect.render({
        elem: '#div-fdchannel input',
        searchKey: 'key',
        searchPlaceholder: '',
        table: {
            id : "fdchannelListTable",
            url:'http://localhost:13389/DataServer/GetChannelAjax.aspx?method=LoadChannelAllTagJson',
            //url:'../../testdata/LoadNews.json',
            page:false,
            width:380,
            height:260,
            parseData: function(res){
                return{
                    "code": 0, //解析接口状态
                    "msg": '', //解析提示文本
                    "count": res.total, //解析数据长度
                    "data": res.data //解析数据列表
                };
            },
            cols: [[
                { type: 'radio' },
                { field: 'fdname', title: '栏目' },
                { field: 'fdid', title: 'ID' },
            ]]
        },
        done: function (elem, data) {
            if(data.data.length>0){
                elem.attr('channelid',data.data[0].fdid);
                elem.val(data.data[0].fdname);
            }
        }
    });
    
    laydate.render({
        elem: '#select-tfdpublishtimebegin'
    });

    laydate.render({
        elem: '#select-tfdpublishtimeend'
    });

    //地区选择
    //加载省份方法
    function AreaCity_load() {
        $.ajax({
            url: "http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetAreaList",
            type: "Post",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                //debugger;
                var ddl = $(".select-sheng");
                //删除节点
                $(".select-sheng option").remove();
                ddl.append("<option value=''>不限(省份)</option>");
                //重新添加
                $.each(data, function (i, n) {
                    var opt = $("<option></option>").text(data[i].fdareaname).val(data[i].fdareacode);
                    ddl.append(opt);
                });
                //重新渲染控件
                form.render('select');
            },
            error: function (data) {
                //alert("Error");
            }
        });
    }
    //地级市
    form.on('select(select-sheng)',function(data){
        var id = data.value;
        $.ajax({
            url: "http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetAreaList&id=" + id,
            type: "Post",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                //debugger;
                var ddl = $(".select-shi");
                //删除节点
                $(".select-shi option").remove();
                ddl.append("<option value=''>不限(地级市)</option>");
                ddl.append("<option value='0'>全部下属地区</option>");
                ddl.append("<option value='-2'>其他</option>");
                $(".select-quxian option").remove();
                $(".select-quxian").html("<option value=''>不限(县级市)</option>");
                //重新添加
                $.each(data, function (i, n) {
                    var opt = $("<option></option>").text(data[i].fdareaname).val(data[i].fdareacode);
                    ddl.append(opt);
                });
                //重新渲染控件
                form.render('select');
            },
            error: function (data) {
                //alert("Error");
            }
        });
    })
    //县级市
    form.on('select(select-shi)',function(data){
        var id = data.value;
        if (id == -2) { id = $(".select-sheng").val(); }
        $.ajax({
            url: "http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetAreaListXian&id=" + id,
            type: "Post",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                var ddl = $(".select-quxian");
                //删除节点
                $(".select-quxian option").remove();
                ddl.html("<option value=''>不限(县级市)</option>");
                //重新添加
                $.each(data, function (i, n) {
                    var opt = $("<option></option>").text(data[i].fdareaname).val(data[i].fdareacode);
                    ddl.append(opt);
                })
                //重新渲染控件
                form.render('select');
            },
            error: function (data) {
                //alert("Error");
            }
        });
    })

    //加载编辑人员
    function BackUserload() {
        $.ajax({
            url: "http://localhost:13389/DataServer/TreeData.aspx?method=GetBackUser",
            type: "Post",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                var editor_ddl = $(".select-editor");
                var approver_ddl = $(".select-approver");
                $.each(data, function (i, n) {
                    var opt = $("<option></option>").text(data[i].Fdusername).val(data[i].Fdusername);
                    var opt2 = $("<option></option>").text(data[i].Fdusername).val(data[i].Fdusername);
                    editor_ddl.append(opt);
                    approver_ddl.append(opt2);
                })
                form.render('select');
            },
            error: function (data) {
                alert("Error");
            }
        });
    }

    //表格编辑中的地区

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

    //搜索
    $(".search_btn").on("click",function(){
        // if($(".searchVal").val() != ''){
        
        //地区选项
        var CityCode = '';
        var codesheng = $(".select-sheng").val();
        var codeshi = $(".select-shi").val();
        var codequxian = $(".select-quxian").val();
        if (codequxian != null && codequxian != "") {
            CityCode = codequxian;
        }
        else {
            if (codeshi != null && codeshi != "") {
                if(codeshi=="0")
                {
                    CityCode=codesheng+"|0";
                }
                else
                {
                    CityCode = codeshi;
                }
            }
            else {
                if (codesheng != null && codesheng != "") {
                    CityCode = codesheng;
                }
            }
        }

        table.reload("newsListTable",{
            url:'http://localhost:13389/DataServer/TreeData.aspx?method=SearchNews',
            //url:'../../testdata/LoadNews.json',
            where:{
                //fdnodeid: 'f729396dac5a48e9bf289d4d1a85eab3',
                key:$(".searchVal").val(),
                CityCode:CityCode,
                ZHongYao:$(".select-zhengfumian").val(),
                fdaproveflag_slt:$(".select-fdapproveflag").val(),
                selectInChannel:$(".select-inchannel").val(),
                SelectInSubProject:$(".select-insubproject").val(),
                SelectType:$(".select-type").val(),
                infosource:$("#select-infosource").val(),
                editor:$(".select-editor").val(),
                approver:$(".select-approver").val(),
                tfdpublishtimebegin:$("#select-tfdpublishtimebegin").val(),
                tfdpublishtimeend:$("#select-tfdpublishtimeend").val(),
                sortOrder:'',
                isPriorityQueryInfoSources:true,
            },
            page: {
                curr: 1 //重新从第 1 页开始
            },
        })
        // }else{
        //     layer.msg("请输入搜索的内容");
        // }
    });

    //保存列表中的修改
    $("#btn_saveNews").on('click',function(){
        debugger;
        var data = layui.table.cache.newsListTable.filter(function(item){
            return item.ischange=='1'
        });
        //alert(data);
        //var json = mini.encode(data);

        //alert(json);
        if (data.length > 0) {
            //grid.loading("保存中，请稍后......");
            //alert(data.length);
            $.ajax({
                url: "http://localhost:13389/DataServer/TreeData.aspx?method=SaveNews",
                data: { data: data },
                type: "post",
                dataType : 'json',
                success: function (result) {
                    //alert(text);
                    //var o = mini.decode(text);
                    if (result.iserror) {
                        alert(result.responseText);
                    } else {
                        top.layer.msg("保存成功！");
                    }

                    //grid.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(jqXHR.responseText);
                }
            });
        }else{
            alert("没有已修改的数据");
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
                    body.find("#fdid").val(edit.fdid);
                    // body.find(".newsName").val(edit.newsName);
                    // body.find(".abstract").val(edit.abstract);
                    // body.find(".thumbImg").attr("src",edit.newsImg);
                    // body.find("#news_content").val(edit.content);
                    // body.find(".newsStatus select").val(edit.newsStatus);
                    // body.find(".openness input[name='openness'][title='"+edit.newsLook+"']").prop("checked","checked");
                    // body.find(".newsTop input[name='newsTop']").prop("checked",edit.newsTop);
                    // form.render();
                }
                setTimeout(function(){
                    layui.layer.tips('点击此处返回文章列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            },

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
            data = checkStatus.data;
        if(data.length > 0) {
            layer.confirm('确定删除选中的文章？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: "http://localhost:13389/DataServer/TreeData.aspx?method=SaveNews",
                    data: { data: data },
                    type: "post",
                    dataType : 'json',
                    success: function (result) {
                        layer.close(index);
                        if (result.iserror) {
                            top.layer.msg(result.responseText);
                        } else {
                            //top.layer.msg("保存成功！");
                            tableIns.reload();
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.responseText);
                    }
                });
            })
        }else{
            layer.msg("请选择需要删除的文章");
        }
    })

   

})