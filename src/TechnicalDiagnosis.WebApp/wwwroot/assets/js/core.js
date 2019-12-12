var routes = {};
var dataTablePersian = { sEmptyTable: "هیچ داده ای در جدول وجود ندارد", sInfo: "نمایش _START_ تا _END_ از _TOTAL_ رکورد", sInfoEmpty: "نمایش 0 تا 0 از 0 رکورد", sInfoPostFix: "", sInfoFiltered: "(فیلتر شده از _MAX_ رکورد)", sInfoThousands: ",", sLengthMenu: "نمایش _MENU_ رکورد", sLoadingRecords: "در حال بارگزاری...", sProcessing: "در حال پردازش...", sSearch: "جستجو:", sZeroRecords: "رکوردی با این مشخصات پیدا نشد", oPaginate: { sFirst: "ابتدا", sLast: "انتها", sNext: "بعدی", sPrevious: "قبلی" }, oAria: { sSortAscending: ": فعال سازی نمایش به صورت صعودی", sSortDescending: ": فعال سازی نمایش به صورت نزولی" } }

var routing = {
    GlobalTitle: "معاینه‌فنی",

    route(path, address, controller, authorize) {
        routes[path] = { address: address, controller: controller, authorize: authorize };
    },

    changeRouteWithPushState(address) {
        history.pushState({ urlPath: '#/' + address }, "", '#/' + address)
        routing.router();
    },

    router() {
        var url = location.hash.slice(1) || '/', id = 0;
        if (/\/\d/.test(url)) {
            id = url.replace(/\D/g, '');
            url = url.replace(/[0-9]/g, "");
        }
        var route = routes[url];
        if (route && route.address) {
            $.ajax({
                type: "GET",
                url: route.address,
                dataType: 'html',
                cache: true,
                tryCount: 0,
                retryLimit: 5,
                success: function (data) {
                    route.controller(data, id);
                }
            });
        } else {
            if (route && route.controller) route.controller(id);
        }
    },

    ganarateTemplate(data, template) {
        var rendered = Mustache.render(template, data);
        document.getElementById("kt_content").innerHTML = rendered;
        if (data && data.page && data.page.title) this.changeGlobalTitle(data.page.title)
        this.addRoutingEventToLinks();
    },

    addRoutingEventToLinks() {
        var menus = document.querySelectorAll(".routing-link");
        for (var i = 0; i < menus.length; i++) {
            menus[i].addEventListener('click', function (event) {
                event.preventDefault()
                var element = event.target;
                if (element && element.getAttribute("href")) routing.changeRouteWithPushState(element.getAttribute("href"));
                if (element.parentElement && element.parentElement.getAttribute("href")) routing.changeRouteWithPushState(event.target.parentElement.getAttribute("href"));
                $(this).parents('.dropdown-menu').hide();
            });
        }
        document.getElementsByClassName("confirm-password")[0].addEventListener("click", this.confirmExpireTokenByPassword())
    },

    changeGlobalTitle(pageTitle) {
        // document.getElementsByTagName("title")[0].text = "{0}| {1}".format(this.GlobalTitle, pageTitle)
    },

    getParseToken() {
        token = localStorage.getItem("token")
        if (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        }
    },

    isExpireToken() {
        decodeJWT = this.getParseToken()
        if (decodeJWT) {
            var expireDate = new Date(decodeJWT.edt * 1000);
            if (expireDate <= (new Date())) return true;
            return false
        }
    },

    isExpireTokenRedirect() {
        if (this.isExpireToken()) {
            localStorage.clear();
            window.location.href = "../auth"
        }
    },

    confirmExpireTokenByPassword(e) {

    },

    setUserName() {
        //document.getElementsByClassName("kt-user-card__name")[0].textContent = "{0} {1}".format(localStorage.getItem("fname"), localStorage.getItem("lname"))
    },

    initMenuEvent() {
        var menus = document.querySelectorAll(".kt-menu__subnav li a");
        for (var i = 0; i < menus.length; i++) {
            menus[i].addEventListener('click', function (event) {
                event.preventDefault()
                var element = event.target;
                if (event.target && event.target.parentElement) {
                    routing.changeRouteWithPushState(event.target.parentElement.getAttribute("href"));
                }
            });
        }
    },

    initWindowEvent() {
        window.addEventListener('hashchange', routing.router);
        window.addEventListener('pushState', routing.router);
        window.addEventListener('load', function () {
            routing.setUserName();
            routing.router();

        });
        window.addEventListener('locationchange', routing.router);
    },

    init() {
        this.initWindowEvent();
        this.initMenuEvent();
    }
}

routing.route('/dashboard', 'components/dashboard.html', function (template) {
    routing.ganarateTemplate({}, template);

    $('.maxlength').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline"
    });

    var container = document.getElementsByClassName("plate-input")[0];
    container.onkeyup = function (e) {
        var target = e.srcElement;
        var maxLength = parseInt(target.attributes["maxlength"].value, 10);
        var myLength = target.value.length;
        var next = target.getAttribute("data-nextelement");
        var prev = target.getAttribute("data-prevelement");
        if (e.keyCode == 8 && myLength == 0 && prev) {
            document.getElementById(prev).focus();
        }
        if (myLength >= maxLength && next) {
            document.getElementById(next).focus();
        }
    }

    container.onkeypress = function (e) {
        var target = e.srcElement;
        var maxLength = parseInt(target.attributes["maxlength"].value, 10);
        if (target.value.length >= maxLength && e.keyCode != 8) {
            return false;
        }
    }

    var plateState = document.getElementById("plateState");
    var plateFirstNumber = document.getElementById("plateFirstNumber");
    var plateAlphabet = document.getElementById("plateAlphabet");
    var plateLastNumber = document.getElementById("plateLastNumber");
    var btnsearchPlate = document.getElementById("searchPlate")


    document.getElementById("clearAllField").onclick = function () {
        plateState.value = "";
        plateFirstNumber.value = "";
        plateAlphabet.value = "";
        plateLastNumber.value = "";
        $(thbtnsearchPlateis).removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
    }

    btnsearchPlate.onclick = function () {
        var form = $(".form-search-plate");
        if (form.valid()) {
            $(this).addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
            APIs.getSearchPlate({
                plateState: plateState.value,
                plateFirstNumber: plateFirstNumber.value,
                plateAlphabet: plateAlphabet.value,
                plateLastNumber: plateLastNumber.value
            })
        }
    }

});

routing.route('/plate', '', function () {
    data = {
        page: {
            title: "پلاک‌ها",
            id: "tablePlate",
            button: [{
                title: "جدید",
                href: "plate/add",
                icon: "la-plus",
                color: "btn-brand"
            }]
        }
    }

    routing.ganarateTemplate(data, document.getElementById("dataTable").innerHTML);
    APIs.getAllPlate(data.page.id);
});

routing.route('/plate/add', 'components/plate/detail.html', function (template) {
    var data = {
        page: {
            title: "پلاک جدید",
            description: "",
            backward: "plate"
        },
        breadCrumb: [
            { title: "پلاک‌ها", link: "plate" }
        ]
    }
    routing.ganarateTemplate(data, template);
    KTLayout.initPageStickyPortlet();

    APIs.getAllPlate("tablePlate");
    $("#serviceDate").pDatepicker({ format: 'YYYY/MM/DD' });

    document.getElementById("saveData").addEventListener("click", function (e) {
        notification.getStart();
        var fields = {
            fullName: document.getElementById("fullName").value,
            mobile: document.getElementById("mobile").value,
            PlateState: document.getElementById("plateState").value,
            PlateAlphabet: document.getElementById("plateAlphabet").value,
            PlateFirstNumber: document.getElementById("plateFirstNumber").value,
            PlateLastNumber: document.getElementById("plateLastNumber").value,
            Description: document.getElementById("description").value,
            IsTechnicalDiagnosis: document.getElementById("isTechnicalDiagnosis").checked,
            ServiceDate: document.getElementById("serviceDate").value,
        }

        APIs.setPlate(fields, function () {
            routing.changeRouteWithPushState(data.page.backward)
        });
    });

});

routing.init();


var APIs = {
    signIn(username, password, callback) {
        $.ajax({
            type: "POST",
            url: "/api/Identity/Login",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ Username: username, Password: password }),
            success: function (response) {
                if (response && response.access_token) {
                    localStorage.setItem("token", response.access_token);
                    localStorage.setItem("refresh_token", response.refresh_token);
                    localStorage.setItem("displayName", response.display_name);
                    window.location.href = "../admin";
                } else {
                    callback("اطلاعات نامعتبر می‌باشد!");
                }
            },
            error: function (request, status, error) {
                callback("اطلاعات نامعتبر می‌باشد!");
            }
        });
    },

    signOut() {
        localStorage.clear();
        window.location.href = "../auth"
    },

    getAllPlate(elementId) {
        var draw = 0;
        $(document.getElementById(elementId)).DataTable({
            language: dataTablePersian,
            responsive: true,
            ordering: false,
            fixedHeader: true,
            stateSave: true,
            columnDefs: [
                { title: "نام‌و‌نام‌خانوادگی", targets: 0, width: "20%", className: "text-center" },
                { title: "شماره‌موبایل", targets: 1, width: "20%", className: "text-center" },
                { title: "شماره‌پلاک", targets: 2, width: "20%", className: "text-center" },
                { title: "نوع‌وسیله‌ی‌نقلیه", targets: 3, width: "5%", className: "text-center" },
                { title: "تاریخ‌مراجعه", targets: 4, width: "10%", className: "text-center" },
                { title: "توضیحات", targets: 5, width: "10%", className: "text-center" },
                { title: "عملیات", targets: 6, width: "10%", className: "text-center" }
            ],
            columns: [
                { data: 'fullName' },
                { data: 'mobile' },
                { data: 'price', mRender: function (data, type, full) { return "ایران{0} {1} {2} {3}".format(full.plateState, full.plateFirstNumber, full.plateAlphabet, full.plateLastNumber); } },
                { data: 'typeVehicleId' },
                { data: 'serviceDate' },
                { data: 'description' },
                {
                    data: 'id',
                    mRender: function (data, type, full) {
                        var status = "";
                        if (full.status)
                            status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'DACAPAED\',' + data + ');"><i class="la la-eject"></i> غیرفعال</a>';
                        else
                            status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'ACTAPAED\',' + data + ');"><i class="la la-check"></i> فعال</a>';
                        return '<span class="dropdown">' +
                            '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
                            '<i class="la la-ellipsis-h"></i>' +
                            '</a>' +
                            '<div class="dropdown-menu dropdown-menu-right">' +
                            '<a class="routing-link dropdown-item" href="package/edit/' + data + '"><i class="la la-edit"></i> ویرایش</a>' +
                            '<a class="routing-link dropdown-item" href="package/codes/' + data + '"><i class="la la-cc-mastercard"></i> نمایش‌کدها &nbsp&nbsp&nbsp&nbsp<span class="kt-badge kt-badge--brand kt-badge--md">' + full.count + '</span></a>' +
                            '<a class="routing-link dropdown-item" href="javascript:APIs.showModalImportCode(' + data + ');"><i class="la la-space-shuttle"></i> ایمپورت‌کدها</a>' +
                            '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'REMAPAED\',' + data + ');"><i class="la la-remove"></i> حذف</a>' +
                            status +
                            '</div>' +
                            '</span>' +
                            '<a href="package/edit/' + data + '" class="routing-link btn btn-sm btn-clean btn-icon btn-icon-md" title="ویرایش">' +
                            '<i class="la la-edit"></i>' +
                            '</a>';
                    }
                }
            ],
            processing: true,
            serverSide: true,
            searching: false,
            ajax: function (data, callback, settings) {
                // var dataRequest = { action: "SHALPAED", info: { page: (data.start / data.length) + 1, count: data.length } };
                $.ajax({
                    type: "POST",
                    url: "/api/Plate/List?page={0}&size={1}".format((data.start / data.length) + 1, data.length),
                    headers: { 'Authorization': "Bearer " + localStorage.getItem("token") },
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    success: function (response) {
                        if (response.rows) {
                            draw = draw + 1;
                            callback({ data: response.rows, draw: draw, recordsFiltered: response.total, recordsTotal: response.total });
                        } else {
                            notification.showDanger(response && response.data && response.data.message ? response.data.message : "مشکلی در ارتباط به وجود آمده است");
                        }
                    }
                });
            },
            drawCallback: function (settings) {
                routing.addRoutingEventToLinks();
                var menus = document.querySelectorAll(".add-new-code-package")
                for (var i = 0; i < menus.length; i++) {
                    menus[i].addEventListener("click", function (e) {
                        event.preventDefault()
                        var element = event.target;
                        notification.getStart();
                        var id = element.getAttribute("data-id");
                        var codeElement = element.parentElement.parentElement.getElementsByTagName("input")[0];
                        if (codeElement) var code = codeElement.value;
                        if (id && code) {
                            APIs.setCode(id, code, function () {
                                codeElement.value = "";
                            });
                        } else {
                            notification.showWarning("اطلاعات نامعتبر است")
                        }
                    });
                }
            }
        });
    },

    setPlate(info, callback) {
        $.ajax({
            type: "POST",
            url: "/api/Plate/Add",
            headers: { 'Authorization': "Bearer " + localStorage.getItem("token") },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(info),
            success: function (response) {
                if (response && response.error && response.error.length) {
                    notification.getDanger(response.error);
                } else {
                    notification.getDone();
                    callback();
                }
            }
        });
    },

    getSearchPlate(data) {
        $.ajax({
            type: "POST",
            url: "/api/Plate/search?plateFirstNumber={0}&plateAlphabet={1}&plateLastNumber={2}&plateState={3}".format(data.plateFirstNumber, data.plateAlphabet, data.plateLastNumber, data.plateState),
            contentType: "application/json; charset=utf-8",
            headers: { 'Authorization': "Bearer " + localStorage.getItem("token") },
            success: function (response) {
                alert(JSON.stringify(response));
            },
            error: function (request, status, error) {
                callback("اطلاعات نامعتبر می‌باشد!");
            }
        });
    }
}

var extention = {
    setInputFilter(textbox, inputFilter, changeValue, beforeChange) {
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
            textbox.addEventListener(event, function () {
                if (beforeChange) this.value = beforeChange(this.value)
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    var changeVal = changeValue(this.value)
                    this.value = changeVal;
                    this.oldValue = changeVal;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                    this.value = "";
                }
            });
        });
    },

    setComma(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    removeComma(value) {
        return value.replace(/,/g, "")
    }
}

var notify = {};
var notification = {
    content: {},

    option: {
        llow_dismiss: true,
        animate: { enter: "animated bounce", exit: "animated bounce" },
        delay: "1000",
        mouse_over: true,
        newest_on_top: true,
        offset: { x: "30", y: "30" },
        placement: { align: "left", from: "top" },
        align: "left",
        from: "top",
        spacing: "10",
        timer: "2000",
        z_index: "10000",
    },

    getStart() {
        this.content.icon = "icon la la-send";
        this.content.message = "در حال ارسال اطلاعات.";
        this.content.title = "درحال ارسال";
        this.option.showProgressbar = true;
        this.option.progress = 5;
        this.option.type = "primary";

        notify = $.notify(this.content, this.option);
    },

    getDanger(message) {
        notify.update('icon', 'icon la la-remove');
        notify.update('title', 'خطا');
        notify.update('message', message ? message : 'عملیات با <strong>خطا</strong> مواجه شد.');
        notify.update('type', 'danger');
        notify.update('progress', 95);
    },

    getDone() {
        notify.update('icon', 'icon la la-check');
        notify.update('title', 'موفقیت آمیز');
        notify.update('message', 'با <strong>موفقیت</strong> به پایان رسید.');
        notify.update('type', 'success');
        notify.update('progress', 100);
    },

    showDanger(message) {
        this.content.icon = "icon la la-remove";
        this.content.title = "خطا";
        this.content.message = message;
        this.option.type = "danger";
        $.notify(this.content, this.option);
    },

    showWarning(message) {
        this.content.icon = "icon la la-info";
        this.content.title = "جهت اطلاع";
        this.content.message = message;
        this.option.type = "warning";
        this.option.showProgressbar = false;
        $.notify(this.content, this.option);
    }
}

String.prototype.format = function () {
    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

String.prototype.numberWithCommas = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

$(document).ajaxError(function (jqXHR, textStatus, errorThrown) {
    if (textStatus.statusText == "Unauthorized")
        window.location.href = "../auth"
    else {
        $("#saveData").attr("disabled", true);
        new Noty({ text: Resource.Noty.GlobarAjaxError, type: 'error' }).show();
    }
});