const getImageBuffer = (image) => {
    if (typeof image.buffer === "object" && image.buffer.type === "Buffer" && image.buffer.data instanceof Array && image.buffer.data.length > 0)
        return Buffer(image.buffer.data).toString('base64');
    return image.buffer;
};

export { getImageBuffer };