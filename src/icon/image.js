/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

export async function loadImage(url) {
    const image = new Image();
    let imageLoadedResolve;
    let imageLoadedReject;
    const imageLoaded = new Promise((resolve, reject) => {
        imageLoadedResolve = resolve;
        imageLoadedReject = reject;
    });
    image.onload = imageLoadedResolve;
    image.onerror = imageLoadedReject;
    image.src = url;
    await imageLoaded;
    return image;
}

export async function svg2png(svgDataURL, width, height) {
    const image = await loadImage(svgDataURL);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
}
