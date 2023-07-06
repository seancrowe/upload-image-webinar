"use strict"

window.SpicyWebService = {
    
    restCall: function (data, apiKey, url, requestType, contentType, endFunctionCall) {
        let xmlreq = new XMLHttpRequest();

        xmlreq.open(requestType, url);

        if (contentType != null) {
            xmlreq.setRequestHeader('Content-Type', contentType);
        }

        xmlreq.setRequestHeader('API-KEY', apiKey);
        xmlreq.send(data);

        xmlreq.onload = () => {
            //console.log(xmlreq.responseText);
            //let results = this.parseXML(xmlreq.responseText, functionName);
            let results = xmlreq.responseText;
            let status = xmlreq.status;

            if (endFunctionCall != null && typeof endFunctionCall == "function") {
                endFunctionCall(status, results);
            }
        };
    },

    getResponseValues: function (xml, responseTag) {
        let doc = new DOMParser().parseFromString(xml, "text/xml");

        let elements = doc.getElementsByTagName(responseTag);

        if (elements.length !== 0) {

            let itemXmlString = elements.item(0).innerHTML.replace(/&apos;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&amp;/g, '&');

            return itemXmlString;
        }

        return null;
    }
}
