$(document).ready(function() {

    window.loader = `<div class="loader loader--style3" title="2">
    <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
       width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
    <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
      <animateTransform attributeType="xml"
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.6s"
        repeatCount="indefinite"/>
      </path>
    </svg>
  </div>`;

    // Sidebar Links to get Parts
    $("a.get-parts").click(function(e) {
        e.preventDefault();
        let href = $(this).attr("href");
        $.ajax({
            method: "GET",
            url: href,
            data: { ispart: true },
            statusCode: {
                200: (res) => {
                    console.log(href);
                    $('.active').removeClass('active')
                    $(this).addClass("active");
                    $("#result").html(res);
                    history.pushState({}, null, href);
                },
                404: function() {
                    alert("page not found");
                },
                401: () => {
                    $.notify("دسترسی غیرمجاز! ابتدا وارد شوید.", { align: "right", delay: 3000, verticalAlign: "top", color: "#fff", background: "#D44950" });
                    setTimeout(function() {
                        window.location.pathname = '/api/login'
                    }, 4000);
                    console.log("دسترسی غیرمجاز! ابتدا وارد شوید.");
                },
                400: () => {
                    $.notify("مشکلی پیش آمده! صفحه را رفرش کنید", { align: "right", delay: 3000, verticalAlign: "top", color: "#fff", background: "#D44950" });
                }
            }
        }).done(function(res) {

        });
    });

});

function toEnglishNumber(strNum) {
    var pn = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    var en = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    var cache = strNum;
    for (var i = 0; i < 10; i++) {
        var regex_fa = new RegExp(pn[i], 'g');
        cache = cache.replace(regex_fa, en[i]);
    }
    return cache;
};

function numWcomma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function trimWords(str, flag) {
    if (flag == '_') {
        return str.toString().replace(/\s/g, "_");
    } else if (flag == 's') {
        return str.toString().replace(/_/g, " ");
    }
};