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
    KTDashboard.init();
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

    $("#serviceDate").pDatepicker({ format: 'YYYY/MM/DD' });

    // document.getElementById("saveData").addEventListener("click", function (e) {
    //     notification.getStart();
    //     var fields = {
    //         name: document.getElementById("title").value,
    //         data: document.getElementById("data").value,
    //         price: document.getElementById("price").value
    //     }

    //     APIs.setPackage(0, fields, function () {
    //         routing.changeRouteWithPushState(data.page.backward)
    //     });
    // });

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
                { title: "ردیف", targets: 0, width: "5%", className: "text-center" },
                { title: "نام‌و‌نام‌خانوادگی", targets: 1, width: "20%", className: "text-center" },
                { title: "شماره‌موبایل", targets: 2, width: "20%", className: "text-center" },
                { title: "شماره‌پلاک", targets: 3, width: "20%", className: "text-center" },
                { title: "نوع‌وسیله‌ی‌نقلیه", targets: 4, width: "5%", className: "text-center" },
                { title: "تاریخ‌مراجعه", targets: 5, width: "10%", className: "text-center" },
                { title: "وضعیت", targets: 6, width: "10%", className: "text-center" },
                { title: "عملیات", targets: 7, width: "10%", className: "text-center" }
            ],
            columns: [
                { data: 'counter', mRender: function (data, type, full) { return data.toString(); } },
                { data: 'name' },
                { data: 'price', mRender: function (data, type, full) { return "{0} ریال".format(Number(data).toFixed(0).toString().numberWithCommas()); } },
                { data: 'data', mRender: function (data, type, full) { return "{0} Mb".format(Number(data).toFixed(0).toString().numberWithCommas()); } },
                {
                    data: 'status',
                    mRender: function (data, type, full) {
                        var status = {
                            0: { 'title': 'غیرفعال', 'class': ' kt-badge--primary' },
                            1: { 'title': 'فعال', 'class': ' kt-badge--success' },
                        };
                        return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
                    }
                },
                {
                    data: 'id',
                    mRender: function (data, type, full) {
                        return '<div class="input-group">' +
                            '<input type="number" class="form-control" placeholder="افزودن کد">' +
                            '<div class="input-group-append">' +
                            '<button class="btn btn-primary add-new-code-package" data-id="' + data + '"  type="button">ثبت!</button>' +
                            '</div>' +
                            '</div>'
                    }
                },
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
                var dataRequest = { action: "SHALPAED", info: { page: (data.start / data.length) + 1, count: data.length } };
                $.ajax({
                    type: "POST",
                    url: APIs.serverAddress,
                    headers: { 'authorizationfield': localStorage.getItem("token") },
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    data: APIs.convertData(dataRequest),
                    success: function (response) {
                        if (response.statusCode == 0) {
                            draw = draw + 1;
                            callback({ data: response.data, draw: draw, recordsFiltered: response.total, recordsTotal: response.total });
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

    // //  انجام عملیات حذف و فعال و غیرفعال به همراه سوال از کاربر
    // setGlobalActionPrompt(action, id) {
    //     swal.fire({
    //         title: 'مطمئن هستید؟',
    //         text: "آیا از انجام عملیات مطمئن هستید؟",
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'بله',
    //         cancelButtonText: 'کنسل',
    //         reverseButtons: true
    //     }).then(function (result) {
    //         if (result.value) {
    //             this.setGlobalAction(action, id)
    //         } else if (result.dismiss === 'cancel') {
    //             notification.showWarning("عملیات لغو شد.");
    //         }
    //     });
    // },

    // // انجام عملیات حذف و فعال و غیرفعال
    // setGlobalAction(action, id) {
    //     notification.getStart();
    //     var dataRequest = { action: action, info: { id: id } };
    //     $.ajax({
    //         type: "POST",
    //         url: this.serverAddress,
    //         headers: { 'authorizationfield': localStorage['token'] },
    //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //         data: this.convertData(dataRequest),
    //         success: function (response) {
    //             if (response.statusCode == 0) {
    //                 notification.getDone();
    //                 $($('table[id^="table"]')[0]).DataTable().ajax.reload(null, false);
    //             } else {
    //                 notification.getDanger(response && response.data && response.data.message ? response.data.message : "");
    //             }
    //         }
    //     });
    // },

    // getAllPackage(elementId) {
    //     var draw = 0;
    //     $(document.getElementById(elementId)).DataTable({
    //         language: dataTablePersian,
    //         responsive: true,
    //         ordering: false,
    //         fixedHeader: true,
    //         stateSave: true,
    //         columnDefs: [
    //             { title: "ردیف", targets: 0, width: "10%", className: "text-center" },
    //             { title: "عنوان", targets: 1, width: "30%", className: "text-center" },
    //             { title: "قیمت", targets: 2, width: "15%", className: "text-center" },
    //             { title: "حجم", targets: 3, width: "10%", className: "text-center" },
    //             { title: "وضعیت", targets: 4, width: "10%", className: "text-center" },
    //             { title: "افزودن کد", targets: 5, width: "15%", className: "text-center" },
    //             { title: "عملیات", targets: 6, width: "10%", className: "text-center" }
    //         ],
    //         columns: [
    //             { data: 'counter', mRender: function (data, type, full) { return data.toString(); } },
    //             { data: 'name' },
    //             { data: 'price', mRender: function (data, type, full) { return "{0} ریال".format(Number(data).toFixed(0).toString().numberWithCommas()); } },
    //             { data: 'data', mRender: function (data, type, full) { return "{0} Mb".format(Number(data).toFixed(0).toString().numberWithCommas()); } },
    //             {
    //                 data: 'status',
    //                 mRender: function (data, type, full) {
    //                     var status = {
    //                         0: { 'title': 'غیرفعال', 'class': ' kt-badge--primary' },
    //                         1: { 'title': 'فعال', 'class': ' kt-badge--success' },
    //                     };
    //                     return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
    //                 }
    //             },
    //             {
    //                 data: 'id',
    //                 mRender: function (data, type, full) {
    //                     return '<div class="input-group">' +
    //                         '<input type="number" class="form-control" placeholder="افزودن کد">' +
    //                         '<div class="input-group-append">' +
    //                         '<button class="btn btn-primary add-new-code-package" data-id="' + data + '"  type="button">ثبت!</button>' +
    //                         '</div>' +
    //                         '</div>'
    //                 }
    //             },
    //             {
    //                 data: 'id',
    //                 mRender: function (data, type, full) {
    //                     var status = "";
    //                     if (full.status)
    //                         status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'DACAPAED\',' + data + ');"><i class="la la-eject"></i> غیرفعال</a>';
    //                     else
    //                         status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'ACTAPAED\',' + data + ');"><i class="la la-check"></i> فعال</a>';
    //                     return '<span class="dropdown">' +
    //                         '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
    //                         '<i class="la la-ellipsis-h"></i>' +
    //                         '</a>' +
    //                         '<div class="dropdown-menu dropdown-menu-right">' +
    //                         '<a class="routing-link dropdown-item" href="package/edit/' + data + '"><i class="la la-edit"></i> ویرایش</a>' +
    //                         '<a class="routing-link dropdown-item" href="package/codes/' + data + '"><i class="la la-cc-mastercard"></i> نمایش‌کدها &nbsp&nbsp&nbsp&nbsp<span class="kt-badge kt-badge--brand kt-badge--md">' + full.count + '</span></a>' +
    //                         '<a class="routing-link dropdown-item" href="javascript:APIs.showModalImportCode(' + data + ');"><i class="la la-space-shuttle"></i> ایمپورت‌کدها</a>' +
    //                         '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'REMAPAED\',' + data + ');"><i class="la la-remove"></i> حذف</a>' +
    //                         status +
    //                         '</div>' +
    //                         '</span>' +
    //                         '<a href="package/edit/' + data + '" class="routing-link btn btn-sm btn-clean btn-icon btn-icon-md" title="ویرایش">' +
    //                         '<i class="la la-edit"></i>' +
    //                         '</a>';
    //                 }
    //             }
    //         ],
    //         processing: true,
    //         serverSide: true,
    //         searching: false,
    //         ajax: function (data, callback, settings) {
    //             var dataRequest = { action: "SHALPAED", info: { page: (data.start / data.length) + 1, count: data.length } };
    //             $.ajax({
    //                 type: "POST",
    //                 url: APIs.serverAddress,
    //                 headers: { 'authorizationfield': localStorage.getItem("token") },
    //                 contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //                 data: APIs.convertData(dataRequest),
    //                 success: function (response) {
    //                     if (response.statusCode == 0) {
    //                         draw = draw + 1;
    //                         callback({ data: response.data, draw: draw, recordsFiltered: response.total, recordsTotal: response.total });
    //                     } else {
    //                         notification.showDanger(response && response.data && response.data.message ? response.data.message : "مشکلی در ارتباط به وجود آمده است");
    //                     }
    //                 }
    //             });
    //         },
    //         drawCallback: function (settings) {
    //             routing.addRoutingEventToLinks();
    //             var menus = document.querySelectorAll(".add-new-code-package")
    //             for (var i = 0; i < menus.length; i++) {
    //                 menus[i].addEventListener("click", function (e) {
    //                     event.preventDefault()
    //                     var element = event.target;
    //                     notification.getStart();
    //                     var id = element.getAttribute("data-id");
    //                     var codeElement = element.parentElement.parentElement.getElementsByTagName("input")[0];
    //                     if (codeElement) var code = codeElement.value;
    //                     if (id && code) {
    //                         APIs.setCode(id, code, function () {
    //                             codeElement.value = "";
    //                         });
    //                     } else {
    //                         notification.showWarning("اطلاعات نامعتبر است")
    //                     }
    //                 });
    //             }
    //         }
    //     });
    // },

    // getAllPackageCodes(elementId, packageId) {
    //     var dataRequest = { action: "GECODOPAED", info: { id: packageId } };
    //     $.ajax({
    //         type: "POST",
    //         url: this.serverAddress,
    //         headers: { 'authorizationfield': localStorage['token'] },
    //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //         data: this.convertData(dataRequest),
    //         success: function (response) {
    //             $(document.getElementById(elementId)).DataTable({
    //                 language: dataTablePersian,
    //                 responsive: true,
    //                 ordering: true,
    //                 data: response.data,
    //                 searching: true,
    //                 pageLength: 50,
    //                 fixedHeader: true,
    //                 stateSave: true,
    //                 columnDefs: [
    //                     { title: "ردیف", targets: 0, width: "10%", className: "text-center" },
    //                     { title: "کد", targets: 1, width: "50%", className: "text-center" },
    //                     { title: "وضعیت", targets: 2, width: "10%", className: "text-center" },
    //                     { title: "عملیات", targets: 3, width: "10%", className: "text-center" }
    //                 ],
    //                 responsive: true,
    //                 columns: [
    //                     { data: 'counter', mRender: function (data, type, full) { return data.toString(); } },
    //                     { data: 'code' },
    //                     {
    //                         data: 'status',
    //                         mRender: function (data, type, full) {
    //                             var status = {
    //                                 0: { 'title': 'غیرفعال', 'class': ' kt-badge--primary' },
    //                                 1: { 'title': 'فعال', 'class': ' kt-badge--success' },
    //                                 2: { 'title': 'درحال‌فروش', 'class': ' kt-badge--warning' },
    //                                 3: { 'title': 'فروخته‌شده', 'class': ' kt-badge--brand' },
    //                             };
    //                             return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
    //                         }
    //                     },
    //                     {
    //                         data: 'id',
    //                         mRender: function (data, type, full) {
    //                             var status = "";
    //                             if (full.status == 1)
    //                                 status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'DACACOD\',' + data + ');"><i class="la la-eject"></i> غیرفعال</a>';
    //                             else if (full.status == 0)
    //                                 status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'ACTACOD\',' + data + ');"><i class="la la-check"></i> فعال</a>';
    //                             return '<span class="dropdown">' +
    //                                 '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
    //                                 '<i class="la la-ellipsis-h"></i>' +
    //                                 '</a>' +
    //                                 '<div class="dropdown-menu dropdown-menu-right">' +
    //                                 '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'REMACOD\',' + data + ');"><i class="la la-remove"></i> حذف</a>' +
    //                                 status +
    //                                 '</div>' +
    //                                 '</span>'
    //                         }
    //                     }
    //                 ],
    //             });
    //         }
    //     });
    // },

    // getPackage(id, callback) {
    //     var dataRequest = { action: "GETAEDPAC", info: { id: id } };
    //     $.ajax({
    //         type: "POST",
    //         url: this.serverAddress,
    //         headers: { 'authorizationfield': localStorage['token'] },
    //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //         data: this.convertData(dataRequest),
    //         success: function (response) {
    //             if (response.statusCode == 0) {
    //                 callback(response.data);
    //             } else {
    //                 notification.showDanger(response && response.data && response.data.message ? response.data.message : "مشکلی در ارتباط به وجود آمده است");
    //             }
    //         }
    //     });
    // },

    // setPackage(id, info, callback) {
    //     var dataRequest = { action: "ADANPAKED", info: info };
    //     if (id) {
    //         dataRequest.info.id = id;
    //         dataRequest.action = "EDAPACED"
    //     }
    //     $.ajax({
    //         type: "POST",
    //         url: this.serverAddress,
    //         headers: { 'authorizationfield': localStorage['token'] },
    //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //         data: this.convertData(dataRequest),
    //         success: function (response) {
    //             if (response.statusCode == 0) {
    //                 // new notification({ text: Resource.notification.Success, type: 'success' }).show()
    //                 notification.getDone();
    //                 callback();
    //             } else {
    //                 // new notification({ text: Resource.notification.Error.format(response.data.message), type: 'error' }).show()
    //                 notification.getDanger();
    //             }
    //         }
    //     });
    // },

    // getAllCode(elementId) {
    //     var draw = 0;
    //     $(document.getElementById(elementId)).DataTable({
    //         language: dataTablePersian,
    //         responsive: true,
    //         ordering: false,
    //         fixedHeader: true,
    //         stateSave: true,
    //         columnDefs: [
    //             { title: "ردیف", targets: 0, width: "10%", className: "text-center" },
    //             { title: "کد", targets: 1, width: "50%", className: "text-center" },
    //             { title: "وضعیت", targets: 2, width: "10%", className: "text-center" },
    //             { title: "عملیات", targets: 3, width: "10%", className: "text-center" }
    //         ],
    //         columns: [
    //             { data: 'counter', mRender: function (data, type, full) { return data.toString(); } },
    //             { data: 'code' },
    //             {
    //                 data: 'status',
    //                 mRender: function (data, type, full) {
    //                     var status = {
    //                         0: { 'title': 'غیرفعال', 'class': ' kt-badge--primary' },
    //                         1: { 'title': 'فعال', 'class': ' kt-badge--success' },
    //                         2: { 'title': 'درحال‌فروش', 'class': ' kt-badge--warning' },
    //                         3: { 'title': 'فروخته‌شده', 'class': ' kt-badge--brand' },
    //                     };
    //                     return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
    //                 }
    //             },
    //             {
    //                 data: 'id',
    //                 mRender: function (data, type, full) {
    //                     var status = "";
    //                     if (full.status == 1)
    //                         status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'DACACOD\',' + data + ');"><i class="la la-eject"></i> غیرفعال</a>';
    //                     else if (full.status == 0)
    //                         status = '<a class="dropdown-item" href="javascript:APIs.setGlobalAction(\'ACTACOD\',' + data + ');"><i class="la la-check"></i> فعال</a>';
    //                     return '<span class="dropdown">' +
    //                         '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
    //                         '<i class="la la-ellipsis-h"></i>' +
    //                         '</a>' +
    //                         '<div class="dropdown-menu dropdown-menu-right">' +
    //                         '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'REMACOD\',' + data + ');"><i class="la la-remove"></i> حذف</a>' +
    //                         status +
    //                         '</div>' +
    //                         '</span>'
    //                 }
    //             }
    //         ],
    //         processing: true,
    //         serverSide: true,
    //         searching: false,
    //         ajax: function (data, callback, settings) {
    //             var dataRequest = { action: "SHALCO", info: { page: (data.start / data.length) + 1, count: data.length } };
    //             $.ajax({
    //                 type: "POST",
    //                 url: APIs.serverAddress,
    //                 headers: { 'authorizationfield': localStorage.getItem("token") },
    //                 contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //                 data: APIs.convertData(dataRequest),
    //                 success: function (response) {
    //                     if (response.statusCode == 0) {
    //                         draw = draw + 1;
    //                         callback({ data: response.data, draw: draw, recordsFiltered: response.total, recordsTotal: response.total });
    //                     } else {
    //                         notification.showDanger(response && response.data && response.data.message ? response.data.message : "مشکلی در ارتباط به وجود آمده است");
    //                         // new notification({ text: Resource.notification.Error.format(response.data.message), type: 'error' }).show()
    //                     }
    //                 }
    //             });
    //         }
    //     });
    // },

    // setCode(packageId, code, callback) {
    //     var dataRequest = { action: "ADANCO", info: { package_id: packageId, code: code } };
    //     $.ajax({
    //         type: "POST",
    //         url: this.serverAddress,
    //         headers: { 'authorizationfield': localStorage['token'] },
    //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //         data: this.convertData(dataRequest),
    //         success: function (response) {
    //             if (response.statusCode == 0) {
    //                 notification.getDone();
    //                 callback();
    //             } else {
    //                 notification.getDanger(response && response.data && response.data.message ? response.data.message : "");
    //             }
    //         }
    //     });
    // },

    // showModalImportCode(packageId) {
    //     var isShowImportCodeInPackage = localStorage.getItem("isShowImportCodeInPackage");
    //     // if (!isShowImportCodeInPackage) {
    //     document.getElementById("importData").modal('show')
    //     // }
    // },

    // getAllTransaction(elementId) {
    //     var draw = 0;
    //     $(document.getElementById(elementId)).DataTable({
    //         language: dataTablePersian,
    //         responsive: true,
    //         ordering: false,
    //         fixedHeader: true,
    //         stateSave: true,
    //         columnDefs: [
    //             { title: "ردیف", targets: 0, width: "10%", className: "text-center" },
    //             { title: "کاربر", targets: 1, width: "20%", className: "text-center" },
    //             { title: "مبلغ", targets: 2, width: "20%", className: "text-center" },
    //             { title: "کد", targets: 3, width: "20%", className: "text-center" },
    //             { title: "وضعیت", targets: 4, width: "10%", className: "text-center" },
    //             { title: "تاریخ", targets: 5, width: "20%", className: "text-center" },
    //         ],
    //         columns: [
    //             { data: 'counter', mRender: function (data, type, full) { return data.toString(); } },
    //             { data: 'user' },
    //             { data: 'price', mRender: function (data, type, full) { return "{0} ریال".format(Number(data).toFixed(0).toString().numberWithCommas()); } },
    //             { data: 'code' },
    //             {
    //                 data: 'status',
    //                 mRender: function (data, type, full) {
    //                     var status = {
    //                         0: { 'title': 'غیرفعال', 'class': ' kt-badge--primary' },
    //                         1: { 'title': 'فعال', 'class': ' kt-badge--success' },
    //                     };
    //                     return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
    //                 }
    //             },
    //             { data: 'created_at' },
    //         ],
    //         processing: true,
    //         serverSide: true,
    //         searching: false,
    //         ajax: function (data, callback, settings) {
    //             var dataRequest = { action: "SHALTRAN", info: { page: (data.start / data.length) + 1, count: data.length } };
    //             $.ajax({
    //                 type: "POST",
    //                 url: APIs.serverAddress,
    //                 headers: { 'authorizationfield': localStorage.getItem("token") },
    //                 contentType: "application/x-www-form-urlencoded; charset=utf-8",
    //                 data: APIs.convertData(dataRequest),
    //                 success: function (response) {
    //                     if (response.statusCode == 0) {
    //                         draw = draw + 1;
    //                         callback({ data: response.data, draw: draw, recordsFiltered: response.total, recordsTotal: response.total });
    //                     } else {
    //                         notification.showDanger(response && response.data && response.data.message ? response.data.message : "مشکلی در ارتباط به وجود آمده است");
    //                         // new notification({ text: Resource.notification.Error.format(response.data.message), type: 'error' }).show()
    //                     }
    //                 }
    //             });
    //         }
    //     });
    // },
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