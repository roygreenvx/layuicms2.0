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
    

    laydate.render({
        elem: '#fdpublishdate'
    });

    formSelects.data('select-city', 'server', {
        url: 'http://localhost:13389/DataServer/GetCityAajax.aspx?method=GetCityDataByfdidJson&fdid=-136',
    }).btns('select-city', ['remove'], {
        space: '10px'
    });

    formSelects.data('select-channel', 'server', {
        url: 'http://localhost:13389/DataServer/GetChannelAjax.aspx?method=LoadChannelAllTagJsonNew',
    }).btns('select-channel', ['remove'], {
        space: '10px'
    });

    upload.render({
        elem: '#chooseAtt'
        ,url: '/upload/'
        ,auto: false
        ,bindAction: '#uploadAtt'
        ,done: function(res){
            console.log(res)
        }
    });

    var tableIns=table.render({
        elem:'#attTable',
        url:'http://localhost:13389/DataServer/TreeData.aspx?method=LoadEditAttachment&fdid='+'-136',
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
            //{field: 'fdid', title: 'ID', align:"center"},
            {field: 'fdfilename', title: '名称', align:"center"},
            {field: 'fdisshowinpage', title: '是否文件中显示', align:"center"},
            {field: 'fdattachmentguid', title: '是否文件中显示', align:"center"},
            {field: 'fdfiletype', title: '类型', align:"center"},
            {field: 'fdupdatetime', title: '时间', align:"center"},
        ]]
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

    form.verify({
        newsName : function(val){
            if(val == ''){
                return "文章标题不能为空";
            }
        },
        content : function(val){
            if(val == ''){
                return "文章内容不能为空";
            }
        }
    })
    form.on("submit(addNews)",function(data){
        //截取文章内容中的一部分文字放入文章摘要
        var abstract = layedit.getText(editIndex).substring(0,50);
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
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
        setTimeout(function(){
            top.layer.close(index);
            top.layer.msg("文章添加成功！");
            layer.closeAll("iframe");
            //刷新父页面
            parent.location.reload();
        },500);
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

})