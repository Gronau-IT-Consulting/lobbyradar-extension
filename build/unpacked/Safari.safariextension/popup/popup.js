var detail_url_extern = 'http://lobbyradar.opendatacloud.de/entity/';
var BG;
if(SAFARI) {
    BG = safari.extension.globalPage.contentWindow;
} else {
    BG = chrome.extension.getBackgroundPage();
}

function enable_for_site(url) {
    var hostname = BG.parseURL(url).hostname;
    BabelExt.bgMessage({requestType:'addWhitelist',hostname:hostname});
}

function disable_for_site(url) {
    var hostname = BG.parseURL(url).hostname;
    BabelExt.bgMessage({requestType:'removeWhitelist',hostname:hostname});
}

function wire_components() {
    $('#btn_settings').click(function(){
        chrome.tabs.create({url: "options.html"});
    });
    $('#btn_enable_for_site').click(function(){
        enable_for_site(tab.url);
        $('.dynamic').hide();
        $('#reloadhint').show();
    });
    $('#btn_disable_for_site').click(function(){
        disable_for_site(tab.url);
        $('.dynamic').hide();
        $('#reloadhint').show();
    });
}

function update_content() {
    $('.dynamic').hide();
    if(SAFARI) $('.hide_in_safari').hide();
    BG.getCurrentTabInfo(function(tabData){
        if( !tabData || !tabData.value ){
            $('#plugin_disabled').show();
            return;
        };
        var info = tabData.value;
        var tab = tabData.tab;
        if( info.stage == 'search' || info.stage == 'mark' ) {
            $('#plugin_working').show();
            window.setTimeout(update_content,100);
        } else {
            if( info.disabled ) {
                $('#plugin_disabled').show();
                if(info.can_enable) {
                    $('#btn_enable_for_site').show();
                }
            } else {
                $('#plugin_disabled').hide();
                if(info.can_disable){
                    $('#btn_disable_for_site').show();
                }
               if( info.hits.length ) {
                    $('#hits').show();
                    $('#num_hits').text(info.hits.length);
                    $('#searchtime').text((info.searchtime/1000).toPrecision(2));
                    $('#hitlist').empty();
                    $.each(info.hits,function(id,person){
                        $('#hitlist').append('<li class="lobbyradar_item"><a href="'+detail_url_extern+person.uid+'">'+person.name+'</a></li>');
                    });
                    $('.lobbyradar_item').click(function(){

                        chrome.tabs.create({url: $('a',this).attr('href')});
                    });

                } else {
                    $('#nohits').show();
                }
            }
        }
    });
}

$(function(){
    wire_components();
    update_content();
});