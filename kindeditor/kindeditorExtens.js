!
function (e, t) {
    var n, r = document.getElementById("sp_desc"),
		i = document.getElementById("input_DESCRIPTION"),
		s = "可输入房间描述、小区环境、周边配套、对合租者的要求等信息";
    KindEditor.ready(function (a) {
        n = a.create('textarea[name="input_DESCRIPTION"]', {
            resizeType: 1,
            allowPreviewEmoticons: !1,
            allowImageUpload: !1,
            items: ["fontname", "fontsize", "|", "forecolor", "hilitecolor", "bold", "italic", "underline", "removeformat", "|", "justifyleft", "justifycenter", "justifyright", "insertorderedlist", "insertunorderedlist"],
            afterBlur: function () {
                var e = n.html(),
					a = n.count(),
					o = !1;
                return "" !== e && e !== s && a >= 5 && 5e3 > a ? (r.innerHTML = "", Common.isBaddeswords(e) ? (i.className = "inputerror", t.warn(r, "房源描述含有敏感字符")) : /\d{7}/.test(e) ? (i.className = "inputerror", t.warn(r, "房源描述不允许包含联系方式")) : (i.className = "input", t.succeed(r), jQuery("#input_DESCRIPTION_New").val(e), o = !0)) : a >= 5e3 ? (i.className = "inputerror", t.warn(r, "房源描述超出长度限制")) : t.warn(r, "请输入房源描述，最少五个汉字。"), this.isEmpty() && this.html(s), o
            },
            afterFocus: function () {
                r.innerHTML = "", this.text() === s && this.html("")
            },
            afterChange: function () {
                this.text() === s ? t.warn(r, "请输入房源描述，最少五个汉字。") : this.count() < 5e3 ? this.count() < 5 && t.warn(r, "请输入房源描述，最少五个汉字。") : (i.className = "inputerror", t.warn(r, "房源描述超出长度限制。"))
            }
        }), e.editor = n
    })
}(window, message);