function dv_rolloutManager(handlersDefsArray, baseHandler) {
    this.handle = function () {
        var errorsArr = [];

        var handler = chooseEvaluationHandler(handlersDefsArray);
        if (handler) {
            var errorObj = handleSpecificHandler(handler);
            if (errorObj === null) {
                return errorsArr;
            }
            else {
                var debugInfo = handler.onFailure();
                if (debugInfo) {
                    for (var key in debugInfo) {
                        if (debugInfo.hasOwnProperty(key)) {
                            if (debugInfo[key] !== undefined || debugInfo[key] !== null) {
                                errorObj[key] = encodeURIComponent(debugInfo[key]);
                            }
                        }
                    }
                }
                errorsArr.push(errorObj);
            }
        }

        var errorObjHandler = handleSpecificHandler(baseHandler);
        if (errorObjHandler) {
            errorObjHandler['dvp_isLostImp'] = 1;
            errorsArr.push(errorObjHandler);
        }
        return errorsArr;
    };

    function handleSpecificHandler(handler) {
        var url;
        var errorObj = null;

        try {
            url = handler.createRequest();
            if (url) {
                if (!handler.sendRequest(url)) {
                    errorObj = createAndGetError('sendRequest failed.',
                        url,
                        handler.getVersion(),
                        handler.getVersionParamName(),
                        handler.dv_script);
                }
            } else {
                errorObj = createAndGetError('createRequest failed.',
                    url,
                    handler.getVersion(),
                    handler.getVersionParamName(),
                    handler.dv_script,
                    handler.dvScripts,
                    handler.dvStep,
                    handler.dvOther
                );
            }
        }
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, url, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
        }

        return errorObj;
    }

    function createAndGetError(error, url, ver, versionParamName, dv_script, dvScripts, dvStep, dvOther) {
        var errorObj = {};
        errorObj[versionParamName] = ver;
        errorObj['dvp_jsErrMsg'] = encodeURIComponent(error);
        if (dv_script && dv_script.parentElement && dv_script.parentElement.tagName && dv_script.parentElement.tagName == 'HEAD') {
            errorObj['dvp_isOnHead'] = '1';
        }
        if (url) {
            errorObj['dvp_jsErrUrl'] = url;
        }
        if (dvScripts) {
            var dvScriptsResult = '';
            for (var id in dvScripts) {
                if (dvScripts[id] && dvScripts[id].src) {
                    dvScriptsResult += encodeURIComponent(dvScripts[id].src) + ":" + dvScripts[id].isContain + ",";
                }
            }
            
           
           
        }
        return errorObj;
    }

    function chooseEvaluationHandler(handlersArray) {
        var config = window._dv_win.dv_config;
        var index = 0;
        var isEvaluationVersionChosen = false;
        if (config.handlerVersionSpecific) {
            for (var i = 0; i < handlersArray.length; i++) {
                if (handlersArray[i].handler.getVersion() == config.handlerVersionSpecific) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }
        else if (config.handlerVersionByTimeIntervalMinutes) {
            var date = config.handlerVersionByTimeInputDate || new Date();
            var hour = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            index = Math.floor(((hour * 60) + minutes) / config.handlerVersionByTimeIntervalMinutes) % (handlersArray.length + 1);
            if (index != handlersArray.length) { 
                isEvaluationVersionChosen = true;
            }
        }
        else {
            var rand = config.handlerVersionRandom || (Math.random() * 100);
            for (var i = 0; i < handlersArray.length; i++) {
                if (rand >= handlersArray[i].minRate && rand < handlersArray[i].maxRate) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }

        if (isEvaluationVersionChosen == true && handlersArray[index].handler.isApplicable()) {
            return handlersArray[index].handler;
        }
        else {
            return null;
        }
    }    
}

function getCurrentTime() {
    "use strict";
    if (Date.now) {
        return Date.now();
    }
    return (new Date()).getTime();
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}

function dv_GetParam(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, 'i');
    var results = regex.exec(url);
    if (results == null) {
        return null;
    }
    else {
        return results[1];
    }
}

function dv_GetKeyValue(url) {
    var keyReg = new RegExp(".*=");
    var keyRet = url.match(keyReg)[0];
    keyRet = keyRet.replace("=", "");

    var valReg = new RegExp("=.*");
    var valRet = url.match(valReg)[0];
    valRet = valRet.replace("=", "");

    return {key: keyRet, value: valRet};
}

function dv_Contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function dv_GetDynamicParams(url, prefix) {
    try {
        prefix = (prefix != undefined && prefix != null) ? prefix : 'dvp';
        var regex = new RegExp("[\\?&](" + prefix + "_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = [];
        while (dvParams != null) {
            results.push(dvParams[1]);
            dvParams = regex.exec(url);
        }
        return results;
    }
    catch (e) {
        return [];
    }
}

function dv_createIframe() {
    var iframe;
    if (document.createElement && (iframe = document.createElement('iframe'))) {
        iframe.name = iframe.id = 'iframe_' + Math.floor((Math.random() + "") * 1000000000000);
        iframe.width = 0;
        iframe.height = 0;
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
    }

    return iframe;
}

function dv_GetRnd() {
    return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 16);
}

function dv_SendErrorImp(serverUrl, errorsArr) {

    for (var j = 0; j < errorsArr.length; j++) {
        var errorObj = errorsArr[j];
        var errorImp = dv_CreateAndGetErrorImp(serverUrl, errorObj);
        dv_sendImgImp(errorImp);
    }
}

function dv_CreateAndGetErrorImp(serverUrl, errorObj) {
    var errorQueryString = '';
    for (var key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            } else {
                var params = ['ctx', 'cmp', 'plc', 'sid'];
                for (var i = 0; i < params.length; i++) {
                    var pvalue = dv_GetParam(errorObj[key], params[i]);
                    if (pvalue) {
                        errorQueryString += '&dvp_js' + params[i] + '=' + pvalue;
                    }
                }
            }
        }
    }

    var windowProtocol = 'https:';
    var sslFlag = '&ssl=1';

    var errorImp = windowProtocol + '//' + serverUrl + sslFlag + errorQueryString;
    return errorImp;
}

function dv_sendImgImp(url) {
    (new Image()).src = url;
}

function dv_getPropSafe(obj, propName) {
    try {
        if (obj) {
            return obj[propName];
        }
    } catch (e) {
    }
}

function dvType() {
    var that = this;
    var eventsForDispatch = {};
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
                $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
            }
        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tProcess=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    this.processTagToTagCollision = function (collision, tag) {
        var i;
        for (i = 0; i < collision.eventsToFire.length; i++) {
            this.pubSub.publish(collision.eventsToFire[i], tag.uid);
        }
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&colltid=' + collision.allReasonsForTagBitFlag;

        for (i = 0; i < collision.reasons.length; i++) {
            var reason = collision.reasons[i];
            tpsServerUrl += '&' + reason.name + "ms=" + reason.milliseconds;
        }

        if (collision.thisTag) {
            tpsServerUrl += '&tlts=' + collision.thisTag.t2tLoadTime;
        }
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    this.processBSIdFound = function (bsID, tag) {
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&bsimpid=' + bsID;
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    this.processBABSVerbose = function (verboseReportingValues, tag) {
        var queryString = "";
        


        var dvpPrepend = "&dvp_BABS_";
        queryString += dvpPrepend + 'NumBS=' + verboseReportingValues.bsTags.length;

        for (var i = 0; i < verboseReportingValues.bsTags.length; i++) {
            var thisFrame = verboseReportingValues.bsTags[i];

            queryString += dvpPrepend + 'GotCB' + i + '=' + thisFrame.callbackReceived;
            queryString += dvpPrepend + 'Depth' + i + '=' + thisFrame.depth;

            if (thisFrame.callbackReceived) {
                if (thisFrame.bsAdEntityInfo && thisFrame.bsAdEntityInfo.comparisonItems) {
                    for (var itemIndex = 0; itemIndex < thisFrame.bsAdEntityInfo.comparisonItems.length; itemIndex++) {
                        var compItem = thisFrame.bsAdEntityInfo.comparisonItems[itemIndex];
                        queryString += dvpPrepend + "tag" + i + "_" + compItem.name + '=' + compItem.value;
                    }
                }
            }
        }

        if (queryString.length > 0) {
            var tpsServerUrl = '';
            if (tag) {
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
            }
            var requestString = tpsServerUrl + queryString;
            $dv.domUtilities.addImage(requestString, tag.tagElement.parentElement);
        }
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if (!data.action) {
                data = window.JSON.parse(data);
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dv.tags) {
                for (var uid in $dv.tags) {
                    if ($dv.tags.hasOwnProperty(uid) && $dv.tags[uid] && $dv.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            var tag;
            switch (data.action) {
                case 'uniquePageViewIdDetermination':
                    if (visitJSHasBeenCalledForThisTag) {
                        $dv.processT2TEvent(data, $dv.tags[myUID]);
                        $dv.t2tEventDataZombie[data.iFrameId] = undefined;
                    }
                    else {
                        data.wasZombie = 1;
                        $dv.t2tEventDataZombie[data.iFrameId] = data;
                    }
                    break;
                case 'maColl':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    data.collision.commonRecievedTS = timeCalled;
                    $dv.processTagToTagCollision(data.collision, tag);
                    break;
                case 'bsIdFound':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    $dv.processBSIdFound(data.id, tag);
                    break;
                case 'babsVerbose':
                    try {
                        tag = $dv.tags[myUID];
                        $dv.processBABSVerbose(data, tag);
                    } catch (err) {
                    }
                    break;
            }

        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tListener=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    if (window.addEventListener) {
        addEventListener("message", messageEventListener, false);
    }
    else {
        attachEvent("onmessage", messageEventListener);
    }

    this.pubSub = new function () {
        var subscribers = [];
        var prerenderHistory = {};

        var publishRtnEvent = function (eventName, uid) {
            var actionsResults = [];
            try {
                if (subscribers[eventName + uid] instanceof Array) {
                    for (var i = 0; i < subscribers[eventName + uid].length; i++) {
                        var funcObject = subscribers[eventName + uid][i];
                        if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                            var isSucceeded = runSafely(function () {
                                return funcObject.Func(uid);
                            });
                            actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                        }
                    }
                }
            }
            catch (e) { }
            return actionsResults;
        };

        this.publishHistoryRtnEvent = function (uid) {
            var actionsResults = [];

            if (prerenderHistory && prerenderHistory[uid]) {
                for (var key in prerenderHistory[uid]) {
                    if (prerenderHistory[uid][key]) {
                        actionsResults.push.apply(actionsResults, publishRtnEvent(prerenderHistory[uid][key], uid));
                    }
                }
                prerenderHistory[uid] = [];
            }

            return actionsResults;
        };

        this.subscribe = function (eventName, uid, actionName, func) {
            if (!subscribers[eventName + uid]) {
                subscribers[eventName + uid] = [];
            }
            subscribers[eventName + uid].push({Func: func, ActionName: actionName});
        };

        this.publish = function (eventName, uid) {
            var actionsResults = [];
            try {
                if (eventName && uid) {
                    if ($dv && $dv.tags[uid] && $dv.tags[uid].prndr) {
                        prerenderHistory[uid] = prerenderHistory[uid] || [];
                        prerenderHistory[uid].push(eventName);
                    }
                    else {
                        actionsResults.push.apply(actionsResults, this.publishHistoryRtnEvent(uid));
                        actionsResults.push.apply(actionsResults, publishRtnEvent(eventName, uid));
                    }
                }
            } catch (e) { }
            return actionsResults.join('&');
        };
    };

    this.domUtilities = new function () {
        function getDefaultParent() {
            return document.body || document.head || document.documentElement;
        }

        this.createImage = function (parentElement) {
            parentElement = parentElement || getDefaultParent();
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            image.src='';
            parentElement.insertBefore(image, parentElement.firstChild);
            return image;
        };

        var imgArr = [];
        var nextImg = 0;
        var imgArrCreated = false;
        if (!navigator.sendBeacon) {
            imgArr[0] = this.createImage();
            imgArr[1] = this.createImage();
            imgArrCreated = true;
        }

        this.addImage = function (url, parentElement, useGET, usePrerenderedImage) {
            parentElement = parentElement || getDefaultParent();
            if (!useGET && navigator.sendBeacon) {
                var message = appendCacheBuster(url);
                navigator.sendBeacon(message, {});
            } else {
                var image;
                if (usePrerenderedImage && imgArrCreated) {
                    image = imgArr[nextImg];
                    image.src = appendCacheBuster(url);
                    nextImg = (nextImg + 1) % imgArr.length;
                } else {
                    image = this.createImage(parentElement);
                    image.src = appendCacheBuster(url);
                    parentElement.insertBefore(image, parentElement.firstChild);
                }
            }
        };



        this.addScriptResource = function (url, parentElement) {
            parentElement = parentElement || getDefaultParent();
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.src = appendCacheBuster(url);
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addScriptCode = function (srcCode, parentElement) {
            parentElement = parentElement || getDefaultParent();
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function (srcHtml, parentElement) {
            parentElement = parentElement || getDefaultParent();
            var divElem = parentElement.ownerDocument.createElement("div");
            divElem.style = "display: inline";
            divElem.innerHTML = srcHtml;
            parentElement.insertBefore(divElem, parentElement.firstChild);
        };
    };

    this.resolveMacros = function (str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : {};
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace(/\[(.*?)\]/g, function (match, p1) {
            var value = upperCaseObj[p1];
            if (value === undefined || value === null) {
                value = '[' + p1 + ']';
            }
            return encodeURIComponent(value);
        });
        return newStr;
    };

    this.settings = new function () {
    };

    this.tagsType = function () {
    };

    this.tagsPrototype = function () {
        this.add = function (tagKey, obj) {
            if (!that.tags[tagKey]) {
                that.tags[tagKey] = new that.tag();
            }
            for (var key in obj) {
                that.tags[tagKey][key] = obj[key];
            }
        };
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () {
    };

    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj) {
                this[key] = obj[key];
            }
        };

        this.getViewabilityData = function () {
        };
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;

    this.registerEventCall = function (impressionId, eventObject, timeoutMs, isRegisterEnabled, usePrerenderedImage) {
        if (typeof isRegisterEnabled !== 'undefined' && isRegisterEnabled === true) {
            addEventCallForDispatch(impressionId, eventObject);

            if (typeof timeoutMs === 'undefined' || timeoutMs == 0 || isNaN(timeoutMs)) {
                dispatchEventCallsNow(impressionId, eventObject);
            }
            else {
                if (timeoutMs > 10000) {
                    timeoutMs = 10000;
                }

                var that = this;
                setTimeout(
                    function () {
                        that.dispatchEventCalls(impressionId);
                    }, timeoutMs);
            }

        } else {
            var url = this.tags[impressionId].protocol + '//' + this.tags[impressionId].ServerPublicDns + "/event.gif?impid=" + impressionId + '&' + createQueryStringParams(eventObject);

            this.domUtilities.addImage(url, this.tags[impressionId].tagElement.parentNode, false, usePrerenderedImage);
        }
    };

    var mraidObjectCache;
    this.getMraid = function () {
        var context = window._dv_win || window;
        var iterationCounter = 0;
        var maxIterations = 20;

        function getMraidRec(context) {
            iterationCounter++;
            var isTopWindow = context.parent == context;
            if (context.mraid || isTopWindow) {
                return context.mraid;
            } else {
                return ( iterationCounter <= maxIterations ) && getMraidRec(context.parent);
            }
        }

        try {
            return mraidObjectCache = mraidObjectCache || getMraidRec(context);
        } catch (e) {
        }
    };

    var dispatchEventCallsNow = function (impressionId, eventObject) {
        addEventCallForDispatch(impressionId, eventObject);
        dispatchEventCalls(impressionId);
    };

    var addEventCallForDispatch = function (impressionId, eventObject) {
        for (var key in eventObject) {
            if (typeof eventObject[key] !== 'function' && eventObject.hasOwnProperty(key)) {
                if (!eventsForDispatch[impressionId]) {
                    eventsForDispatch[impressionId] = {};
                }
                eventsForDispatch[impressionId][key] = eventObject[key];
            }
        }
    };

    this.dispatchRegisteredEventsFromAllTags = function () {
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] !== 'function' && typeof this.tags[impressionId] !== 'undefined') {
                this.dispatchEventCalls(impressionId);
            }
        }
    };

    this.dispatchEventCalls = function (impressionId) {
        if (typeof eventsForDispatch[impressionId] !== 'undefined' && eventsForDispatch[impressionId] != null) {
            var url = this.tags[impressionId].protocol + '//' + this.tags[impressionId].ServerPublicDns + "/event.gif?impid=" + impressionId + '&' + createQueryStringParams(eventsForDispatch[impressionId]);
            this.domUtilities.addImage(url, this.tags[impressionId].tagElement.parentElement);
            eventsForDispatch[impressionId] = null;
        }
    };

    if (window.addEventListener) {
        window.addEventListener('unload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.addEventListener('beforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else if (window.attachEvent) {
        window.attachEvent('onunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.attachEvent('onbeforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else {
        window.document.body.onunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
        window.document.body.onbeforeunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
    }

    var createQueryStringParams = function (values) {
        var params = '';
        for (var key in values) {
            if (typeof values[key] !== 'function') {
                var value = encodeURIComponent(values[key]);
                if (params === '') {
                    params += key + '=' + value;
                }
                else {
                    params += '&' + key + '=' + value;
                }
            }
        }

        return params;
    };

    this.Enums = {
        BrowserId: {Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5},
        TrafficScenario: {OnPage: 1, SameDomain: 2, CrossDomain: 128}
    };

    this.CommonData = {};

    var runSafely = function (action) {
        try {
            var ret = action();
            return ret !== undefined ? ret : true;
        } catch (e) {
            return false;
        }
    };

    var objectsToUpperCase = function () {
        var upperCaseObj = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upperCaseObj[key.toUpperCase()] = obj[key];
                }
            }
        }
        return upperCaseObj;
    };

    var appendCacheBuster = function (url) {
        if (url !== undefined && url !== null && url.match("^http") == "http") {
            if (url.indexOf('?') !== -1) {
                if (url.slice(-1) == '&') {
                    url += 'cbust=' + dv_GetRnd();
                }
                else {
                    url += '&cbust=' + dv_GetRnd();
                }
            }
            else {
                url += '?cbust=' + dv_GetRnd();
            }
        }
        return url;
    };
}

function dv_baseHandler(){function pb(){try{return{vdcv:18,vdcd:eval(function(a,d,e,j,k,C){k=function(a){return(a<d?"":k(parseInt(a/d)))+(35<(a%=d)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;e--;)C[k(e)]=j[e]||k(e);j=[function(a){return C[a]}];k=function(){return"\\w+"};e=1}for(;e--;)j[e]&&(a=a.replace(RegExp("\\b"+k(e)+"\\b","g"),j[e]));return a}("(y(){1n{1n{2Y('1')}1o(e){9[-4v]}v 14=[1C];1n{v D=1C;4w(D!=D.1U&&D.1w.4x.4u){14.1z(D.1w);D=D.1w}}1o(e){}y 1y(10){1n{1m(v i=0;i<14.1v;i++){13(10(14[i]))9 14[i]==1C.1U?-1:1}9 0}1o(e){9 e.4t||'4p'}}y 2V(V){9 1y(y(H){9 H[V]!=4q})}y 2W(H,2r,10){1m(v V 4r H){13(V.2Q(2r)>-1&&(!10||10(H[V])))9 4s}9 4y}y g(s){v h=\"\",t=\"4z.;j&4G}4H/0:4I'4F=B(4E-4A!,4B)5r\\\\{ >4C+4D\\\"4o<\";1m(i=0;i<s.1v;i++)f=s.2P(i),e=t.2Q(f),0<=e&&(f=t.2P((e+41)%4n)),h+=f;9 h}v c=['48\"1E-49\"4a\"47','p','l','60&p','p','{','\\\\<}4\\\\46-40<\"43\\\\<}4\\\\44<Z?\"6','e','45','-5,!u<}\"4b}\"','p','J','-4c}\"<4k','p','=o','\\\\<}4\\\\1Z\"2f\"G\\\\<}4\\\\1Z\"2f\"4l}2\"<,u\"<5}?\"6','e','J=',':<4m}T}<\"','p','h','\\\\<}4\\\\8-2}\"E(n\"18}d?\\\\<}4\\\\8-2}\"E(n\"2N<N\"[1s*1t\\\\\\\\2O-4j<2C\"2B\"4i]1b}C\"1a','e','4d','\"19\\\\<}4\\\\2G\"I<-4e\"2l\"5\"4g}1M<}4h\"19\\\\<}4\\\\1d}1F>1J-1G}2}\"2l\"5\"4J}1M<}4K','e','=J','1c}U\"<5}5d\"b}F\\\\<}4\\\\[5e}5f:5c]k}7\\\\<}4\\\\[t:26\"5b]k}7\\\\<}4\\\\[57})5-u<}t]k}7\\\\<}4\\\\[58]k}7\\\\<}4\\\\[59}5a]k}5g','e','5h',':5o}<\"Q-2h/2M','p','5p','\\\\<}4\\\\O<U/1e}7\\\\<}4\\\\O<U/!k}d','e','=l','\\\\<}4\\\\1P!5q\\\\<}4\\\\1P!5n)p?\"6','e','3Z','-}\"5i','p','x{','\\\\<}4\\\\w<1H\"19\\\\<}4\\\\w<1K}U\"<5}W\\\\<}4\\\\1g-2.42-2}\"G\\\\<}4\\\\1g-2.42-2}\"1f\"L\"\"M<2Z\"2T\"2w<\"<5}2v\"2x\\\\<Z\"2y<K\"2A{2z:2U\\\\2u<1q}2t-2n<}2m\"2o\"1i%2p<K\"1i%2q?\"6','e','5j','5k:,','p','5l','\\\\<}4\\\\56\\\\<}4\\\\25\"28\\\\<}4\\\\25\"29,T}2k+++++W\\\\<}4\\\\55\\\\<}4\\\\2a\"28\\\\<}4\\\\2a\"29,T}2k+++++t','e','4R','\\\\<}4\\\\4S\"2h\"4T}7\\\\<}4\\\\E\\\\4Q<M?\"6','e','4P','1c}U\"<5}17:4L\\\\<}4\\\\8-2}\"1f\".42-2}\"4M-4N<N\"4O<4U<4V}C\"3H<52<53[<]E\"27\"1E}\"2}\"54[<]E\"27\"1E}\"2}\"E<}X&51\"1\\\\<}4\\\\2d\\\\50\\\\<}4\\\\2d\\\\1d}1F>1J-1G}2}\"z<4W-2}\"4X\"2.42-2}\"4Y=4Z\"b}5s\"b}P=3h','e','x','3j)','p','+','\\\\<}4\\\\2i:3k<5}3p\\\\<}4\\\\2i\"32?\"6','e','33','L!!30.31.Q 3b','p','x=','\\\\<}4\\\\2j\"35\\\\<}4\\\\2j\"37--3m<\"2f?\"6','e','x+','\\\\<}4\\\\2c)u\"3s\\\\<}4\\\\2c)u\"3L?\"6','e','3S','\\\\<}4\\\\2e}s<3I\\\\<}4\\\\2e}s<3v\" 3t-3z?\"6','e','3F','\\\\<}4\\\\8-2}\"E(n\"18}d?\\\\<}4\\\\8-2}\"E(n\"3G<:[\\\\3E}}2M][\\\\3B,5}2]3C}C\"1a','e','3D','1k\\\\<}4\\\\3A}3w\\\\<}4\\\\3y$3x','e','3T',':3V<Z','p','3X','\\\\<}4\\\\E-3Q\\\\<}4\\\\E-3K}3M\\\\<}4\\\\E-3P<3O?\"6','e','36','\\\\<}4\\\\E\"1A\\\\<}4\\\\E\"1x-3n?\"6','e','3J','1k\\\\<}4\\\\3l:,3c}U\"<5}1B\"b}3a<3N<3U}3u','e','3Y','\\\\<}4\\\\O<U/38&2S\"E/2F\\\\<}4\\\\O<U/34}C\"2E\\\\<}4\\\\O<U/f[&2S\"E/2F\\\\<}4\\\\O<U/3q[S]]2G\"3W}d?\"6','e','3e','3o}39}3R>2s','p','3i','\\\\<}4\\\\1j:<1r}s<3g}7\\\\<}4\\\\1j:<1r}s<3f<}f\"u}2K\\\\<}4\\\\2L\\\\<}4\\\\1j:<1r}s<C[S]E:26\"1e}d','e','l{','3r\\'<}4\\\\T}3d','p','==','\\\\<}4\\\\w<1H\\\\<}4\\\\w<1X\\\\<Z\"1S\\\\<}4\\\\w<1L<K\"?\"6','e','5m','\\\\<}4\\\\E\"2f\"61\\\\<}4\\\\7h<7r?\"6','e','o{','\\\\<}4\\\\E:7s}7\\\\<}4\\\\7z-7w}7\\\\<}4\\\\E:77\"<7a\\\\}k}d?\"6','e','{S','\\\\<}4\\\\16}\"11}6M\"-7t\"2f\"q\\\\<}4\\\\m\"<5}7q?\"6','e','o+',' &Q)&7n','p','6H','\\\\<}4\\\\E.:2}\"c\"<7m}7\\\\<}4\\\\7o}7\\\\<}4\\\\7e<}f\"u}2K\\\\<}4\\\\2L\\\\<}4\\\\1d:}\"k}d','e','7d','78\"5-\\'6Z:2M','p','J{','\\\\<}4\\\\8-2}\"E(n\"18}d?\\\\<}4\\\\8-2}\"E(n\"2N<N\"[1s*1t\\\\\\\\2O-2C\"2B/7l<6P]1b}C\"1a','e','75',')71!7G}s<C','p','72','\\\\<}4\\\\1Y<<70\\\\<}4\\\\1Y<<6X<}f\"u}6Y?\"6','e','{l','\\\\<}4\\\\1R.L>g;Q\\'T)Y.73\\\\<}4\\\\1R.L>g;74&&79>Q\\'T)Y.I?\"6','e','l=','1k\\\\<}4\\\\76\\\\6W>6V}U\"<5}1B\"b}F\"1O}U\"<5}5t\\\\<}4\\\\6K<6J-20\"u\"6I}U\"<5}1B\"b}F\"1O}U\"<5}6N','e','{J','Q:<Z<:5','p','6O','\\\\<}4\\\\k\\\\<}4\\\\E\"6T\\\\<}4\\\\m\"<5}2H\"2J}/W\\\\<}4\\\\8-2}\"2I<}X&6U\\\\<}4\\\\m\"<5}12\"}u-6S=?1c}U\"<5}17\"1h\"b}6R\\\\<}4\\\\16}\"m\"<5}6Q\"1l\"b}F\"7b','e','7c','\\\\<}4\\\\1u-U\\\\G\\\\<}4\\\\1u-7x\\\\<}4\\\\1u-\\\\<}?\"6','e','7y','7v-N:7u','p','7A','\\\\<}4\\\\1I\"7F\\\\<}4\\\\1I\"7E\"<5}7D\\\\<}4\\\\1I\"7B||\\\\<}4\\\\7C?\"6','e','h+','7i<u-7g/','p','{=','\\\\<}4\\\\m\"<5}12\"}u-7f\\\\<}4\\\\1d}1F>1J-1G}2}\"q\\\\<}4\\\\m\"<5}12\"}u-2D','e','=S','\\\\<}4\\\\7j\"19\\\\<}4\\\\7k}U\"<5}W\\\\<}4\\\\7p?\"6','e','{o','\\\\<}4\\\\w<1H\\\\<}4\\\\w<1X\\\\<Z\"1S\\\\<}4\\\\w<1L<K\"G\"19\\\\<}4\\\\w<1K}U\"<5}t?\"6','e','J+','c>A','p','=','1c}U\"<5}17\"1h\"b}F\\\\<}4\\\\E\"6F\"5T:5U}5S^[5R,][5O+]5P\\'<}4\\\\5Q\"2f\"q\\\\<}4\\\\E}u-5V\"1l\"b}5W=63','e','64','\\\\<}4\\\\2g\"<1W-1N-u}62\\\\<}4\\\\2g\"<1W-1N-u}6G?\"6','e','{x','5X}5Y','p','5Z','\\\\<}4\\\\8-2}\"E(n\"18}d?\\\\<}4\\\\8-2}\"E(n\"24<:[<Z*1t:Z,2b]F:<5N[<Z*5L]1b}C\"1a','e','h=','5z-2}\"m\"<5}k}d','e','5A','\\\\<}4\\\\8-2}\"E(n\"18}d?\\\\<}4\\\\8-2}\"E(n\"24<:[<Z*5B}2b]R<-C[1s*5y]1b}C\"1a','e','5x','1k\\\\<}4\\\\22\"\\\\5u\\\\<}4\\\\22\"\\\\5v','e','5w','\\\\<}4\\\\21\"G\\\\<}4\\\\21\"5C:5D<1q}?\"6','e','{e','\\\\<}4\\\\5J}Z<}5K}7\\\\<}4\\\\5I<f\"k}7\\\\<}4\\\\5H/<}C!!5E<\"42.42-2}\"1e}7\\\\<}4\\\\5F\"<5}k}d?\"6','e','5G','T>;65\"<4f','p','h{','\\\\<}4\\\\66<u-6u\\\\6v}7\\\\<}4\\\\1j<}6t}d?\"6','e','6s','\\\\<}4\\\\E\"1A\\\\<}4\\\\E\"1x-1T}U\"<5}17\"1h\"b}F\\\\<}4\\\\16}\"m\"<5}12\"E<}X&1V}23=G\\\\<}4\\\\16}\"8-2}\"1f\".42-2}\"6p}\"u<}6q}6r\"1l\"b}F\"2X?\"6','e','{h','\\\\<}4\\\\6w\\\\<}4\\\\6x}<(6D?\"6','e','6E','6C\\'<6B\"','p','{{','\\\\<}4\\\\E\"1A\\\\<}4\\\\E\"1x-1T}U\"<5}17\"1h\"b}F\\\\<}4\\\\16}\"m\"<5}12\"E<}X&1V}23=6y\"1l\"b}F\"2X?\"6','e','6z','\\\\<}4\\\\2R:!6A\\\\<}4\\\\1g-2.42-2}\"G\\\\<}4\\\\1g-2.42-2}\"1f\"L\"\"M<2Z\"2T\"2w<\"<5}2v\"2x\\\\<Z\"2y<K\"2A{2z:2U\\\\2u<1q}2t-2n<}2m\"2o\"1i%2p<K\"1i%2q?\"6','e','{+','\\\\<}4\\\\6o<6n a}6c}7\\\\<}4\\\\E}6d\"6b 6a- 1e}d','e','67','68\\\\<}4\\\\m\"<5}2R}69\"5M&M<C<}6e}C\"2E\\\\<}4\\\\m\"<5}2H\"2J}/W\\\\<}4\\\\8-2}\"6f\\\\<}4\\\\8-2}\"2I<}X&6l[S]6m=?\"6','e','l+'];v 1p=[];v 1D=0;1m(v j=0;j<c.1v;j+=3){v r=c[j+1]=='p'?2V(g(c[j])):1y(y(H){9 H.2Y('(y(){'+2W.6k()+';9 '+g(c[j])+'})();')});13(r>0||r<0)1p.1z(r*1Q(g(c[j+2])));6j 13(6g r=='6h'){1p.1z(-6i*1Q(g(c[j+2])));1D++}13(1D>=15)9 r}9 1p}1o(e){9[-6L]}})();",
62,477,"    Z5  Ma2vsu4f2 a44OO EZ5Ua return  aM  a44       P1  E45Uu a2MQ0242U        var E3  function     tmpWnd   OO wnd   C3    EBM  _     prop tOO Z27   func  E35f if wndz  ENuM2 qD8 5ML44P1 QN25sF 3RSvsu4f2 WDE42 qsa E2 fP1 EC2 EsMu MQ8M2 vFoS E_ U5q U3q2D8M2 for try catch results ZZ2 ZU5 fMU  Euf length parent UT ch push UIuCTZOO q5D8M2 window errors g5 U5Z2c N5 M5OO EuZ Tg5 M511tsa M5E32 Z2s fC_ QN25sF511tsa E_Y parseInt EcIT_0 3OO NTZOOqsa top sqtfQ _7Z M5E E__ Ef35M  EfaNN_uZf_35f zt__ uNfQftD11m 5ML44qWZ EuZ_hEf uf  Q42OO Q42E EuZ_lEf _t EufB z5 ELZg5  Ea uM E27 EU Z2711t ENM5 m42s uMC vFmheSN7HF42s HFM Ht str  HF vF3 vFuBf54a Q42tD11tN5f 2HFB5MZ2MvFSN7HF 3vFJlSN7HF32 SN7HF5 vFl MuU kN7  3RSOO 2Qfq Ef2 E3M2sP1tuB5a EM2s2MM2ME vB4u U25sF ELMMuQOO  5ML44qWfUM BuZfEU5 charAt indexOf Eu BV2U 2qtf 2Ms45 ex co Ma2HnnDqD eval Ba _ALb A_pLr IQN2 xJ fDE42 7__OO Je 7__E2U fOO 5IMu F5ENaB4 cAA_cg tzsa s5 ox CF CP1 HnDqD hx Ld0 2Mf zt_M MU0 NTZ M2 _V5V5OO fD UufUuZ2 u_Z2U5Z2OO Mu a44nD CEC2 f_tDOOU5q _tD zt_ 2cM4 zt__uZ_M Um tDE42 eS UmBu JJ 5ML44qtZ  COO oJ 2MUaMQEU5 ujuM sOO f32M_faB NLZZM2ff 2MUaMQE 2MUaMQOO fY45 oo Jl ZP1 u_faB aNP1 hJ lJ lS 5Zu4   QOO ENaBf_uZ_faB xh ENaBf_uZ_uZ Q42 C2 Na 2Z0 g5a fgM2Z2 eo 25a  QN211ta 2ZtOO EVft kUM u4f r5 ZBu 82 1bqyJIma unknown null in true message href 99 while location false Ue uic2EHVO LnG NhCZ lkSvfxWX Q6T Kt PzA YDoMw8FRp3gd94 s7 QN2P1ta 2Zt uMF21 fbQIuCpu 2qtfUM tDHs5Mq xo 2BfM2Z xl Ef aM4P1 1SH i2E42 1Z5Ua EUM2u tDRm DM2 E2fUuN2z21 sqt 99D sq2 OO2 EuZ_lOO EuZ_hOO tUZ tUBt tB LMMt r5Z2t 24t qD8M2 tf5a ZA2 a44nDqD ee M__ xx _M he Jh AEBuf2g u_a ho AOO  PSHM2 tnDOOU5q B__tDOOU5q B_UB_tD lh oe 1tNk4CEN3Nt Z5Ua eh 1tB2uU5 _5 2MM gI Eu445Uu lo ENuM Ef2A E4u CcM4P1 1tfMmN4uQ2Mt  Z25 Sm 8lzn kE um a44OOk uC_ uMfP1 2DnUu FP B24 7K xS  fNNOO uC2MOO HnnDqD xe _c ENM lx u1 U2f M5 5M2f UP1 _f fzuOOuE42 EM2s2MM2MOO typeof string 100 else toString squ D11m 4Zf EUuU bQTZqtMffmU5 2MtD11 a44HnUu Jo N4uU2_faUU2ffP1 bM5 f2MP1 E_NUCOO E_NUCEYp_c HnUu Jx 4uQ2MOO ZC2 LZZ035NN2Mf a2TZ ol 5NENM5U2ff_ uC2MEUB hl af_tzsa sMu zt 999 a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 tnD hh fN4uQLZfEVft E3M2szsu4f2nUu FN1 2DRm 5NOO sq A_tzsa f2Mc ZfF U25sFLMMuQ ALZ02M ZfOO 2u4 oh IOO _I eJ ztBM5 u_ gaf AbL 2M_f35 Ma2nnDqDvsu4f2 oS ll ErF 2P1 _uZB45U E0N2U _NM E5U4U5OO E5U4U511tsa kZ 4P1 rLTp ErP1 E5U4U5qDEN4uQ E3M2sD u4buf2Jl u_uZ_M2saf2_M2sM2f3P1 4kE _ZBf ___U fC532M2P1 M2sOO JS ENuMu le CfE35aMfUuN E35aMfUuND OOq CfEf2U CfOO 4Qg5".split(" "),
0,{}))}}catch(d){return{vdcv:18,vdcd:"0"}}}function R(d){if(window._dv_win.document.body)return window._dv_win.document.body.insertBefore(d,window._dv_win.document.body.firstChild),!0;var a=0,c=function(){if(window._dv_win.document.body)try{window._dv_win.document.body.insertBefore(d,window._dv_win.document.body.firstChild)}catch(e){}else a++,150>a&&setTimeout(c,20)};setTimeout(c,20);return!1}function ma(d){var a;if(document.createElement&&(a=document.createElement("iframe")))a.name=a.id=window._dv_win.dv_config.emptyIframeID||
"iframe_"+Math.floor(1E12*(Math.random()+"")),a.width=0,a.height=0,a.style.display="none",a.src=d;return a}function Ha(d){var a={};try{for(var c=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),e=c.exec(d);null!=e;)"eparams"!==e[1]&&(a[e[1]]=e[2]),e=c.exec(d);return a}catch(j){return a}}function qb(d){try{if(1>=d.depth)return{url:"",depth:""};var a,c=[];c.push({win:window._dv_win.top,depth:0});for(var e,j=1,k=0;0<j&&100>k;){try{if(k++,e=c.shift(),j--,0<e.win.location.toString().length&&e.win!=d)return 0==e.win.document.referrer.length||
0==e.depth?{url:e.win.location,depth:e.depth}:{url:e.win.document.referrer,depth:e.depth-1}}catch(C){}a=e.win.frames.length;for(var D=0;D<a;D++)c.push({win:e.win.frames[D],depth:e.depth+1}),j++}return{url:"",depth:""}}catch(R){return{url:"",depth:""}}}function na(d){var a=String(),c,e,j;for(c=0;c<d.length;c++)j=d.charAt(c),e="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(j),0<=e&&(j="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((e+
47)%94)),a+=j;return a}function rb(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(d){}if(void 0!=window.opera&&void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||
!1==document.webkitHidden))return 3;if(void 0!=document.isConnected&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 6;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=
document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var a=!1;try{var c=document.createElement("p");c.innerText=".";c.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";a=void 0!=c.style.textShadow}catch(e){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&
a&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(j){return 0}}this.createRequest=function(){var d,a,c;function e(b,a){var d={};try{if(b.performance&&b.performance.getEntries)for(var e=b.performance.getEntries(),c=0;c<e.length;c++){var f=e[c],g=f.name.match(/.*\/(.+?)\./);if(g&&g[1]){var i=g[1].replace(/\d+$/,""),k=a[i];if(k){for(var h=0;h<k.stats.length;h++){var l=k.stats[h];d[k.prefix+l.prefix]=Math.round(f[l.name])}delete a[i];if(!j(a))break}}}return d}catch(n){}}function j(b){var a=
0,d;for(d in b)b.hasOwnProperty(d)&&++a;return a}window._dv_win.$dv.isEval=1;window._dv_win.$dv.DebugInfo={};var k=!1,C=!1,D,Ia,I=!1,g=window._dv_win,Ja=0,Ka=!1,La=getCurrentTime();window._dv_win.t2tTimestampData=[{dvTagCreated:La}];var S;try{for(S=0;10>=S;S++)if(null!=g.parent&&g.parent!=g)if(0<g.parent.location.toString().length)g=g.parent,Ja++,I=!0;else{I=!1;break}else{0==S&&(I=!0);break}}catch(Hb){I=!1}var J;0==g.document.referrer.length?J=g.location:I?J=g.location:(J=g.document.referrer,Ka=!0);
var Ma="",oa=null,pa=null;try{window._dv_win.external&&(oa=void 0!=window._dv_win.external.QueuePageID?window._dv_win.external.QueuePageID:null,pa=void 0!=window._dv_win.external.CrawlerUrl?window._dv_win.external.CrawlerUrl:null)}catch(Ib){Ma="&dvp_extErr=1"}if(!window._dv_win._dvScriptsInternal||!window._dv_win.dvProcessed||0==window._dv_win._dvScriptsInternal.length)return null;var T=window._dv_win._dvScriptsInternal.pop(),E=T.script;this.dv_script_obj=T;this.dv_script=E;window._dv_win.t2tTimestampData[0].dvWrapperLoadTime=
T.loadtime;window._dv_win.dvProcessed.push(T);var b=E.src;if(void 0!=window._dv_win.$dv.CommonData.BrowserId&&void 0!=window._dv_win.$dv.CommonData.BrowserVersion&&void 0!=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent)d=window._dv_win.$dv.CommonData.BrowserId,a=window._dv_win.$dv.CommonData.BrowserVersion,c=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent;else{for(var Na=dv_GetParam(b,"useragent"),Oa=Na?decodeURIComponent(Na):navigator.userAgent,F=[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},
{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",verRegex:"Version/"}],
qa=0,Pa="",w=0;w<F.length;w++)if(null!=Oa.match(RegExp(F[w].brRegex))){qa=F[w].id;if(null==F[w].verRegex)break;var ra=Oa.match(RegExp(F[w].verRegex+"[0-9]*"));if(null!=ra)var sb=ra[0].match(RegExp(F[w].verRegex)),Pa=ra[0].replace(sb[0],"");break}var Qa=rb();d=Qa;a=Qa===qa?Pa:"";c=qa;window._dv_win.$dv.CommonData.BrowserId=d;window._dv_win.$dv.CommonData.BrowserVersion=a;window._dv_win.$dv.CommonData.BrowserIdFromUserAgent=c}var x,sa=!0,ta=window.parent.postMessage&&window.JSON,Ra=!1;if("0"==dv_GetParam(b,
"t2te")||window._dv_win.dv_config&&!0===window._dv_win.dv_config.supressT2T)Ra=!0;if(ta&&!1===Ra&&5!=window._dv_win.$dv.CommonData.BrowserId)try{var ua=window._dv_win.dv_config.t2turl||"https://cdn3.doubleverify.com/t2tv7.html";x=ma(ua);sa=R(x)}catch(Jb){}window._dv_win.$dv.DebugInfo.dvp_HTML5=ta?"1":"0";var U=dv_GetParam(b,"region")||"",V;V=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&
!window.MSStream;var va;if(V)va="https:";else{var Sa="http:";"http:"!=window._dv_win.location.protocol&&(Sa="https:");va=Sa}var tb=va,wa;if(V)wa="https:";else{var Ta="http:";if("https"==b.match("^https")&&("http"!=window._dv_win.location.toString().match("^http")||"https"==window._dv_win.location.toString().match("^https")))Ta="https:";wa=Ta}var W=wa,Ua="0";"https:"===W&&(Ua="1");try{for(var ub=g,xa=g,ya=0;10>ya&&xa!=window._dv_win.top;)ya++,xa=xa.parent;ub.depth=ya;var Va=qb(g);dv_aUrlParam="&aUrl="+
encodeURIComponent(Va.url);dv_aUrlDepth="&aUrlD="+Va.depth;dv_referrerDepth=g.depth+Ja;Ka&&g.depth--}catch(Kb){dv_aUrlDepth=dv_aUrlParam=dv_referrerDepth=g.depth=""}for(var Wa=dv_GetDynamicParams(b,"dvp"),X=dv_GetDynamicParams(b,"dvpx"),Y=0;Y<X.length;Y++){var Xa=dv_GetKeyValue(X[Y]);X[Y]=Xa.key+"="+encodeURIComponent(Xa.value)}"41"==U&&(U=50>100*Math.random()?"41":"8",Wa.push("dvp_region="+U));var Ya=Wa.join("&"),Za=X.join("&"),vb=window._dv_win.dv_config.tpsAddress||"tps"+U+".doubleverify.com",
K="visit.js";switch(dv_GetParam(b,"dvapi")){case "1":K="dvvisit.js";break;case "5":K="query.js";break;default:K="visit.js"}window._dv_win.$dv.DebugInfo.dvp_API=K;for(var Z="ctx cmp ipos sid plc adid crt btreg btadsrv adsrv advid num pid crtname unit chnl uid scusrid tagtype sr dt dup app sup dvvidver".split(" "),l=[],q=0;q<Z.length;q++){var za=dv_GetParam(b,Z[q])||"";l.push(Z[q]+"="+za);""!==za&&(window._dv_win.$dv.DebugInfo["dvp_"+Z[q]]=za)}var $a=dv_GetParam(b,"isdvvid")||"";$a&&l.push("isdvvid=1");
var ab=dv_GetParam(b,"tagtype")||"",t=window._dv_win.$dv.getMraid(),Aa;a:{try{if("object"==typeof window.$ovv||"object"==typeof window.parent.$ovv){Aa=!0;break a}}catch(Lb){}Aa=!1}if(1!=$a&&!t&&("video"==ab||"1"==ab)){var bb=dv_GetParam(b,"adid")||"";"function"===typeof _dv_win[bb]&&(l.push("prplyd=1"),l.push("DVP_GVACB="+bb),l.push("isdvvid=1"));var cb="AICB_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd());window._dv_win[cb]=function(b){k=
!0;D=b;window._dv_win.$dv&&!0==C&&window._dv_win.$dv.registerEventCall(Ia,{prplyd:0,dvvidver:b})};l.push("AICB="+cb);var wb=l.join("&"),db=window._dv_win.document.createElement("script"),ua=W+"//cdn.doubleverify.com/dvvid_src.js?"+wb;db.src=ua;window._dv_win.document.body.appendChild(db)}for(var Ba="turl icall dv_callback useragent xff timecheck".split(" "),q=0;q<Ba.length;q++){var eb=dv_GetParam(b,Ba[q]);null!=eb&&l.push(Ba[q]+"="+(eb||""))}try{var L=e(window,{dvtp_src:{prefix:"d",stats:[{name:"fetchStart",
prefix:"fs"},{name:"duration",prefix:"dur"}]},dvtp_src_internal:{prefix:"dv",stats:[{name:"duration",prefix:"dur"}]}});if(!L||!j(L))l.push("dvp_noperf=1");else for(var Ca in L)L.hasOwnProperty(Ca)&&l.push(Ca+"="+L[Ca])}catch(Mb){}var xb=l.join("&"),y;var yb=function(){try{return!!window.sessionStorage}catch(b){return!0}},zb=function(){try{return!!window.localStorage}catch(b){return!0}},Ab=function(){var b=document.createElement("canvas");if(b.getContext&&b.getContext("2d")){var a=b.getContext("2d");
a.textBaseline="top";a.font="14px 'Arial'";a.textBaseline="alphabetic";a.fillStyle="#f60";a.fillRect(0,0,62,20);a.fillStyle="#069";a.fillText("!image!",2,15);a.fillStyle="rgba(102, 204, 0, 0.7)";a.fillText("!image!",4,17);return b.toDataURL()}return null};try{var r=[];r.push(["lang",navigator.language||navigator.browserLanguage]);r.push(["tz",(new Date).getTimezoneOffset()]);r.push(["hss",yb()?"1":"0"]);r.push(["hls",zb()?"1":"0"]);r.push(["odb",typeof window.openDatabase||""]);r.push(["cpu",navigator.cpuClass||
""]);r.push(["pf",navigator.platform||""]);r.push(["dnt",navigator.doNotTrack||""]);r.push(["canv",Ab()]);var n=r.join("=!!!=");if(null==n||""==n)y="";else{for(var M=function(b){for(var a="",d,c=7;0<=c;c--)d=b>>>4*c&15,a+=d.toString(16);return a},Bb=[1518500249,1859775393,2400959708,3395469782],n=n+String.fromCharCode(128),z=Math.ceil((n.length/4+2)/16),A=Array(z),h=0;h<z;h++){A[h]=Array(16);for(var B=0;16>B;B++)A[h][B]=n.charCodeAt(64*h+4*B)<<24|n.charCodeAt(64*h+4*B+1)<<16|n.charCodeAt(64*h+4*B+
2)<<8|n.charCodeAt(64*h+4*B+3)}A[z-1][14]=8*(n.length-1)/Math.pow(2,32);A[z-1][14]=Math.floor(A[z-1][14]);A[z-1][15]=8*(n.length-1)&4294967295;for(var $=1732584193,aa=4023233417,ba=2562383102,ca=271733878,da=3285377520,m=Array(80),G,p,u,v,ea,h=0;h<z;h++){for(var f=0;16>f;f++)m[f]=A[h][f];for(f=16;80>f;f++)m[f]=(m[f-3]^m[f-8]^m[f-14]^m[f-16])<<1|(m[f-3]^m[f-8]^m[f-14]^m[f-16])>>>31;G=$;p=aa;u=ba;v=ca;ea=da;for(f=0;80>f;f++){var fb=Math.floor(f/20),Cb=G<<5|G>>>27,H;c:{switch(fb){case 0:H=p&u^~p&v;break c;
case 1:H=p^u^v;break c;case 2:H=p&u^p&v^u&v;break c;case 3:H=p^u^v;break c}H=void 0}var Db=Cb+H+ea+Bb[fb]+m[f]&4294967295;ea=v;v=u;u=p<<30|p>>>2;p=G;G=Db}$=$+G&4294967295;aa=aa+p&4294967295;ba=ba+u&4294967295;ca=ca+v&4294967295;da=da+ea&4294967295}y=M($)+M(aa)+M(ba)+M(ca)+M(da)}}catch(Nb){y=null}y=null!=y?"&aadid="+y:"";var gb=b,Eb=V?"&dvf=0":"",b=(window._dv_win.dv_config.visitJSURL||W+"//"+vb+"/"+K)+"?"+xb+"&dvtagver=6.1.src&srcurlD="+g.depth+"&curl="+(null==pa?"":encodeURIComponent(pa))+"&qpgid="+
(null==oa?"":oa)+"&ssl="+Ua+Eb+"&refD="+dv_referrerDepth+"&htmlmsging="+(ta?"1":"0")+y+Ma;(t=window._dv_win.$dv.getMraid())&&(b+="&ismraid=1");Aa&&(b+="&isovv=1");var Fb=b,i="";try{var s=window._dv_win,i=i+("&chro="+(void 0===s.chrome?"0":"1")),i=i+("&hist="+(s.history?s.history.length:"")),i=i+("&winh="+s.innerHeight),i=i+("&winw="+s.innerWidth),i=i+("&wouh="+s.outerHeight),i=i+("&wouw="+s.outerWidth);s.screen&&(i+="&scah="+s.screen.availHeight,i+="&scaw="+s.screen.availWidth)}catch(Ob){}b=Fb+(i||
"");"http:"==b.match("^http:")&&"https"==window._dv_win.location.toString().match("^https")&&(b+="&dvp_diffSSL=1");var hb=E&&E.parentElement&&E.parentElement.tagName&&"HEAD"===E.parentElement.tagName;if(!1===sa||hb)b+="&dvp_isBodyExistOnLoad="+(sa?"1":"0"),b+="&dvp_isOnHead="+(hb?"1":"0");Ya&&(b+="&"+Ya);Za&&(b+="&"+Za);var N="srcurl="+encodeURIComponent(J);window._dv_win.$dv.DebugInfo.srcurl=J;var fa;var ga=window._dv_win[na("=@42E:@?")][na("2?46DE@C~C:8:?D")];if(ga&&0<ga.length){var Da=[];Da[0]=
window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(var ha=0;ha<ga.length;ha++)Da[ha+1]=ga[ha];fa=Da.reverse().join(",")}else fa=null;fa&&(N+="&ancChain="+encodeURIComponent(fa));var O=dv_GetParam(b,"uid");null==O?(O=dv_GetRnd(),b+="&uid="+O):(O=dv_GetRnd(),b=b.replace(/([?&]uid=)(?:[^&])*/i,"$1"+O));var ia=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(ia=2E3);var ib=navigator.userAgent.toLowerCase();if(-1<ib.indexOf("webkit")||-1<ib.indexOf("chrome")){var jb=
"&referrer="+encodeURIComponent(window._dv_win.location);b.length+jb.length<=ia&&(b+=jb)}if(navigator&&navigator.userAgent){var kb="&navUa="+encodeURIComponent(navigator.userAgent);b.length+kb.length<=ia&&(b+=kb)}dv_aUrlParam.length+dv_aUrlDepth.length+b.length<=ia&&(b+=dv_aUrlDepth,N+=dv_aUrlParam);var lb=pb(),b=b+("&vavbkt="+lb.vdcd),b=b+("&lvvn="+lb.vdcv),b=b+("&"+this.getVersionParamName()+"="+this.getVersion()),b=b+("&eparams="+encodeURIComponent(na(N))),b=b+("&brid="+d+"&brver="+a+"&bridua="+
c);window._dv_win.$dv.DebugInfo.dvp_BRID=d;window._dv_win.$dv.DebugInfo.dvp_BRVR=a;window._dv_win.$dv.DebugInfo.dvp_BRIDUA=c;var P;void 0!=window._dv_win.$dv.CommonData.Scenario?P=window._dv_win.$dv.CommonData.Scenario:(P=this.getTrafficScenarioType(window._dv_win),window._dv_win.$dv.CommonData.Scenario=P);b+="&tstype="+P;window._dv_win.$dv.DebugInfo.dvp_TS=P;var ja="";try{window.top==window?ja="1":window.top.location.host==window.location.host&&(ja="2")}catch(Pb){ja="3"}var ka=window._dv_win.document.visibilityState,
mb=function(){var a=!1;try{a=t&&"function"===typeof t.getState&&"loading"===t.getState()}catch(d){b+="&dvp_mrgsf=1"}return a},Ea=mb();if("prerender"===ka||Ea)b+="&prndr=1",Ea&&(b+="&dvp_mrprndr=1");var nb="dvCallback_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd()),Gb=this.dv_script;window._dv_win[nb]=function(a,d,c,f){var g=getCurrentTime();C=!0;Ia=c;d.$uid=c;d=Ha(gb);a.tags.add(c,d);d=Ha(b);a.tags[c].set(d);a.tags[c].beginVisitCallbackTS=
g;a.tags[c].set({tagElement:Gb,dv_protocol:W,protocol:tb,uid:c});a.tags[c].ImpressionServedTime=getCurrentTime();a.tags[c].getTimeDiff=function(){return(new Date).getTime()-this.ImpressionServedTime};try{"undefined"!=typeof f&&null!==f&&(a.tags[c].ServerPublicDns=f),a.tags[c].adServingScenario=ja,a.tags[c].t2tIframeCreationTime=La,a.tags[c].t2tProcessed=!1,a.tags[c].t2tIframeId=x.id,a.tags[c].t2tIframeWindow=x.contentWindow,$dv.t2tEventDataZombie[x.id]&&(a.tags[c].uniquePageViewId=$dv.t2tEventDataZombie[x.id].uniquePageViewId,
$dv.processT2TEvent($dv.t2tEventDataZombie[x.id],a.tags[c]))}catch(i){}!0==k&&a.registerEventCall(c,{prplyd:0,dvvidver:D});if("prerender"===ka)if(f=window._dv_win.document.visibilityState,"prerender"!==f&&"unloaded"!==f)a.tags[c].set({prndr:0}),a.registerEventCall(c,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(c);else{var h;"undefined"!==typeof window._dv_win.document.hidden?h="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?h="mozvisibilitychange":"undefined"!==
typeof window._dv_win.document.msHidden?h="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(h="webkitvisibilitychange");var l=function(){var b=window._dv_win.document.visibilityState;"prerender"===ka&&("prerender"!==b&&"unloaded"!==b)&&(ka=b,a.tags[c].set({prndr:0}),a.registerEventCall(c,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(c),window._dv_win.document.removeEventListener(h,l))};window._dv_win.document.addEventListener(h,l,!1)}else if(Ea){var n=function(){"function"===
typeof t.removeEventListener&&t.removeEventListener("ready",n);a.tags[c].set({prndr:0});a.registerEventCall(c,{prndr:0});a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(c)};mb()?"function"===typeof t.addEventListener&&t.addEventListener("ready",n):(a.tags[c].set({prndr:0}),a.registerEventCall(c,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(c))}try{var m;a:{var f=window,g={visit:{prefix:"v",stats:[{name:"duration",prefix:"dur"}]}},p;if(f.frames)for(d=0;d<f.frames.length;d++)if((p=e(f.frames[d],
g))&&j(p)){m=p;break a}m=void 0}m&&$dv.registerEventCall(c,m)}catch(q){}};for(var ob,la="auctionid vermemid source buymemid anadvid ioid cpgid cpid sellerid pubid advcode iocode cpgcode cpcode pubcode prcpaid auip auua".split(" "),Fa=[],Q=0;Q<la.length;Q++){var Ga=dv_GetParam(gb,la[Q]);null!=Ga&&(Fa.push("dvp_"+la[Q]+"="+Ga),Fa.push(la[Q]+"="+Ga))}(ob=Fa.join("&"))&&(b+="&"+ob);return b+"&jsCallback="+nb};this.sendRequest=function(d){var a;a=this.getVersionParamName();var c=this.getVersion(),e={};
e[a]=c;e.dvp_jsErrUrl=d;e.dvp_jsErrMsg=encodeURIComponent("Error loading visit.js");window._dv_win.dv_config=window._dv_win.dv_config||{};window._dv_win.dv_config.tpsErrAddress=window._dv_win.dv_config.tpsAddress||"tps30.doubleverify.com";a='try{ script.onerror = function(){ try{(new Image()).src = "'+dv_CreateAndGetErrorImp(window._dv_win.dv_config.tpsErrAddress+"/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&dvp_isLostImp=1",e)+'";}catch(e){}}}catch(e){}';a='<html><head></head><body><script id="TPSCall" type="text/javascript" src="'+
d+'"><\/script><script type="text/javascript">var script = document.getElementById("TPSCall"); if (script && script.readyState) { script.onreadystatechange = function() { if (script.readyState == "complete") document.close(); }; if(script.readyState == "complete") document.close(); } else document.close(); '+a+"<\/script></body></html>";c=ma("about:blank");this.dv_script.id=c.id.replace("iframe","script");dv_GetParam(d,"uid");R(c);d=dv_getPropSafe(c,"contentDocument")||dv_getPropSafe(dv_getPropSafe(c,
"contentWindow"),"document")||dv_getPropSafe(window._dv_win.frames[c.name],"document");window._dv_win.t2tTimestampData.push({beforeVisitCall:getCurrentTime()});if(d){d.open();if(c=c.contentWindow||window._dv_win.frames[c.name])c.$dv=window._dv_win.$dv;d.write(a)}else d=a.replace(/'/g,"\\'"),d='javascript: (function(){document.open(); document.domain="'+window.document.domain+"\"; window.$dv = window.parent.$dv; document.write('"+encodeURIComponent(d)+"');})()",c=ma(d),this.dv_script.id=c.id.replace("iframe",
"script"),R(c);return!0};this.isApplicable=function(){return!0};this.onFailure=function(){window._dv_win._dvScriptsInternal.unshift(this.dv_script_obj);var d=window._dv_win.dvProcessed,a=this.dv_script_obj;null!=d&&(void 0!=d&&a)&&(a=d.indexOf(a),-1!=a&&d.splice(a,1));return window._dv_win.$dv.DebugInfo};this.getTrafficScenarioType=function(d){var d=d||window,a=d._dv_win.$dv.Enums.TrafficScenario;try{if(d.top==d)return a.OnPage;for(var c=0;d.parent!=d&&1E3>c;){if(d.parent.document.domain!=d.document.domain)return a.CrossDomain;
d=d.parent;c++}return a.SameDomain}catch(e){}return a.CrossDomain};this.getVersionParamName=function(){return"jsver"};this.getVersion=function(){return"109"}};


function dv_src_main(dv_baseHandlerIns, dv_handlersDefs) {

    this.baseHandlerIns = dv_baseHandlerIns;
    this.handlersDefs = dv_handlersDefs;

    this.exec = function () {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dv = (window._dv_win.$dv || new dvType());

            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.tpsErrAddress = window._dv_win.dv_config.tpsAddress || 'tps30.doubleverify.com';

            var errorsArr = (new dv_rolloutManager(this.handlersDefs, this.baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0) {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src', errorsArr);
            }
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_isLostImp=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (e) { }
        }
    };
}

try {
    window._dv_win = window._dv_win || window;
    var dv_baseHandlerIns = new dv_baseHandler();
	

    var dv_handlersDefs = [];
    (new dv_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }