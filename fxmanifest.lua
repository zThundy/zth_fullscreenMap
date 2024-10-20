fx_version "cerulean"
games { "gta5", "rdr3" }
lua54 "yes"

author "zThundy__"
description "Resource to manage all kinds of garages"
version "1.0.0"

files {
    "html/*",
    "html/css/*",
    "html/js/*",
    "html/images/*",
    "html/lib/*",

    "html/index.html",
}

ui_page "html/index.html"

client_scripts {
    "client/main.lua",
}