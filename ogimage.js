const fs = require('fs');
const Trianglify = require('trianglify'); // trianglify
const images = require("images"); // Node.js轻量级跨平台图像编解码库

function generateOGImage() {
    var background = Trianglify({
        width: 1400,
        height: 756,
        stroke_width: Math.floor(Math.random() * 60) + 40,
        cell_size: Math.floor(Math.random() * 40) + 30,
    });
    saveImage(background.png(), "background.png")
}


function saveImage(data, filename) {
    var matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        imageBuffer = {};
    if (matches.length !== 3) {
        return new Error('無效的影像編碼');
    }

    imageBuffer.type = matches[1];
    imageBuffer.data = new Buffer(matches[2], 'base64');

    require('fs').writeFile('./ogimage_prepare/' + filename, imageBuffer.data, function(err) {
        if (err) {
            console.error(err);
        }
        console.log('file ' + filename + ' saved.')
        saveOGImage()
    });
}

function saveOGImage() {
    images("./ogimage_prepare/background.png") //Load image from file
        .draw(images("./ogimage_prepare/og.png"), 0, 0)
        .save("./ogimage/" + Math.floor(Math.random() * 999999) + ".png", { //Save the image to a file, with the quality of 50
            quality: 100
        });

}
exports.generateOGImage = generateOGImage;