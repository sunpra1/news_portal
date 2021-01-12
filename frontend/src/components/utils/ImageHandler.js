const getImageBuffer = (image) => {
    if (typeof image.buffer === "object" && image.buffer.type === "Buffer" && typeof image.buffer.data === "object" && image.buffer.data.length > 0) {
        return Buffer(image.buffer.data).toString('base64');
    }
    return image.buffer;
};

export { getImageBuffer };