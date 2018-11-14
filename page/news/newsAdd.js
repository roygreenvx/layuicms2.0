var keditor;
KindEditor.ready(function (K) {
    keditor = K.create('#content', {
        themeType : 'simple',
        width : '100%',
        resizeType: 0,
        minHeight: 50,//设置编辑器的最小高度
        minWidth: 500,//设置编辑器的最小宽度
        allowPreviewEmoticons: !1,
        allowImageUpload: !1,
        
    });
});
layui.config({
    base: '../../js/' //此处路径请自行处理, 可以使用绝对路径
}).extend({
    formSelects: 'formSelects-v4'
});
layui.use(['form','layer','table','layedit','laydate','upload','formSelects'],function(){
    var form = layui.form
        layer = parent.layer === undefined ? layui.layer : top.layer,
        laypage = layui.laypage,
        upload = layui.upload,
        layedit = layui.layedit,
        laydate = layui.laydate,
        table = layui.table,
        formSelects = layui.formSelects,
        $ = layui.jquery;
    
    var delAttList=[];//删除的附件

    var fdid=$("#fdid").val();//文章id
    var originData="";

    //编辑时初始化赋值
    if(fdid!=""){
        $.ajax({
            url: "http://localhost:13389/DataServer/TreeData.aspx?method=LoadEditNew&fdid="+fdid,
            dataType : 'json',
            success: function (result) {
                //console.log(result);
                originData=result;
                form.val("form-news", {
                    "fdarticletitle": result.fdarticletitle
                    ,"fdarticleurl": result.fdarticleurl
                    ,"fdsource": result.fdsource
                    ,"fdkeyword": result.fdkeyword
                    ,"fdpublishdate": result.fdpublishdate.replace('T',' ')
                    ,"fdimportance": result.fdimportance
                    ,"fdapproveflag": result.fdapproveflag
                });
                keditor.html(result.fdhtmlcontent);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseText);
            }
        });
    }

    laydate.render({
        elem: '#fdpublishdate',
        format:'yyyy-MM-dd HH:mm:ss'
    });

    formSelects.data('select-city', 'server', {
        url: 'http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetCityDataByfdidJson&fdid='+fdid,
    }).btns('select-city', ['remove']);

    formSelects.data('select-channel', 'server', {
        url: 'http://localhost:13389/DataServer/GetChannelAjax.aspx?method=LoadChannelAllTagJsonNew&fdid='+fdid,
    }).btns('select-channel', ['remove']);


    var tableIns=table.render({
        elem:'#attTable',
        url:'http://localhost:13389/DataServer/TreeData.aspx?method=LoadEditAttachment&fdid='+fdid,
        request: {
            pageName: 'pageIndex', //页码的参数名称，默认：page
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        where:{
            sortOrder:'',
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
        id : "attListTable",
        cols : [[
            {title: '', width:90, templet:'#attListBar',fixed:"left",align:"center"},
            //{field: 'fdid', title: 'ID', align:"center"},
            {field: 'fdfilename', title: '名称', align:"center"},
            {field: 'fdisshowinpage', title: '是否文件中显示', align:"center"},
            {field: 'fdattachmentguid', title: '文档中标示', align:"center"},
            {field: 'fdfiletype', title: '类型', align:"center"},
            {field: 'fdupdatetime', title: '时间', align:"center"},
        ]]
    });

    table.on('tool(attTable)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        if(layEvent === 'del'){ //删除
            var fdhtmlcontent = keditor.html();
            fdhtmlcontent = fdhtmlcontent.replace('[AttachmentID=' + data.fdattachmentguid + ']', '');
            fdhtmlcontent = fdhtmlcontent.replace('[PICAttachmentID=' + data.fdattachmentguid + ']', '');
            keditor.html(fdhtmlcontent);
            data["_state"]="removed";
            delAttList.push(data);
            obj.del();
        }
    });


    $("#uploadPicAtt").click(function(){
        var guid = new GUID();
        var guiddata = guid.newGUID();
        document.cookie = "guiddata=" + guiddata;
        layer.open({
            type: 2, 
            title:'添加图片',
            area: ['500px', '200px'],
            btn: ['确定'],
            content: 'http://localhost:13389/Modules/AddAttachment.aspx?fdIsShowInPage=1&fdid='+fdid,
            success: function(layero, index){
                document.cookie = "guiddata=" + guiddata;
                console.log(layero, index);
            },
            yes: function(index, layero){
                document.cookie = "guiddata=";
                keditor.insertHtml('<strong>[PICAttachmentID=' + guiddata + ']</strong>');
                table.reload("attListTable");
                layer.close(index); 
            }
        });
    });

    // //用于同步编辑器内容到textarea
    // layedit.sync(editIndex);

    // //上传缩略图
    // upload.render({
    //     elem: '.thumbBox',
    //     url: '../../json/userface.json',
    //     method : "get",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
    //     done: function(res, index, upload){
    //         var num = parseInt(4*Math.random());  //生成0-4的随机数，随机显示一个头像信息
    //         $('.thumbImg').attr('src',res.data[num].src);
    //         $('.thumbBox').css("background","#fff");
    //     }
    // });

    // //格式化时间
    // function filterTime(val){
    //     if(val < 10){
    //         return "0" + val;
    //     }else{
    //         return val;
    //     }
    // }
    // //定时发布
    // var time = new Date();
    // var submitTime = time.getFullYear()+'-'+filterTime(time.getMonth()+1)+'-'+filterTime(time.getDate())+' '+filterTime(time.getHours())+':'+filterTime(time.getMinutes())+':'+filterTime(time.getSeconds());
    // laydate.render({
    //     elem: '#release',
    //     type: 'datetime',
    //     trigger : "click",
    //     done : function(value, date, endDate){
    //         submitTime = value;
    //     }
    // });
    // form.on("radio(release)",function(data){
    //     if(data.elem.title == "定时发布"){
    //         $(".releaseDate").removeClass("layui-hide");
    //         $(".releaseDate #release").attr("lay-verify","required");
    //     }else{
    //         $(".releaseDate").addClass("layui-hide");
    //         $(".releaseDate #release").removeAttr("lay-verify");
    //         submitTime = time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
    //     }
    // });

    // form.verify({
    //     newsName : function(val){
    //         if(val == ''){
    //             return "文章标题不能为空";
    //         }
    //     },
    //     content : function(val){
    //         if(val == ''){
    //             return "文章内容不能为空";
    //         }
    //     }
    // })
    form.on("submit(addNews)",function(data){
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});

        if(fdid!=""){//编辑
            var newsData=data.field;
            newsData.fdcontent=keditor.text();
            newsData.fdhtmlcontent=keditor.html();
            newsData=[newsData];
            
            var cityData=[{"children":[]}];
            $.each(layui.formSelects.value('select-city'),function(index,data){
                cityData[0].children.push({
                    "lfdid":data.value,
                    "lfdname":data.name
                })
            })

            var channelData=[{"children":[]}];
            $.each(layui.formSelects.value('select-channel'),function(index,data){
                channelData[0].children.push({
                    "fdid":data.value,
                    "fdname":data.name
                })
            })

            var attData=delAttList;
        
            $.ajax({
                url: "http://localhost:13389/DataServer/TreeData.aspx?method=UpdateArticle",
                type: 'post',
                data: { 
                    data: JSON.stringify(newsData), 
                    tdata: JSON.stringify(cityData), 
                    tdatac: JSON.stringify(channelData), 
                    griddata: JSON.stringify(attData) 
                },
                success: function (text) {
                    //console.log(text);
                    top.layer.close(index);
                    top.layer.msg("文章修改成功！");
                    layer.closeAll("iframe");
                    //刷新父页面
                    parent.layui.table.reload('newsListTable');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    top.layer.close(index);
                    alert(jqXHR.responseText);
                    layer.closeAll("iframe");
                }
            });
        }
        else{

            var newsData={};
            newsData["fdid"]=data.field.fdid;
            newsData["title"]=data.field.fdarticletitle;
            newsData["fdarticleurl"]=data.field.fdarticleurl;
            newsData["source"]=data.field.fdsource;
            newsData["keyword"]=data.field.fdkeyword;
            newsData["publishtime"]=data.field.fdpublishdate;
            newsData["fdimportance"]=data.field.fdimportance;
            //newsData["fdapproveflag"]=data.field.fdapproveflag;
            newsData["fdcontent"]=keditor.text();
            newsData["fdhtmlcontent"]=keditor.html();
            newsData["fdnodeguid"]=layui.formSelects.value('select-channel').length>0?layui.formSelects.value('select-channel')[0].value:"";
            newsData=[newsData];

            var cityData=[{"children":[]}];
            $.each(layui.formSelects.value('select-city'),function(index,data){
                cityData[0].children.push({
                    "lfdid":data.value,
                    "lfdname":data.name
                })
            })

            var attData=delAttList;

            $.ajax({
                url: "http://localhost:13389/DataServer/TreeData.aspx?method=SaveArticle",
                type: 'post',
                data: { 
                    data: JSON.stringify(newsData), 
                    tdata: JSON.stringify(cityData), 
                    griddata: JSON.stringify(attData) 
                },
                success: function (text) {
                    //console.log(text);
                    top.layer.close(index);
                    top.layer.msg("文章添加成功！");
                    layer.closeAll("iframe");
                    //刷新父页面
                    parent.layui.table.reload('newsListTable');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    top.layer.close(index);
                    alert(jqXHR.responseText);
                    layer.closeAll("iframe");
                }
            });
        }
        





        //截取文章内容中的一部分文字放入文章摘要
        //var abstract = layedit.getText(editIndex).substring(0,50);
        //弹出loading
        //var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        // 实际使用时的提交信息
        // $.post("上传路径",{
        //     newsName : $(".newsName").val(),  //文章标题
        //     abstract : $(".abstract").val(),  //文章摘要
        //     content : layedit.getContent(editIndex).split('<audio controls="controls" style="display: none;"></audio>')[0],  //文章内容
        //     newsImg : $(".thumbImg").attr("src"),  //缩略图
        //     classify : '1',    //文章分类
        //     newsStatus : $('.newsStatus select').val(),    //发布状态
        //     newsTime : submitTime,    //发布时间
        //     newsTop : data.filed.newsTop == "on" ? "checked" : "",    //是否置顶
        // },function(res){
        //
        // })
        // setTimeout(function(){
        //     top.layer.close(index);
        //     top.layer.msg("文章添加成功！");
        //     layer.closeAll("iframe");
        //     //刷新父页面
        //     parent.location.reload();
        // },500);
        return false;
    })

    // //预览
    // form.on("submit(look)",function(){
    //     layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
    //     return false;
    // })

    // //创建一个编辑器
    // var editIndex = layedit.build('news_content',{
    //     height : 535,
    //     uploadImage : {
    //         url : "../../json/newsImg.json"
    //     }
    // });



     /*
        * 功能：生成一个GUID码，其中GUID以14个以下的日期时间及18个以上的16进制随机数组成，GUID存在一定的重复概率，但重复概率极低，理论上重复概率为每10ms有1/(16^18)，即16的18次方分之1，重复概率低至可忽略不计
        * 免责声明：此代码为作者学习专用，如在使用者在使用过程中因代码问题造成的损失，与作者没有任何关系
        * 日期：2014年9月4日
        * 作者：wyc
        */
    function GUID() {
        this.date = new Date();

        /* 判断是否初始化过，如果初始化过以下代码，则以下代码将不再执行，实际中只执行一次 */
        if (typeof this.newGUID != 'function') {

            /* 生成GUID码 */
            GUID.prototype.newGUID = function () {
                this.date = new Date();
                var guidStr = '';
                sexadecimalDate = this.hexadecimal(this.getGUIDDate(), 16);
                sexadecimalTime = this.hexadecimal(this.getGUIDTime(), 16);
                for (var i = 0; i < 9; i++) {
                    guidStr += Math.floor(Math.random() * 16).toString(16);
                }
                guidStr += sexadecimalDate;
                guidStr += sexadecimalTime;
                while (guidStr.length < 32) {
                    guidStr += Math.floor(Math.random() * 16).toString(16);
                }
                return this.formatGUID(guidStr);
            }

            /*
                * 功能：获取当前日期的GUID格式，即8位数的日期：19700101
                * 返回值：返回GUID日期格式的字条串
                */
            GUID.prototype.getGUIDDate = function () {
                return this.date.getFullYear() + this.addZero(this.date.getMonth() + 1) + this.addZero(this.date.getDay());
            }

            /*
                * 功能：获取当前时间的GUID格式，即8位数的时间，包括毫秒，毫秒为2位数：12300933
                * 返回值：返回GUID日期格式的字条串
                */
            GUID.prototype.getGUIDTime = function () {
                return this.addZero(this.date.getHours()) + this.addZero(this.date.getMinutes()) + this.addZero(this.date.getSeconds()) + this.addZero(parseInt(this.date.getMilliseconds() / 10));
            }

            /*
            * 功能: 为一位数的正整数前面添加0，如果是可以转成非NaN数字的字符串也可以实现
                * 参数: 参数表示准备再前面添加0的数字或可以转换成数字的字符串
                * 返回值: 如果符合条件，返回添加0后的字条串类型，否则返回自身的字符串
                */
            GUID.prototype.addZero = function (num) {
                if (Number(num).toString() != 'NaN' && num >= 0 && num < 10) {
                    return '0' + Math.floor(num);
                } else {
                    return num.toString();
                }
            }

            /* 
                * 功能：将y进制的数值，转换为x进制的数值
                * 参数：第1个参数表示欲转换的数值；第2个参数表示欲转换的进制；第3个参数可选，表示当前的进制数，如不写则为10
                * 返回值：返回转换后的字符串
                */
            GUID.prototype.hexadecimal = function (num, x, y) {
                if (y != undefined) {
                    return parseInt(num.toString(), y).toString(x);
                } else {
                    return parseInt(num.toString()).toString(x);
                }
            }

            /*
                * 功能：格式化32位的字符串为GUID模式的字符串
                * 参数：第1个参数表示32位的字符串
                * 返回值：标准GUID格式的字符串
                */
            //GUID.prototype.formatGUID = function (guidStr) {
            //    var str1 = guidStr.slice(0, 8) + '-',
            //      str2 = guidStr.slice(8, 12) + '-',
            //      str3 = guidStr.slice(12, 16) + '-',
            //      str4 = guidStr.slice(16, 20) + '-',
            //      str5 = guidStr.slice(20);
                GUID.prototype.formatGUID = function (guidStr) {
                    var str1 = guidStr.slice(0, 8) ,
                        str2 = guidStr.slice(8, 12) ,
                        str3 = guidStr.slice(12, 16) ,
                        str4 = guidStr.slice(16, 20) ,
                        str5 = guidStr.slice(20);
                return str1 + str2 + str3 + str4 + str5;
            }
        }
    }

})