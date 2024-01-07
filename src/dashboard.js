$(document).ready(() => {
    $("#status").text("Loading...");
    $("#status").css("color", "black");

    const url = localStorage.getItem("url");
    const token = localStorage.getItem("token");
    if (url == null || token == null) {
        window.location.replace("login.html");
    }

    $("#url").text("url: " + url);

    $.ajax({
        url: new URL("api/handler/all", url),
        type: "GET",
        success: result => {
            result.data.forEach(({name, enabled}) => {
                $("#handlers").append(`<li><input type="radio" name="handler" value="${name}"> ${name} <input type="checkbox" ${enabled ? "checked" : ""} data-name="${name}"></li>`);
            });
        }
    }).then(() => {
        $("#handlers").on("change", "input[type=checkbox]", function () {
            const name = $(this).data("name");
            const enabled = $(this).prop("checked");

            $.ajax({
                url: new URL(enabled ? "api/handler/enable" : "api/handler/disable", url),
                type: "GET",
                data: {name, token},
                success: result => {
                    $("#status").text(JSON.stringify(result));
                    $("#status").css("color", "green");
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                    $(this).prop("checked", !enabled);
                }
            })
        });

        $("#handlers").on("change", "input[type=radio]", function () {
            const name = $(this).val();

            const load_groups = $.ajax({
                url: new URL("api/group/all", url),
                type: "GET",
                data: {token},
                success: result => {
                    $("#groups").empty();
                    result.data.forEach(name => {
                        $("#groups").append(`<li><input type="checkbox" data-name="${name}"> ${name}</li>`);
                    });
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                }
            })

            $.ajax({
                url: new URL("api/handler/groups", url),
                type: "GET",
                data: {name, token},
                success: async result => {
                    await load_groups;
                    result.data.forEach(name => {
                        $(`input[data-name="${name}"]`).prop("checked", true);
                    });
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                }
            });
        });

        $("#groups").on("change", "input[type=checkbox]", function () {
            const name = $("input[type=radio]:checked").val();
            const group = $(this).data("name");
            const enabled = $(this).prop("checked");

            $.ajax({
                url: new URL(enabled ? "api/group/add" : "api/group/remove", url),
                type: "GET",
                data: {name, group, token},
                success: result => {
                    $("#status").text(JSON.stringify(result));
                    $("#status").css("color", "green");
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                    $(this).prop("checked", !enabled);
                }
            })
        });

        $("#status").text("Loaded");
        $("#status").css("color", "green");
    })

    $("#logout").click(() => {
        localStorage.removeItem("url");
        localStorage.removeItem("token");
        window.location.replace("login.html");
    });
});

