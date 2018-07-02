// https://codepen.io/netsi1964/pres/bdMxvr
/*global $, jQuery, localStorage, window, angular, alert, document, console, confirm, require, $source, $output */
/*jshint unused:false */
/*jshint plusplus: false, devel: true, nomen: true, indent: 4, maxerr: 50 */

// This function is just a codepen related util for the lazy programmer :-)
"use strict";
(function defineVarsFromClassName() {
    var needVar = $("[class]"),
        definedVars = "",
        i,
        ii,
        classes,
        sVarName,
        sClassName,
        $this,
        $us;
    for (i = 0; i < needVar.length; i++) {
        $this = $(needVar[i]);
        classes = $this.attr("class").split(" ");
        for (ii = 0; ii < classes.length; ii++) {
            sClassName = $.trim(classes[ii]);
            if (sClassName.length > 0) {
                $us = $("." + sClassName);
                sVarName = "$" + sClassName.replace(/\-/g, "_");
                if (typeof window[sVarName] === "undefined") {
                    window[sVarName] = $us;
                    definedVars += " " + sVarName;
                }
            }
        }
    }
    return definedVars;
})();

// INCLUDE FROM HERE - csvToHtml

/**
 * Converts a CSV string to object with rows and header
 * @param   {String} sCSV    A CSV string
 * @param   {Object} options {
 *                         seperator: string "The CSV col selerator" [";"]
 *                         hasHeader: bool [true]
 *                         headerPrefix: string ["COL]  }
 * @returns {Object} {
 * headers: array of headers,
 * rows: array of rows (including header)
 *  }
 */
function convertToArray(sCSV, options) {
    var result = {
        headers: null,
        rows: null
    },
        firstRowAt = 0,
        tds,
        first,
        cols;
    options = options || {};
    options = $.extend(options, {
        seperator: ";",
        hasHeader: true,
        headerPrefix: "COL"
    });

    // Create header
    tds = sCSV.split("\x0a");
    first = tds[0].split(options.seperator);
    if (options.hasHeader) {
        result.headers = first;
        result.headers = result.headers.map(function (header) {
            return header.replace(/\//g, "_");
        });
        firstRowAt = 1;
    } else {
        result.headers = first.map(function (header, i) {
            return options.headerPrefix + i;
        });
    }

    // Create rows
    cols = result.headers.length;
    result.rows = tds.map(function (row, i) {
        return row.split(options.seperator);
    });
    return result;
}

function tag(element, value) {
    return "<" + element + ">" + value + "</" + element + ">";
}

function toHTML(arr) {
    var sTable = "<table class=\"ts definition compact striped celled table color first line\">";
    arr.map(function (row, i) {
        var sRow = "";
        row.map(function (cell, ii) {
            var tagname = "td";
            sRow += tag(tagname, cell);
        });
        sTable += tag("tr", sRow) + ((i === 0) ? "" : "");
    });
    return sTable + "</table>";
}

function csvToHtml($source, $output, options) {
    var sCSV = $source,
        result = convertToArray(sCSV, options || {});
    $output.html(toHTML(result.rows));
}
// INCLUDE TO HERE - csvToHtml

// This is how you can use the code
// csvToHtml($source, $output);
