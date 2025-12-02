// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 
const svgText = document.getElementById("svg-text")

// Functions we need

// • Empty Canvas
// • Render Grid
// • Render  Glyph
// • Render Text

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Events / Interactions

// A function to clean up the canvas
const emptyCanvas = () => {
    // First delete previous letters
    const previousGlyph = document.getElementById('glyph-group')

    // Remove the element
    if (previousGlyph) previousGlyph.remove()
}


const renderGrid = () => {

    const width = bitmapFont.parameters.width
    const height = bitmapFont.parameters.height
    const columns = bitmapFont.parameters.columns
    const rows = bitmapFont.parameters.rows

    // const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    // svgText.appendChild(defs);


    const gridUnitWidth = width / columns
    const gridUnitHeight = height / rows
    // Lets create a group for order and organisation
    const gridGroup =
        // document.getElementById('grid-guide-lines') 
        // || 
        document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // gridGroup.innerHTML = ''
    // Remove previous element if available!!

    // Lets give the grid a id, so we can show and hide it Later
    gridGroup.setAttribute('class', 'grid')

    if (!bitmapFont.parameters.showGrid) return

    // Create the grid
    for (let i = 0; i < columns + 1; i++) {
        // Create a horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', i * gridUnitWidth)
        line.setAttribute('x2', i * gridUnitWidth)
        line.setAttribute('y1', 0)
        line.setAttribute('y2', height)

        gridGroup.appendChild(line)
    }

    // Create the grid
    for (let i = 0; i < rows + 1; i++) {
        // Create a horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')


        // Place the line
        line.setAttribute('x1', 0)
        line.setAttribute('x2', width)
        line.setAttribute('y1', i * gridUnitHeight)
        line.setAttribute('y2', i * gridUnitHeight)

        // Choose the color of the line

        gridGroup.appendChild(line)
    }
    // svgLetter.appendChild(gridGroup)

    return gridGroup
}




const renderGlyph = (character) => {

    const currentLetterObj = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef']
    const currentLetter = currentLetterObj.data

    // Lets create a group for later deletion
    const glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    glyphGroup.setAttribute('id', 'glyph-group')

    const width = bitmapFont.parameters.width
    const height = bitmapFont.parameters.height
    const columns = bitmapFont.parameters.columns
    const rows = bitmapFont.parameters.rows

    const gridUnitWidth = width / columns
    const gridUnitHeight = height / rows

    const copies = bitmapFont.parameters.copies.count

    for (let copyIndex = 0; copyIndex < copies; copyIndex++) {

        const radius = bitmapFont.parameters.radius - copyIndex * bitmapFont.parameters.copies.offset.scale

        const inc = copyIndex / copies

        const r = 255 - inc * 255
        const g = 255 - inc * 255
        const b = 255 - inc * 255

        const color = `rgb(${r}, ${g}, ${b})`

        for (let i = 0; i < columns; i++) {

            for (let k = 0; k < rows; k++) {

                const rowCount = k * columns
                const colCount = i
                const pixelIndex = rowCount + colCount
                const currentPixel = currentLetter[pixelIndex]
                
                if (currentPixel !== 1) continue;

                const x = i * gridUnitWidth + gridUnitWidth / 2
                const y = k * gridUnitHeight + gridUnitHeight / 2

                const pixel = renderPixel(x, y, radius, copyIndex, pixelIndex, character)

                glyphGroup.appendChild(pixel)
            }
        }
    }

    return glyphGroup
}


const renderText = () => {

    const text = bitmapFont.preview.text
    const spacing = bitmapFont.parameters.spacing
    const globalColumns = bitmapFont.parameters.columns
    const gridUnitWidth = bitmapFont.parameters.width / globalColumns
    const lineHeight = bitmapFont.parameters.height

    // 按换行符分割文本
    const lines = text.split('\n')
    
    // 计算最长行的宽度
    // 需要遍历每一行来计算实际宽度
    let maxWidth = 0
    lines.forEach(line => {
        let lineWidth = 0
        line.split("").forEach((character, charIndex) => {
            const glyph = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef']
            const glyphColumns = glyph.columns
            lineWidth += glyphColumns * gridUnitWidth + spacing
        })
        maxWidth = Math.max(maxWidth, lineWidth)
    })
    
    const width = Math.max(maxWidth, gridUnitWidth)
    const height = lines.length * lineHeight

    svgText.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svgText.innerHTML = ""

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'svg-defs')
    svgText.appendChild(defs);

    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // 逐行渲染
    lines.forEach((lineIndex, lineIdx) => {
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        lineGroup.setAttribute('transform', `translate(${spacing / 2}, ${lineIdx * lineHeight})`)

        let currentX = 0
        lineIndex.split("").forEach((character) => {
            const glyph = renderGlyph(character)
            glyph.setAttribute('transform', `translate(${currentX}, 0)`)
            
            // 获取该字符的实际列数
            const glyphObj = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef']
            const glyphColumns = glyphObj.columns
            
            // 更新下一个字符的 x 坐标
            currentX += glyphColumns * gridUnitWidth + spacing
            
            lineGroup.appendChild(glyph)
        })

        textGroup.appendChild(lineGroup)
    })

    svgText.appendChild(textGroup)
}

// Actuall render the grid
renderGrid()
bitmapFont.preview.text = ""
renderText()

const svgContainer = document.getElementById('typing')

// 监听键盘输入
window.addEventListener('keydown', (event) => {
    const key = event.key
    
    // 处理退格键
    if (key === 'Backspace') {
        event.preventDefault()
        bitmapFont.preview.text = bitmapFont.preview.text.slice(0, -1)
        renderText()
        return
    }
    
    // 处理删除键
    if (key === 'Delete') {
        event.preventDefault()
        bitmapFont.preview.text = ""
        renderText()
        return
    }
    
    // 处理回车键换行
    if (key === 'Enter') {
        event.preventDefault()
        bitmapFont.preview.text += '\n'
        renderText()
        return
    }
    
    // 处理普通字符
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        bitmapFont.preview.text += key
        renderText()
    }
})

// 点击 SVG 聚焦
svgContainer.addEventListener('click', () => {
    svgContainer.focus()
})

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 动画循环：使 gradientAngleOffset 在 0-180 之间缓动
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

let animationStartTime = Date.now()
const animationDuration = 4000 // 4秒完整循环（0-180-0）

const updateGradientAngles = () => {
    const currentTime = Date.now()
    const elapsed = (currentTime - animationStartTime) % (animationDuration * 2)
    
    // 计算 0-180-0 的缓动值（三角波）
    let progress = elapsed / animationDuration
    let offset
    
    if (progress <= 1) {
        // 0 到 180
        offset = progress * 30
    } else {
        // 180 回到 0
        offset = (2 - progress) * 30
    }
    
    // 更新全局渐变角度偏移
    bitmapFont.parameters.gradientAngleOffset = offset
    
    // 更新所有渐变元素
    const gradients = document.querySelectorAll('#svg-defs linearGradient')
    gradients.forEach(gradient => {
        const gradientId = gradient.getAttribute('id')
        
        // 从 gradientId 解析出 pixelIndex 和 character
        // 格式: grad-{pixelIndex}-{character}-{timestamp}-{random}
        const parts = gradientId.split('-')
        if (parts.length >= 3) {
            const pixelIndex = parseInt(parts[1])
            const character = parts[2]
            
            // 获取该字符的字形对象和角度
            const characterObj = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef']
            const angleArray = characterObj.gradientAngle
            let angle = angleArray[pixelIndex] || 0
            angle = (angle + bitmapFont.parameters.gradientAngleOffset) % 360
            
            // 更新渐变的方向
            const rad = angle * Math.PI / 180
            const xx = Math.cos(rad)
            const yy = Math.sin(rad)
            
            const x1 = (50 - xx * 50).toFixed(2) + '%'
            const y1 = (50 - yy * 50).toFixed(2) + '%'
            const x2 = (50 + xx * 50).toFixed(2) + '%'
            const y2 = (50 + yy * 50).toFixed(2) + '%'
            
            gradient.setAttribute('x1', x1)
            gradient.setAttribute('y1', y1)
            gradient.setAttribute('x2', x2)
            gradient.setAttribute('y2', y2)
        }
    })
}

// 注释掉动画循环的定义和调用
/*
const animationLoop = () => {
    updateGradientAngles();
    requestAnimationFrame(animationLoop);
};

animationLoop();
*/

// 移除摄像头相关功能
/*
async function setupCameraAndHandTracking() {
    const video = document.createElement('video');
    video.style.position = 'absolute';
    video.style.top = '0';
    video.style.left = '0';
    video.style.opacity = '0.5'; // 可选：设置透明度以便调试
    document.body.appendChild(video);

    // 获取摄像头流
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    // 加载手势识别模型（使用 TensorFlow.js 的 Handpose）
    const model = await handpose.load();

    // 监听视频帧
    video.addEventListener('loadeddata', async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        async function detectHands() {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 检测手部关键点
            const predictions = await model.estimateHands(video);

            if (predictions.length > 0) {
                const hand = predictions[0];
                const x = hand.boundingBox.topLeft[0]; // 获取手的水平位置
                const canvasWidth = canvas.width;

                // 根据手的位置计算角度
                const angle = Math.round((x / canvasWidth) * 180); // 角度范围 0-180
                updateAngle(angle);
            }

            requestAnimationFrame(detectHands);
        }

        detectHands();
    });
}

setupCameraAndHandTracking();
*/
