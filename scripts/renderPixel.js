// Rendering a Pixel

// Parameters
// x – Postion
// y - Position
// radius – Scale
// index – Each iteration


const renderPixel = (x, y, radius, index, pixelIndex, character) => {
    // Offset per item
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)

    // 获取字符的缩放因子
    let charScale = 1
    if (bitmapFont.parameters.charScaleVariation > 0) {
        // 如果该字符还没有随机缩放值，则生成一个
        if (!bitmapFont.parameters.charScaleRandomness[character]) {
            // 生成 -charScaleVariation 到 +charScaleVariation 的随机缩放
            const variation = (Math.random() - 0.5) * 2 * bitmapFont.parameters.charScaleVariation / 100
            bitmapFont.parameters.charScaleRandomness[character] = 1 + variation
        }
        charScale = bitmapFont.parameters.charScaleRandomness[character]
    }

    // 应用缩放到半径和偏移
    const scaledRadius = radius * charScale
    const scaledXOfst = xOfst * charScale
    const scaledYOfst = yOfst * charScale

    // 获取像素分割参数 (0-100)
    const subdivisionLevel = bitmapFont.parameters.pixelSubdivision / 100

    // 创建像素组容器
    const pixelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 如果分割参数为0，渲染单个像素
    if (subdivisionLevel === 0) {
        const pixel = createSinglePixel(x + scaledXOfst, y + scaledYOfst, scaledRadius, index, pixelIndex, character);
        pixelGroup.appendChild(pixel);
        return pixelGroup;
    }

    // 计算子像素的大小和位置
    // 当subdivisionLevel为1时，4个子像素完全填充原像素区域
    const subPixelRadius = scaledRadius * (0.5 + 0.5 * (1 - subdivisionLevel));
    const offsetDistance = scaledRadius * subdivisionLevel * 0.5;

    // 4个子像素的相对位置（左上、右上、左下、右下）
    const subPixelPositions = [
        { x: x + scaledXOfst - offsetDistance, y: y + scaledYOfst - offsetDistance }, // 左上
        { x: x + scaledXOfst + offsetDistance, y: y + scaledYOfst - offsetDistance }, // 右上
        { x: x + scaledXOfst - offsetDistance, y: y + scaledYOfst + offsetDistance }, // 左下
        { x: x + scaledXOfst + offsetDistance, y: y + scaledYOfst + offsetDistance }  // 右下
    ];

    // 创建4个子像素
    subPixelPositions.forEach((pos, subIndex) => {
        const subPixel = createSinglePixel(pos.x, pos.y, subPixelRadius, index, `${pixelIndex}-${subIndex}`, character);
        pixelGroup.appendChild(subPixel);
    });

    return pixelGroup;
}

// 创建单个像素的辅助函数
function createSinglePixel(x, y, radius, index, pixelIndex, character) {
    // 根据 pixelShape 参数选择圆形或方形
    let pixel;
    
    // 确定使用的形状
    let shapeType = bitmapFont.parameters.pixelShape;
    
    // 如果启用随机形状，则使用存储的随机形状或生成新的
    if (bitmapFont.parameters.useRandomShape) {
        const shapeKey = `${character}-${pixelIndex}`;
        
        // 如果没有为这个像素存储形状，则生成并存储
        if (!bitmapFont.parameters.pixelShapes[shapeKey]) {
            bitmapFont.parameters.pixelShapes[shapeKey] = Math.random() > 0.5 ? 'circle' : 'square';
        }
        
        shapeType = bitmapFont.parameters.pixelShapes[shapeKey];
    }
    
    if (shapeType === 'circle') {
        // 创建圆形
        pixel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pixel.setAttribute('r', radius);
        pixel.setAttribute('cx', x);
        pixel.setAttribute('cy', y);
        
        // 为圆形添加正片叠底混合模式
        pixel.setAttribute('style', 'mix-blend-mode: multiply;');
    } else {
        // 创建方形
        pixel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pixel.setAttribute('width', radius * 2);
        pixel.setAttribute('height', radius * 2);
        pixel.setAttribute('x', x - radius);
        pixel.setAttribute('y', y - radius);
        
        // 方形不使用混合模式，保持默认的正常混合
    }

    // 为每个像素生成唯一的渐变ID
    const uniqueGradientId = `grad-${pixelIndex}-${character}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建唯一的渐变色
    const gradient = createUniqueGradient(uniqueGradientId, index, x, y, pixelIndex, character);

    // 将渐变添加到像素的父元素
    pixel._gradient = gradient;
    pixel.setAttribute('fill', `url(#${uniqueGradientId})`);
    const svgDefs = document.getElementById('svg-defs')
    svgDefs.appendChild(pixel._gradient);
    return pixel;
}

// 创建唯一渐变的函数
function createUniqueGradient(gradientId, index, x, y, pixelIndex, character) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', gradientId);
    
    // 获取该字符的字形对象
    const characterObj = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
    const angleArray = characterObj.gradientAngle;
    
    // 处理分割后的索引，例如 "5-0" 应该对应索引 5
    // 这样可以确保子像素继承父像素的渐变角度
    let lookupIndex = pixelIndex;
    if (typeof pixelIndex === 'string' && pixelIndex.indexOf('-') !== -1) {
        lookupIndex = parseInt(pixelIndex.split('-')[0]);
    }
    
    // 根据像素索引获取对应的角度，并加上全局偏移
    let angle = angleArray[lookupIndex] || 0;
    angle = (angle + bitmapFont.parameters.gradientAngleOffset) % 360;
    
    const rad = angle * Math.PI / 180;
    const xx = Math.cos(rad);
    const yy = Math.sin(rad);

    // SVG y 轴向下为正，所以 y 需要反向
    const x1 = (50 - xx * 50).toFixed(2) + '%';
    const y1 = (50 - yy * 50).toFixed(2) + '%';
    const x2 = (50 + xx * 50).toFixed(2) + '%';
    const y2 = (50 + yy * 50).toFixed(2) + '%';

    gradient.setAttribute('x1', x1);
    gradient.setAttribute('y1', y1);
    gradient.setAttribute('x2', x2);
    gradient.setAttribute('y2', y2);

    // 基于索引、位置等生成唯一颜色

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', bitmapFont.parameters.offet0 / 100);
    stop1.setAttribute('stop-color', bitmapFont.parameters.color0);

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', bitmapFont.parameters.offet1 / 100);
    stop2.setAttribute('stop-color', bitmapFont.parameters.color1);

    const stop3 = document.createElementNS(svgNS, 'stop');
    stop3.setAttribute('offset', bitmapFont.parameters.offet2 / 100);
    stop3.setAttribute('stop-color', bitmapFont.parameters.color2);

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);

    return gradient;
}


const renderPixel2 = (x, y, radius, index) => {



    const scale = radius / 100 - index * 0.01 * 2

    // Ofset per item
    const xOfst = (bitmapFont.parameters.copies.offset.x * (index)) - scale * 50
    const yOfst = (bitmapFont.parameters.copies.offset.y * (index)) - scale * 50

    // now we are handling the logic for placing the circles
    const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Storing path as string
    const path = `M39.17,40.89c2.39,31.35-23.87,69.37-30.71,40.26S62.71,2.86,41.39,16.71C20.07,30.55.34,60.62.5,39.14c.16-21.48,56.01-58.55,63.01-25.46,7,33.1-1.59,35.8,16.55,28.16,18.14-7.64,8.59,78.92-14.64,49.96-23.23-28.96-26.25-50.92-26.25-50.92Z`

    // Adding Path as attribute
    newPath.setAttribute('d', path)

    // transforming path
    newPath.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) scale(${scale})`)

    return newPath
}

// const renderPixel = (x, y, radius, index) => {

//     x = x - radius + bitmapFont.parameters.copies.offset.x
//     y = y - radius + bitmapFont.parameters.copies.offset.y
//     // now we are handling the logic for placing the circles
//     const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//     newCircle.setAttribute('width', radius*2);
//     newCircle.setAttribute('height', radius*2);
//     newCircle.setAttribute('x', x)
//     newCircle.setAttribute('y', y)
//     newCircle.setAttribute('transform', `rotate(${index * 10}, ${x}, ${y})`)

//     return newCircle
// }




