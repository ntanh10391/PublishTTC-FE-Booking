﻿/*
* TelerikReporting v12.0.18.227 (https://www.telerik.com/products/reporting.aspx)
* Copyright 2018 Telerik AD. All rights reserved.
*
* Telerik Reporting commercial licenses may be obtained at
* https://www.telerik.com/purchase/license-agreement/reporting.aspx
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
(function(trv, $, window, document, undefined) {
    "use strict";
    var stringFormatRegExp = /{(\w+?)}/g;
    var specialKeys = {
        DELETE: 46,
        BACKSPACE: 8,
        TAB: 9,
        ESC: 27,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        END: 35,
        HOME: 36
    };
    function getCheckSpecialKeyFn() {
        var userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.indexOf("firefox") > -1) {
            var specialKeysArray = Object.keys(specialKeys);
            var specialKeysLength = specialKeysArray.length;
            return function(keyCode) {
                for (var i = 0; i < specialKeysLength; i++) {
                    if (specialKeys[specialKeysArray[i]] == keyCode) {
                        return true;
                    }
                }
            };
        }
        return function(keyCode) {
            return false;
        };
    }
    var utils = trv.utils = {
        trim: function(s, charlist) {
            return this.rtrim(this.ltrim(s, charlist), charlist);
        },
        replaceAll: function(str, find, replace) {
            return str.replace(new RegExp(find, "g"), replace);
        },
        ltrim: function(s, charlist) {
            if (charlist === undefined) {
                charlist = "s";
            }
            return s.replace(new RegExp("^[" + charlist + "]+"), "");
        },
        rtrim: function(s, charlist) {
            if (charlist === undefined) {
                charlist = "s";
            }
            return s.replace(new RegExp("[" + charlist + "]+$"), "");
        },
        stringFormat: function(template, data) {
            var isArray = Array.isArray(data);
            return template.replace(stringFormatRegExp, function($0, $1) {
                return data[isArray ? parseInt($1) : $1];
            });
        },
        escapeHtml: function(str) {
            return $("<div>").text(str).html();
        },
        isSpecialKey: getCheckSpecialKeyFn(),
        tryParseInt: function(value) {
            if (/^(\-|\+)?([0-9]+)$/.test(value)) {
                return Number(value);
            }
            return NaN;
        },
        tryParseFloat: function(value) {
            if (/^(\-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value)) {
                return Number(value);
            }
            return NaN;
        },
        parseToLocalDate: function(date) {
            if (date instanceof Date) return date;
            var isUtc = /Z|[\+\-]\d\d:?\d\d/i.test(date);
            if (!isUtc) {
                date += "Z";
            }
            return new Date(date);
        },
        adjustTimezone: function(date) {
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
        },
        unadjustTimezone: function(date) {
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        areEqual: function(v1, v2) {
            if (v1 instanceof Date && v2 instanceof Date) {
                if (v1.getTime() !== v2.getTime()) {
                    return false;
                }
            } else if (v1 !== v2) {
                return false;
            }
            return true;
        },
        reportSourcesAreEqual: function(rs1, rs2) {
            if (rs1 && rs2 && rs1.report === rs2.report) {
                var params1 = [], params2 = [];
                if (rs1.parameters) params1 = Object.getOwnPropertyNames(rs1.parameters);
                if (rs2.parameters) params2 = Object.getOwnPropertyNames(rs2.parameters);
                if (params1.length === params2.length) {
                    for (var i = params1.length - 1; i >= 0; i--) {
                        var p = params1[i];
                        var v1 = rs1.parameters[p];
                        var v2 = rs2.parameters[p];
                        if (Array.isArray(v1)) {
                            if (!Array.isArray(v2)) return false;
                            if (!utils.areEqualArrays(v1, v2)) {
                                return false;
                            }
                        } else if (!utils.areEqual(v1, v2)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        },
        areEqualArrays: function(array1, array2) {
            if (array1 == null) {
                if (array2 != null) {
                    return false;
                } else {
                    return true;
                }
            } else {
                if (array2 == null) {
                    return false;
                }
            }
            if (array1.length !== array2.length) {
                return false;
            }
            for (var j = array1.length - 1; j >= 0; j--) {
                if (!utils.areEqual(array1[j], array2[j])) {
                    return false;
                }
            }
            return true;
        },
        isSvgSupported: function isSvgSupported() {
            var matches = /Version\/(\d+.\d+.\d+) Safari/.exec(navigator.userAgent);
            if (matches && matches.length > 1) {
                var version = parseFloat(matches[1]);
                return version >= 6;
            }
            return true;
        },
        isInvalidClientException: function(xhr) {
            if (!xhr) return false;
            if (!xhr.responseText) return false;
            var json = utils.parseJSON(xhr.responseText);
            if (!json) return false;
            if (!json.exceptionType) return false;
            return json.exceptionType === "Telerik.Reporting.Services.Engine.InvalidClientException";
        },
        parseJSON: function(json) {
            try {
                return JSON.parse(json, function(key, value) {
                    if (key && value) {
                        var firstChar = key.charAt(0);
                        if (firstChar == firstChar.toUpperCase()) {
                            var newPropertyName = firstChar.toLowerCase() + key.slice(1);
                            this[newPropertyName] = value;
                        }
                    }
                    return value;
                });
            } catch (e) {
                return null;
            }
        },
        extend: function() {
            var src, copy, name, options, target, i = 0, length = arguments.length;
            target = length > 1 ? arguments[i++] || {} : {};
            for (;i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        },
        each: function(obj, callback) {
            var length, i = 0;
            if (utils.isArray(obj)) {
                length = obj.length;
                for (;i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }
            return obj;
        },
        selector: function() {
            return document.querySelectorAll(arguments[0]);
        },
        isArray: function(obj) {
            if (Array.isArray(obj)) return true;
            var length = !!obj && "length" in obj && obj.length;
            if (typeof length === "number") {
                return true;
            }
            return false;
        },
        loadScript: function(src, done) {
            var js = document.createElement("script");
            js.src = src;
            js.onload = function() {
                done();
            };
            js.onerror = function() {
                done(new Error("Failed to load script " + src));
            };
            document.head.appendChild(js);
        },
        filterUniqueLastOccurance: function(array) {
            function onlyLastUnique(value, index, self) {
                return self.lastIndexOf(value) === index;
            }
            return array.filter(onlyLastUnique);
        },
        logError: function(error) {
            var console = window.console;
            if (console && console.error) {
                console.error(error);
            }
        }
    };
    trv.domUtils = function() {
        function toPixels(value) {
            return parseInt(value, 10) || 0;
        }
        return {
            getMargins: function(dom) {
                var $target = $(dom);
                return {
                    left: toPixels($target.css("marginLeft")),
                    right: toPixels($target.css("marginRight")),
                    top: toPixels($target.css("marginTop")),
                    bottom: toPixels($target.css("marginBottom"))
                };
            },
            getPadding: function(dom) {
                var $target = $(dom);
                return {
                    left: toPixels($target.css("paddingLeft")),
                    right: toPixels($target.css("paddingRight")),
                    top: toPixels($target.css("paddingTop")),
                    bottom: toPixels($target.css("paddingBottom"))
                };
            },
            getBorderWidth: function(dom) {
                var $target = $(dom);
                return {
                    left: toPixels($target.css("borderLeftWidth")),
                    right: toPixels($target.css("borderRightWidth")),
                    top: toPixels($target.css("borderTopWidth")),
                    bottom: toPixels($target.css("borderBottomWidth"))
                };
            },
            scale: function(dom, scaleX, scaleY, originX, originY) {
                scaleX = scaleX || 1;
                scaleY = scaleY || 1;
                originX = originX || 0;
                originY = originY || 0;
                var scale = utils.stringFormat("scale({0}, {1})", [ scaleX, scaleY ]), origin = utils.stringFormat("{0} {1}", [ originX, originY ]);
                $(dom).css("transform", scale).css("-moz-transform", scale).css("-ms-transform", scale).css("-webkit-transform", scale).css("-o-transform", scale).css("-moz-transform-origin", origin).css("-webkit-transform-origin", origin).css("-o-transform-origin", origin).css("-ms-transform-origin", origin).css("transform-origin", origin);
            }
        };
    }();
})(window.telerikReportViewer = window.telerikReportViewer || {}, window.jQuery, window, document);

(function(trv) {
    "use strict";
    var sr = {
        controllerNotInitialized: "Controller is not initialized.",
        noReportInstance: "No report instance.",
        missingTemplate: "!obsolete resource!",
        noReport: "No report.",
        noReportDocument: "No report document.",
        missingOrInvalidParameter: "Missing or invalid parameter value. Please input valid data for all parameters.",
        invalidParameter: "Please input a valid value.",
        invalidDateTimeValue: "Please input a valid date.",
        parameterIsEmpty: "Parameter value cannot be empty.",
        cannotValidateType: "Cannot validate parameter of type {type}.",
        loadingFormats: "Loading...",
        loadingReport: "Loading report...",
        preparingDownload: "Preparing document to download. Please wait...",
        preparingPrint: "Preparing document to print. Please wait...",
        errorLoadingTemplates: "Error loading the report viewer's templates. (Template = {0}).",
        loadingReportPagesInProgress: "{0} pages loaded so far ...",
        loadedReportPagesComplete: "Done. Total {0} pages loaded.",
        noPageToDisplay: "No page to display.",
        errorDeletingReportInstance: "Error deleting report instance: {0}.",
        errorRegisteringViewer: "Error registering the viewer with the service.",
        noServiceClient: "No serviceClient has been specified for this controller.",
        errorRegisteringClientInstance: "Error registering client instance.",
        errorCreatingReportInstance: "Error creating report instance (Report = {0}).",
        errorCreatingReportDocument: "Error creating report document (Report = {0}; Format = {1}).",
        unableToGetReportParameters: "Unable to get report parameters.",
        errorObtainingAuthenticationToken: "Error obtaining authentication token.",
        clientExpired: "Click 'Refresh' to restore client session.",
        ariaLabelPageNumberSelector: "Page number selector. Showing page {0} of {1}.",
        ariaLabelPageNumberEditor: "Page number editor.",
        ariaLabelExpandable: "Expandable",
        ariaLabelParameter: "parameter",
        ariaLabelErrorMessage: "Error message",
        ariaLabelParameterInfo: "Contains {0} options.",
        ariaLabelMultiSelect: "Multiselect",
        ariaLabelMultiValue: "Multivalue",
        ariaLabelSingleValue: "Single value",
        ariaLabelParameterDateTime: "Datetime",
        ariaLabelParameterString: "String",
        ariaLabelParameterNumerical: "Numerical",
        ariaLabelParameterBoolean: "Boolean"
    };
    trv.sr = trv.utils.extend(sr, trv.sr);
})(window.telerikReportViewer = window.telerikReportViewer || {});

(function(trv, window, document, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    function IEHelper() {
        function getPdfPlugin() {
            var classIds = [ "AcroPDF.PDF.1", "PDF.PdfCtrl.6", "PDF.PdfCtrl.5" ];
            var plugin = null;
            utils.each(classIds, function(index, classId) {
                try {
                    plugin = new ActiveXObject(classId);
                    if (plugin) {
                        return false;
                    }
                } catch (ex) {}
            });
            return plugin;
        }
        return {
            hasPdfPlugin: function() {
                return getPdfPlugin() !== null;
            }
        };
    }
    function FirefoxHelper() {
        function hasPdfPlugin() {
            var matches = /Firefox[\/\s](\d+\.\d+)/.exec(navigator.userAgent);
            if (null !== matches && matches.length > 1) {
                var version = parseFloat(matches[1]);
                if (version >= 19) {
                    return false;
                }
            }
            var pdfPlugins = navigator.mimeTypes["application/pdf"];
            var pdfPlugin = pdfPlugins !== null ? pdfPlugins.enabledPlugin : null;
            if (pdfPlugin) {
                var description = pdfPlugin.description;
                return description.indexOf("Adobe") !== -1 && (description.indexOf("Version") === -1 || parseFloat(description.split("Version")[1]) >= 6);
            }
            return false;
        }
        return {
            hasPdfPlugin: function() {
                return hasPdfPlugin();
            }
        };
    }
    function ChromeHelper() {
        function hasPdfPlugin() {
            var navPlugins = navigator.plugins;
            var found = false;
            utils.each(navPlugins, function(key, value) {
                if (navPlugins[key].name === "Chrome PDF Viewer" || navPlugins[key].name === "Adobe Acrobat") {
                    found = true;
                    return false;
                }
            });
            return found;
        }
        return {
            hasPdfPlugin: function() {
                return hasPdfPlugin();
            }
        };
    }
    function SafariHelper() {
        function hasPdfPlugin() {
            var navPlugins = navigator.plugins;
            var found = false;
            utils.each(navPlugins, function(key, value) {
                if (navPlugins[key].name === "WebKit built-in PDF" || navPlugins[key].name === "Adobe Acrobat") {
                    found = true;
                    return false;
                }
            });
            return found;
        }
        return {
            hasPdfPlugin: function() {
                return hasPdfPlugin();
            }
        };
    }
    function OtherBrowserHelper() {
        return {
            hasPdfPlugin: function() {
                return false;
            }
        };
    }
    function selectBrowserHelper() {
        if (window.navigator) {
            var userAgent = window.navigator.userAgent.toLowerCase();
            if (userAgent.indexOf("msie") > -1 || userAgent.indexOf("mozilla") > -1 && userAgent.indexOf("trident") > -1) return IEHelper(); else if (userAgent.indexOf("firefox") > -1) return FirefoxHelper(); else if (userAgent.indexOf("chrome") > -1) return ChromeHelper(); else if (userAgent.indexOf("safari") > -1) return SafariHelper(); else return OtherBrowserHelper();
        }
        return null;
    }
    var helper = selectBrowserHelper();
    var hasPdfPlugin = helper ? helper.hasPdfPlugin() : false;
    trv.printManager = function() {
        var iframe;
        function printDesktop(src) {
            if (!iframe) {
                iframe = document.createElement("IFRAME");
                iframe.style.display = "none";
            }
            iframe.src = src;
            document.body.appendChild(iframe);
        }
        function printMobile(src) {
            window.open(src, "_self");
        }
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var printFunc = isMobile ? printMobile : printDesktop;
        return {
            print: function(src) {
                printFunc(src);
            },
            getDirectPrintState: function() {
                return hasPdfPlugin;
            }
        };
    }();
})(window.telerikReportViewer = window.telerikReportViewer || {}, window, document);

(function(trv, $, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    var JSON_MIME_TYPE = "application/json", JSON_CONTENT_TYPE = "application/json; charset=UTF-8", URLENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded; charset=UTF-8", HTTP_GET = "GET", HTTP_POST = "POST", HTTP_PUT = "PUT", HTTP_DELETE = "DELETE";
    var defaultOptions = {};
    trv.ServiceClient = function(options) {
        options = utils.extend({}, defaultOptions, options);
        var baseUrl = utils.rtrim(options.serviceUrl || options.baseUrl, "\\/"), loginPromise;
        var _ajax = $ajax;
        function validateClientID(clientID) {
            if (!clientID) throw "Invalid cliendID";
        }
        function urlFromTemplate(template, args) {
            args = utils.extend({}, {
                baseUrl: baseUrl
            }, args);
            return utils.stringFormat(template, args);
        }
        function getHeaderSettings(authorizationToken) {
            return authorizationToken ? {
                headers: {
                    Authorization: "Bearer " + authorizationToken
                }
            } : {};
        }
        function login() {
            if (!loginPromise) {
                var loginInfo = options.loginInfo;
                if (loginInfo && loginInfo.url && (loginInfo.username || loginInfo.password)) {
                    loginPromise = _ajax({
                        url: loginInfo.url,
                        type: HTTP_POST,
                        data: {
                            grant_type: "password",
                            username: loginInfo.username,
                            password: loginInfo.password
                        },
                        dataType: "json",
                        contentType: URLENCODED_CONTENT_TYPE
                    }).then(function(result) {
                        return result.access_token;
                    });
                } else {
                    loginPromise = Promise.resolve();
                }
            }
            return loginPromise;
        }
        function $ajax(ajaxSettings) {
            return new Promise(function(resolve, reject) {
                $.ajax(ajaxSettings).done(function(data) {
                    return resolve(data);
                }).fail(function(xhr, status, error) {
                    reject(toXhrErrorData(xhr, status, error));
                });
            });
        }
        function toXhrErrorData(xhr, status, error) {
            return {
                xhr: xhr,
                status: status,
                error: error
            };
        }
        return {
            _urlFromTemplate: urlFromTemplate,
            registerClient: function(settings) {
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_POST,
                        url: urlFromTemplate("{baseUrl}/clients"),
                        dataType: "json",
                        data: JSON.stringify({
                            timeStamp: Date.now()
                        })
                    });
                    return _ajax(ajaxSettings);
                }).then(function(clientData) {
                    return clientData.clientId;
                });
            },
            unregisterClient: function(clientID, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_DELETE,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}", {
                            clientID: clientID
                        })
                    });
                    return _ajax(ajaxSettings);
                });
            },
            getParameters: function(clientID, report, parameterValues, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_POST,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/parameters", {
                            clientID: clientID
                        }),
                        contentType: JSON_CONTENT_TYPE,
                        dataType: "json",
                        data: JSON.stringify({
                            report: report,
                            parameterValues: parameterValues
                        })
                    });
                    return _ajax(ajaxSettings);
                });
            },
            createReportInstance: function(clientID, report, parameterValues, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_POST,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances", {
                            clientID: clientID
                        }),
                        contentType: JSON_CONTENT_TYPE,
                        dataType: "json",
                        data: JSON.stringify({
                            report: report,
                            parameterValues: parameterValues
                        })
                    });
                    return _ajax(ajaxSettings);
                }).then(function(instanceData) {
                    return instanceData.instanceId;
                });
            },
            deleteReportInstance: function(clientID, instanceID, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_DELETE,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}", {
                            clientID: clientID,
                            instanceID: instanceID
                        })
                    });
                    return _ajax(ajaxSettings);
                });
            },
            createReportDocument: function(clientID, instanceID, format, deviceInfo, useCache, baseDocumentID, actionID, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    deviceInfo = deviceInfo || {};
                    deviceInfo["BasePath"] = baseUrl;
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_POST,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}/documents", {
                            clientID: clientID,
                            instanceID: instanceID
                        }),
                        contentType: JSON_CONTENT_TYPE,
                        dataType: "json",
                        data: JSON.stringify({
                            format: format,
                            deviceInfo: deviceInfo,
                            useCache: useCache,
                            baseDocumentID: baseDocumentID,
                            actionID: actionID
                        })
                    });
                    return _ajax(ajaxSettings);
                }).then(function(documentData) {
                    return documentData.documentId;
                });
            },
            deleteReportDocument: function(clientID, instanceID, documentID, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_DELETE,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}/documents/{documentID}", {
                            clientID: clientID,
                            instanceID: instanceID,
                            documentID: documentID
                        })
                    });
                    return _ajax(ajaxSettings);
                });
            },
            getDocumentInfo: function(clientID, instanceID, documentID, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_GET,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}/documents/{documentID}/info", {
                            clientID: clientID,
                            instanceID: instanceID,
                            documentID: documentID
                        }),
                        dataType: "json"
                    });
                    return _ajax(ajaxSettings);
                });
            },
            getPage: function(clientID, instanceID, documentID, pageNumber, settings) {
                validateClientID(clientID);
                return login().then(function(authorizationToken) {
                    var ajaxSettings = utils.extend(getHeaderSettings(authorizationToken), settings, {
                        type: HTTP_GET,
                        url: urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}/documents/{documentID}/pages/{pageNumber}", {
                            clientID: clientID,
                            instanceID: instanceID,
                            documentID: documentID,
                            pageNumber: pageNumber
                        }),
                        dataType: "json"
                    });
                    return _ajax(ajaxSettings);
                });
            },
            get: function(url) {
                var ajaxSettings = {
                    type: HTTP_GET,
                    url: url
                };
                return _ajax(ajaxSettings);
            },
            formatDocumentUrl: function(clientID, instanceID, documentID, queryString) {
                var url = urlFromTemplate("{baseUrl}/clients/{clientID}/instances/{instanceID}/documents/{documentID}", {
                    clientID: clientID,
                    instanceID: instanceID,
                    documentID: documentID
                });
                if (queryString) {
                    url += "?" + queryString;
                }
                return url;
            },
            getDocumentFormats: function(settings) {
                var ajaxSettings = utils.extend({}, settings, {
                    type: HTTP_GET,
                    url: urlFromTemplate("{baseUrl}/formats"),
                    dataType: "json"
                });
                return _ajax(ajaxSettings);
            },
            setAccessToken: function(accessToken) {
                loginPromise = Promise.resolve(accessToken);
            },
            login: login
        };
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery);

(function(trv, window, document, undefined) {
    "use strict";
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    var printManager = trv.printManager;
    if (!printManager) {
        throw "Missing telerikReportViewer.printManager";
    }
    trv.ViewModes = {
        INTERACTIVE: "INTERACTIVE",
        PRINT_PREVIEW: "PRINT_PREVIEW"
    };
    trv.PrintModes = {
        AUTO_SELECT: "AUTO_SELECT",
        FORCE_PDF_PLUGIN: "FORCE_PDF_PLUGIN",
        FORCE_PDF_FILE: "FORCE_PDF_FILE"
    };
    var defaultOptions = {
        pagePollIntervalMs: 500,
        documentInfoPollIntervalMs: 2e3
    };
    function ReportViewerController(options) {
        var controller = {}, clientId, reportInstanceId, reportDocumentId, registerClientPromise, registerInstancePromise, documentFormatsPromise, report, parameterValues, currentPageNumber, pageCount, viewMode = trv.ViewModes.INTERACTIVE, loader, printMode = trv.PrintModes.AUTO_SELECT, bookmarkNodes, clientHasExpired = false, parameterValidators = trv.parameterValidators, events = new Events();
        clearReportState();
        options = utils.extend({}, defaultOptions, options);
        if (options.settings.printMode) {
            printMode = options.settings.printMode();
        }
        var client = options.serviceClient;
        if (!client) {
            throw sr.noServiceClient;
        }
        clientId = options.settings.clientId();
        function setClientId(id) {
            clientId = id;
            options.settings.clientId(clientId);
        }
        function clearClientId() {
            clientId = null;
            registerClientPromise = null;
            options.settings.clientId(null);
        }
        function getFormat() {
            if (viewMode === trv.ViewModes.PRINT_PREVIEW) {
                return "HTML5";
            }
            return "HTML5Interactive";
        }
        function handleRequestError(xhrData, localizedMessage) {
            if (utils.isInvalidClientException(xhrData.xhr)) {
                onClientExpired();
            }
            raiseError(formatXhrError(xhrData.xhr, xhrData.status, xhrData.error, localizedMessage));
            throw "Error shown. Throwing promises chain stop error.";
        }
        function initializeClientAsync() {
            if (!registerClientPromise) {
                registerClientPromise = client.registerClient().catch(function(xhrErrorData) {
                    handleRequestError(xhrErrorData, sr.errorRegisteringViewer);
                }).then(function(clientId) {
                    setClientId(clientId);
                }).catch(clearClientId);
            }
            return registerClientPromise;
        }
        function registerInstanceAsync() {
            if (!registerInstancePromise) {
                registerInstancePromise = createReportInstanceAsync(report, parameterValues).then(function(instanceId) {
                    reportInstanceId = instanceId;
                });
                registerInstancePromise.catch(function(errorMessage) {
                    registerInstancePromise = null;
                });
            }
            return registerInstancePromise;
        }
        function clearReportState() {
            reportDocumentId = null;
            reportInstanceId = null;
            registerInstancePromise = null;
            currentPageNumber = pageCount = 0;
        }
        function formatError(args) {
            var len = args.length;
            if (len == 1) {
                return args[0];
            }
            if (len > 1) {
                return utils.stringFormat(args[0], Array.prototype.slice.call(args, 1));
            }
            return "";
        }
        function raiseError() {
            var error = formatError(arguments);
            controller.error(error);
        }
        function createReportInstanceAsync(report, parameterValues) {
            throwIfNotInitialized();
            return client.createReportInstance(clientId, report, parameterValues).catch(function(xhrErrorData) {
                handleRequestError(xhrErrorData, utils.stringFormat(sr.errorCreatingReportInstance, [ utils.escapeHtml(report) ]));
            });
        }
        function registerDocumentAsync(format, deviceInfo, useCache, baseDocumentId, actionId) {
            throwIfNotInitialized();
            throwIfNoReportInstance();
            return client.createReportDocument(clientId, reportInstanceId, format, deviceInfo, useCache, baseDocumentId, actionId).catch(function(xhrErrorData) {
                handleRequestError(xhrErrorData, utils.stringFormat(sr.errorCreatingReportDocument, [ utils.escapeHtml(report), utils.escapeHtml(format) ]));
            });
        }
        function getDocumentInfoRecursive(clientId, instanceId, documentId, options) {
            if (instanceId == reportInstanceId) {
                return client.getDocumentInfo(clientId, instanceId, documentId).catch(handleRequestError).then(function(info) {
                    if (info && info.documentReady) {
                        return info;
                    } else {
                        info["promise"] = new Promise(function(resolve, reject) {
                            window.setTimeout(resolve, options.documentInfoPollIntervalMs);
                        }).then(function() {
                            return getDocumentInfoRecursive(clientId, instanceId, documentId, options);
                        });
                        return info;
                    }
                });
            } else {
                return Promise.reject();
            }
        }
        function ReportLoader(reportHost, useCache, baseDocumentId, actionId) {
            var loaderOptions = {};
            function onReportDocumentRegistered(id) {
                if (reportHost) {
                    reportDocumentId = id;
                    onBeginLoadReport();
                    getReportDocumentReady();
                }
            }
            function onBeforeLoadReport() {
                loaderOptions.documentInfoPollIntervalMs = options.pagePollIntervalMs;
                if (reportHost) {
                    reportHost.beforeLoadReport();
                }
            }
            function onBeginLoadReport() {
                if (reportHost) {
                    reportHost.beginLoadReport();
                }
            }
            function onReportLoadComplete(info) {
                if (reportHost) {
                    reportHost.onReportLoadComplete(info);
                }
            }
            function onReportLoadProgress(info) {
                if (reportHost) {
                    pageCount = info.pageCount;
                    reportHost.reportLoadProgress(info);
                }
            }
            function getReportDocumentReady() {
                throwIfNotInitialized();
                throwIfNoReportInstance();
                throwIfNoReportDocument();
                progressReportDocumentReady(getDocumentInfoRecursive(clientId, reportInstanceId, reportDocumentId, loaderOptions));
            }
            function progressReportDocumentReady(getDocumentReadyPromise) {
                getDocumentReadyPromise.then(function(info) {
                    if (info.documentReady) {
                        onReportLoadComplete(info);
                    } else {
                        onReportLoadProgress(info);
                        progressReportDocumentReady(info.promise);
                    }
                });
            }
            function onError() {
                if (reportHost) {
                    reportHost.raiseError.apply(this, arguments);
                }
            }
            function getPageAsync(pageNo) {
                return new Promise(function(resolve, reject) {
                    var fn = function() {
                        client.getPage(clientId, reportInstanceId, reportDocumentId, pageNo).catch(handleRequestError).then(function(pageInfo) {
                            if (pageInfo.pageReady) {
                                resolve(pageInfo);
                            } else {
                                window.setTimeout(fn, options.pagePollIntervalMs);
                            }
                        });
                    };
                    fn();
                });
            }
            function onBeginLoadPage(pageNo) {
                if (reportHost) {
                    reportHost.beginLoadPage(pageNo);
                }
            }
            var loadPromise;
            function loadAsync() {
                if (!loadPromise) {
                    onBeforeLoadReport();
                    var format = getFormat();
                    var deviceInfo = createPreviewDeviceInfo();
                    loadPromise = initializeClientAsync().then(registerInstanceAsync).then(function() {
                        return registerDocumentAsync(format, deviceInfo, useCache, baseDocumentId, actionId);
                    }).then(onReportDocumentRegistered);
                }
                return loadPromise;
            }
            function createPreviewDeviceInfo() {
                var deviceInfo = createDeviceInfo();
                deviceInfo.ContentOnly = true;
                deviceInfo.UseSVG = utils.isSvgSupported();
                return deviceInfo;
            }
            return {
                beginLoad: function() {
                    loadAsync();
                },
                beginGetPage: function(pageNo) {
                    throwIfNotInitialized();
                    loadAsync().then(function() {
                        onBeginLoadPage(pageNo);
                        return getPageAsync(pageNo);
                    }).then(function(pageInfo) {
                        loaderOptions.documentInfoPollIntervalMs = options.documentInfoPollIntervalMs;
                        if (reportHost) {
                            reportHost.pageReady(pageInfo);
                        }
                    });
                },
                dispose: function() {
                    reportHost = null;
                }
            };
        }
        function createDeviceInfo() {
            var enableAcc = options.settings.enableAccessibility();
            var deviceInfo = {
                enableAccessibility: enableAcc
            };
            if (enableAcc) {
                deviceInfo.contentTabIndex = options.settings.contentTabIndex;
            }
            return deviceInfo;
        }
        function resolveErrorByExceptionType(exceptionType) {
            switch (exceptionType) {
              case "Telerik.Reporting.Services.Engine.InvalidParameterException":
                return sr.missingOrInvalidParameter;

              default:
                return "";
            }
        }
        function formatXhrError(xhr, status, error, localizedMessage) {
            var parsedXhr = utils.parseJSON(xhr.responseText);
            var result = "";
            if (parsedXhr) {
                var errorMessage = resolveErrorByExceptionType(parsedXhr.exceptionType || parsedXhr.error);
                if (errorMessage) {
                    return errorMessage;
                }
                result = parsedXhr.message;
                var exceptionMessage = parsedXhr.exceptionMessage || parsedXhr.error_description;
                if (exceptionMessage) {
                    if (result) {
                        result += "<br/>" + exceptionMessage;
                    } else {
                        result = exceptionMessage;
                    }
                }
            } else {
                result = xhr.responseText;
            }
            if (localizedMessage || error) {
                if (result) {
                    result = "<br/>" + result;
                }
                result = (localizedMessage ? localizedMessage : error) + result;
            }
            if (utils.isInvalidClientException(xhr)) {
                result += "<br />" + sr.clientExpired;
            }
            return result;
        }
        function getReportPage(pageNo) {
            if (loader) {
                loader.beginGetPage(pageNo);
            }
        }
        function loadReportAsync(ignoreCache, baseDocumentId, actionId) {
            if (!report) {
                raiseError(sr.noReport);
                return;
            }
            if (loader) {
                loader.dispose();
                loader = null;
            }
            clearReportState();
            loader = new ReportLoader(controller, !ignoreCache, baseDocumentId, actionId);
            loader.beginLoad();
        }
        function onExportStarted() {
            controller.exportStarted();
        }
        function onExportDocumentReady(args) {
            controller.exportReady(args);
        }
        function onPrintStarted() {
            controller.printStarted();
        }
        function onPrintDocumentReady(args) {
            controller.printReady(args);
        }
        function printReport() {
            throwIfNoReport();
            onPrintStarted();
            var canUsePlugin = getCanUsePlugin();
            var contentDisposition = canUsePlugin ? "inline" : "attachment";
            var queryString = "response-content-disposition=" + contentDisposition;
            exportAsync("PDF", {
                ImmediatePrint: true
            }).then(function(info) {
                var url = client.formatDocumentUrl(info.clientId, info.instanceId, info.documentId, queryString);
                onPrintDocumentReady({
                    url: url
                });
                printManager.print(url);
            });
        }
        function getCanUsePlugin() {
            switch (printMode) {
              case trv.PrintModes.FORCE_PDF_FILE:
              case false:
                return false;

              case trv.PrintModes.FORCE_PDF_PLUGIN:
              case true:
                return true;

              default:
                return printManager.getDirectPrintState();
            }
        }
        function exportReport(format, deviceInfo) {
            throwIfNoReport();
            onExportStarted();
            if (!deviceInfo) {
                deviceInfo = createDeviceInfo();
            }
            var queryString = "response-content-disposition=attachment";
            exportAsync(format, deviceInfo).then(function(info) {
                var url = client.formatDocumentUrl(info.clientId, info.instanceId, info.documentId, queryString);
                onExportDocumentReady({
                    url: url
                });
                window.open(url, "_self");
            });
        }
        function exportAsync(format, deviceInfo) {
            throwIfNoReport();
            return initializeClientAsync().then(registerInstanceAsync).then(function() {
                return registerDocumentAsync(format, deviceInfo, true, reportDocumentId);
            }).then(function(documentId) {
                return waitReportDocumentReady(clientId, reportInstanceId, documentId, options);
            });
        }
        function waitReportDocumentReady(clientId, reportInstanceId, documentId, options) {
            return new Promise(function(resolve, reject) {
                var fn = function(promise) {
                    promise.then(function(info) {
                        if (info.documentReady) {
                            resolve({
                                clientId: clientId,
                                instanceId: reportInstanceId,
                                documentId: documentId
                            });
                        } else {
                            fn(info.promise);
                        }
                    });
                };
                fn(getDocumentInfoRecursive(clientId, reportInstanceId, documentId, options));
            });
        }
        function execServerAction(actionId) {
            throwIfNoReport();
            throwIfNoReportInstance();
            throwIfNoReportDocument();
            onServerActionStarted();
            controller.refreshReportCore(false, reportDocumentId, actionId);
        }
        function throwIfNotInitialized() {
            if (!clientId) {
                throw sr.controllerNotInitialized;
            }
        }
        function throwIfNoReportInstance() {
            if (!reportInstanceId) {
                throw sr.noReportInstance;
            }
        }
        function throwIfNoReportDocument() {
            if (!reportDocumentId) {
                throw sr.noReportDocument;
            }
        }
        function throwIfNoReport() {
            if (!report) {
                throw sr.noReport;
            }
        }
        function getEventHandlerFromArguments(args) {
            var arg0;
            if (args && args.length) {
                arg0 = args[0];
            }
            if (typeof arg0 == "function") {
                return arg0;
            }
            return null;
        }
        function eventFactory(event, args) {
            var h = getEventHandlerFromArguments(args);
            if (h) {
                events.on(event, h);
            } else {
                events.trigger(event, args);
            }
            return controller;
        }
        function Events() {
            var events = {};
            function resolveEvent(eventName) {
                var event = events[eventName];
                if (!event) {
                    events[eventName] = event = new Event(eventName);
                }
                return event;
            }
            return {
                on: function(eventName, handler) {
                    resolveEvent(eventName).on(handler);
                },
                trigger: function(eventName, args) {
                    resolveEvent(eventName).trigger(args);
                }
            };
            function Event(eventName) {
                var callbacks = [];
                var event = {
                    on: function(callback) {
                        callbacks.push(callback);
                    },
                    trigger: function(args) {
                        var a = [].slice.call(args);
                        a.unshift(eventName);
                        for (var i = 0; i < callbacks.length; i++) {
                            callbacks[i].apply(controller, a);
                        }
                    }
                };
                return event;
            }
        }
        function loadParametersAsync(report, paramValues) {
            return initializeClientAsync().then(function() {
                return client.getParameters(clientId, report, paramValues || parameterValues || {}).catch(function(xhrErrorData) {
                    handleRequestError(xhrErrorData, sr.unableToGetReportParameters);
                });
            });
        }
        function getDocumentFormatsAsync() {
            if (!documentFormatsPromise) {
                documentFormatsPromise = client.getDocumentFormats().catch(handleRequestError);
            }
            return documentFormatsPromise;
        }
        function getPageForBookmark(nodes, id) {
            if (nodes) {
                for (var i = 0, len = nodes.length; i < len; i++) {
                    var node = nodes[i];
                    if (node.id == id) {
                        return node.page;
                    } else {
                        var page = getPageForBookmark(node.items, id);
                        if (page) {
                            return page;
                        }
                    }
                }
            }
            return null;
        }
        function fixDataContractJsonSerializer(arr) {
            var dict = {};
            if (Array.isArray(arr)) {
                arr.forEach(function(pair) {
                    dict[pair.Key] = pair.Value;
                });
            }
            return dict;
        }
        function changeReportSource(rs) {
            if (options.settings.reportSource) {
                options.settings.reportSource(rs);
            }
            controller.reportSourceChanged();
        }
        function changePageNumber(pageNr) {
            options.settings.pageNumber(pageNr);
            controller.currentPageChanged();
        }
        var actionHandlers = {
            sorting: function(action) {
                execServerAction(action.Id);
            },
            toggleVisibility: function(action) {
                execServerAction(action.Id);
            },
            navigateToReport: function(action) {
                var args = action.Value;
                onServerActionStarted();
                controller.reportSource({
                    report: args.Report,
                    parameters: fixDataContractJsonSerializer(args.ParameterValues)
                });
                controller.refreshReport(false);
            },
            navigateToUrl: function(action) {
                var args = action.Value;
                window.open(args.Url, args.Target);
            },
            navigateToBookmark: function(action) {
                var id = action.Value, page = getPageForBookmark(bookmarkNodes, id);
                controller.navigateToPage(page, id);
            },
            customAction: function(action) {}
        };
        function onInteractiveActionExecuting(cancelArgs) {
            controller.interactiveActionExecuting(cancelArgs);
        }
        function executeReportAction(cancelArgs) {
            var action = cancelArgs.action;
            var handler = actionHandlers[action.Type];
            if (typeof handler === "function") {
                window.setTimeout(function() {
                    onInteractiveActionExecuting(cancelArgs);
                    if (!cancelArgs.cancel) {
                        handler(action);
                    }
                }, 0);
            }
        }
        function onServerActionStarted() {
            controller.serverActionStarted();
        }
        function onReportActionEnter(args) {
            controller.interactiveActionEnter({
                action: args.action,
                element: args.element
            });
        }
        function onReportActionLeave(args) {
            controller.interactiveActionLeave({
                action: args.action,
                element: args.element
            });
        }
        function clientExpired() {
            return eventFactory(controller.Events.CLIENT_EXPIRED, arguments);
        }
        function onClientExpired() {
            clientHasExpired = true;
            controller.clientExpired();
        }
        function onReportToolTipOpening(args) {
            controller.toolTipOpening(args);
        }
        controller.Events = {
            ERROR: "trv.ERROR",
            EXPORT_STARTED: "trv.EXPORT_STARTED",
            EXPORT_DOCUMENT_READY: "trv.EXPORT_DOCUMENT_READY",
            PRINT_STARTED: "trv.PRINT_STARTED",
            PRINT_DOCUMENT_READY: "trv.PRINT_DOCUMENT_READY",
            BEFORE_LOAD_PARAMETERS: "trv.BEFORE_LOAD_PARAMETERS",
            ON_LOADED_REPORT_CHANGE: "trv.ON_LOADED_REPORT_CHANGE",
            BEFORE_LOAD_REPORT: "trv.BEFORE_LOAD_REPORT",
            BEGIN_LOAD_REPORT: "trv.BEGIN_LOAD_REPORT",
            REPORT_LOAD_COMPLETE: "trv.REPORT_LOAD_COMPLETE",
            REPORT_LOAD_PROGRESS: "trv.REPORT_LOAD_PROGRESS",
            REPORT_LOAD_FAIL: "trv.REPORT_LOAD_FAIL",
            BEGIN_LOAD_PAGE: "trv.BEGIN_LOAD_PAGE",
            PAGE_READY: "trv.PAGE_READY",
            VIEW_MODE_CHANGED: "trv.VIEW_MODE_CHANGED",
            PRINT_MODE_CHANGED: "trv.PRINT_MODE_CHANGED",
            REPORT_SOURCE_CHANGED: "trv.REPORT_SOURCE_CHANGED",
            NAVIGATE_TO_PAGE: "trv.NAVIGATE_TO_PAGE",
            CURRENT_PAGE_CHANGED: "trv.CURRENT_PAGE_CHANGED",
            GET_DOCUMENT_MAP_STATE: "trv.GET_DOCUMENT_MAP_STATE",
            SET_DOCUMENT_MAP_VISIBLE: "trv.SET_DOCUMENT_MAP_VISIBLE",
            GET_PARAMETER_AREA_STATE: "trv.GET_PARAMETER_AREA_STATE",
            SET_PARAMETER_AREA_VISIBLE: "trv.SET_PARAMETER_AREA_VISIBLE",
            PAGE_SCALE: "trv.PAGE_SCALE",
            GET_PAGE_SCALE: "trv.GET_PAGE_SCALE",
            SERVER_ACTION_STARTED: "trv.SERVER_ACTION_STARTED",
            TOGGLE_SIDE_MENU: "trv.TOGGLE_SIDE_MENU",
            UPDATE_UI: "trv.UPDATE_UI",
            CSS_LOADED: "trv.CSS_LOADED",
            RELOAD_PARAMETERS: "trv.RELOAD_PARAMETERS",
            INTERACTIVE_ACTION_EXECUTING: "trv.INTERACTIVE_ACTION_EXECUTING",
            INTERACTIVE_ACTION_ENTER: "trv.INTERACTIVE_ACTION_ENTER",
            INTERACTIVE_ACTION_LEAVE: "trv.INTERACTIVE_ACTION_LEAVE",
            UPDATE_UI_INTERNAL: "trv.UPDATE_UI_INTERNAL",
            CLIENT_EXPIRED: "trv.CLIENT_EXPIRED",
            TOOLTIP_OPENING: "trv.TOOLTIP_OPENING",
            PAGE_NUMBER: "trv.PAGE_NUMBER",
            PAGE_COUNT: "trv.PAGE_COUNT"
        };
        utils.extend(controller, {
            reportSource: function(rs) {
                if (null === rs) {
                    report = parameterValues = null;
                    clearReportState();
                    changeReportSource(rs);
                    return this;
                } else if (rs) {
                    report = rs.report;
                    parameterValues = rs.parameters;
                    changeReportSource(rs);
                    return this;
                } else {
                    if (report === null) {
                        return null;
                    }
                    return {
                        report: report,
                        parameters: utils.extend({}, parameterValues)
                    };
                }
            },
            reportDocumentIdExposed: function() {
                return reportDocumentId;
            },
            setParameters: function(paramValues) {
                parameterValues = paramValues;
            },
            pageCount: function() {
                return pageCount;
            },
            currentPageNumber: function(pageNo) {
                if (pageNo === undefined) return currentPageNumber;
                var num = utils.tryParseInt(pageNo);
                if (num != currentPageNumber) {
                    currentPageNumber = num;
                    changePageNumber(num);
                }
                return this;
            },
            viewMode: function(vm) {
                var vmode = controller.setViewMode(vm);
                if (typeof vmode === "string") {
                    return vmode;
                }
                if (report) {
                    controller.refreshReportCore(false, reportDocumentId);
                }
                return controller;
            },
            setViewMode: function(vm) {
                if (!vm) {
                    return viewMode;
                }
                if (viewMode != vm) {
                    viewMode = vm;
                    controller.viewModeChanged(vm);
                }
                return controller;
            },
            printMode: function(pm) {
                if (!pm) {
                    return printMode;
                }
                if (printMode != pm) {
                    printMode = pm;
                    controller.printModeChanged(pm);
                }
                return controller;
            },
            previewReport: function(ignoreCache, baseDocumentId, actionId) {
                controller.onLoadedReportChange();
                controller.refreshReportCore(ignoreCache, baseDocumentId, actionId);
            },
            refreshReportCore: function(ignoreCache, baseDocumentId, actionId) {
                loadReportAsync(ignoreCache, baseDocumentId, actionId);
            },
            refreshReport: function(ignoreCache, baseDocumentId, actionId) {
                controller.onLoadedReportChange();
                if (clientHasExpired) {
                    clientHasExpired = false;
                    clearClientId();
                }
                if (!report) {
                    raiseError(sr.noReport);
                    return;
                }
                var loadParametersPromise = controller.loadParameters(null);
                loadParametersPromise.then(function(parameters) {
                    var parameterValues = {};
                    var hasError = false;
                    utils.each(parameters || [], function() {
                        try {
                            parameterValues[this.id] = parameterValidators.validate(this, this.value);
                        } catch (e) {
                            hasError = true;
                            return;
                        }
                    });
                    if (hasError) {
                        raiseError(sr.missingOrInvalidParameter);
                    } else {
                        controller.setParameters(parameterValues);
                        controller.refreshReportCore(ignoreCache, baseDocumentId, actionId);
                    }
                });
                controller.reloadParameters(loadParametersPromise);
            },
            exportReport: function(format, deviceInfo) {
                exportReport(format, deviceInfo);
            },
            printReport: function() {
                printReport();
            },
            getReportPage: function(pageNumber) {
                getReportPage(pageNumber);
            },
            executeReportAction: function(cancelArgs) {
                executeReportAction(cancelArgs);
            },
            reportActionEnter: function(args) {
                onReportActionEnter(args);
            },
            reportActionLeave: function(args) {
                onReportActionLeave(args);
            },
            reportToolTipOpening: function(args) {
                onReportToolTipOpening(args);
            },
            loadParameters: function(paramValues) {
                if (report === null) {
                    return {};
                }
                controller.beforeLoadParameters(paramValues == null);
                return loadParametersAsync(report, paramValues);
            },
            getDocumentFormats: function() {
                return getDocumentFormatsAsync();
            },
            setAuthenticationToken: function(token) {
                client.setAccessToken(token);
            },
            clientId: function() {
                return clientId;
            },
            onReportLoadComplete: function(info) {
                pageCount = info.pageCount;
                bookmarkNodes = info.bookmarkNodes;
                controller.reportLoadComplete(info);
            },
            raiseError: raiseError,
            on: events.on,
            error: function() {
                return eventFactory(controller.Events.ERROR, arguments);
            },
            reloadParameters: function() {
                return eventFactory(controller.Events.RELOAD_PARAMETERS, arguments);
            },
            exportStarted: function() {
                return eventFactory(controller.Events.EXPORT_STARTED, arguments);
            },
            exportReady: function() {
                return eventFactory(controller.Events.EXPORT_DOCUMENT_READY, arguments);
            },
            printStarted: function() {
                return eventFactory(controller.Events.PRINT_STARTED, arguments);
            },
            printReady: function() {
                return eventFactory(controller.Events.PRINT_DOCUMENT_READY, arguments);
            },
            beforeLoadParameters: function() {
                return eventFactory(controller.Events.BEFORE_LOAD_PARAMETERS, arguments);
            },
            onLoadedReportChange: function() {
                return eventFactory(controller.Events.ON_LOADED_REPORT_CHANGE, arguments);
            },
            beforeLoadReport: function() {
                return eventFactory(controller.Events.BEFORE_LOAD_REPORT, arguments);
            },
            beginLoadReport: function() {
                return eventFactory(controller.Events.BEGIN_LOAD_REPORT, arguments);
            },
            reportLoadComplete: function() {
                return eventFactory(controller.Events.REPORT_LOAD_COMPLETE, arguments);
            },
            reportLoadProgress: function() {
                return eventFactory(controller.Events.REPORT_LOAD_PROGRESS, arguments);
            },
            reportLoadFail: function() {
                return eventFactory(controller.Events.REPORT_LOAD_FAIL, arguments);
            },
            beginLoadPage: function() {
                return eventFactory(controller.Events.BEGIN_LOAD_PAGE, arguments);
            },
            pageReady: function() {
                return eventFactory(controller.Events.PAGE_READY, arguments);
            },
            viewModeChanged: function() {
                return eventFactory(controller.Events.VIEW_MODE_CHANGED, arguments);
            },
            printModeChanged: function() {
                return eventFactory(controller.Events.PRINT_MODE_CHANGED, arguments);
            },
            reportSourceChanged: function() {
                return eventFactory(controller.Events.REPORT_SOURCE_CHANGED, arguments);
            },
            navigateToPage: function() {
                return eventFactory(controller.Events.NAVIGATE_TO_PAGE, arguments);
            },
            currentPageChanged: function() {
                return eventFactory(controller.Events.CURRENT_PAGE_CHANGED, arguments);
            },
            getDocumentMapState: function() {
                return eventFactory(controller.Events.GET_DOCUMENT_MAP_STATE, arguments);
            },
            setDocumentMapVisible: function() {
                return eventFactory(controller.Events.SET_DOCUMENT_MAP_VISIBLE, arguments);
            },
            getParametersAreaState: function() {
                return eventFactory(controller.Events.GET_PARAMETER_AREA_STATE, arguments);
            },
            setParametersAreaVisible: function() {
                return eventFactory(controller.Events.SET_PARAMETER_AREA_VISIBLE, arguments);
            },
            scale: function() {
                return eventFactory(controller.Events.PAGE_SCALE, arguments);
            },
            getScale: function() {
                return eventFactory(controller.Events.GET_PAGE_SCALE, arguments);
            },
            serverActionStarted: function() {
                return eventFactory(controller.Events.SERVER_ACTION_STARTED, arguments);
            },
            cssLoaded: function() {
                return eventFactory(controller.Events.CSS_LOADED, arguments);
            },
            interactiveActionExecuting: function() {
                return eventFactory(controller.Events.INTERACTIVE_ACTION_EXECUTING, arguments);
            },
            interactiveActionEnter: function() {
                return eventFactory(controller.Events.INTERACTIVE_ACTION_ENTER, arguments);
            },
            interactiveActionLeave: function() {
                return eventFactory(controller.Events.INTERACTIVE_ACTION_LEAVE, arguments);
            },
            updateUI: function() {
                return eventFactory(controller.Events.UPDATE_UI, arguments);
            },
            updateUIInternal: function() {
                return eventFactory(controller.Events.UPDATE_UI_INTERNAL, arguments);
            },
            toolTipOpening: function() {
                return eventFactory(controller.Events.TOOLTIP_OPENING, arguments);
            },
            pageNumberChange: function() {
                return eventFactory(controller.Events.PAGE_NUMBER, arguments);
            },
            pageCountChange: function() {
                return eventFactory(controller.Events.PAGE_COUNT, arguments);
            },
            clientExpired: clientExpired
        });
        return controller;
    }
    trv.ReportViewerController = ReportViewerController;
})(window.telerikReportViewer = window.telerikReportViewer || {}, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    trv.touchBehavior = function(dom, options) {
        var startDistance, ignoreTouch;
        init(dom);
        function init(element) {
            if (typeof $.fn.kendoTouch === "function") {
                $(element).find(".trv-page-wrapper").mousedown(function() {
                    ignoreTouch = true;
                }).mouseup(function() {
                    ignoreTouch = false;
                }).kendoTouch({
                    multiTouch: true,
                    enableSwipe: true,
                    swipe: function(e) {
                        if (!ignoreTouch) {
                            onSwipe(e);
                        }
                    },
                    gesturestart: function(e) {
                        if (!ignoreTouch) {
                            onGestureStart(e);
                        }
                    },
                    gestureend: function(e) {
                        if (!ignoreTouch) {
                            onGestureEnd(e);
                        }
                    },
                    gesturechange: function(e) {
                        if (!ignoreTouch) {
                            onGestureChange(e);
                        }
                    },
                    doubletap: function(e) {
                        if (!ignoreTouch) {
                            onDoubleTap(e);
                        }
                    },
                    touchstart: function(e) {
                        if (!ignoreTouch) {
                            fire("touchstart");
                        }
                    }
                });
            }
        }
        function onDoubleTap(e) {
            fire("doubletap", e);
        }
        function onGestureStart(e) {
            startDistance = kendo.touchDelta(e.touches[0], e.touches[1]).distance;
        }
        function onGestureEnd(e) {}
        function onGestureChange(e) {
            var current = kendo.touchDelta(e.touches[0], e.touches[1]).distance;
            onPinch({
                distance: current,
                lastDistance: startDistance
            });
            startDistance = current;
        }
        function onSwipe(e) {
            fire("swipe", e);
        }
        function onPinch(e) {
            fire("pinch", e);
        }
        function fire(func, args) {
            var handler = options[func];
            if (typeof handler === "function") {
                handler(args);
            }
        }
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    var domUtils = trv.domUtils;
    var touchBehavior = trv.touchBehavior;
    if (!touchBehavior) {
        throw "Missing telerikReportViewer.touch";
    }
    var defaultOptions = {};
    var scaleModes = trv.ScaleModes = {
        FIT_PAGE_WIDTH: "FIT_PAGE_WIDTH",
        FIT_PAGE: "FIT_PAGE",
        SPECIFIC: "SPECIFIC"
    };
    function PagesArea(placeholder, options, otherOptions) {
        options = $.extend({}, defaultOptions, options, otherOptions);
        var controller = options.controller;
        if (!controller) throw "No controller (telerikReportViewer.reportViewerController) has been specified.";
        var $placeholder = $(placeholder), $pageContainer = $placeholder.find(".trv-page-container"), pageContainer = $pageContainer[0], $pageWrapper = $placeholder.find(".trv-page-wrapper"), pageWrapper = $pageWrapper[0], $errorMessage = $placeholder.find(".trv-error-message"), actions, pendingBookmark, pageScaleMode = scaleModes.SPECIFIC, pageScale = 1, minPageScale = .1, maxPageScale = 8, documentReady = true, navigateToPageOnDocReady, navigateToBookmarkOnDocReady, isNewReportSource, showErrorTimeoutId;
        $(window).on("resize", function(event, args) {
            if (shouldAutosizePage()) {
                updatePageDimensions();
            }
        });
        enableTouch($placeholder);
        function clearPendingTimeoutIds() {
            if (showErrorTimeoutId) {
                window.clearTimeout(showErrorTimeoutId);
            }
        }
        function invalidateCurrentlyLoadedPage() {
            var page = findPage(navigateToPageOnDocReady);
            if (page) {
                pageNo(page, -1);
            }
        }
        function navigateWhenPageAvailable(pageNumber, pageCount) {
            if (pageNumber && pageNumber <= pageCount) {
                navigateToPage(pageNumber, navigateToBookmarkOnDocReady);
            }
        }
        function navigateOnLoadComplete(pageNumber, pageCount) {
            if (pageNumber) {
                var pageNumber = Math.min(pageNumber, pageCount);
                navigateToPage(pageNumber, navigateToBookmarkOnDocReady);
            }
        }
        function clearPage() {
            clear(isNewReportSource);
            isNewReportSource = false;
        }
        controller.reportSourceChanged(function() {
            isNewReportSource = true;
            navigateToPageOnDocReady = null;
            navigateToBookmarkOnDocReady = null;
            documentReady = false;
        }).beforeLoadParameters(function(event, initial) {
            if (initial) {
                showError(sr.loadingReport);
            }
        }).beforeLoadReport(function() {
            documentReady = false;
            if (!navigateToPageOnDocReady) navigateToPageOnDocReady = 1;
            clearPendingTimeoutIds();
            clear();
            disablePagesArea(true);
            showError(sr.loadingReport);
        }).beginLoadReport(function(event, args) {
            documentReady = true;
            invalidateCurrentlyLoadedPage();
        }).reportLoadProgress(function(event, args) {
            navigateWhenPageAvailable(navigateToPageOnDocReady, args.pageCount);
            showError(utils.stringFormat(sr.loadingReportPagesInProgress, [ args.pageCount ]));
        }).reportLoadComplete(function(event, args) {
            if (0 === args.pageCount) {
                clearPage();
                showError(sr.noPageToDisplay);
            } else {
                navigateOnLoadComplete(navigateToPageOnDocReady, args.pageCount);
                showError(utils.stringFormat(sr.loadedReportPagesComplete, [ args.pageCount ]));
                showErrorTimeoutId = window.setTimeout(showError, 2e3);
                enableInteractivity();
            }
        }).navigateToPage(function(event, pageNumber, bookmark) {
            navigateToPage(pageNumber, bookmark);
        }).pageReady(function(event, page) {
            setPageContent(page);
            disablePagesArea(false);
        }).error(function(event, error) {
            disablePagesArea(false);
            clearPage();
            showError(error);
        }).exportStarted(function(event, args) {
            showError(sr.preparingDownload);
        }).exportReady(function(event, args) {
            showError();
        }).printStarted(function(event, args) {
            showError(sr.preparingPrint);
        }).printReady(function(event, args) {
            showError();
        }).scale(function(event, args) {
            setPageScale(args);
        }).getScale(function(event, args) {
            var page = getCurrentPage();
            var scale = $(page).data("pageScale") || pageScale;
            args.scale = scale;
            args.scaleMode = pageScaleMode;
        }).setDocumentMapVisible(function() {
            if (shouldAutosizePage()) {
                updatePageDimensions();
            }
        }).setParametersAreaVisible(function() {
            if (shouldAutosizePage()) {
                updatePageDimensions();
            }
        }).serverActionStarted(function() {
            disablePagesArea(true);
            showError(sr.loadingReport);
        });
        function enableTouch(dom) {
            var allowSwipeLeft, allowSwipeRight;
            touchBehavior(dom, {
                swipe: function(e) {
                    var pageNumber = controller.currentPageNumber();
                    if (allowSwipeLeft && e.direction == "left") {
                        if (pageNumber < controller.pageCount()) {
                            controller.navigateToPage(pageNumber + 1);
                        }
                    } else if (allowSwipeRight && e.direction == "right") {
                        if (pageNumber > 1) {
                            controller.navigateToPage(pageNumber - 1);
                        }
                    }
                },
                pinch: function(e) {
                    var page = getCurrentPage();
                    var scale = $(page).data("pageScale") || pageScale;
                    var f = e.distance / e.lastDistance;
                    setPageScale({
                        scale: scale * f,
                        scaleMode: trv.ScaleModes.SPECIFIC
                    });
                },
                doubletap: function(e) {
                    options.commands.toggleZoomMode.exec();
                },
                touchstart: function(e) {
                    var el = pageWrapper;
                    allowSwipeRight = 0 == el.scrollLeft;
                    allowSwipeLeft = el.scrollWidth - el.offsetWidth == el.scrollLeft;
                }
            });
        }
        function shouldAutosizePage() {
            return -1 != [ scaleModes.FIT_PAGE, scaleModes.FIT_PAGE_WIDTH ].indexOf(pageScaleMode);
        }
        function updatePageDimensions() {
            for (var i = 0, children = pageContainer.childNodes, len = children.length; i < len; i++) {
                setPageDimensions(children[i], pageScaleMode, pageScale);
            }
        }
        function setPageScale(options) {
            pageScaleMode = options.scaleMode || pageScaleMode;
            var scale = pageScale;
            if ("scale" in options) {
                scale = options.scale;
            }
            pageScale = Math.max(minPageScale, Math.min(maxPageScale, scale));
            updatePageDimensions();
        }
        function clear(clearPageWrapper) {
            disableInteractivity();
            pendingBookmark = undefined;
            if (clearPageWrapper) {
                $pageWrapper.empty();
            }
            showError();
        }
        function getCurrentPage() {
            return findPage(controller.currentPageNumber());
        }
        function findPage(pageNumber) {
            var page;
            utils.each($pageContainer.children(), function(index, page1) {
                if (pageNo(page1) == pageNumber) {
                    page = page1;
                }
                return !page;
            });
            return page;
        }
        function navigateToPage(pageNumber, bookmark) {
            if (documentReady) {
                navigateToPageCore(pageNumber, bookmark);
            } else {
                navigateToPageOnDocumentReady(pageNumber, bookmark);
            }
        }
        function navigateToPageOnDocumentReady(pageNumber, bookmark) {
            navigateToPageOnDocReady = pageNumber;
            navigateToBookmarkOnDocReady = bookmark;
        }
        function navigateToPageCore(pageNumber, bookmark) {
            var page = findPage(pageNumber);
            if (page) {
                if (bookmark) {
                    navigateToBookmark(bookmark);
                }
            } else {
                pendingBookmark = bookmark;
                beginLoadPage(pageNumber);
            }
        }
        function navigateToBookmark(bookmark) {
            if (bookmark) {
                var el = $pageContainer.find("[data-bookmark-id=" + bookmark + "]")[0];
                if (el) {
                    if (options.enableAccessibility) {
                        var $nextFocusable = findNextFocusableElement($(el));
                        if ($nextFocusable) {
                            $nextFocusable.focus();
                        }
                    }
                    var container = $pageContainer[0], offsetTop = 0, offsetLeft = 0;
                    while (el && el != container) {
                        if ($(el).is(".trv-page-wrapper")) {
                            var scale = $(el).data("pageScale");
                            if (typeof scale === "number") {
                                offsetTop *= scale;
                                offsetLeft *= scale;
                            }
                        }
                        offsetTop += el.offsetTop;
                        offsetLeft += el.offsetLeft;
                        el = el.offsetParent;
                    }
                    container.scrollTop = offsetTop;
                    container.scrollLeft = offsetLeft;
                }
            }
        }
        function findNextFocusableElement(element) {
            if (!element || element.length == 0) {
                return null;
            }
            var num = utils.tryParseInt(element.attr("tabindex"));
            if (num != NaN && num > -1) {
                return element;
            }
            return findNextFocusableElement(element.next());
        }
        function disablePagesArea(disable) {
            (disable ? $.fn.addClass : $.fn.removeClass).call($placeholder, "loading");
        }
        function showError(error) {
            $errorMessage.html(error);
            (error ? $.fn.addClass : $.fn.removeClass).call($placeholder, "error");
        }
        function pageNo(page, no) {
            var $page = page.$ ? page : $(page), dataKey = "pageNumber";
            if (no === undefined) {
                return $page.data(dataKey);
            }
            $page.data(dataKey, no);
            return page;
        }
        function beginLoadPage(pageNumber) {
            disablePagesArea(true);
            window.setTimeout(controller.getReportPage.bind(controller, pageNumber), 1);
            navigateToPageOnDocReady = null;
        }
        function setPageDimensions(page, scaleMode, scale) {
            var $target = $(page), $page = $target.find("div.trv-report-page"), $pageContent = $target.find("div.sheet"), pageContent = $pageContent[0];
            if (!pageContent) return;
            var pageWidth, pageHeight, box = $target.data("box");
            if (!box) {
                var margins = domUtils.getMargins($target), borders = domUtils.getBorderWidth($page), padding = domUtils.getPadding($page);
                box = {
                    padLeft: margins.left + borders.left + padding.left,
                    padRight: margins.right + borders.right + padding.right,
                    padTop: margins.top + borders.top + padding.top,
                    padBottom: margins.bottom + borders.bottom + padding.bottom
                };
                $target.data("box", box);
            }
            if ($target.data("pageWidth") === undefined) {
                pageWidth = pageContent.offsetWidth;
                pageHeight = pageContent.offsetHeight;
                $target.data("pageWidth", pageWidth);
                $target.data("pageHeight", pageHeight);
            } else {
                pageWidth = $target.data("pageWidth");
                pageHeight = $target.data("pageHeight");
            }
            var scrollBarV = pageHeight > pageWidth && scaleMode == scaleModes.FIT_PAGE_WIDTH ? 20 : 0, scaleW = (pageContainer.clientWidth - scrollBarV - box.padLeft - box.padRight) / pageWidth, scaleH = (pageContainer.clientHeight - 1 - box.padTop - box.padBottom) / pageHeight;
            if (scaleMode == scaleModes.FIT_PAGE_WIDTH) {
                scale = scaleW;
            } else if (!scale || scaleMode == scaleModes.FIT_PAGE) {
                scale = Math.min(scaleW, scaleH);
            }
            $target.data("pageScale", scale);
            domUtils.scale($pageContent, scale, scale);
            $page.css("height", scale * pageHeight).css("width", scale * pageWidth);
        }
        function enableInteractivity() {
            $pageContainer.on("click", "[data-reporting-action]", onInteractiveItemClick);
            $pageContainer.on("mouseenter", "[data-reporting-action]", onInteractiveItemEnter);
            $pageContainer.on("mouseleave", "[data-reporting-action]", onInteractiveItemLeave);
            $pageContainer.on("mouseenter", "[data-tooltip-title],[data-tooltip-text]", onToolTipItemEnter);
            $pageContainer.on("mouseleave", "[data-tooltip-title],[data-tooltip-text]", onToolTipItemLeave);
        }
        function disableInteractivity() {
            $pageContainer.off("click", "[data-reporting-action]", onInteractiveItemClick);
            $pageContainer.off("mouseenter", "[data-reporting-action]", onInteractiveItemEnter);
            $pageContainer.off("mouseleave", "[data-reporting-action]", onInteractiveItemLeave);
            $pageContainer.off("mouseenter", "[data-tooltip-title],[data-tooltip-text]", onToolTipItemEnter);
            $pageContainer.off("mouseleave", "[data-tooltip-title],[data-tooltip-text]", onToolTipItemLeave);
        }
        function onInteractiveItemClick(args) {
            var $t = $(this);
            var actionId = $t.attr("data-reporting-action");
            var a = getAction(actionId);
            if (a) {
                navigateToPageOnDocReady = controller.currentPageNumber();
                controller.executeReportAction({
                    element: args.currentTarget,
                    action: a,
                    cancel: false
                });
            }
        }
        function onInteractiveItemEnter(args) {
            var $t = $(this);
            var actionId = $t.attr("data-reporting-action");
            var a = getAction(actionId);
            if (a !== null && args.currentTarget === this) {
                controller.reportActionEnter({
                    element: args.currentTarget,
                    action: a
                });
            }
        }
        function onInteractiveItemLeave(args) {
            var $t = $(this);
            var actionId = $t.attr("data-reporting-action");
            var a = getAction(actionId);
            if (a !== null && args.currentTarget === this) {
                controller.reportActionLeave({
                    element: args.currentTarget,
                    action: a
                });
            }
        }
        function getAction(actionId) {
            if (actions) {
                var action;
                utils.each(actions, function() {
                    if (this.Id == actionId) {
                        action = this;
                    }
                    return action === undefined;
                });
                return action;
            }
            return null;
        }
        function onToolTipItemEnter(args) {
            var $t = $(this);
            var title = $t.attr("data-tooltip-title");
            var text = $t.attr("data-tooltip-text");
            if (!title && !text) {
                return;
            }
            var toolTipArgs = {
                element: args.currentTarget,
                toolTip: {
                    title: title || "",
                    text: text || ""
                },
                cancel: false
            };
            controller.reportToolTipOpening(toolTipArgs);
            if (toolTipArgs.cancel) {
                return;
            }
            var content = applyToolTipTemplate(toolTipArgs);
            var viewportElement = args.currentTarget.viewportElement;
            var ktt = getToolTip($t, content);
            ktt.show($t);
            if (viewportElement && viewportElement.nodeName === "svg") {
                positionToolTip(ktt, args);
            }
        }
        function applyToolTipTemplate(toolTipArgs) {
            var toolTipTemplate = options.templates["trv-pages-area-kendo-tooltip"];
            var $container = $(toolTipTemplate);
            var $titleSpan = $container.find(".trv-pages-area-kendo-tooltip-title");
            var $textSpan = $container.find(".trv-pages-area-kendo-tooltip-text");
            $titleSpan.text(toolTipArgs.toolTip.title);
            $textSpan.text(toolTipArgs.toolTip.text);
            return $container.clone().wrap("<p>").parent().html();
        }
        function positionToolTip(toolTip, e) {
            var x = e.pageX;
            var y = e.pageY;
            toolTip.popup.element.parent().css({
                left: x + 10,
                top: y + 5
            });
        }
        function getToolTip(target, toolTipContent) {
            var ktt = target.data("kendoTooltip");
            if (!ktt) {
                ktt = target.kendoTooltip({
                    content: toolTipContent,
                    autohide: true,
                    callout: false
                }).data("kendoTooltip");
            }
            return ktt;
        }
        function onToolTipItemLeave(args) {
            var $t = $(this);
            var toolTip = $t.data("kendoTooltip");
            if (toolTip) {
                toolTip.hide();
            }
        }
        function updatePageStyle(page) {
            var styleId = "trv-" + controller.clientId() + "-styles";
            $("#" + styleId).remove();
            var pageStyles = $("<style id=" + styleId + "></style>");
            pageStyles.append(page.pageStyles);
            pageStyles.appendTo("head");
        }
        function setPageContent(page) {
            actions = JSON.parse(page.pageActions);
            updatePageStyle(page);
            var wrapper = $($.parseHTML(page.pageContent)), $pageContent = wrapper.find("div.sheet"), $page = $('<div class="trv-report-page"></div>');
            $pageContent.css("margin", 0);
            $page.append($pageContent).append($('<div class="trv-page-overlay"></div>'));
            var pageNumber = page.pageNumber;
            var $target = $pageWrapper.empty().removeData().data("pageNumber", pageNumber).append($page);
            controller.currentPageNumber(pageNumber);
            if (controller.viewMode() == trv.ViewModes.INTERACTIVE) {
                $placeholder.removeClass("printpreview");
                $placeholder.addClass("interactive");
            } else {
                $placeholder.removeClass("interactive");
                $placeholder.addClass("printpreview");
            }
            setPageDimensions($target, pageScaleMode, pageScale);
            $pageContainer.scrollTop(0);
            $pageContainer.scrollLeft(0);
            navigateToBookmark(pendingBookmark);
        }
    }
    var pluginName = "telerik_ReportViewer_PagesArea";
    $.fn[pluginName] = function(options, otherOptions) {
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new PagesArea(this, options, otherOptions));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var defaultOptions = {};
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    function DocumentMapArea(placeholder, options, otherOptions) {
        options = $.extend({}, defaultOptions, options, otherOptions);
        var controller = options.controller;
        if (!controller) {
            throw "No controller (telerikReporting.reportViewerController) has been specified.";
        }
        var $placeholder = $(placeholder), $documentMap;
        var documentMapVisible = options.documentMapVisible !== false;
        var enableAccessibility = options.enableAccessibility;
        init();
        function init() {
            $documentMap = $('<div id="documentMap"></div>');
            $documentMap.appendTo(placeholder);
            attach();
        }
        function onTreeViewSelectionChanged(e) {
            var documentMapNode = this.dataItem(e.node), page = documentMapNode.page, id = documentMapNode.id;
            controller.navigateToPage(page, id);
        }
        function onTreeViewNodeExpand(e) {
            if (enableAccessibility) {
                window.setTimeout(function() {
                    setNodeAccessibilityAttributes(e.node);
                }, 100);
            }
        }
        function setNodeAccessibilityAttributes(node) {
            var $items = $(node).find("li");
            utils.each($items, function() {
                var $li = $(this);
                $li.attr("aria-label", $li[0].innerText);
            });
        }
        function clearDocumentMap() {
            displayDocumentMap([]);
        }
        function displayDocumentMap(documentMap) {
            var hasDocumentMap = documentMap && !$.isEmptyObject(documentMap);
            var $treeView = $documentMap.data("kendoTreeView");
            if (!$treeView) {
                $documentMap.kendoTreeView({
                    dataTextField: "text",
                    select: onTreeViewSelectionChanged
                });
                $treeView = $documentMap.data("kendoTreeView");
            }
            $treeView.setDataSource(documentMap);
            setAccessibilityAttributes($treeView);
            showDocumentMap(hasDocumentMap);
        }
        function setAccessibilityAttributes(treeView) {
            if (enableAccessibility) {
                treeView.bind("expand", onTreeViewNodeExpand);
                treeView.element.attr("aria-label", "Document map area");
                var listItems = treeView.element.find("ul");
                utils.each(listItems, function() {
                    setNodeAccessibilityAttributes(this);
                });
            }
        }
        function isVisible() {
            var args = {};
            controller.getDocumentMapState(args);
            return args.visible;
        }
        function beginLoad() {
            $placeholder.addClass("loading");
        }
        function endLoad() {
            $placeholder.removeClass("loading");
        }
        var currentReport = null;
        var documentMapNecessary = false;
        function showDocumentMap(show) {
            (show ? $.fn.removeClass : $.fn.addClass).call($placeholder, "hidden");
        }
        function attach() {
            controller.beginLoadReport(function() {
                beginLoad();
                var r = controller.reportSource().report;
                var clearMapItems = currentReport !== r || !isVisible();
                currentReport = r;
                if (clearMapItems) {
                    clearDocumentMap();
                }
            }).reportLoadComplete(function(event, args) {
                if (args.documentMapAvailable) {
                    documentMapNecessary = true;
                    displayDocumentMap(args.documentMapNodes);
                    controller.setDocumentMapVisible({
                        enabled: true,
                        visible: documentMapVisible
                    });
                } else {
                    documentMapNecessary = false;
                    showDocumentMap(false);
                }
                endLoad();
            }).error(function(event, error) {
                endLoad();
                clearDocumentMap();
            }).getDocumentMapState(function(event, args) {
                args.enabled = documentMapNecessary;
                args.visible = documentMapVisible;
            }).setDocumentMapVisible(function(event, args) {
                documentMapVisible = args.visible;
                showDocumentMap(args.visible && documentMapNecessary);
            });
        }
    }
    var pluginName = "telerik_ReportViewer_DocumentMapArea";
    $.fn[pluginName] = function(options, otherOptions) {
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new DocumentMapArea(this, options, otherOptions));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    trv.ParameterTypes = {
        INTEGER: "System.Int64",
        FLOAT: "System.Double",
        STRING: "System.String",
        DATETIME: "System.DateTime",
        BOOLEAN: "System.Boolean"
    };
    trv.parameterEditorsMatch = {
        MultiSelect: function(parameter) {
            return Boolean(parameter.availableValues) && parameter.multivalue;
        },
        SingleSelect: function(parameter) {
            return Boolean(parameter.availableValues) && !parameter.multivalue;
        },
        MultiValue: function(parameter) {
            return Boolean(parameter.multivalue);
        },
        DateTime: function(parameter) {
            return parameter.type === trv.ParameterTypes.DATETIME;
        },
        String: function(parameter) {
            return parameter.type === trv.ParameterTypes.STRING;
        },
        Number: function(parameter) {
            switch (parameter.type) {
              case trv.ParameterTypes.INTEGER:
              case trv.ParameterTypes.FLOAT:
                return true;

              default:
                return false;
            }
        },
        Boolean: function(parameter) {
            return parameter.type === trv.ParameterTypes.BOOLEAN;
        },
        Default: function(parameter) {
            return true;
        }
    };
    var sr = trv.sr, utils = trv.utils;
    var multivalueUtils = function() {
        var lineSeparator = "\n";
        return {
            formatValue: function(value) {
                var text = "";
                if (value) {
                    [].concat(value).forEach(function(val) {
                        if (text.length > 0) {
                            text += lineSeparator;
                        }
                        text += val;
                    });
                }
                return text;
            },
            parseValues: function(text) {
                return ("" + text).split(lineSeparator);
            }
        };
    }();
    function integerInputBehavior(input) {
        function isValid(newValue) {
            return /^(\-|\+)?([0-9]*)$/.test(newValue);
        }
        function onKeyPress(event) {
            if (utils.isSpecialKey(event.keyCode)) {
                return true;
            }
            return isValid($(input).val() + String.fromCharCode(event.charCode));
        }
        function onPaste(event) {}
        function attach(input) {
            $(input).on("keypress", onKeyPress).on("paste", onPaste);
        }
        function detach(input) {
            $(input).off("keypress", onKeyPress).off("paste", onPaste);
        }
        attach(input);
        return {
            dispose: function() {
                detach(input);
            }
        };
    }
    function floatInputBehavior(input) {
        function isValid(newValue) {
            return /^(\-|\+)?([0-9]*(\.[0-9]*)?)$/.test(newValue);
        }
        function onKeyPress(event) {
            if (utils.isSpecialKey(event.keyCode)) {
                return true;
            }
            return isValid($(input).val() + String.fromCharCode(event.charCode));
        }
        function onPaste(event) {}
        function attach(input) {
            $(input).on("keypress", onKeyPress).on("paste", onPaste);
        }
        function detach(input) {
            $(input).off("keypress", onKeyPress).off("paste", onPaste);
        }
        attach(input);
        return {
            dispose: function() {
                detach(input);
            }
        };
    }
    function applyClass(apply, cssClass, item) {
        var fn = apply ? $.fn.addClass : $.fn.removeClass;
        fn.call(item, cssClass);
    }
    function enableItem(item, enable) {
        applyClass(!enable, "k-state-disabled", item);
    }
    function selectItem(item, select) {
        applyClass(select, "k-state-selected", item);
        item.attr("aria-selected", select);
    }
    function addAccessibilityAttributes(editor, type, caption, additionalInfo, error) {
        if (!additionalInfo) {
            additionalInfo = "";
        }
        var label = utils.stringFormat("{0}. {1} {2}. {3}", [ caption, type, sr.ariaLabelParameter, additionalInfo ]);
        editor.attr("aria-label", label);
        setAccessibilityErrorAttributes(editor, error);
    }
    var containerTabIndex;
    var editorsIndex = 0;
    function setEditorTabIndex(editor) {
        if (!containerTabIndex) {
            var $container = $("div.trv-parameters-area-content");
            if ($container.length > 0) {
                var tabIndexAttr = $container.attr("tabIndex");
                if (tabIndexAttr) {
                    containerTabIndex = utils.tryParseInt(tabIndexAttr);
                }
            }
            if (!containerTabIndex || isNaN(containerTabIndex)) {
                containerTabIndex = 300;
            }
        }
        editor.attr("tabindex", containerTabIndex + ++editorsIndex);
    }
    function setAccessibilityErrorAttributes(editor, error) {
        var errToken = utils.stringFormat(" {0}:", [ sr.ariaLabelErrorMessage ]);
        var label = editor.attr("aria-label");
        if (!label) {
            return;
        }
        var errIdx = label.indexOf(errToken);
        if (errIdx > -1) {
            label = label.substring(0, errIdx);
        }
        if (error && error != "") {
            editor.attr("aria-required", true);
            editor.attr("aria-invalid", true);
            label += errToken + error;
        } else {
            editor.removeAttr("aria-invalid");
        }
        editor.attr("aria-label", label);
    }
    function navigatableEnabledForList(enableAccessibility) {
        return kendo.version >= "2017.3.1018" || enableAccessibility;
    }
    trv.parameterEditors = [ {
        match: trv.parameterEditorsMatch.MultiSelect,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder);
            var enabled = true;
            $placeholder.html(options.templates["trv-parameter-editor-available-values-multiselect"]);
            var $list = $placeholder.find(".list"), $selectAll = $placeholder.find(".select-all"), $selectNone = $placeholder.find(".select-none"), listView, parameter, updateTimeout, valueChangeCallback = options.parameterChanged, initialized;
            $selectAll.click(function(e) {
                e.preventDefault();
                if (!enabled) return;
                setSelectedItems(parameter.availableValues.map(function(av) {
                    return av.value;
                }));
            });
            $selectNone.click(function(e) {
                e.preventDefault();
                if (!enabled) return;
                setSelectedItems([]);
            });
            function onSelectionChanged(selection) {
                if (initialized) {
                    applyAriaSelected(selection);
                    notifyParameterChanged(selection);
                }
                var noSelection = selection.length == 0;
                (noSelection ? $.fn.show : $.fn.hide).call($selectAll);
                (!noSelection ? $.fn.show : $.fn.hide).call($selectNone);
            }
            function applyAriaSelected(selection) {
                var children = listView.element.children();
                utils.each(children, function() {
                    var $item = $(this);
                    var isSelected = selection.filter($item).length > 0;
                    $item.attr("aria-selected", isSelected);
                });
            }
            function notifyParameterChanged(selection) {
                var availableValues = parameter.availableValues, values = $.map(selection, function(item) {
                    return availableValues[$(item).index()].value;
                });
                clearPendingChange();
                var immediateUpdate = !parameter.autoRefresh && !parameter.childParameters;
                updateTimeout = window.setTimeout(function() {
                    if (!utils.areEqualArrays(parameter.value, values)) {
                        valueChangeCallback(parameter, values);
                    }
                    updateTimeout = null;
                }, immediateUpdate ? 0 : 1e3);
            }
            function clearPendingChange() {
                if (updateTimeout) {
                    window.clearTimeout(updateTimeout);
                }
            }
            function getSelectedItems() {
                return $(listView.element).find(".k-state-selected");
            }
            function onItemClick() {
                if (!enabled) return;
                $(this).toggleClass("k-state-selected");
                onSelectionChanged(getSelectedItems());
            }
            function onKeydown(event) {
                if (!enabled) return;
                if (event.which != 32) {
                    return;
                }
                var focused = $(listView.element).find(".k-state-focused");
                if (focused.length > 0) {
                    focused.toggleClass("k-state-selected");
                    onSelectionChanged(getSelectedItems());
                    event.preventDefault();
                }
            }
            function init() {
                setEditorTabIndex($list);
                setSelectedItems(parameter.value);
                var element = $(listView.element);
                element.on("mousedown", ".listviewitem", onItemClick);
                element.on("keydown", onKeydown);
                initialized = true;
            }
            function clear() {
                initialized = false;
                if (listView) {
                    $(listView.element).off("click", ".listviewitem", onItemClick);
                    $(listView.element).off("keydown", onKeydown);
                }
            }
            function setSelectedItems(items) {
                setSelectedItemsCore(items);
                onSelectionChanged(getSelectedItems());
            }
            function setSelectedItemsCore(items) {
                if (!Array.isArray(items)) {
                    items = [ items ];
                }
                var children = listView.element.children();
                utils.each(parameter.availableValues, function(i, av) {
                    var selected = false;
                    utils.each(items, function(j, v) {
                        var availableValue = av.value;
                        if (v instanceof Date) {
                            availableValue = utils.parseToLocalDate(av.value);
                        }
                        selected = utils.areEqual(v, availableValue);
                        return !selected;
                    });
                    selectItem($(children[i]), selected);
                });
            }
            return {
                beginEdit: function(param) {
                    clear();
                    parameter = param;
                    $list.kendoListView({
                        template: '<div class="listviewitem">${name}</div>',
                        dataSource: {
                            data: parameter.availableValues
                        },
                        selectable: false,
                        navigatable: navigatableEnabledForList(options.enableAccessibility)
                    });
                    listView = $list.data("kendoListView");
                    init();
                },
                enable: function(enable) {
                    enabled = enable;
                    enableItem($list, enabled);
                },
                clearPendingChange: clearPendingChange,
                addAccessibility: function(param) {
                    var info = utils.stringFormat(sr.ariaLabelParameterInfo, [ param.availableValues.length ]);
                    addAccessibilityAttributes($list, sr.ariaLabelMultiSelect, param.text, info, param.Error);
                    $list.attr("aria-multiselectable", "true");
                    var items = $list.find(".listviewitem");
                    utils.each(items, function() {
                        $(this).attr("aria-label", this.innerText);
                    });
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($list, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.SingleSelect,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder);
            var enabled = true;
            $placeholder.html(options.templates["trv-parameter-editor-available-values"]);
            var $list = $placeholder.find(".list"), $selectNone = $placeholder.find(".select-none"), listView, parameter, valueChangeCallback = options.parameterChanged;
            if ($selectNone) {
                $selectNone.click(function(e) {
                    e.preventDefault();
                    listView.clearSelection();
                });
            }
            function onSelectionChanged(selection) {
                notifyParameterChanged(selection);
            }
            function notifyParameterChanged(selection) {
                var availableValues = parameter.availableValues, values = $.map(selection, function(item) {
                    return availableValues[$(item).index()].value;
                });
                if (Array.isArray(values)) {
                    values = values[0];
                }
                valueChangeCallback(parameter, values);
            }
            function getSelectedItems() {
                return listView.select();
            }
            function onChange() {
                onSelectionChanged(getSelectedItems());
            }
            function init() {
                setEditorTabIndex($list);
                setSelectedItems(parameter.value);
                listView.bind("change", onChange);
            }
            function reset() {
                if (listView) {
                    listView.unbind("change", onChange);
                }
            }
            function setSelectedItems(value) {
                var items = listView.element.children();
                utils.each(parameter.availableValues, function(i, av) {
                    var availableValue = av.value;
                    if (value instanceof Date) {
                        availableValue = utils.parseToLocalDate(av.value);
                    }
                    if (utils.areEqual(value, availableValue)) {
                        listView.select(items[i]);
                        return false;
                    }
                    return true;
                });
            }
            return {
                beginEdit: function(param) {
                    reset();
                    parameter = param;
                    if ($selectNone && !param.allowNull) {
                        $selectNone.hide();
                    }
                    $list.kendoListView({
                        template: '<div class="listviewitem">${name}</div>',
                        dataSource: {
                            data: parameter.availableValues
                        },
                        selectable: true,
                        navigatable: navigatableEnabledForList(options.enableAccessibility)
                    });
                    listView = $list.data("kendoListView");
                    init($list);
                },
                enable: function(enable) {
                    enabled = enable;
                    enableItem($list, enabled);
                    if (enabled) {
                        listView.bind("change", onChange);
                        $list.addClass("k-selectable");
                    } else {
                        listView.unbind("change", onChange);
                        $list.removeClass("k-selectable");
                    }
                },
                addAccessibility: function(param) {
                    var info = utils.stringFormat(sr.ariaLabelParameterInfo, [ param.availableValues.length ]);
                    addAccessibilityAttributes($list, sr.ariaLabelSingleValue, param.text, info, param.Error);
                    var items = $list.find(".listviewitem");
                    utils.each(items, function() {
                        $(this).attr("aria-label", this.innerText);
                    });
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($list, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.MultiValue,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder), parameter;
            $placeholder.html(options.templates["trv-parameter-editor-multivalue"]);
            var $textArea = $placeholder.find("textarea").on("change", function() {
                if (options.parameterChanged) {
                    options.parameterChanged(parameter, multivalueUtils.parseValues(this.value));
                }
            });
            function setValue(value) {
                parameter.value = value;
                $textArea.val(multivalueUtils.formatValue(value));
            }
            return {
                beginEdit: function(param) {
                    parameter = param;
                    setValue(param.value);
                    setEditorTabIndex($textArea);
                },
                enable: function(enable) {
                    enableItem($textArea, enable);
                    $textArea.prop("disabled", !enable);
                },
                addAccessibility: function(param) {
                    addAccessibilityAttributes($textArea, sr.ariaLabelMultiValue, param.text, null, param.Error);
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($textArea, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.DateTime,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder), parameter;
            $placeholder.html(options.templates["trv-parameter-editor-datetime"]);
            var $dateTimePicker = $placeholder.find("input[type=datetime]").kendoDatePicker({
                change: function() {
                    var handler = options.parameterChanged;
                    if (handler) {
                        var dtv = this.value();
                        if (null !== dtv) {
                            dtv = utils.adjustTimezone(dtv);
                        }
                        handler(parameter, dtv);
                    }
                }
            });
            var dateTimePicker = $dateTimePicker.data("kendoDatePicker");
            function setValue(value) {
                parameter.value = value;
                var dt = null;
                try {
                    if (value) {
                        dt = utils.unadjustTimezone(value);
                    }
                } catch (e) {
                    dt = null;
                }
                dateTimePicker.value(dt);
            }
            return {
                beginEdit: function(param) {
                    parameter = param;
                    setValue(param.value);
                    setEditorTabIndex($dateTimePicker);
                },
                enable: function(enable) {
                    dateTimePicker.enable(enable);
                    enableItem($dateTimePicker, enable);
                },
                addAccessibility: function(param) {
                    addAccessibilityAttributes($dateTimePicker, sr.ariaLabelParameterDateTime, param.text, null, param.Error);
                    $dateTimePicker.attr("aria-live", "assertive");
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($dateTimePicker, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.String,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder), parameter;
            $placeholder.html(options.templates["trv-parameter-editor-text"]);
            var $input = $placeholder.find('input[type="text"]').change(function() {
                if (options.parameterChanged) {
                    options.parameterChanged(parameter, $input.val());
                }
            });
            function setValue(value) {
                parameter.value = value;
                $input.val(value);
            }
            return {
                beginEdit: function(param) {
                    parameter = param;
                    setValue(param.value);
                    setEditorTabIndex($input);
                },
                enable: function(enabled) {
                    $input.prop("disabled", !enabled);
                    enableItem($input, enabled);
                },
                addAccessibility: function(param) {
                    addAccessibilityAttributes($input, sr.ariaLabelParameterString, param.text, null, param.Error);
                    $input.attr("aria-live", "assertive");
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($input, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.Number,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder), parameter, inputBehavior;
            $placeholder.html(options.templates["trv-parameter-editor-number"]);
            var $input = $placeholder.find("input[type=number]").on("change", function() {
                if (options.parameterChanged) {
                    options.parameterChanged(parameter, $input.val());
                }
            });
            function setValue(value) {
                parameter.value = value;
                $input.val(value);
            }
            return {
                beginEdit: function(param) {
                    if (inputBehavior) {
                        inputBehavior.dispose();
                    }
                    parameter = param;
                    $input.val(parameter.value);
                    if (parameter.type === trv.ParameterTypes.INTEGER) {
                        inputBehavior = integerInputBehavior($input);
                    } else {
                        inputBehavior = floatInputBehavior($input);
                    }
                    setEditorTabIndex($input);
                },
                enable: function(enable) {
                    $input.prop("disabled", !enable);
                    enableItem($input, enable);
                },
                addAccessibility: function(param) {
                    addAccessibilityAttributes($input, sr.ariaLabelParameterNumerical, param.text, null, param.Error);
                    $input.attr("aria-live", "assertive");
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($input, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.Boolean,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder), parameter;
            $placeholder.html(options.templates["trv-parameter-editor-boolean"]);
            var $input = $placeholder.find("input[type=checkbox]").on("change", function() {
                if (options.parameterChanged) {
                    options.parameterChanged(parameter, this.checked);
                }
            });
            function setValue(value) {
                parameter.value = value;
                $input[0].checked = value === true;
            }
            return {
                beginEdit: function(param) {
                    parameter = param;
                    setValue(param.value);
                    setEditorTabIndex($input);
                },
                enable: function(enable) {
                    enableItem($input, enable);
                    $input.attr("disabled", !enable);
                },
                addAccessibility: function(param) {
                    addAccessibilityAttributes($input, sr.ariaLabelParameterBoolean, param.text, null, param.Error);
                    $input.attr("aria-live", "assertive");
                },
                setAccessibilityErrorState: function(param) {
                    setAccessibilityErrorAttributes($input, param.Error);
                }
            };
        }
    }, {
        match: trv.parameterEditorsMatch.Default,
        createEditor: function(placeholder, options) {
            var $placeholder = $(placeholder);
            $placeholder.html('<div class="trv-parameter-editor-generic"></div>');
            return {
                beginEdit: function(parameter) {
                    $placeholder.find(".trv-parameter-editor-generic").html(parameter.Error ? "(error)" : parameter.value);
                },
                enable: function(enable) {}
            };
        }
    } ];
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr, utils = trv.utils;
    trv.parameterValidators = function() {
        var validators = {};
        function validateParameter(parameter, value, validatorFunc, compareFunc) {
            var values = [].concat(value).map(function(value1) {
                return checkAvailbaleValues(parameter, validatorFunc(value1), compareFunc);
            });
            if (parameter.multivalue) {
                if ((value == null || value.length == 0) && !parameter.allowNull) {
                    throw sr.invalidParameter;
                }
                return values;
            }
            return values[0];
        }
        function isNull(parameter, value) {
            return parameter.allowNull && -1 != [ null, "", undefined ].indexOf(value);
        }
        function checkAvailbaleValues(parameter, value, compareFunc) {
            if (parameter.availableValues) {
                var found = false;
                utils.each(parameter.availableValues, function(i, av) {
                    found = compareFunc(value, av.value);
                    return !found;
                });
                if (!found) {
                    if (parameter.allowNull && !value) {
                        return value;
                    }
                    throw sr.invalidParameter;
                }
            }
            return value;
        }
        validators[trv.ParameterTypes.STRING] = {
            validate: function(parameter, value) {
                return validateParameter(parameter, value, function(value) {
                    if (!value) {
                        if (parameter.allowNull) {
                            return null;
                        }
                        if (parameter.allowBlank) {
                            return "";
                        }
                        throw sr.parameterIsEmpty;
                    }
                    return value;
                }, function(s1, s2) {
                    return s1 == s2;
                });
            }
        };
        validators[trv.ParameterTypes.FLOAT] = {
            validate: function(parameter, value) {
                return validateParameter(parameter, value, function(value) {
                    var num = utils.tryParseFloat(value);
                    if (isNaN(num)) {
                        if (isNull(parameter, value)) {
                            return null;
                        }
                        throw sr.parameterIsEmpty;
                    }
                    return num;
                }, function(f1, f2) {
                    return utils.tryParseFloat(f1) == utils.tryParseFloat(f2);
                });
            }
        };
        validators[trv.ParameterTypes.INTEGER] = {
            validate: function(parameter, value) {
                return validateParameter(parameter, value, function(value) {
                    var num = utils.tryParseInt(value);
                    if (isNaN(num)) {
                        if (isNull(parameter, value)) {
                            return null;
                        }
                        throw sr.parameterIsEmpty;
                    }
                    return num;
                }, function(n1, n2) {
                    return utils.tryParseInt(n1) == utils.tryParseFloat(n2);
                });
            }
        };
        validators[trv.ParameterTypes.DATETIME] = {
            validate: function(parameter, value) {
                return validateParameter(parameter, value, function(value) {
                    if (parameter.allowNull && (value === null || value === "" || value === undefined)) {
                        return null;
                    }
                    if (!isNaN(Date.parse(value))) {
                        return utils.parseToLocalDate(value);
                    }
                    throw sr.invalidDateTimeValue;
                }, function(d1, d2) {
                    d1 = utils.parseToLocalDate(d1);
                    d2 = utils.parseToLocalDate(d2);
                    return d1.getTime() == d2.getTime();
                });
            }
        };
        validators[trv.ParameterTypes.BOOLEAN] = {
            validate: function(parameter, value) {
                return validateParameter(parameter, value, function(value) {
                    if (-1 != [ "true", "false" ].indexOf(("" + value).toLowerCase())) {
                        return Boolean(value);
                    }
                    if (isNull(parameter, value)) {
                        return null;
                    }
                    throw sr.parameterIsEmpty;
                }, function(b1, b2) {
                    return Boolean(b1) == Boolean(b2);
                });
            }
        };
        return {
            validate: function(parameter, value) {
                var v = validators[parameter.type];
                if (!v) {
                    throw utils.stringFormat(sr.cannotValidateType, parameter);
                }
                return v.validate(parameter, value);
            }
        };
    }();
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr, utils = trv.utils, parameterValidators = trv.parameterValidators;
    var defaultOptions = {};
    var Events = {
        PARAMETERS_READY: "pa.parametersReady",
        ERROR: "pa.Error"
    };
    function ParametersArea(placeholder, options, otherOptions) {
        options = $.extend({}, defaultOptions, options, otherOptions);
        var parametersArea = {};
        var $parametersArea = $(parametersArea);
        var editors = {};
        var controller = options.controller;
        if (!controller) {
            throw "No controller (telerikReporting.reportViewerController) has been specified.";
        }
        var parameterEditors = [].concat(options.parameterEditors, trv.parameterEditors);
        var recentParameterValues, parameters, initialParameterValues = undefined;
        var $placeholder = $(placeholder), $content = $placeholder.find(".trv-parameters-area-content"), $errorMessage = $placeholder.find(".trv-error-message"), $previewButton = $placeholder.find(".trv-parameters-area-preview-button"), noParametersContent = $placeholder.html();
        $previewButton.on("click", function(e) {
            e.preventDefault();
            if (allParametersValid()) {
                applyParameters();
            }
        });
        var parameterContainerTemplate = options.templates["trv-parameter"];
        var parametersAreaVisible = options.parametersAreaVisible !== false;
        var enableAccessibility = options.enableAccessibility;
        function createParameterContainer() {
            return $(parameterContainerTemplate);
        }
        function createParameterUI(parameter) {
            var $container = createParameterContainer(), $editorPlaceholder = $container.find(".trv-parameter-value"), $title = $container.find(".trv-parameter-title"), $error = $container.find(".trv-parameter-error"), $errorMessage = $container.find(".trv-parameter-error-message"), $useDefaultValueCheckbox = $container.find(".trv-parameter-use-default input"), editorFactory = selectParameterEditorFactory(parameter);
            var parameterText = parameter.text;
            var isHiddenParameter = !parameter.isVisible;
            if (isHiddenParameter) {
                parameterText += "<br />[<b>hidden</b>]";
            }
            $title.html(parameterText).attr("title", parameterText);
            $errorMessage.html(parameter.Error);
            (parameter.Error ? $.fn.show : $.fn.hide).call($error);
            var editor = editorFactory.createEditor($editorPlaceholder, {
                templates: options.templates,
                parameterChanged: function(parameter, newValue) {
                    try {
                        newValue = parameterValidators.validate(parameter, newValue);
                        $error.hide();
                        onParameterChanged(parameter, newValue);
                    } catch (error) {
                        parameter.Error = error;
                        parameter.value = [];
                        $errorMessage.html(error);
                        $error.show();
                        enablePreviewButton(false);
                    } finally {
                        setAccessibilityErrorState(parameter);
                    }
                },
                enableAccessibility: enableAccessibility
            });
            editors[parameter.id] = editor;
            editor.beginEdit(parameter);
            if (enableAccessibility && !isHiddenParameter) {
                editor.addAccessibility(parameter);
            }
            if ($useDefaultValueCheckbox.length > 0) {
                $useDefaultValueCheckbox.on("click", function() {
                    var useDefaultValue = $(this).is(":checked");
                    if (useDefaultValue) {
                        delete recentParameterValues[parameter.id];
                        delete initialParameterValues[parameter.id];
                        invalidateChildParameters(parameter);
                        updateParameters(onLoadParametersSuccess);
                    } else {
                        recentParameterValues[parameter.id] = parameter.value;
                        initialParameterValues[parameter.id] = parameter.value;
                    }
                    editor.enable(!useDefaultValue);
                    raiseParametersReady();
                });
                var hasInitialValues = initialParameterValues != null;
                if (hasInitialValues) {
                    if (!(parameter.id in initialParameterValues)) {
                        $useDefaultValueCheckbox.prop("checked", true);
                        editor.enable(false);
                    }
                } else if (isHiddenParameter) {
                    $useDefaultValueCheckbox.prop("checked", true);
                    editor.enable(false);
                }
            }
            return $container;
        }
        function setAccessibilityErrorState(parameter) {
            var editor = editors[parameter.id];
            if (!editor || !enableAccessibility) {
                return;
            }
            editor.setAccessibilityErrorState(parameter);
        }
        function enablePreviewButton(enabled) {
            if (enabled) {
                $previewButton.prop("disabled", false);
                $previewButton.removeClass("k-state-disabled");
            } else {
                $previewButton.prop("disabled", true);
                $previewButton.addClass("k-state-disabled");
            }
        }
        function selectParameterEditorFactory(parameter) {
            var factory;
            utils.each(parameterEditors, function() {
                if (this && this.match(parameter)) {
                    factory = this;
                }
                return !factory;
            });
            return factory;
        }
        function showError(error) {
            $errorMessage.html(error);
            (error ? $.fn.addClass : $.fn.removeClass).call($placeholder, "error");
        }
        function showPreviewButton() {
            (allParametersAutoRefresh(parameters) ? $.fn.removeClass : $.fn.addClass).call($placeholder, "preview");
        }
        function allParametersAutoRefresh() {
            var allAuto = true;
            utils.each(parameters, function() {
                return allAuto = !this.isVisible || this.autoRefresh;
            });
            return allAuto;
        }
        function allParametersValid() {
            var allValid = true;
            utils.each(parameters, function() {
                return allValid = !this.Error;
            });
            return allValid;
        }
        function fill(newParameters) {
            recentParameterValues = {};
            parameters = newParameters || [];
            editors = {};
            var $parameterContainer, $tempContainer = $("<div></div>");
            utils.each(parameters, function() {
                try {
                    this.value = parameterValidators.validate(this, this.value);
                } catch (e) {
                    this.Error = this.Error || e;
                }
                var hasError = Boolean(this.Error), hasValue = !hasError;
                if (hasValue) {
                    recentParameterValues[this.id] = this.value;
                } else {
                    this.Error = sr.invalidParameter;
                }
                if (this.isVisible || options.showHiddenParameters) {
                    if ($parameterContainer = createParameterUI(this)) {
                        $tempContainer.append($parameterContainer);
                    }
                }
            });
            if (initialParameterValues !== undefined) {
                if (null == initialParameterValues) {
                    initialParameterValues = {};
                    utils.each(parameters, function() {
                        if (this.isVisible) {
                            initialParameterValues[this.id] = this.value;
                        } else {
                            delete recentParameterValues[this.id];
                        }
                    });
                } else {
                    utils.each(parameters, function() {
                        if (!(this.id in initialParameterValues)) {
                            delete recentParameterValues[this.id];
                        }
                    });
                }
            }
            $content.empty();
            if (parameters.length > 0) {
                $content.append($tempContainer.children());
                if (enableAccessibility) {
                    $content.attr("aria-label", "Parameters area. Contains " + parameters.length + " parameters.");
                }
            } else {
                $content.append(noParametersContent);
            }
            showPreviewButton(parameters);
            var allValid = allParametersValid();
            enablePreviewButton(allValid);
        }
        function applyParameters() {
            controller.setParameters($.extend({}, recentParameterValues));
            controller.previewReport(false);
        }
        function allParametersValidForAutoRefresh() {
            var triggerAutoUpdate = true;
            for (var i = parameters.length - 1; triggerAutoUpdate && i >= 0; i--) {
                var p = parameters[i];
                triggerAutoUpdate = p.id in recentParameterValues && (Boolean(p.autoRefresh) || !p.isVisible);
            }
            return triggerAutoUpdate;
        }
        function raiseParametersReady() {
            parametersArea.parametersReady(recentParameterValues);
        }
        function tryRefreshReport() {
            raiseParametersReady();
            if (allParametersValidForAutoRefresh()) {
                applyParameters();
            }
        }
        function invalidateChildParameters(parameter) {
            if (parameter.childParameters) {
                utils.each(parameter.childParameters, function(index, parameterId) {
                    var childParameter = getParameterById(parameterId);
                    if (childParameter) {
                        invalidateChildParameters(childParameter);
                    }
                    delete recentParameterValues[parameterId];
                    resetPendingParameterChange(parameterId);
                });
            }
        }
        function resetPendingParameterChange(parameterId) {
            if (editors) {
                var editor = editors[parameterId];
                if (editor && typeof editor.clearPendingChange === "function") {
                    editor.clearPendingChange();
                }
            }
        }
        function onParameterChanged(parameter, newValue) {
            delete parameter["Error"];
            parameter.value = newValue;
            recentParameterValues[parameter.id] = newValue;
            if (initialParameterValues !== undefined) {
                if (parameter.id in initialParameterValues) {
                    recentParameterValues[parameter.id] = newValue;
                }
            } else {
                recentParameterValues[parameter.id] = newValue;
            }
            invalidateChildParameters(parameter);
            if (parameter.childParameters) {
                updateParameters(tryRefreshReport);
            } else {
                var allValid = allParametersValid();
                enablePreviewButton(allValid);
                if (allValid) {
                    tryRefreshReport();
                }
            }
        }
        function getParameterById(parameterId) {
            if (parameters) {
                for (var i = 0; i < parameters.length; i++) {
                    var p = parameters[i];
                    if (p.id === parameterId) {
                        return p;
                    }
                }
            }
            return null;
        }
        function setParametersAreaVisibility(visible) {
            controller.setParametersAreaVisible({
                visible: visible
            });
        }
        function hasVisibleParameters(params) {
            if (!params || null === params) {
                return false;
            }
            var result = false;
            utils.each(params, function() {
                result = this.isVisible;
                return !result;
            });
            return result;
        }
        var loadingCount = 0;
        function beginLoad() {
            loadingCount++;
            $placeholder.addClass("loading");
        }
        function endLoad() {
            if (loadingCount > 0) {
                if (0 == --loadingCount) {
                    $placeholder.removeClass("loading");
                }
            }
        }
        function onLoadParametersComplete(params, successAction) {
            var showParamsArea = hasVisibleParameters(params) && parametersAreaVisible;
            if (!showParamsArea) {
                showParametersArea(false);
            }
            fill(params);
            showError("");
            if (showParamsArea) {
                showParametersArea(true);
            }
            controller.updateUIInternal();
            if (typeof successAction === "function") {
                successAction();
            }
            endLoad();
        }
        function updateParameters(successAction) {
            acceptParameters(controller.loadParameters(recentParameterValues), successAction);
        }
        function acceptParameters(controllerLoadParametersPromise, successAction) {
            beginLoad();
            controllerLoadParametersPromise.then(function(parameters) {
                onLoadParametersComplete(parameters, successAction);
            }).catch(function(error) {
                endLoad();
                clear();
                if (!$placeholder.hasClass("hidden")) {
                    showError(error);
                }
                parametersArea.error(error);
            });
        }
        function getEventHandlerFromArguments(args) {
            var arg0;
            if (args && args.length) {
                arg0 = args[0];
            }
            if (typeof arg0 == "function") {
                return arg0;
            }
            return null;
        }
        function eventFactory(event, args) {
            var h = getEventHandlerFromArguments(args);
            if (h) {
                $parametersArea.on(event, h);
            } else {
                $parametersArea.trigger(event, args);
            }
            return controller;
        }
        function onLoadParametersSuccess() {
            if (initialParameterValues === null) {
                initialParameterValues = $.extend({}, recentParameterValues);
            }
            raiseParametersReady();
        }
        function showParametersArea(show) {
            (show ? $.fn.removeClass : $.fn.addClass).call($placeholder, "hidden");
        }
        function onReloadParameters(event, controllerLoadParametersPromise) {
            showError();
            $content.empty();
            acceptParameters(controllerLoadParametersPromise, onLoadParametersSuccess);
        }
        controller.reloadParameters(onReloadParameters).getParametersAreaState(function(event, args) {
            var parametersAreaNecessary = false;
            if (parameters) {
                parametersAreaNecessary = hasVisibleParameters(parameters);
            }
            args.enabled = parametersAreaNecessary;
            args.visible = parametersAreaVisible;
        }).setParametersAreaVisible(function(event, args) {
            parametersAreaVisible = args.visible;
            showParametersArea(args.visible && hasVisibleParameters(parameters));
        }).beforeLoadReport(function() {
            loadingCount = 0;
            beginLoad();
        }).error(endLoad).pageReady(function() {
            endLoad();
        });
        function clear() {
            fill([]);
        }
        $.extend(parametersArea, {
            allParametersValid: function() {
                return allParametersValid();
            },
            clear: function() {
                clear();
            },
            error: function() {
                return eventFactory(Events.ERROR, arguments);
            },
            parametersReady: function() {
                return eventFactory(Events.PARAMETERS_READY, arguments);
            },
            setParameters: function(parameterValues) {
                initialParameterValues = null === parameterValues ? null : $.extend({}, parameterValues);
            }
        });
        return parametersArea;
    }
    var pluginName = "telerik_ReportViewer_ParametersArea";
    $.fn[pluginName] = function(options, otherOptions) {
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new ParametersArea(this, options, otherOptions));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    function uiController(options) {
        var stateFlags = {
            ExportInProgress: 1 << 0,
            PrintInProgress: 1 << 1
        };
        function getState(flags) {
            return (state & flags) != 0;
        }
        function setState(flags, value) {
            if (value) {
                state |= flags;
            } else {
                state &= ~flags;
            }
        }
        var controller = options.controller, historyManager = options.history, state = 0, refreshUI, commands = options.commands;
        if (!controller) {
            throw "No controller (telerikReporting.ReportViewerController) has been specified.";
        }
        function getDocumentMapState() {
            var args = {};
            controller.getDocumentMapState(args);
            return args;
        }
        function getParametersAreaState() {
            var args = {};
            controller.getParametersAreaState(args);
            return args;
        }
        function updateUI() {
            if (!refreshUI) {
                refreshUI = true;
                window.setTimeout(function() {
                    try {
                        updateUICore();
                    } finally {
                        refreshUI = false;
                    }
                }, 10);
            }
        }
        function updateUICore() {
            var rs = controller.reportSource();
            var pageCount = controller.pageCount();
            var currentPageNumber = controller.currentPageNumber();
            var hasReport = rs && rs.report;
            var hasPages = hasReport && pageCount > 0;
            var nextPage = hasPages && currentPageNumber < pageCount;
            var prevPage = hasPages && currentPageNumber > 1;
            var hasPage = hasPages && currentPageNumber;
            var documentMapState = getDocumentMapState();
            var parametersAreaState = getParametersAreaState();
            commands.goToFirstPage.enabled(prevPage);
            commands.goToPrevPage.enabled(prevPage);
            commands.goToLastPage.enabled(nextPage);
            commands.goToNextPage.enabled(nextPage);
            commands.goToPage.enabled(hasPages);
            commands.print.enabled(hasPages && !getState(stateFlags.PrintInProgress));
            commands.export.enabled(hasPages && !getState(stateFlags.ExportInProgress));
            commands.refresh.enabled(hasReport);
            commands.historyBack.enabled(historyManager && historyManager.canMoveBack());
            commands.historyForward.enabled(historyManager && historyManager.canMoveForward());
            commands.toggleDocumentMap.enabled(hasReport && documentMapState.enabled).checked(documentMapState.enabled && documentMapState.visible);
            commands.toggleParametersArea.enabled(hasReport && parametersAreaState.enabled).checked(parametersAreaState.enabled && parametersAreaState.visible);
            commands.togglePrintPreview.enabled(hasPages).checked(controller.viewMode() == trv.ViewModes.PRINT_PREVIEW);
            commands.zoom.enabled(hasPage);
            commands.zoomIn.enabled(hasPage);
            commands.zoomOut.enabled(hasPage);
            commands.toggleZoomMode.enabled(hasPage);
            controller.updateUI(null);
            try {
                controller.pageNumberChange(currentPageNumber);
                controller.pageCountChange(pageCount);
            } finally {}
        }
        function getScaleMode() {
            var args = {};
            controller.getScale(args);
            return args.scaleMode;
        }
        controller.scale(function(event, args) {
            commands.toggleZoomMode.checked(args.scaleMode == trv.ScaleModes.FIT_PAGE);
        });
        controller.currentPageChanged(updateUI);
        controller.beforeLoadReport(updateUI);
        controller.reportLoadProgress(updateUI);
        controller.reportLoadComplete(updateUI);
        controller.reportSourceChanged(updateUI);
        controller.viewModeChanged(updateUI);
        controller.setParametersAreaVisible(updateUI);
        controller.setDocumentMapVisible(updateUI);
        controller.exportStarted(function() {
            setState(stateFlags.ExportInProgress, true);
            updateUI();
        });
        controller.exportReady(function() {
            setState(stateFlags.ExportInProgress, false);
            updateUI();
        });
        controller.printStarted(function() {
            setState(stateFlags.PrintInProgress, true);
            updateUI();
        });
        controller.printReady(function() {
            setState(stateFlags.PrintInProgress, false);
            updateUI();
        });
        controller.error(function() {
            setState(stateFlags.ExportInProgress, false);
            setState(stateFlags.PrintInProgress, false);
            updateUI();
        });
        controller.updateUIInternal(updateUI);
        updateUI();
    }
    trv.uiController = uiController;
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, window, document, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    trv.HistoryManager = function(options) {
        var controller = options.controller;
        var clientHasExpired = false;
        if (!controller) {
            throw "No controller (telerikReporting.reportViewerController) has been specified.";
        }
        var settings = options.settings, history = settings.history() || {
            records: [],
            position: -1
        };
        controller.onLoadedReportChange(function() {
            clientHasExpired = false;
            addToHistory(true);
        }).currentPageChanged(function() {
            updatePageInfo();
        }).reportLoadComplete(function(event, args) {
            addToHistory(false);
        }).clientExpired(function() {
            clientHasExpired = true;
            var records = history.records;
            for (var i = 0; i < records.length; i++) {
                records[i].reportDocumentId = null;
            }
        });
        function getCurrentRecord() {
            var records = history.records;
            if (records.length > 0) {
                return records[history.position];
            }
            return null;
        }
        function pushRecord(rec) {
            var records = history.records, position = history.position;
            records = Array.prototype.slice.call(records, 0, position + 1);
            records.push(rec);
            history.records = records;
            history.position = records.length - 1;
            saveSettings();
        }
        function saveSettings() {
            settings.history(history);
        }
        function updatePageInfo() {
            var currentRecord = getCurrentRecord();
            if (currentRecord) {
                currentRecord.pageNumber = controller.currentPageNumber();
                currentRecord.viewMode = controller.viewMode();
                currentRecord.reportDocumentId = controller.reportDocumentIdExposed();
                saveSettings();
            }
        }
        function addToHistory(temp) {
            removeTempRecordsFromHistory();
            var currentRecord = getCurrentRecord();
            var rs = controller.reportSource();
            if (!currentRecord || !utils.reportSourcesAreEqual(currentRecord.reportSource, rs)) {
                pushRecord({
                    reportSource: rs,
                    pageNumber: 1,
                    temp: temp
                });
            }
        }
        function exec(currentRecord) {
            controller.setViewMode(currentRecord.viewMode);
            controller.reportSource(currentRecord.reportSource);
            controller.refreshReport(false, currentRecord.reportDocumentId);
            controller.navigateToPage(currentRecord.pageNumber);
        }
        function canMove(step) {
            var position = history.position, length = history.records.length, newPos = position + step;
            return 0 <= newPos && newPos < length;
        }
        function move(step) {
            var position = history.position, length = history.records.length, newPos = position + step;
            if (newPos < 0) {
                newPos = 0;
            } else if (newPos >= length) {
                newPos = length - 1;
            }
            if (newPos != position) {
                history.position = newPos;
                saveSettings();
                exec(getCurrentRecord());
            }
        }
        function removeTempRecordsFromHistory() {
            var lastIndex = history.records.length - 1;
            while (lastIndex >= 0) {
                if (history.records[lastIndex].temp === true) {
                    history.records.splice(lastIndex, 1);
                    if (history.position >= lastIndex) {
                        history.position--;
                    }
                } else {
                    break;
                }
                lastIndex--;
            }
        }
        return {
            back: function() {
                move(-1);
            },
            forward: function() {
                move(+1);
            },
            canMoveBack: function() {
                return canMove(-1);
            },
            canMoveForward: function() {
                return canMove(1);
            },
            loadCurrent: function() {
                var rec = getCurrentRecord();
                if (rec) {
                    exec(rec);
                }
                return Boolean(rec);
            }
        };
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    var scaleTransitionMap = {};
    scaleTransitionMap[trv.ScaleModes.FIT_PAGE] = {
        scaleMode: trv.ScaleModes.FIT_PAGE_WIDTH
    };
    scaleTransitionMap[trv.ScaleModes.FIT_PAGE_WIDTH] = {
        scaleMode: trv.ScaleModes.SPECIFIC,
        scale: 1
    };
    scaleTransitionMap[trv.ScaleModes.SPECIFIC] = {
        scaleMode: trv.ScaleModes.FIT_PAGE
    };
    var scaleValues = [ .1, .25, .5, .75, 1, 1.5, 2, 4, 8 ];
    function CommandSet(options) {
        var controller = options.controller;
        if (!controller) {
            throw "No options.controller.";
        }
        var historyManager = options.history;
        if (!historyManager) {
            throw "No options.history.";
        }
        function getDocumentMapVisible() {
            var args = {};
            controller.getDocumentMapState(args);
            return Boolean(args.visible);
        }
        function getParametersAreaVisible() {
            var args = {};
            controller.getParametersAreaState(args);
            return Boolean(args.visible);
        }
        return {
            historyBack: new command(function() {
                historyManager.back();
            }),
            historyForward: new command(function() {
                historyManager.forward();
            }),
            goToPrevPage: new command(function() {
                controller.navigateToPage(controller.currentPageNumber() - 1);
            }),
            goToNextPage: new command(function() {
                controller.navigateToPage(controller.currentPageNumber() + 1);
            }),
            goToFirstPage: new command(function() {
                controller.navigateToPage(1);
            }),
            goToLastPage: new command(function() {
                controller.navigateToPage(controller.pageCount());
            }),
            goToPage: new command(function(pageNumber) {
                if (!isNaN(pageNumber)) {
                    var pageCount = controller.pageCount();
                    if (pageNumber > pageCount) {
                        pageNumber = pageCount;
                    } else if (pageNumber < 1) {
                        pageNumber = 1;
                    }
                    controller.navigateToPage(pageNumber);
                    return pageNumber;
                }
            }),
            refresh: new command(function() {
                controller.refreshReport(true);
            }),
            "export": new command(function(format) {
                if (format) {
                    controller.exportReport(format);
                }
            }),
            print: new command(function() {
                controller.printReport();
            }),
            togglePrintPreview: new command(function() {
                controller.viewMode(controller.viewMode() == trv.ViewModes.PRINT_PREVIEW ? trv.ViewModes.INTERACTIVE : trv.ViewModes.PRINT_PREVIEW);
            }),
            toggleDocumentMap: new command(function() {
                controller.setDocumentMapVisible({
                    visible: !getDocumentMapVisible()
                });
            }),
            toggleParametersArea: new command(function() {
                controller.setParametersAreaVisible({
                    visible: !getParametersAreaVisible()
                });
            }),
            zoom: new command(function(scale) {
                controller.scale({
                    scale: 1
                });
            }),
            zoomIn: new command(function() {
                zoom(1);
            }),
            zoomOut: new command(function() {
                zoom(-1);
            }),
            toggleSideMenu: new command(function() {
                $(controller).trigger(controller.Events.TOGGLE_SIDE_MENU);
            }),
            toggleZoomMode: new command(function() {
                var args = {};
                controller.getScale(args);
                controller.scale(scaleTransitionMap[args.scaleMode]);
            })
        };
        function zoom(step) {
            var args = {};
            controller.getScale(args);
            args.scale = getZoomScale(args.scale, step);
            args.scaleMode = trv.ScaleModes.SPECIFIC;
            controller.scale(args);
        }
        function getZoomScale(scale, steps) {
            var pos = -1, length = scaleValues.length;
            for (var i = 0; i < length; i++) {
                var value = scaleValues[i];
                if (scale < value) {
                    pos = i - .5;
                    break;
                }
                if (scale == value) {
                    pos = i;
                    break;
                }
            }
            pos = pos + steps;
            if (steps >= 0) {
                pos = Math.round(pos - .49);
            } else {
                pos = Math.round(pos + .49);
            }
            if (pos < 0) {
                pos = 0;
            } else if (pos > length - 1) {
                pos = length - 1;
            }
            return scaleValues[pos];
        }
    }
    trv.CommandSet = CommandSet;
    function command(execCallback) {
        var enabledState = true;
        var checkedState = false;
        var cmd = {
            enabled: function(state) {
                if (arguments.length == 0) {
                    return enabledState;
                }
                var newState = Boolean(state);
                enabledState = newState;
                $(this).trigger("enabledChanged");
                return cmd;
            },
            checked: function(state) {
                if (arguments.length == 0) {
                    return checkedState;
                }
                var newState = Boolean(state);
                checkedState = newState;
                $(this).trigger("checkedChanged");
                return cmd;
            },
            exec: execCallback
        };
        return cmd;
    }
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    var lastSelectedMenuItem, lastSelectedSubmenuItem;
    function MainMenu(dom, options, otherOptions) {
        options = $.extend({}, options, otherOptions);
        var menu = $(dom).data("kendoMenu"), childrenL1 = dom.childNodes, controller = options.controller, enableAccessibility = options.enableAccessibility, DEFAULT_TABINDEX = 1;
        if (!menu) {
            init();
        }
        controller.reportLoadComplete(function(e, args) {
            if (enableAccessibility) {} else {
                if (menu && menu._oldHoverItem) {
                    menu._oldHoverItem.toggleClass("k-state-focused");
                }
            }
        });
        function init() {
            menu = $(dom).kendoMenu().data("kendoMenu"), menu.bind("open", onSubmenuOpen);
            menu.bind("activate", onSubmenuActivate);
            menu.bind("deactivate", onSubmenuDeactivate);
            menu.element.off("keydown", onMenuKeyDown);
            menu.element.on("keydown", onMenuKeyDown);
            if (options.enableAccessibility) {
                setTabIndexes();
            }
        }
        function setTabIndexes() {
            var $menus = $.find('[data-role="telerik_ReportViewer_MainMenu"]');
            utils.each($menus, function() {
                var $menuArea = $(this);
                var listItems = $menuArea.find("li");
                var menuTabIndex = 0;
                var tabIndexAttr = $menuArea.attr("tabIndex");
                if (tabIndexAttr) {
                    menuTabIndex = utils.tryParseInt(tabIndexAttr);
                    if (!menuTabIndex || isNaN(menuTabIndex)) {
                        menuTabIndex = 0;
                    }
                }
                setMenuItemsTabIndexes(listItems, menuTabIndex);
                var pager = listItems.find('input[data-role="telerik_ReportViewer_PageNumberInput"]');
                if (pager.length > 0) {
                    pager.attr("tabindex", menuTabIndex);
                }
            });
        }
        function setMenuItemsTabIndexes(listItems, menuTabIndex) {
            utils.each(listItems, function() {
                var $item = $(this);
                $item.attr("tabindex", menuTabIndex);
                $item.focus(function() {
                    $item.addClass("k-state-focused");
                });
                $item.blur(function() {
                    $item.removeClass("k-state-focused");
                });
                var anchor = $item.children("a");
                if (anchor.length > 0) {
                    var $anchor = $(anchor);
                    $anchor.attr("tabindex", -1);
                    $item.attr("title", $anchor.attr("title"));
                }
                $item.off("keydown");
                $item.on("keydown", function(event) {
                    if (event.which == kendo.keys.ENTER) {
                        clickOnMenuItem($item);
                        lastSelectedMenuItem = $item;
                    }
                });
            });
        }
        function onSubmenuOpen(e) {
            var $item = $(e.item);
            if ($item.children("ul[data-command-list=export-format-list]").length > 0) {
                menu.unbind("open", onSubmenuOpen);
                menu.append({
                    text: sr.loadingFormats,
                    spriteCssClass: "k-icon k-loading"
                }, $item);
                controller.getDocumentFormats().then(fillFormats).then(function() {
                    menu.open($item);
                });
            }
        }
        function fillFormats(formats) {
            utils.each($(dom).find("ul[data-command-list=export-format-list]"), function() {
                var $list = $(this), $parent = $list.parents("li");
                menu.remove($list.children("li"));
                var tabIndex = enableAccessibility ? $parent.attr("tabindex") : -1;
                if (!tabIndex) {
                    tabIndex = 1;
                }
                utils.each(formats, function() {
                    var format = this;
                    var ariaLabel = enableAccessibility ? utils.stringFormat('aria-label="{localizedName}" ', format) : " ";
                    var li = "<li " + ariaLabel + utils.stringFormat('tabindex="' + tabIndex + '"><a tabindex="-1" href="#" data-command="telerik_ReportViewer_export" data-command-parameter="{name}"><span>{localizedName}</span></a></li>', format);
                    menu.append(li, $parent);
                });
                if (enableAccessibility) {
                    setInternalListAccessibilityKeyEvents($parent.find("li"));
                }
            });
        }
        function setInternalListAccessibilityKeyEvents(listItems) {
            utils.each(listItems, function() {
                var $item = $(this);
                $item.off("keydown");
                $item.on("keydown", function(event) {
                    switch (event.which) {
                      case kendo.keys.ENTER:
                        clickOnMenuItem($item);
                        break;

                      case kendo.keys.UP:
                        var $prev = $item.prev();
                        if ($prev.length > 0) {
                            $prev.focus();
                        } else {
                            $item.parents("li").focus();
                        }
                        break;

                      case kendo.keys.DOWN:
                        var $next = $item.next();
                        if ($next.length > 0) {
                            $next.focus();
                        } else {
                            $item.parent().children("li").first().focus();
                        }
                        break;
                    }
                });
            });
        }
        function clickOnMenuItem(item) {
            if (item && item.length > 0) {
                var anchor = item.children("a");
                if (anchor.length > 0) {
                    anchor.click();
                }
            }
        }
        function onSubmenuActivate(e) {
            var $item = $(e.item);
            focusOnFirstSubmenuItem($item);
        }
        function onSubmenuDeactivate(e) {
            lastSelectedSubmenuItem = undefined;
        }
        function focusOnFirstSubmenuItem(parentItem) {
            if (lastSelectedMenuItem && lastSelectedMenuItem.is(parentItem)) {
                window.setTimeout(function() {
                    var li = parentItem.find("li");
                    if (li.length > 0) {
                        li[0].focus();
                    }
                }, 100);
            }
        }
        function onMenuKeyDown(e) {
            switch (e.which) {
              case kendo.keys.ENTER:
                if (!enableAccessibility) {
                    var $item = getFocusedItem();
                    if ($item.length > 0) {
                        if (isItemExportContainer($item) && lastSelectedSubmenuItem) {
                            $item = lastSelectedSubmenuItem;
                        }
                        clickOnMenuItem($item);
                    }
                }
                break;

              case kendo.keys.RIGHT:
                enableAccessibility ? focusNextItemAccessibilitySelection() : focusNextItemNativeMenuSelection();
                break;

              case kendo.keys.LEFT:
                enableAccessibility ? focusPreviousItemAccessibilitySelection() : focusPreviousItemNativeMenuSelection();
                break;

              case kendo.keys.DOWN:
              case kendo.keys.UP:
                if (!enableAccessibility) {
                    lastSelectedSubmenuItem = getKendoFocusedNestedItem();
                }
            }
        }
        function getFocusedItem() {
            var $item;
            var focusedItem = document.activeElement;
            if (focusedItem && focusedItem.localName == "li") {
                var items = $(childrenL1).filter("li.k-item");
                for (var i = 0; i < items.length; i++) {
                    var listItem = items[i];
                    if (focusedItem === listItem) {
                        $item = $(listItem);
                        break;
                    }
                }
            } else {
                $item = menu.element.children("li.k-item.k-state-focused");
                if ($item.length == 0) {
                    $item = menu.element.children("li.k-item").first();
                }
            }
            return $item;
        }
        function focusNextItemAccessibilitySelection() {
            var $item = getFocusedItem();
            if (!$item || !$item.length > 0) {
                return;
            }
            var $next = $item.next();
            if (!$next.length > 0) {
                $next = $(childrenL1).filter("li.k-item").first();
            }
            $next.focus();
        }
        var lastKendoFocusedItem;
        function focusNextItemNativeMenuSelection() {
            var allItems = menu.element.children("li.k-item");
            var $focused = allItems.filter(".k-state-focused");
            if (kendo.version >= "2017.3.913") {
                lastKendoFocusedItem = $focused;
                return;
            }
            if ($focused.hasClass("k-state-disabled")) {
                if (!lastKendoFocusedItem || $focused.is(lastKendoFocusedItem)) {
                    var $next = $focused.next();
                    if (!$next.length > 0) {
                        $next = allItems.first();
                    }
                    $focused.toggleClass("k-state-focused");
                    $next.toggleClass("k-state-focused");
                    lastKendoFocusedItem = $next;
                    menu._oldHoverItem = $next;
                } else {
                    lastKendoFocusedItem = $focused;
                }
            } else {
                menu._oldHoverItem = $focused;
                lastKendoFocusedItem = $focused;
            }
        }
        function focusPreviousItemAccessibilitySelection() {
            var $item = getFocusedItem();
            if (!$item || !$item.length > 0) {
                return;
            }
            var $prev = $item.prev();
            if (!$prev.length > 0) {
                $prev = $(childrenL1).filter("li.k-item").last();
            }
            $prev.focus();
        }
        function focusPreviousItemNativeMenuSelection() {
            var $focused = menu.element.children("li.k-item.k-state-focused");
            lastKendoFocusedItem = $focused;
        }
        function getKendoFocusedNestedItem() {
            var $focused = menu.element.find('li.k-item.k-state-focused [data-command="telerik_ReportViewer_export"]');
            if ($focused.length == 1) {
                return $focused.parent("li");
            }
            return undefined;
        }
        function isItemExportContainer(item) {
            if (item.length == 0) {
                return;
            }
            var id = item.attr("id");
            return id == "main-menu-export-command" || id == "side-menu-export-command";
        }
    }
    var pluginName = "telerik_ReportViewer_MainMenu";
    $.fn[pluginName] = function(options, otherOptions) {
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new MainMenu(this, options, otherOptions));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReporting.utils";
    }
    var loadingFormats, panelBar;
    function SideMenu(dom, options, otherOptions) {
        options = $.extend({}, options, otherOptions);
        var enableAccessibility = options.enableAccessibility, lastSelectedMenuItem, DEFAULT_TABINDEX = 3;
        var controller = options.controller;
        if (!controller) {
            throw "No controller (telerikReporting.ReportViewerController) has been specified.";
        }
        init(dom);
        function init(root) {
            var $root = $(root);
            panelBar = $root.children("ul").kendoPanelBar().data("kendoPanelBar");
            panelBar.bind("expand", onSubmenuOpen);
            panelBar.element.off("keydown", onPanelKeyDown);
            panelBar.element.on("keydown", onPanelKeyDown);
            setTabIndexes($root);
            enableCloseOnClick($root);
            $root.click(function(e) {
                if (e.target == root) {
                    $(options.controller).trigger(options.controller.Events.TOGGLE_SIDE_MENU);
                }
            });
        }
        $(controller).on(controller.Events.TOGGLE_SIDE_MENU, function() {
            setSideMenuVisibility();
            if (enableAccessibility) {
                panelBar.element.focus();
            }
        });
        function setSideMenuVisibility() {
            var $root = panelBar.element.parent();
            var hidden = $root.position().left < 0 || !$root.is(":visible");
            if (hidden) {
                $root.show();
            } else {
                window.setTimeout(function() {
                    $root.hide();
                }, 500);
            }
        }
        function onSubmenuOpen(e) {
            var $item = $(e.item);
            if ($item.children("ul[data-command-list=export-format-list]").length > 0) {
                panelBar.unbind("expand", onSubmenuOpen);
                panelBar.append({
                    text: sr.loadingFormats,
                    spriteCssClass: "k-icon k-loading"
                }, $item);
                options.controller.getDocumentFormats().then(fillFormats).then(function() {
                    panelBar.expand($item);
                });
            }
        }
        function fillFormats(formats) {
            utils.each($(dom).find("ul[data-command-list=export-format-list]"), function() {
                var $list = $(this), $parent = $list.parents("li");
                panelBar.remove($list.children("li"));
                var tabIndex = $parent.attr("tabindex");
                if (!tabIndex) {
                    tabIndex = DEFAULT_TABINDEX;
                }
                utils.each(formats, function(i) {
                    var format = this;
                    var ariaLabel = enableAccessibility ? utils.stringFormat('aria-label="{localizedName}" ', format) : " ";
                    var li = "<li " + ariaLabel + utils.stringFormat('tabindex="' + tabIndex + '"><a tabindex="-1" href="#" data-command="telerik_ReportViewer_export" data-command-parameter="{name}"><span>{localizedName}</span></a></li>', format);
                    panelBar.append(li, $parent);
                });
                setListItemsTabIndex($parent.find("li"), tabIndex);
                enableCloseOnClick($parent);
            });
        }
        function focusOnFirstSubmenuItem(parentItem) {
            if (lastSelectedMenuItem && lastSelectedMenuItem.is(parentItem)) {
                window.setTimeout(function() {
                    var li = parentItem.find("li");
                    if (li.length > 0) {
                        li[0].focus();
                    }
                }, 100);
            }
        }
        function enableCloseOnClick(root) {
            utils.each(root.find("li"), function() {
                var isLeaf = $(this).children("ul").length == 0;
                if (isLeaf) {
                    $(this).children("a").click(function() {
                        $(options.controller).trigger(options.controller.Events.TOGGLE_SIDE_MENU);
                    });
                }
            });
        }
        function setTabIndexes(root) {
            if (!root) {
                return;
            }
            var $list = root.children("ul");
            var parentTabIndex = root.attr("tabindex");
            var listIndex = parentTabIndex ? parentTabIndex : DEFAULT_TABINDEX;
            setListItemsTabIndex($list, listIndex);
        }
        function setListItemsTabIndex(list, tabIndex) {
            list.attr("tabindex", tabIndex);
            var items = list.find("li");
            utils.each(items, function() {
                var $item = $(this);
                $item.attr("tabindex", tabIndex);
                var anchor = $item.children("a");
                if (anchor.length > 0) {
                    var $anchor = $(anchor);
                    $anchor.attr("tabindex", -1);
                }
                $item.focus(function() {
                    var anchor = $item.children("a");
                    if (anchor.length > 0) {
                        anchor.addClass("k-state-focused");
                    }
                });
                $item.blur(function() {
                    var anchor = $item.children("a");
                    if (anchor.length > 0) {
                        anchor.removeClass("k-state-focused");
                    }
                });
                $item.off("keydown", onItemKeyDown);
                $item.on("keydown", onItemKeyDown);
            });
        }
        function onPanelKeyDown(e) {
            if (e.which == kendo.keys.ENTER) {
                var $item;
                var isSelectedFocusedItem = false;
                var focusedItem = document.activeElement;
                if (focusedItem && focusedItem.localName == "li") {
                    var items = panelBar.element.find("li.k-item");
                    for (var i = 0; i < items.length; i++) {
                        var listItem = items[i];
                        if (focusedItem === listItem) {
                            $item = $(listItem);
                            isSelectedFocusedItem = true;
                            break;
                        }
                    }
                } else {
                    $item = panelBar.select();
                }
                if (!$item || !$item.length > 0) {
                    return;
                }
                handleItemSelect($item, isSelectedFocusedItem);
            }
        }
        function onItemKeyDown(e) {
            if (e.which == kendo.keys.ENTER) {
                handleItemSelect($(e.target), false);
            }
        }
        function handleItemSelect(item, handleExpandCollapse) {
            if (!item.length > 0) {
                return;
            }
            lastSelectedMenuItem = item;
            var isLeaf = item.children("ul").length == 0;
            if (!isLeaf) {
                if (handleExpandCollapse) {
                    if (item.hasClass("k-state-active")) {
                        panelBar.collapse(item);
                    } else {
                        panelBar.expand(item);
                    }
                }
            } else {
                var $anchor = item.find("a");
                if ($anchor.length > 0) {
                    $anchor[0].click();
                }
            }
        }
    }
    var pluginName = "telerik_ReportViewer_SideMenu";
    $.fn[pluginName] = function(options, otherOptions) {
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new SideMenu(this, options, otherOptions));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    trv.binder = {
        bind: function($element) {
            var args = Array.prototype.slice.call(arguments, 1);
            attachCommands($element, args);
            var result = utils.selector('[data-role^="telerik_ReportViewer_"]');
            utils.each(result, function() {
                var $this = $(this), f = $.fn[$this.attr("data-role")];
                if (typeof f === "function") {
                    f.apply($this, args);
                }
            });
        }
    };
    function attachCommands($element, args) {
        var commands = args[0].commands, viewerOptions = args[1], elementSelector = '[data-command^="telerik_ReportViewer_"]', customElementSelector = "[data-target-report-viewer]" + elementSelector;
        $element.on("click", elementSelector, commandHandler);
        if (!trv.GlobalSettings.CommandHandlerAttached) {
            $(document.body).on("click", customElementSelector, customCommandHandler);
            trv.GlobalSettings.CommandHandlerAttached = true;
        }
        utils.each(commands, function(key, command) {
            attachCommand(key, command, viewerOptions, $element);
        });
        function commandHandler(e) {
            var prefixedDataCommand = $(this).attr("data-command");
            if (prefixedDataCommand) {
                var dataCommand = prefixedDataCommand.substring("telerik_ReportViewer_".length), cmd = commands[dataCommand];
                if (cmd.enabled()) {
                    cmd.exec($(this).attr("data-command-parameter"));
                }
                e.preventDefault();
            }
        }
        function customCommandHandler(e) {
            var $this = $(this), prefixedDataCommand = $this.attr("data-command"), reportViewerTarget = $this.attr("data-target-report-viewer");
            if (prefixedDataCommand && reportViewerTarget) {
                var dataCommand = prefixedDataCommand.substring("telerik_ReportViewer_".length), reportViewer = $(reportViewerTarget).data("telerik_ReportViewer"), cmd = reportViewer.commands[dataCommand];
                if (cmd.enabled()) {
                    cmd.exec($(this).attr("data-command-parameter"));
                }
                e.preventDefault();
            }
        }
    }
    function attachCommand(dataCommand, cmd, viewerOptions, $element) {
        if (cmd) {
            var elementSelector = '[data-command="telerik_ReportViewer_' + dataCommand + '"]', customElementSelector = '[data-target-report-viewer="' + viewerOptions.selector + '"]' + elementSelector, $defaultElement = $element.find(elementSelector), $customElement = $(customElementSelector);
            $(cmd).on("enabledChanged", function(e) {
                (cmd.enabled() ? $.fn.removeClass : $.fn.addClass).call($defaultElement.parent("li"), "k-state-disabled");
                (cmd.enabled() ? $.fn.removeClass : $.fn.addClass).call($customElement, viewerOptions.disabledButtonClass);
            }).on("checkedChanged", function(e) {
                (cmd.checked() ? $.fn.addClass : $.fn.removeClass).call($defaultElement.parent("li"), "k-state-selected");
                (cmd.checked() ? $.fn.addClass : $.fn.removeClass).call($customElement, viewerOptions.checkedButtonClass);
            });
        }
    }
    function LinkButton(dom, options) {
        var cmd, $element = $(dom), dataCommand = $element.attr("data-command");
        if (dataCommand) {
            cmd = options.commands[dataCommand];
        }
        if (cmd) {
            $element.click(function(e) {
                if (cmd.enabled()) {
                    cmd.exec($(this).attr("data-command-parameter"));
                } else {
                    e.preventDefault();
                }
            });
            $(cmd).on("enabledChanged", function(e) {
                (cmd.enabled() ? $.fn.removeClass : $.fn.addClass).call($element, "disabled");
            }).on("checkedChanged", function(e) {
                (cmd.checked() ? $.fn.addClass : $.fn.removeClass).call($element, "checked");
            });
        }
    }
    var linkButton_pluginName = "telerik_ReportViewer_LinkButton";
    $.fn[linkButton_pluginName] = function(options) {
        return utils.each(this, function() {
            if (!$.data(this, linkButton_pluginName)) {
                $.data(this, linkButton_pluginName, new LinkButton(this, options));
            }
        });
    };
    function PageNumberInput(dom, options) {
        var $element = $(dom), cmd = options.commands["goToPage"];
        function setPageNumber(value) {
            $element.val(value);
        }
        options.controller.pageNumberChange(function(e, value) {
            setPageNumber(value);
        });
        $element.change(function() {
            var val = $(this).val();
            var num = utils.tryParseInt(val);
            if (num != NaN) {
                var result = cmd.exec(num);
                setPageNumber(result);
            }
        });
        $element.keydown(function(e) {
            if (e.which == 13) {
                $(this).change();
                return e.preventDefault();
            }
        });
        function validateValue(value) {
            return /^([0-9]+)$/.test(value);
        }
        $element.keypress(function(event) {
            if (utils.isSpecialKey(event.keyCode)) {
                return true;
            }
            var newValue = $element.val() + String.fromCharCode(event.charCode);
            return validateValue(newValue);
        }).on("paste", function(event) {});
    }
    var pageNumberInput_pluginName = "telerik_ReportViewer_PageNumberInput";
    $.fn[pageNumberInput_pluginName] = function(options) {
        return utils.each(this, function() {
            if (!$.data(this, pageNumberInput_pluginName)) {
                $.data(this, pageNumberInput_pluginName, new PageNumberInput(this, options));
            }
        });
    };
    function PageCountLabel(dom, options) {
        var $element = $(dom);
        options.controller.pageCountChange(function(e, value) {
            $element.html(value);
        });
    }
    var pageCountLabel_pluginName = "telerik_ReportViewer_PageCountLabel";
    $.fn[pageCountLabel_pluginName] = function(options) {
        return utils.each(this, function() {
            if (!$.data(this, pageCountLabel_pluginName)) {
                $.data(this, pageCountLabel_pluginName, new PageCountLabel(this, options));
            }
        });
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, window, document, undefined) {
    "use strict";
    trv.PerspectiveManager = function(dom, controller) {
        var smallMenu = dom.querySelectorAll ? dom.querySelectorAll(".trv-menu-small")[0] : false, perspectives = {
            small: {
                documentMapVisible: false,
                parametersAreaVisible: false,
                onDocumentMapVisibleChanged: function(e, args) {
                    if (args.visible) {
                        controller.setParametersAreaVisible({
                            visible: false
                        });
                    }
                },
                onParameterAreaVisibleChanged: function(e, args) {
                    if (args.visible) {
                        controller.setDocumentMapVisible({
                            visible: false
                        });
                    }
                },
                onBeforeLoadReport: function() {
                    controller.setParametersAreaVisible({
                        visible: false
                    });
                    controller.setDocumentMapVisible({
                        visible: false
                    });
                },
                onNavigateToPage: function() {
                    controller.setParametersAreaVisible({
                        visible: false
                    });
                    controller.setDocumentMapVisible({
                        visible: false
                    });
                }
            },
            large: {
                documentMapVisible: true,
                parametersAreaVisible: true
            }
        }, currentPerspective;
        function init() {
            currentPerspective = getPerspective();
            initStateFromController(perspectives["large"]);
        }
        function setPerspective(beforeApplyState) {
            var perspective = getPerspective();
            if (perspective !== currentPerspective) {
                var oldState = perspectives[currentPerspective];
                var newState = perspectives[perspective];
                currentPerspective = perspective;
                if (beforeApplyState) {
                    beforeApplyState.call(undefined, oldState, newState);
                }
                applyState(newState);
            }
        }
        function onDocumentMapVisibleChanged(e, args) {
            dispatch("onDocumentMapVisibleChanged", arguments);
        }
        function onParameterAreaVisibleChanged(e, args) {
            dispatch("onParameterAreaVisibleChanged", arguments);
        }
        function onBeforeLoadReport() {
            dispatch("onBeforeLoadReport", arguments);
        }
        function onNavigateToPage() {
            dispatch("onNavigateToPage", arguments);
        }
        function onReportLoadComplete() {
            dispatch("onReportLoadComplete", arguments);
        }
        function onWindowResize() {
            setPerspective(function(oldState, newState) {
                initStateFromController(oldState);
            });
        }
        function onCssLoaded() {
            setPerspective(null);
        }
        function dispatch(func, args) {
            var activePerspective = perspectives[currentPerspective];
            var handler = activePerspective[func];
            if (typeof handler === "function") {
                handler.apply(activePerspective, args);
            }
        }
        function attach() {
            window.addEventListener("resize", onWindowResize);
            controller.setDocumentMapVisible(onDocumentMapVisibleChanged);
            controller.setParametersAreaVisible(onParameterAreaVisibleChanged);
            controller.beforeLoadReport(onBeforeLoadReport);
            controller.navigateToPage(onNavigateToPage);
            controller.reportLoadComplete(onReportLoadComplete);
            controller.cssLoaded(onCssLoaded);
        }
        function getPerspective() {
            return smallMenu && getComputedStyle(smallMenu)["display"] != "none" ? "small" : "large";
        }
        function initStateFromController(state) {
            state.documentMapVisible = documentMapVisible();
            state.parametersAreaVisible = parametersAreaVisible();
        }
        function applyState(state) {
            documentMapVisible(state.documentMapVisible);
            parametersAreaVisible(state.parametersAreaVisible);
        }
        function documentMapVisible() {
            if (arguments.length == 0) {
                var args1 = {};
                controller.getDocumentMapState(args1);
                return args1.visible;
            }
            controller.setDocumentMapVisible({
                visible: Boolean(arguments[0])
            });
            return this;
        }
        function parametersAreaVisible() {
            if (arguments.length == 0) {
                var args1 = {};
                controller.getParametersAreaState(args1);
                return args1.visible;
            }
            controller.setParametersAreaVisible({
                visible: Boolean(arguments[0])
            });
            return this;
        }
        init();
        return {
            attach: attach
        };
    };
})(window.telerikReportViewer = window.telerikReportViewer || {}, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    var defaultOptions = {};
    function accessibility(options) {
        var controller, pageInitialized = false, areas, lastArea, keyMap = {
            CONFIRM_KEY: 13,
            CONTENT_AREA_KEY: 67,
            DOCUMENT_MAP_AREA_KEY: 68,
            MENU_AREA_KEY: 77,
            PARAMETERS_AREA_KEY: 80
        };
        options = $.extend({}, defaultOptions, options);
        controller = options.controller;
        if (!controller) {
            throw "No controller (telerikReporting.ReportViewerController) has been specified.";
        }
        controller.reportLoadComplete(onReportLoadComplete).pageReady(function(event, page) {
            initPage(page);
            pageInitialized = true;
        }).error(function(e, message) {
            focusOnErrorMessage();
            window.setTimeout(setAccessibilityUI, 500);
        }).updateUI(function(e) {
            if (pageInitialized) {
                setPageSelector();
                decorateMenuItems();
            }
        });
        function onReportLoadComplete(e, args) {
            setAccessibilityUI();
            var content = findContentArea();
            if (content.length > 0) {
                content.focus();
            }
        }
        function setAccessibilityUI() {
            if (!areas) {
                initAreas();
                $(document.body).off("keydown", processKeyDown);
                $(document.body).on("keydown", processKeyDown);
            }
        }
        function focusOnErrorMessage() {
            var selectorChain = [ "div.trv-pages-area", "div.trv-error-message" ];
            var $errMsg = findElement(selectorChain);
            if ($errMsg.length == 0) {
                return;
            }
            $errMsg.attr("tabIndex", 0);
            $errMsg.focus();
        }
        function initPage(page) {
            if (!page) {
                return;
            }
            setAccessibilityUI();
            var area = areas[keyMap.CONTENT_AREA_KEY];
            setContentAreaKeyDown(area);
        }
        function setPageSelector() {
            var $pagers = $(".trv-report-pager");
            if ($pagers.length > 0) {
                var pageNumber = controller.currentPageNumber();
                var pageCount = controller.pageCount();
                utils.each($pagers, function() {
                    var $pager = $(this);
                    $pager.attr("aria-label", utils.stringFormat(sr.ariaLabelPageNumberSelector, [ pageNumber, pageCount ]));
                    var $pageInputs = $pager.find("input[data-role=telerik_ReportViewer_PageNumberInput]");
                    if ($pageInputs.length > 0) {
                        utils.each($pageInputs, function() {
                            var $this = $(this);
                            $this.attr("aria-label", sr.ariaLabelPageNumberEditor);
                            $this.attr("min", "1");
                            $this.attr("max", "" + pageCount);
                        });
                    }
                });
            }
        }
        function initAreas() {
            areas = {};
            areas[keyMap.DOCUMENT_MAP_AREA_KEY] = findDocumentMapArea();
            areas[keyMap.MENU_AREA_KEY] = findMenuArea();
            areas[keyMap.CONTENT_AREA_KEY] = findContentArea();
            var parametersArea = findParametersArea();
            if (parametersArea) {
                areas[keyMap.PARAMETERS_AREA_KEY] = parametersArea;
                setParameterEditorsKeyDown(parametersArea);
            }
        }
        function findContentArea() {
            return findElement([ "div[data-role=telerik_ReportViewer_PagesArea]" ]);
        }
        function findDocumentMapArea() {
            return findElement([ "div[data-role=telerik_ReportViewer_DocumentMapArea]", "div[data-role=treeview]" ]);
        }
        function findMenuArea() {
            return findElement("ul[data-role=telerik_ReportViewer_MainMenu]");
        }
        function findParametersArea() {
            return findElement([ "div[data-role=telerik_ReportViewer_ParametersArea]", "div.trv-parameters-area-content" ]);
        }
        function findElement(selectorChain) {
            if (selectorChain.constructor != Array) {
                selectorChain = [ selectorChain ];
            }
            var $area = $(selectorChain[0]);
            for (var i = 1; i < selectorChain.length; i++) {
                $area = $area.find(selectorChain[i]);
            }
            return $area;
        }
        function processKeyDown(event) {
            if (!areas) {
                return;
            }
            if (!(event.altKey && event.ctrlKey)) {
                return;
            }
            var currentArea = areas[event.which];
            if (!currentArea) {
                return;
            }
            if (!IsAreaContainerVisible(currentArea.parent())) {
                return;
            }
            var className = "k-state-focused";
            if (lastArea) {
                lastArea.removeClass(className);
            }
            currentArea.addClass(className);
            currentArea.focus();
            lastArea = currentArea;
            event.preventDefault();
        }
        function setParameterEditorsKeyDown(parametersAreaContent) {
            if (parametersAreaContent.length == 0) {
                return;
            }
            var $paramsArea = parametersAreaContent.parent("div[data-role=telerik_ReportViewer_ParametersArea]");
            if (!IsAreaContainerVisible($paramsArea)) {
                return;
            }
            utils.each(parametersAreaContent.children(), function() {
                $(this).keydown(function(event) {
                    if (event.which == keyMap.CONFIRM_KEY) {
                        var paramsButton = $paramsArea.find("button.trv-parameters-area-preview-button");
                        paramsButton.focus();
                        event.preventDefault();
                    }
                });
            });
        }
        function IsAreaContainerVisible(container) {
            return container && !container.hasClass("hidden");
        }
        function setContentAreaKeyDown(contentArea) {
            if (!contentArea) {
                return;
            }
            var actions = contentArea.find("div [data-reporting-action]");
            if (!actions.length > 0) {
                return;
            }
            utils.each(actions, function() {
                var $action = $(this);
                $action.keydown(function(event) {
                    if (event.which == keyMap.CONFIRM_KEY) {
                        $action.click();
                    }
                });
            });
        }
        function decorateMenuItems() {
            var menuAreas = areas[keyMap.MENU_AREA_KEY];
            if (!menuAreas) {
                return;
            }
            utils.each(menuAreas, function() {
                var $menu = $(this);
                var menuItems = $menu.children("li.k-item");
                utils.each(menuItems, function() {
                    var $menuItem = $(this);
                    if (!$menuItem.hasClass("trv-report-pager")) {
                        var expandable = $menuItem.find("ul").length > 0 ? utils.stringFormat(". {0}", [ sr.ariaLabelExpandable ]) : "";
                        var selected = $menuItem.hasClass("k-state-selected") ? ". Selected" : "";
                        var label = $menuItem.attr("title") + expandable + selected;
                        $menuItem.attr("aria-label", label);
                        if ($menuItem.hasClass("k-state-disabled")) {
                            $menuItem.attr("aria-disabled", "true");
                        } else {
                            $menuItem.removeAttr("aria-disabled");
                        }
                    }
                });
            });
        }
        function setKeyMap(keyMapValues) {
            keyMap = keyMapValues;
            areas = undefined;
        }
        function getKeyMap() {
            return keyMap;
        }
        return {
            getKeyMap: getKeyMap,
            setKeyMap: setKeyMap
        };
    }
    trv.accessibility = accessibility;
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);

(function(trv, $, window, document, undefined) {
    "use strict";
    if (!$) {
        alert("jQuery is not loaded. Make sure that jQuery is included.");
    }
    if (!trv.GlobalSettings) {
        trv.GlobalSettings = {};
    }
    var utils = trv.utils;
    if (!utils) {
        throw "Missing telerikReportViewer.utils";
    }
    var sr = trv.sr;
    if (!sr) {
        throw "Missing telerikReportViewer.sr";
    }
    if (!trv.ServiceClient) {
        throw "Missing telerikReportViewer.ServiceClient";
    }
    if (!trv.ReportViewerController) {
        throw "Missing telerikReportViewer.ReportViewerController";
    }
    if (!trv.HistoryManager) {
        throw "Missing telerikReportViewer.HistoryManager";
    }
    var binder = trv.binder;
    if (!binder) {
        throw "Missing telerikReportViewer.Binder";
    }
    if (!trv.CommandSet) {
        throw "Missing telerikReportViewer.commandSet";
    }
    if (!trv.uiController) {
        throw "Missing telerikReportViewer.uiController";
    }
    trv.Events = {
        EXPORT_BEGIN: "EXPORT_BEGIN",
        EXPORT_END: "EXPORT_END",
        PRINT_BEGIN: "PRINT_BEGIN",
        PRINT_END: "PRINT_END",
        RENDERING_BEGIN: "RENDERING_BEGIN",
        RENDERING_END: "RENDERING_END",
        PAGE_READY: "PAGE_READY",
        ERROR: "ERROR",
        UPDATE_UI: "UPDATE_UI",
        INTERACTIVE_ACTION_EXECUTING: "INTERACTIVE_ACTION_EXECUTING",
        INTERACTIVE_ACTION_ENTER: "INTERACTIVE_ACTION_ENTER",
        INTERACTIVE_ACTION_LEAVE: "INTERACTIVE_ACTION_LEAVE",
        VIEWER_TOOLTIP_OPENING: "VIEWER_TOOLTIP_OPENING"
    };
    var templateCache = function() {
        var cache = {};
        return {
            load: function(url, serviceUrl, client) {
                var p = cache[url];
                if (!p) {
                    cache[url] = p = client.get(url).then(function(html) {
                        var templates = {};
                        var styleSheets = [];
                        var scripts = [];
                        var baseUri = utils.rtrim(serviceUrl, "\\/") + "/";
                        html = utils.replaceAll(html, "{service}/", baseUri);
                        html = utils.replaceAll(html, "{service}", baseUri);
                        var viewerTemplate = $("<div></div>").html(html);
                        utils.each(viewerTemplate.find("template"), function(index, e) {
                            var $e = $(e);
                            templates[$e.attr("id")] = utils.trim($e.html(), "\n 	");
                        });
                        utils.each(viewerTemplate.find("link"), function(index, e) {
                            styleSheets.push(utils.trim(e.outerHTML, "\n 	"));
                        });
                        styleSheets = utils.filterUniqueLastOccurance(styleSheets);
                        utils.each(viewerTemplate.find("script"), function(index, e) {
                            scripts.push(utils.trim(e.innerHTML, "\n 	"));
                        });
                        return {
                            templates: templates,
                            styleSheets: styleSheets,
                            scripts: scripts
                        };
                    });
                }
                return p;
            }
        };
    }();
    function MemStorage() {
        var data = {};
        return {
            getItem: function(key) {
                return data[key];
            },
            setItem: function(key, value) {
                data[key] = value;
            },
            removeItem: function(key) {
                delete data[key];
            }
        };
    }
    function ReportViewerSettings(id, storage, defaultSettings) {
        var _this = {};
        function getItem(key) {
            var value = storage.getItem(formatKey(key));
            return value != null ? value : defaultSettings[key];
        }
        function stateItem(prop, args) {
            var stateKey = "state";
            var value = getItem(stateKey);
            var currentState = typeof value == "string" ? JSON.parse(value) : {};
            if (args.length) {
                if (currentState) {
                    currentState[prop] = args[0];
                }
                setItem(stateKey, JSON.stringify(currentState));
                return _this;
            } else {
                return currentState[prop];
            }
        }
        function setItem(key, value) {
            var formattedKey = formatKey(key);
            storage.setItem(formattedKey, value);
            if (storage instanceof window.Storage) {
                var oldValue = storage.getItem(formattedKey);
                var storageEvent = document.createEvent("StorageEvent");
                storageEvent.initStorageEvent("telerikReportingStorage", false, false, formattedKey, oldValue, value, null, storage);
                window.dispatchEvent(storageEvent);
            }
        }
        function formatKey(key) {
            return id + "_" + key;
        }
        function value(key, args) {
            if (args.length) {
                setItem(key, args[0]);
                return _this;
            } else {
                return getItem(key);
            }
        }
        function valueFloat(key, args) {
            if (args.length) {
                setItem(key, args[0]);
                return _this;
            } else {
                return parseFloat(getItem(key));
            }
        }
        function valueObject(key, args) {
            if (args.length) {
                setItem(key, JSON.stringify(args[0]));
                return _this;
            } else {
                var value = getItem(key);
                return typeof value == "string" ? JSON.parse(value) : null;
            }
        }
        utils.extend(_this, {
            viewMode: function() {
                return stateItem("viewMode", arguments);
            },
            printMode: function() {
                return stateItem("printMode", arguments);
            },
            scale: function() {
                return stateItem("scale", arguments);
            },
            scaleMode: function() {
                return stateItem("scaleMode", arguments);
            },
            documentMapVisible: function() {
                return stateItem("documentMapVisible", arguments);
            },
            parametersAreaVisible: function() {
                return stateItem("parametersAreaVisible", arguments);
            },
            history: function() {
                return valueObject("history", arguments);
            },
            clientId: function() {
                return value("clientId", arguments);
            },
            reportSource: function() {
                return stateItem("reportSource", arguments);
            },
            pageNumber: function() {
                return stateItem("pageNumber", arguments);
            },
            enableAccessibility: function() {
                return value("enableAccessibility", arguments);
            },
            accessibilityKeyMap: function() {
                return stateItem("accessibilityKeyMap", arguments);
            }
        });
        return _this;
    }
    function getDefaultOptions(serviceUrl) {
        return {
            id: null,
            serviceUrl: null,
            templateUrl: utils.rtrim(serviceUrl, "\\/") + "/resources/templates/telerikReportViewerTemplate-html",
            reportSource: null,
            reportServer: null,
            authenticationToken: null,
            scale: 1,
            scaleMode: trv.ScaleModes.FIT_PAGE,
            viewMode: trv.ViewModes.INTERACTIVE,
            persistSession: false,
            parameterEditors: [],
            disabledButtonClass: null,
            checkedButtonClass: null,
            parametersAreaVisible: true,
            documentMapVisible: true,
            enableAccessibility: false
        };
    }
    function ReportViewer(dom, options) {
        if (!window.kendo) {
            alert("Kendo is not loaded. Make sure that Kendo is included.");
        }
        var $placeholder = $(dom), templates = {}, scripts = {}, persistanceKey = options.id || "#" + $placeholder.attr("id"), accessibility;
        if (!validateOptions(options)) {
            return;
        }
        var svcApiUrl = options.serviceUrl;
        if (options.reportServer) {
            var reportServerUrl = utils.rtrim(options.reportServer.url, "\\/");
            svcApiUrl = reportServerUrl + "/api/reports";
        }
        options = utils.extend({}, getDefaultOptions(svcApiUrl), options);
        var settings = new ReportViewerSettings(persistanceKey, options.persistSession ? window.sessionStorage : new MemStorage(), {
            scale: options.scale,
            scaleMode: options.scaleMode,
            printMode: options.printMode ? options.printMode : options.directPrint,
            enableAccessibility: options.enableAccessibility
        });
        var serviceClientOptions = {};
        if (options.reportServer) {
            var reportServerUrl = utils.rtrim(options.reportServer.url, "\\/");
            serviceClientOptions.serviceUrl = reportServerUrl + "/api/reports";
            serviceClientOptions.loginInfo = {
                url: reportServerUrl + "/Token",
                username: options.reportServer.username,
                password: options.reportServer.password
            };
        } else {
            serviceClientOptions.serviceUrl = options.serviceUrl;
        }
        var client = new trv.ServiceClient(serviceClientOptions);
        var controller = options.controller;
        if (!controller) {
            controller = new trv.ReportViewerController({
                serviceClient: client,
                settings: settings
            });
        }
        var history = new trv.HistoryManager({
            controller: controller,
            settings: settings
        });
        var commands = new trv.CommandSet({
            controller: controller,
            history: history
        });
        new trv.uiController({
            controller: controller,
            history: history,
            commands: commands
        });
        var viewer = {
            refreshReport: function(ignoreCache) {
                if (arguments.length === 0) {
                    ignoreCache = true;
                }
                controller.refreshReport(ignoreCache);
                return viewer;
            },
            reportSource: function(rs) {
                if (rs || rs === null) {
                    controller.reportSource(rs);
                    controller.refreshReport(false);
                    return viewer;
                }
                return controller.reportSource();
            },
            viewMode: function(vm) {
                if (vm) {
                    controller.viewMode(vm);
                    return viewer;
                }
                return controller.viewMode();
            },
            printMode: function(pm) {
                if (pm) {
                    controller.printMode(pm);
                    return viewer;
                }
                return controller.printMode();
            },
            scale: function(scale) {
                if (scale) {
                    controller.scale(scale);
                    return viewer;
                }
                scale = {};
                controller.getScale(scale);
                return scale;
            },
            currentPage: function() {
                return controller.currentPageNumber();
            },
            pageCount: function() {
                return controller.pageCount();
            },
            authenticationToken: function(token) {
                if (token) {
                    controller.setAuthenticationToken(token);
                }
                return viewer;
            },
            bind: function(eventName, eventHandler) {
                eventBinder(eventName, eventHandler, true);
            },
            unbind: function(eventName, eventHandler) {
                eventBinder(eventName, eventHandler, false);
            },
            accessibilityKeyMap: function(keyMap) {
                if (accessibility) {
                    if (keyMap) {
                        accessibility.setKeyMap(keyMap);
                        return viewer;
                    }
                    return accessibility.getKeyMap();
                }
                return undefined;
            },
            commands: commands
        };
        function validateOptions(options) {
            if (!options) {
                $placeholder.html("The report viewer configuration options are not initialized.");
                return false;
            }
            if (options.reportServer) {
                if (!options.reportServer.url) {
                    $placeholder.html("The report server URL is not specified.");
                    return false;
                }
            } else {
                if (!options.serviceUrl) {
                    $placeholder.html("The serviceUrl is not specified.");
                    return false;
                }
            }
            return true;
        }
        function eventBinder(eventName, eventHandler, bind) {
            if (typeof eventHandler == "function") {
                if (bind) {
                    $(viewer).on(eventName, {
                        sender: viewer
                    }, eventHandler);
                } else {
                    $(viewer).off(eventName, eventHandler);
                }
            } else if (!eventHandler && !bind) {
                $(viewer).off(eventName);
            }
        }
        function attachEvents() {
            var viewerEventsMapping = {
                EXPORT_BEGIN: controller.Events.EXPORT_STARTED,
                EXPORT_END: controller.Events.EXPORT_DOCUMENT_READY,
                PRINT_BEGIN: controller.Events.PRINT_STARTED,
                PRINT_END: controller.Events.PRINT_DOCUMENT_READY,
                RENDERING_BEGIN: controller.Events.BEFORE_LOAD_REPORT,
                RENDERING_END: controller.Events.REPORT_LOAD_COMPLETE,
                PAGE_READY: controller.Events.PAGE_READY,
                ERROR: controller.Events.ERROR,
                UPDATE_UI: controller.Events.UPDATE_UI,
                INTERACTIVE_ACTION_EXECUTING: controller.Events.INTERACTIVE_ACTION_EXECUTING,
                INTERACTIVE_ACTION_ENTER: controller.Events.INTERACTIVE_ACTION_ENTER,
                INTERACTIVE_ACTION_LEAVE: controller.Events.INTERACTIVE_ACTION_LEAVE,
                VIEWER_TOOLTIP_OPENING: controller.Events.TOOLTIP_OPENING
            }, $viewer = $(viewer);
            for (var eventName in viewerEventsMapping) {
                var controllerEventName = viewerEventsMapping[eventName];
                controller.on(controllerEventName, function($viewer, eventName) {
                    return function(e, args) {
                        $viewer.trigger({
                            type: eventName,
                            data: e.data
                        }, args);
                    };
                }($viewer, eventName));
            }
        }
        function attachEventHandlers() {
            eventBinder(trv.Events.EXPORT_BEGIN, options.exportBegin, true);
            eventBinder(trv.Events.EXPORT_END, options.exportEnd, true);
            eventBinder(trv.Events.PRINT_BEGIN, options.printBegin, true);
            eventBinder(trv.Events.PRINT_END, options.printEnd, true);
            eventBinder(trv.Events.RENDERING_BEGIN, options.renderingBegin, true);
            eventBinder(trv.Events.RENDERING_END, options.renderingEnd, true);
            eventBinder(trv.Events.PAGE_READY, options.pageReady, true);
            eventBinder(trv.Events.ERROR, options.error, true);
            eventBinder(trv.Events.UPDATE_UI, options.updateUi, true);
            eventBinder(trv.Events.INTERACTIVE_ACTION_EXECUTING, options.interactiveActionExecuting, true);
            eventBinder(trv.Events.INTERACTIVE_ACTION_ENTER, options.interactiveActionEnter, true);
            eventBinder(trv.Events.INTERACTIVE_ACTION_LEAVE, options.interactiveActionLeave, true);
            eventBinder(trv.Events.VIEWER_TOOLTIP_OPENING, options.viewerToolTipOpening, true);
            $(controller).on(controller.Events.TOGGLE_SIDE_MENU, function() {
                window.setTimeout(function() {
                    $placeholder.toggleClass("trv-side-menu-visible");
                }, 1);
            });
        }
        function init() {
            $placeholder.html(templates["trv-report-viewer"]);
            binder.bind($placeholder, {
                controller: controller,
                commands: commands,
                templates: templates
            }, options);
            new trv.PerspectiveManager(dom, controller).attach();
            attachEvents();
            attachEventHandlers();
            initFromStorage();
            initAccessibility(options);
        }
        function initFromStorage() {
            var vm = settings.viewMode();
            var pm = settings.printMode();
            var s = settings.scale();
            var sm = settings.scaleMode();
            var dm = settings.documentMapVisible();
            var pa = settings.parametersAreaVisible();
            var am = settings.accessibilityKeyMap();
            controller.viewMode(vm ? vm : options.viewMode);
            controller.printMode(pm ? pm : options.printMode);
            controller.scale({
                scale: s ? s : options.scale,
                scaleMode: sm ? sm : options.scaleMode
            });
            controller.setDocumentMapVisible({
                visible: dm ? dm : options.documentMapVisible
            });
            controller.setParametersAreaVisible({
                visible: pa ? pa : options.parametersAreaVisible
            });
            controller.printModeChanged(function() {
                settings.printMode(controller.printMode());
            });
            controller.viewModeChanged(function() {
                settings.viewMode(controller.viewMode());
            });
            controller.scale(function() {
                var args = {};
                controller.getScale(args);
                settings.scale(args.scale);
                settings.scaleMode(args.scaleMode);
            });
            controller.setDocumentMapVisible(function() {
                var args = {};
                controller.getDocumentMapState(args);
                settings.documentMapVisible(args.visible);
            });
            controller.setParametersAreaVisible(function() {
                var args = {};
                controller.getParametersAreaState(args);
                settings.parametersAreaVisible(args.visible);
            });
        }
        function initAccessibility(options) {
            if (options.enableAccessibility) {
                accessibility = new trv.accessibility({
                    controller: controller,
                    templates: templates
                });
                var am = options.accessibilityKeyMap;
                if (am) {
                    accessibility.setKeyMap(am);
                }
                settings.contentTabIndex = getTemplateContentTabIndex();
            }
        }
        function getTemplateContentTabIndex() {
            var pageAreaSelector = "div.trv-pages-area";
            try {
                var pagesArea$ = $placeholder.find(pageAreaSelector);
                if (pagesArea$.length == 0) {
                    throw "Selector " + pageAreaSelector + " did not return a result.";
                }
                return parseInt(pagesArea$.attr("tabindex"));
            } catch (e) {
                if (console) console.log(e);
                return 0;
            }
        }
        function start() {
            var pendingRefresh = false;
            init();
            controller.reportLoadComplete(function() {
                if (options.documentMapVisible === false) {
                    controller.setDocumentMapVisible({
                        visible: false
                    });
                }
            });
            var rs = settings.reportSource();
            if (rs !== undefined) {
                controller.reportSource(rs);
                var pageNumber = settings.pageNumber();
                if (pageNumber !== undefined) {
                    controller.navigateToPage(pageNumber);
                }
                pendingRefresh = true;
            } else {
                if (options.viewMode) {
                    controller.viewMode(options.viewMode);
                }
                if (options.reportSource) {
                    controller.reportSource(options.reportSource);
                    pendingRefresh = true;
                }
            }
            for (var i = 0; i < scripts.length; i++) {
                try {
                    eval(scripts[i]);
                } catch (e) {
                    if (console) console.log(e);
                }
            }
            if (typeof options.ready === "function") {
                options.ready.call(viewer);
            }
            if (pendingRefresh) {
                controller.refreshReport(false);
            }
        }
        function loadStyleSheets(styleSheets) {
            if (!styleSheets) return Promise.resolve();
            var $head = $("head");
            var currentStyleLinks = $head.find("link").map(function(i, e) {
                return e.outerHTML;
            }).toArray();
            var promises = [];
            utils.each(styleSheets, function(i, e) {
                if (-1 == currentStyleLinks.indexOf(e)) {
                    promises.push(new Promise(function(resolve, reject) {
                        var $link = $(e);
                        $link.on("load", resolve);
                        $link.on("onerror", function() {
                            utils.logError("error loading stylesheet " + e);
                            resolve();
                        });
                        $head.append($link);
                    }));
                }
            });
            return Promise.all(promises).then(controller.cssLoaded);
        }
        function browserSupportsAllFeatures() {
            return window.Promise;
        }
        function main(err) {
            if (err) {
                utils.logError(err);
            } else {
                if (options.authenticationToken) {
                    controller.setAuthenticationToken(options.authenticationToken);
                }
                templateCache.load(options.templateUrl, svcApiUrl, client).catch(function() {
                    $placeholder.html(utils.stringFormat(sr.errorLoadingTemplates, [ utils.escapeHtml(options.templateUrl) ]));
                    return Promise.reject();
                }).then(function(result) {
                    templates = result.templates;
                    scripts = result.scripts;
                    return loadStyleSheets(result.styleSheets);
                }).then(start);
            }
        }
        if (browserSupportsAllFeatures()) {
            main();
        } else {
            utils.loadScript("https://cdn.polyfill.io/v2/polyfill.min.js?features=Promise", main);
        }
        return viewer;
    }
    var pluginName = "telerik_ReportViewer";
    jQuery.fn[pluginName] = function(options) {
        if (this.selector && !options.selector) {
            options.selector = this.selector;
        }
        return utils.each(this, function() {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new ReportViewer(this, options));
            }
        });
    };
    trv.ReportViewer = ReportViewer;
})(window.telerikReportViewer = window.telerikReportViewer || {}, jQuery, window, document);
/* DO NOT MODIFY OR DELETE THIS LINE! UPGRADE WIZARD CHECKSUM B8C3BAC0B691EB849490C4D32EAD6EF2 */