jQuery(function($){
    $(document).ajaxSend(function() {
        $("#overlay").fadeIn(300);　
    });
    $(document).ajaxComplete(function() {
        $("#overlay").fadeOut(300);　
    });
})

window.getCookie = function(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

window.setCookie = function(name, val, day = null, path="path=/") {
    if (day != null){
        var d = new Date();
        d.setTime(d.getTime() + (day*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + val + ";" + expires + ";" + path;
    }else
        document.cookie = name + "=" + val + ";" + ";" + path;

}

window.XMLParser = function name(xmlStr) {
    if (typeof window.DOMParser != "undefined") {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    } else {
        throw new Error("No XML parser found");
    } 
}

window.showErrorToast = function(msg) {
    $("#error-toast").children('.toast-body').text(msg)
    $('#error-toast').toast('show');  
};

window.showSuccessToast = function(msg) {
    $("#success-toast").children('.toast-body').text(msg)
    $('#success-toast').toast('show');    
};

window.select2Styles = function(){
    $(".select2-container").addClass("form-control p-0 border-0");
    $(".select2-container").removeAttr('style');
    $('.select2-selection').addClass("form-control");
};

window.environments = function(){
    return {
        baseURL: 'http://pynar.org'
    };
};
window.uuidv4 = function() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    
};

window.avatarColors = function(){
    return {
        "A": "#f44336",
        "B": "#E91E63",
        "C": "#9C27B0",
        "Ç": "#673AB7",
        "D": "#3F51B5",
        "E": "#2196F3",
        "F": "#03A9F4",
        "G": "#00BCD4",
        "H": "#009688",
        "I": "#4CAF50",
        "İ": "#8BC34A",
        "J": "#CDDC39",
        "K": "#FFEB3B",
        "L": "#FFC107",
        "M": "#FF9800",
        "N": "#FF5722",
        "O": "#795548",
        "Ö": "#9E9E9E",
        "P": "#37474F",
        "R": "#f44380",
        "S": "#E91EFF",
        "Ş": "#9C2760",
        "T": "#219613",
        "U": "#7955F1",
        "Ü": "#FF57F2",
        "V": "#FFEB43",
        "Y": "#CDDC16",
        "Z": "#10a167"
    }
}

window.avatar = function(name, size = 1){
    
    if(!['', null, undefined].includes(name)){
        
        let element = document.createElement('div');
        element.className = "avatar avatar-size-" + size +  " rounded-circle d-flex justify-content-center align-items-center overflow-hidden text-white"
        element.style.backgroundColor = avatarColors()[name.substring(0,1).toUpperCase()]
        element.innerHTML = name.split(' ').map(function(el) { return el[0] }).join().replaceAll(',','').toUpperCase()

        return element;
    }

    return undefined;
}

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

window.formattedMonth = function(month){
    if(!['', null, undefined].includes(month)){
        if(month < 10)
            return '0' + month
        return month
    }

    return undefined
}

window.importSelect2 = function(callback = null) {

    $.holdReady(true);
    jQuery.getScript('assets/lib/jquery/select2-4.0.1.min.js', function() {
        console.log("jQuery Select2 bileşeni yüklendi.");
        $.holdReady(false);
        if(callback)
            callback()
    });

}

window.importChartjs = function(){

    jQuery.getScript('assets/lib/chartjs/chart-3.3.2.min.js', function() {
        console.log("Chart.js bileşeni yüklendi.");
    });
    
}

window.createEditor = async function(opt = {}) {
    return new Promise(function(resolve, reject) {
        jQuery.getScript('assets/lib/codemirror/codemirror.min.js')
            .done(function(){
                console.log('jQuery CodeMirror bileşeni yüklendi.');
                jQuery.getScript('assets/lib/codemirror/mode/python/python.min.js')
                    .done(function(){
                        console.log('jQuery CodeMirror Python bileşeni yüklendi.');
                        var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                            mode: {
                                name: "python",
                                version: 3,
                                singleLineStringErrors: false
                            },
                            lineNumbers: true,
                            indentUnit: 4,
                            matchBrackets: true,
                            ...opt
                        });
                    
                        resolve(editor)
                    })
                    .fail(function(err) {
                        reject(err)
                    })   
            })
            .fail(function(err) {
                reject(err)
            })
    });     
}

window.setEditor = async function(editor, val) {
    if(![null, undefined].includes(editor))
        editor.setValue(val)
    
    return undefined
}

window.createDataTable = function(opt = {}, selector = '.data-table'){
    return new Promise(function(resolve, reject) {
        jQuery.getScript('assets/lib/jquery/jquery.dataTables.min.js')
            .done(function(){
                console.log('jQuery DataTables bileşeni yüklendi.');
                jQuery.getScript('assets/lib/jquery/dataTables.bootstrap5.min.js')
                    .done(function(){
                        console.log('jQuery DataTables.bootstrap5 bileşeni yüklendi.');
                        var datatable = $(selector).DataTable({
                            "language": {
                                "decimal": "",
                                "emptyTable": "Tablo içerisinde herhangi bir veri bulunamadı.",
                                "info": "_TOTAL_ kayıt içinden _START_-_END_ arası gösteriliyor.",
                                "infoEmpty": "0 kayıt içinden 0-0 arası gösteriliyor.",
                                "infoFiltered": "(Toplam _MAX_ kayıttan filtrelendi)",
                                "infoPostFix": "",
                                "thousands": ",",
                                "lengthMenu": "Her sayfa için _MENU_ veri gösteriliyor.",
                                "loadingRecords": "Yükleniyor...",
                                "processing": "İşleniyor...",
                                "search": "Ara:",
                                "zeroRecords": "Üzgünüm. Herhangi bir veri bulunamadı.",
                                "paginate": {
                                    "first": '<i class="fa fa-angle-double-left"></i>',
                                    "last": '<i class="fa fa-angle-double-right"></i>',
                                    "next": '<i class="fa fa-angle-right"></i>',
                                    "previous": '<i class="fa fa-angle-left"></i>'
                                },
                                "aria": {
                                    "sortAscending": ": Artan Sırada",
                                    "sortDescending": ": Azalan Sırada"
                                },
                    
                            },
                            responsive: true,
                            ...opt
                        })
                    
                        resolve(datatable)
                    })
                    .fail(function(err) {
                        reject(err)
                    })   
            })
            .fail(function(err) {
                reject(err)
            })
    });     
    
}

$(function () {
    if(![null, undefined].includes(document.querySelector('[data-bs-toggle="popover"]')))
        var popover = new bootstrap.Popover(document.querySelector('[data-bs-toggle="popover"]'), {
            container: 'body'
        }) 
})