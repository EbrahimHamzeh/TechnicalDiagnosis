var routes = {};
var dataTablePersian = {
  sEmptyTable: "هیچ داده ای در جدول وجود ندارد",
  sInfo: "نمایش _START_ تا _END_ از _TOTAL_ رکورد",
  sInfoEmpty: "نمایش 0 تا 0 از 0 رکورد",
  sInfoPostFix: "",
  sInfoFiltered: "(فیلتر شده از _MAX_ رکورد)",
  sInfoThousands: ",",
  sLengthMenu: "نمایش _MENU_ رکورد",
  sLoadingRecords: "در حال بارگزاری...",
  sProcessing: "در حال پردازش...",
  sSearch: "جستجو:",
  sZeroRecords: "رکوردی با این مشخصات پیدا نشد",
  oPaginate: {
    sFirst: "ابتدا",
    sLast: "انتها",
    sNext: "بعدی",
    sPrevious: "قبلی"
  },
  oAria: {
    sSortAscending: ": فعال سازی نمایش به صورت صعودی",
    sSortDescending: ": فعال سازی نمایش به صورت نزولی"
  }
};
var viewBag = {};

var routing = {
  GlobalTitle: "معاینه‌فنی",

  route(path, address, controller, authorize) {
    routes[path] = {
      address: address,
      controller: controller,
      authorize: authorize
    };
  },

  changeRouteWithPushState(address) {
    history.pushState({ urlPath: "#/" + address }, "", "#/" + address);
    routing.router();
  },

  router() {
    var url = location.hash.slice(1) || "/",
      id = 0;
    if (/\/\d/.test(url)) {
      id = url.replace(/\D/g, "");
      url = url.replace(/[0-9]/g, "");
    }
    if (
      url == "/" &&
      !this.isExpireToken() &&
      window.location.pathname != "/auth/"
    )
      url = "/dashboard";
    var route = routes[url];
    if (route && route.address) {
      $.ajax({
        type: "GET",
        url: route.address,
        dataType: "html",
        cache: true,
        tryCount: 0,
        retryLimit: 5,
        success: function(data) {
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
    if (data && data.page && data.page.title)
      this.changeGlobalTitle(data.page.title);
    this.addRoutingEventToLinks();
  },

  addRoutingEventToLinks() {
    var menus = document.querySelectorAll(".routing-link");
    for (var i = 0; i < menus.length; i++) {
      menus[i].addEventListener("click", function(event) {
        event.preventDefault();
        var element = event.target;
        if (element && element.getAttribute("href"))
          routing.changeRouteWithPushState(element.getAttribute("href"));
        if (element.parentElement && element.parentElement.getAttribute("href"))
          routing.changeRouteWithPushState(
            event.target.parentElement.getAttribute("href")
          );
        $(this)
          .parents(".dropdown-menu")
          .hide();
      });
    }
    document
      .getElementsByClassName("confirm-password")[0]
      .addEventListener("click", this.confirmExpireTokenByPassword());
  },

  changeGlobalTitle(pageTitle) {
    // document.getElementsByTagName("title")[0].text = "{0}| {1}".format(this.GlobalTitle, pageTitle)
  },

  getParseToken() {
    token = localStorage.getItem("token");
    if (token) {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function(c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    }
  },

  isExpireToken() {
    decodeJWT = this.getParseToken();
    if (decodeJWT) {
      var expireDate = new Date(decodeJWT.edt * 1000);
      if (expireDate <= new Date()) return true;
      return false;
    }
  },

  isExpireTokenRedirect() {
    if (this.isExpireToken()) {
      localStorage.clear();
      window.location.href = "../auth";
    }
  },

  confirmExpireTokenByPassword(e) {},

  setUserName() {
    //document.getElementsByClassName("kt-user-card__name")[0].textContent = "{0} {1}".format(localStorage.getItem("fname"), localStorage.getItem("lname"))
  },

  initMenuEvent() {
    var menus = document.querySelectorAll(".kt-menu__subnav li a");
    for (var i = 0; i < menus.length; i++) {
      menus[i].addEventListener("click", function(event) {
        event.preventDefault();
        var element = event.target;
        if (event.target && event.target.parentElement) {
          routing.changeRouteWithPushState(
            event.target.parentElement.getAttribute("href")
          );
        }
      });
    }
  },

  initWindowEvent() {
    window.addEventListener("hashchange", routing.router);
    window.addEventListener("pushState", routing.router);
    window.addEventListener("load", function() {
      routing.setUserName();
      routing.router();
    });
    window.addEventListener("locationchange", routing.router);
  },

  init() {
    this.initWindowEvent();
    this.initMenuEvent();
  }
};

routing.route("/dashboard", "components/dashboard.html", function(template) {
  routing.ganarateTemplate({}, template);

  $(".maxlength").maxlength({
    warningClass:
      "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
    limitReachedClass:
      "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline"
  });

  var container = document.getElementsByClassName("plate-input")[0];
  container.onkeyup = function(e) {
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
  };

  container.onkeypress = function(e) {
    var target = e.srcElement;
    var maxLength = parseInt(target.attributes["maxlength"].value, 10);
    if (target.value.length >= maxLength && e.keyCode != 8) {
      return false;
    }
  };

  var plateState = document.getElementById("plateState");
  var plateFirstNumber = document.getElementById("plateFirstNumber");
  var plateAlphabet = document.getElementById("plateAlphabet");
  var plateLastNumber = document.getElementById("plateLastNumber");
  var btnsearchPlate = document.getElementById("searchPlate");

  document.getElementById("clearAllField").onclick = function() {
    plateState.value = "";
    plateFirstNumber.value = "";
    plateAlphabet.value = "";
    plateLastNumber.value = "";
    $(thbtnsearchPlateis)
      .removeClass(
        "kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light"
      )
      .attr("disabled", false);
  };

  btnsearchPlate.onclick = function() {
    var form = $(".form-search-plate");
    if (form.valid()) {
      $(this)
        .addClass(
          "kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light"
        )
        .attr("disabled", true);
      var searchPlate = {
        plateState: plateState.value,
        plateFirstNumber: plateFirstNumber.value,
        plateAlphabet: plateAlphabet.value,
        plateLastNumber: plateLastNumber.value
      };
      localStorage.setItem("searchPlate", JSON.stringify(searchPlate));
      APIs.getSearchPlate(searchPlate, function(response) {
        viewBag["plateSearchResult"] = response;
        routing.changeRouteWithPushState(
          "plate/serachresult/" + (response && response.id ? response.id : "0")
        );
      });
    }
  };
});

routing.route("/plate", "", function() {
  data = {
    page: {
      title: "پلاک‌ها",
      id: "tablePlate",
      button: [
        {
          title: "جدید",
          href: "plate/add",
          icon: "la-plus",
          color: "btn-brand"
        }
      ]
    }
  };

  routing.ganarateTemplate(
    data,
    document.getElementById("dataTable").innerHTML
  );
  APIs.getAllPlate(data.page.id);
});

routing.route("/plate/add", "components/plate/detail.html", function(template) {
  var data = {
    page: {
      title: "پلاک جدید",
      description: "",
      backward: "plate"
    },
    breadCrumb: [{ title: "پلاک‌ها", link: "plate" }]
  };
  routing.ganarateTemplate(data, template);
  KTLayout.initPageStickyPortlet();

  $("#serviceDate").pDatepicker({ format: "YYYY/MM/DD" });

  var typeVehicle = document.getElementById("typeVehicle");
  APIs.getSelectList(typeVehicle, 0);

  document.getElementById("saveData").addEventListener("click", function(e) {
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
      typeVehicleId: Number(typeVehicle.options[typeVehicle.selectedIndex].value)
    };

    APIs.setPlate(fields, function() {
      routing.changeRouteWithPushState(data.page.backward);
    });
  });
});

routing.route("/plate/edit/", "components/plate/detail.html", function(
  template,
  id
) {
  var data = {
    page: {
      title: "ویرایش پلاک",
      description: "",
      backward: "plate"
    },
    breadCrumb: [{ title: "پلاک‌ها", link: "plate" }]
  };
  routing.ganarateTemplate(data, template);
  KTLayout.initPageStickyPortlet();

  var fullName = document.getElementById("fullName");
  var mobile = document.getElementById("mobile");
  var PlateState = document.getElementById("plateState");
  var PlateAlphabet = document.getElementById("plateAlphabet");
  var PlateFirstNumber = document.getElementById("plateFirstNumber");
  var PlateLastNumber = document.getElementById("plateLastNumber");
  var Description = document.getElementById("description");
  var IsTechnicalDiagnosis = document.getElementById("isTechnicalDiagnosis");
  var ServiceDate = document.getElementById("serviceDate");
  $("#serviceDate").pDatepicker({ format: "YYYY/MM/DD" });

  APIs.getPlate(id, function(response) {
    fullName.value = response.fullName;
    mobile.value = response.mobile;
    PlateState.value = response.plateState;
    PlateAlphabet.value = response.plateAlphabet;
    PlateFirstNumber.value = response.plateFirstNumber;
    PlateLastNumber.value = response.plateLastNumber;
    Description.value = response.description;
    IsTechnicalDiagnosis.checked = response.isTechnicalDiagnosis;
    ServiceDate.value = response.serviceDatePersian;
  });

  document.getElementById("saveData").addEventListener("click", function() {
    notification.getStart();
    var fields = {
      id: parseInt(id),
      fullName: fullName.value,
      mobile: mobile.value,
      PlateState: PlateState.value,
      PlateAlphabet: PlateAlphabet.value,
      PlateFirstNumber: PlateFirstNumber.value,
      PlateLastNumber: PlateLastNumber.value,
      Description: Description.value,
      IsTechnicalDiagnosis: IsTechnicalDiagnosis.checked,
      ServiceDate: ServiceDate.value
    };

    APIs.setPlate(fields, function() {
      routing.changeRouteWithPushState(data.page.backward);
    });
  });
});

routing.route("/plate/serachresult/", "components/plate/detail.html", function(
  template,
  id
) {
  var data = {
    page: { title: "اطلاعات پلاک", description: "", backward: "dashboard" },
    breadCrumb: [{ title: "داشبورد", link: "dashboard" }]
  };

  routing.ganarateTemplate(data, template);
  KTLayout.initPageStickyPortlet();

  var fullName = document.getElementById("fullName");
  var mobile = document.getElementById("mobile");
  var PlateState = document.getElementById("plateState");
  var PlateAlphabet = document.getElementById("plateAlphabet");
  var PlateFirstNumber = document.getElementById("plateFirstNumber");
  var PlateLastNumber = document.getElementById("plateLastNumber");
  var Description = document.getElementById("description");
  var IsTechnicalDiagnosis = document.getElementById("isTechnicalDiagnosis");
  var ServiceDate = document.getElementById("serviceDate");
  $("#serviceDate").pDatepicker({ format: "YYYY/MM/DD" });

  PlateState.readOnly = true;
  PlateAlphabet.readOnly = true;
  PlateFirstNumber.readOnly = true;
  PlateLastNumber.readOnly = true;

  var searchPlate = JSON.parse(
    localStorage.getItem("searchPlate")
      ? localStorage.getItem("searchPlate")
      : ""
  );
  PlateState.value = searchPlate.plateState;
  PlateAlphabet.value = searchPlate.plateAlphabet;
  PlateFirstNumber.value = searchPlate.plateFirstNumber;
  PlateLastNumber.value = searchPlate.plateLastNumber;

  if (id > 0 && viewBag["plateSearchResult"] == undefined) {
    APIs.getPlate(id, function(response) {
      fullName.value = response.fullName;
      mobile.value = response.mobile;
      PlateState.value = response.plateState;
      PlateAlphabet.value = response.plateAlphabet;
      PlateFirstNumber.value = response.plateFirstNumber;
      PlateLastNumber.value = response.plateLastNumber;
      Description.value = response.description;
      IsTechnicalDiagnosis.checked = response.isTechnicalDiagnosis;
      ServiceDate.value = response.serviceDatePersian;
    });
  } else {
    if (viewBag["plateSearchResult"] != undefined) {
      fullName.value = viewBag["plateSearchResult"].fullName;
      mobile.value = viewBag["plateSearchResult"].mobile;
      PlateState.value = viewBag["plateSearchResult"].plateState;
      PlateAlphabet.value = viewBag["plateSearchResult"].plateAlphabet;
      PlateFirstNumber.value = viewBag["plateSearchResult"].plateFirstNumber;
      PlateLastNumber.value = viewBag["plateSearchResult"].plateLastNumber;
      Description.value = viewBag["plateSearchResult"].description;
      IsTechnicalDiagnosis.checked =
        viewBag["plateSearchResult"].isTechnicalDiagnosis;
      ServiceDate.value = viewBag["plateSearchResult"].serviceDatePersian;
    }
  }

  document.getElementById("saveData").addEventListener("click", function() {
    notification.getStart();
    var fields = {
      id: parseInt(id),
      fullName: fullName.value,
      mobile: mobile.value,
      PlateState: PlateState.value,
      PlateAlphabet: PlateAlphabet.value,
      PlateFirstNumber: PlateFirstNumber.value,
      PlateLastNumber: PlateLastNumber.value,
      Description: Description.value,
      IsTechnicalDiagnosis: IsTechnicalDiagnosis.checked,
      ServiceDate: ServiceDate.value
    };

    APIs.setPlate(fields, function() {
      routing.changeRouteWithPushState(data.page.backward);
    });
  });
});

routing.route("/user", "", function() {
  data = {
    page: {
      title: "کاربران",
      id: "tableuser",
      button: [
        {
          title: "جدید",
          href: "user/add",
          icon: "la-plus",
          color: "btn-brand"
        }
      ]
    }
  };

  routing.ganarateTemplate(
    data,
    document.getElementById("dataTable").innerHTML
  );
  APIs.getAllUser(data.page.id);
});

routing.route("/user/add", "components/user/detail.html", function(template) {
  var data = {
    page: {
      title: "کاربر جدید",
      description: "",
      backward: "user"
    },
    breadCrumb: [{ title: "کاربران", link: "user" }]
  };

  routing.ganarateTemplate(data, template);
  KTLayout.initPageStickyPortlet();

  document.getElementById("saveData").addEventListener("click", function(e) {
    notification.getStart();
    var fields = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      displayName: document.getElementById("displayName").value,
      isActive: document.getElementById("isAdmin").checked,
      description: document.getElementById("description").value
    };

    APIs.setUser(fields, function() {
      routing.changeRouteWithPushState(data.page.backward);
    });
  });
});

routing.route("/typeVehicle", "", function() {
  data = {
    page: {
      title: "نوع خودرو/ دوره",
      id: "tablTypeVehicle",
      button: [
        {
          title: "جدید",
          href: "typeVehicle/add",
          icon: "la-plus",
          color: "btn-brand"
        }
      ]
    }
  };

  routing.ganarateTemplate(
    data,
    document.getElementById("dataTable").innerHTML
  );
  APIs.getAllTypeVehicle(data.page.id);
});

routing.route(
  "/typeVehicle/add",
  "components/typeVehicle/detail.html",
  function(template) {
    var data = {
      page: {
        title: "نوع خودرو/ دوره جدید",
        description: "",
        backward: "typeVehicle"
      },
      breadCrumb: [{ title: "نوع خودرو/ دوره", link: "typeVehicle" }]
    };

    routing.ganarateTemplate(data, template);
    KTLayout.initPageStickyPortlet();

    document.getElementById("saveData").addEventListener("click", function(e) {
      notification.getStart();
      var fields = {
        title: document.getElementById("title").value,
        Days: Number(document.getElementById("period").value),
        description: document.getElementById("description").value
      };

      APIs.setTypeVehicle(fields, function() {
        routing.changeRouteWithPushState(data.page.backward);
      });
    });
  }
);

routing.init();

var APIs = {
  signIn(username, password, callback) {
    $.ajax({
      type: "POST",
      url: "/api/Identity/Login",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({ Username: username, Password: password }),
      success: function(response) {
        if (response && response.access_token) {
          localStorage.setItem("token", response.access_token);
          localStorage.setItem("refresh_token", response.refresh_token);
          localStorage.setItem("displayName", response.display_name);
          window.location.href = "../admin";
        } else {
          callback("اطلاعات نامعتبر می‌باشد!");
        }
      },
      error: function(request, status, error) {
        callback("اطلاعات نامعتبر می‌باشد!");
      }
    });
  },

  signOut() {
    localStorage.clear();
    window.location.href = "../auth";
  },

  setGlobalActionPrompt(address) {
    swal
      .fire({
        title: "مطمئن هستید؟",
        text: "آیا از انجام عملیات مطمئن هستید؟",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "بله",
        cancelButtonText: "کنسل",
        reverseButtons: true
      })
      .then(function(result) {
        if (result.value) {
          APIs.setGlobalAction(address);
        } else if (result.dismiss === "cancel") {
          notification.showWarning("عملیات لغو شد.");
        }
      });
  },

  setGlobalAction(address) {
    notification.getStart();
    $.ajax({
      type: "POST",
      url: address,
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      contentType: "application/x-www-form-urlencoded; charset=utf-8",
      success: function(response) {
        if (response && response.error && response.error.length) {
          notification.getDanger(response.error);
        } else {
          $($('table[id^="table"]')[0])
            .DataTable()
            .ajax.reload(null, false);
          notification.getDone();
        }
      }
    });
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
        {
          title: "نام‌و‌نام‌خانوادگی",
          targets: 0,
          width: "20%",
          className: "text-center"
        },
        {
          title: "شماره‌موبایل",
          targets: 1,
          width: "20%",
          className: "text-center"
        },
        {
          title: "شماره‌پلاک",
          targets: 2,
          width: "20%",
          className: "text-center"
        },
        {
          title: "نوع‌وسیله‌ی‌نقلیه",
          targets: 3,
          width: "5%",
          className: "text-center"
        },
        {
          title: "تاریخ‌مراجعه",
          targets: 4,
          width: "10%",
          className: "text-center"
        },
        {
          title: "توضیحات",
          targets: 5,
          width: "10%",
          className: "text-center"
        },
        { title: "عملیات", targets: 6, width: "10%", className: "text-center" }
      ],
      columns: [
        { data: "fullName" },
        { data: "mobile" },
        {
          data: "price",
          mRender: function(data, type, full) {
            return "ایران{0} {1} {2} {3}".format(
              full.plateState,
              full.plateFirstNumber,
              full.plateAlphabet,
              full.plateLastNumber
            );
          }
        },
        { data: "typeVehicleId" },
        { data: "serviceDatePersian" },
        { data: "description" },
        {
          data: "id",
          mRender: function(data, type, full) {
            return (
              '<span class="dropdown">' +
              '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
              '<i class="la la-ellipsis-h"></i>' +
              "</a>" +
              '<div class="dropdown-menu dropdown-menu-right">' +
              '<a class="routing-link dropdown-item" href="plate/edit/' +
              data +
              '"><i class="la la-edit"></i> ویرایش</a>' +
              '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'/api/Plate/delete/' +
              data +
              '\');"><i class="la la-remove"></i> حذف</a>' +
              "</div>" +
              "</span>" +
              '<a href="plate/edit/' +
              data +
              '" class="routing-link btn btn-sm btn-clean btn-icon btn-icon-md" title="ویرایش">' +
              '<i class="la la-edit"></i>' +
              "</a>"
            );
          }
        }
      ],
      processing: true,
      serverSide: true,
      searching: false,
      ajax: function(data, callback, settings) {
        // var dataRequest = { action: "SHALPAED", info: { page: (data.start / data.length) + 1, count: data.length } };
        $.ajax({
          type: "POST",
          url: "/api/Plate/List?page={0}&size={1}".format(
            data.start / data.length + 1,
            data.length
          ),
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
          contentType: "application/x-www-form-urlencoded; charset=utf-8",
          success: function(response) {
            if (response.rows) {
              draw = draw + 1;
              callback({
                data: response.rows,
                draw: draw,
                recordsFiltered: response.total,
                recordsTotal: response.total
              });
            } else {
              notification.showDanger(
                response && response.data && response.data.message
                  ? response.data.message
                  : "مشکلی در ارتباط به وجود آمده است"
              );
            }
          }
        });
      },
      drawCallback: function(settings) {
        routing.addRoutingEventToLinks();
        var menus = document.querySelectorAll(".add-new-code-package");
        for (var i = 0; i < menus.length; i++) {
          menus[i].addEventListener("click", function(e) {
            event.preventDefault();
            var element = event.target;
            notification.getStart();
            var id = element.getAttribute("data-id");
            var codeElement = element.parentElement.parentElement.getElementsByTagName(
              "input"
            )[0];
            if (codeElement) var code = codeElement.value;
            if (id && code) {
              APIs.setCode(id, code, function() {
                codeElement.value = "";
              });
            } else {
              notification.showWarning("اطلاعات نامعتبر است");
            }
          });
        }
      }
    });
  },

  setPlate(info, callback) {
    $.ajax({
      type: "POST",
      url: info.id ? "/api/Plate/Update" : "/api/Plate/Add",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(info),
      success: function(response) {
        if (response && response.error && response.error.length) {
          notification.getDanger(response.error);
        } else {
          notification.getDone();
          callback();
        }
      }
    });
  },

  getSearchPlate(data, callback) {
    $.ajax({
      type: "POST",
      url: "/api/Plate/search?plateFirstNumber={0}&plateAlphabet={1}&plateLastNumber={2}&plateState={3}".format(
        data.plateFirstNumber,
        data.plateAlphabet,
        data.plateLastNumber,
        data.plateState
      ),
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function(response) {
        // alert(JSON.stringify(response));
        if (response && response.error && response.error.length) {
          notification.getDanger(response.error);
        } else {
          callback(response);
        }
      },
      error: function(request, status, error) {
        callback("اطلاعات نامعتبر می‌باشد!");
      }
    });
  },

  getPlate(id, callback) {
    $.ajax({
      type: "POST",
      url: "/api/plate/get/" + id,
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function(response) {
        callback(response);
      },
      error: function(request, status, error) {
        callback("اطلاعات نامعتبر می‌باشد!");
      }
    });
  },

  getAllUser(elementId) {
    var draw = 0;
    $(document.getElementById(elementId)).DataTable({
      language: dataTablePersian,
      responsive: true,
      ordering: false,
      fixedHeader: true,
      stateSave: true,
      columnDefs: [
        {
          title: "نام‌کاربری",
          targets: 0,
          width: "20%",
          className: "text-center"
        },
        {
          title: "نام",
          targets: 1,
          width: "20%",
          className: "text-center"
        },
        {
          title: "تاریخ‌آخرین‌ورود",
          targets: 2,
          width: "20%",
          className: "text-center"
        },
        {
          title: "وضعیت",
          targets: 3,
          width: "5%",
          className: "text-center"
        },
        { title: "عملیات", targets: 4, width: "10%", className: "text-center" }
      ],
      columns: [
        { data: "username" },
        { data: "displayName" },
        { data: "lastLoggedIn" },
        { data: "isActive" },
        {
          data: "id",
          mRender: function(data, type, full) {
            return (
              '<span class="dropdown">' +
              '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
              '<i class="la la-ellipsis-h"></i>' +
              "</a>" +
              '<div class="dropdown-menu dropdown-menu-right">' +
              '<a class="routing-link dropdown-item" href="plate/edit/' +
              data +
              '"><i class="la la-edit"></i> ویرایش</a>' +
              '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'/api/Plate/delete/' +
              data +
              '\');"><i class="la la-remove"></i> حذف</a>' +
              "</div>" +
              "</span>" +
              '<a href="plate/edit/' +
              data +
              '" class="routing-link btn btn-sm btn-clean btn-icon btn-icon-md" title="ویرایش">' +
              '<i class="la la-edit"></i>' +
              "</a>"
            );
          }
        }
      ],
      processing: true,
      serverSide: true,
      searching: false,
      ajax: function(data, callback, settings) {
        $.ajax({
          type: "POST",
          url: "/api/User/List?page={0}&size={1}".format(
            data.start / data.length + 1,
            data.length
          ),
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
          contentType: "application/x-www-form-urlencoded; charset=utf-8",
          success: function(response) {
            if (response.rows) {
              draw = draw + 1;
              callback({
                data: response.rows,
                draw: draw,
                recordsFiltered: response.total,
                recordsTotal: response.total
              });
            } else {
              notification.showDanger(
                response && response.data && response.data.message
                  ? response.data.message
                  : "مشکلی در ارتباط به وجود آمده است"
              );
            }
          }
        });
      },
      drawCallback: function(settings) {
        routing.addRoutingEventToLinks();
      }
    });
  },

  setUser(info, callback) {
    $.ajax({
      type: "POST",
      url: info.id ? "/api/user/Update" : "/api/user/Add",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(info),
      success: function(response) {
        if (response && response.error && response.error.length) {
          notification.getDanger(response.error);
        } else {
          notification.getDone();
          callback();
        }
      }
    });
  },

  getAllTypeVehicle(elementId) {
    var draw = 0;
    $(document.getElementById(elementId)).DataTable({
      language: dataTablePersian,
      responsive: true,
      ordering: false,
      fixedHeader: true,
      stateSave: true,
      columnDefs: [
        {
          title: "عنوان",
          targets: 0,
          width: "20%",
          className: "text-center"
        },
        {
          title: "روز(هر دوره)",
          targets: 1,
          width: "20%",
          className: "text-center"
        },
        {
          title: "وضعیت",
          targets: 2,
          width: "5%",
          className: "text-center"
        },
        { title: "عملیات", targets: 3, width: "10%", className: "text-center" }
      ],
      columns: [
        { data: "title" },
        { data: "days" },
        { data: "isActive" },
        {
          data: "id",
          mRender: function(data, type, full) {
            return (
              '<span class="dropdown">' +
              '<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">' +
              '<i class="la la-ellipsis-h"></i>' +
              "</a>" +
              '<div class="dropdown-menu dropdown-menu-right">' +
              '<a class="routing-link dropdown-item" href="plate/edit/' +
              data +
              '"><i class="la la-edit"></i> ویرایش</a>' +
              '<a class="dropdown-item" href="javascript:APIs.setGlobalActionPrompt(\'/api/Plate/delete/' +
              data +
              '\');"><i class="la la-remove"></i> حذف</a>' +
              "</div>" +
              "</span>" +
              '<a href="plate/edit/' +
              data +
              '" class="routing-link btn btn-sm btn-clean btn-icon btn-icon-md" title="ویرایش">' +
              '<i class="la la-edit"></i>' +
              "</a>"
            );
          }
        }
      ],
      processing: true,
      serverSide: true,
      searching: false,
      ajax: function(data, callback, settings) {
        $.ajax({
          type: "POST",
          url: "/api/typevehicle/list?page={0}&size={1}".format(
            data.start / data.length + 1,
            data.length
          ),
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
          contentType: "application/x-www-form-urlencoded; charset=utf-8",
          success: function(response) {
            if (response.rows) {
              draw = draw + 1;
              callback({
                data: response.rows,
                draw: draw,
                recordsFiltered: response.total,
                recordsTotal: response.total
              });
            } else {
              notification.showDanger(
                response && response.data && response.data.message
                  ? response.data.message
                  : "مشکلی در ارتباط به وجود آمده است"
              );
            }
          }
        });
      },
      drawCallback: function(settings) {
        routing.addRoutingEventToLinks();
      }
    });
  },

  setTypeVehicle(info, callback) {
    $.ajax({
      type: "POST",
      url: info.id ? "/api/typevehicle/update" : "/api/typevehicle/add",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(info),
      success: function(response) {
        if (response && response.error && response.error.length) {
          notification.getDanger(response.error);
        } else {
          notification.getDone();
          callback();
        }
      }
    });
  },

  getSelectList(element, selectedId) {
    $.ajax({
      type: "POST",
      url: "/api/typeVehicle/selectlist/" + selectedId,
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      contentType: "application/json; charset=utf-8",
      success: function(response) {
        if (response && response.error && response.error.length) {
          notification.showDanger(response.error);
        } else {
          for (var i = 0; i < response.length; i++) {
            var opt = document.createElement("option");
            opt.value = response[i].value;
            opt.innerHTML = response[i].text;
            opt.selected = response[i].selected;
            element.appendChild(opt);
          }
        }
      }
    });
  }
};

var extention = {
  setInputFilter(textbox, inputFilter, changeValue, beforeChange) {
    [
      "input",
      "keydown",
      "keyup",
      "mousedown",
      "mouseup",
      "select",
      "contextmenu",
      "drop"
    ].forEach(function(event) {
      textbox.addEventListener(event, function() {
        if (beforeChange) this.value = beforeChange(this.value);
        if (inputFilter(this.value)) {
          this.oldValue = this.value;
          var changeVal = changeValue(this.value);
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
    return value.replace(/,/g, "");
  }
};

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
    z_index: "10000"
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
    notify.update("icon", "icon la la-remove");
    notify.update("title", "خطا");
    notify.update(
      "message",
      message ? message : "عملیات با <strong>خطا</strong> مواجه شد."
    );
    notify.update("type", "danger");
    notify.update("progress", 95);
  },

  getDone() {
    notify.update("icon", "icon la la-check");
    notify.update("title", "موفقیت آمیز");
    notify.update("message", "با <strong>موفقیت</strong> به پایان رسید.");
    notify.update("type", "success");
    notify.update("progress", 100);
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
};

String.prototype.format = function() {
  var formatted = this;
  for (var arg in arguments) {
    formatted = formatted.replace("{" + arg + "}", arguments[arg]);
  }
  return formatted;
};

String.prototype.numberWithCommas = function() {
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

$(document).ajaxSend(function() {
  KTApp.blockPage({
    overlayColor: "#000000",
    type: "v2",
    state: "primary",
    message: "درحال‌بارگذاری"
  });
});

$(document).ajaxStop(function() {
  KTApp.unblockPage();
});

$(document).ajaxError(function(jqXHR, textStatus, errorThrown) {
  if (textStatus.statusText == "Unauthorized") window.location.href = "../auth";
  else {
    $("#saveData").attr("disabled", true);
    notification.showDanger("مشکلی در ارتباط با سرور به‌وجود آمده است.");
  }
});
