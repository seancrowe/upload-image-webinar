# What is this?
These are the modified source files from this webinar:
https://www.chili-publish.com/watch-how-to-rest-api/

It is modified, so they are not 1:1 the same as the webinar.

## Setup
To get this working, please edit index.html and change the  `documentURL` value.

```
 import {PublisherInterface} from "https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js";
    window.PublisherInterface = PublisherInterface

    // Add you document URL here - you can get the URL from the BackOffice
    👇👇⬇️ Right here
    const documentURL = 'https://ft-nostress.chili-publish.online/ft-nostress/editor_html.aspx?doc=770acae8-f4da-4484-bbc5-379b9e9a466f&apiKey=GX0ohac4kIeDCqbd5zV3ZZAhnQTJqRwno7S_o_XXbpVQO72GoWpOrzQw1uIn_0lIEJLBh6ybxjr+ekvYPA8B+g==';

    document.getElementById("editor-iframe").src = documentURL + "&fullWS=false";

    window.PublisherInterface.build(document.getElementById("editor-iframe"), {events:["DocumentFullyLoaded"]}).then((publisher) => {
        window.publisher = publisher;
    });
```

In addition, you can use any document, but I would use one with an image frame.

Almost final note, if you have an image variable in your document called ImagePlaceHolder, that image variable value will be placed in the frame when you press the remove image button.

Final note, this webinar was small in scope for uploading an image, I would not fork this project and build your entire application around this base.