// 1. Config for controls
const controlsNumber = [
    {
        label: 'Spacing',
        // value: 1000,
        min: 0,
        max: 1000,
        path: 'parameters.spacing', // -> font > config > width
    },
    {
        label: 'Gradient Angle Offset',
        min: 0,
        max: 360,
        path: 'parameters.gradientAngleOffset', // 全局渐变角度偏移
    },
    {
        label: 'Width',
        // value: 1000,
        min: 200,
        max: 2000,
        path: 'parameters.width', // -> font > config > width
    },
    {
        label: 'Radius',
        min: 20,
        max: 500,
        path: 'parameters.radius', // -> font > config > radius
    },
    {
        label: 'Copies',
        min: 1,
        max: 30,
        path: 'parameters.copies.count', // -> font > config > radius
    },
    {
        label: 'Copy Offset Scale',
        min: -10,
        max: 20,
        path: 'parameters.copies.offset.scale', // -> font > config > radius
    },
    {
        label: 'Copy Offset X',
        min: -100,
        max: 100,
        path: 'parameters.copies.offset.x', // -> font > config > radius
    },
    {
        label: 'Copy Offset Y',
        min: -100,
        max: 100,
        path: 'parameters.copies.offset.y', // -> font > config > radius
    },
    {
        label: 'Copy gradient offset0',
        min: 0,
        max: 100,
        path: 'parameters.offet0',
    },
    {
        label: 'Copy gradient offset1',
        min: 0,
        max: 100,
        path: 'parameters.offet1',
    },
    {
        label: 'Copy gradient offset2',
        min: 0,
        max: 100,
        path: 'parameters.offet2',
    },
    {
        label: 'Character Scale Variation',
        min: 0,
        max: 100,
        path: 'parameters.charScaleVariation', // 字母缩放变化幅度
    },
    {
        label: 'Pixel Subdivision',
        min: 0,
        max: 100,
        path: 'parameters.pixelSubdivision', // 像素分割，0=1个像素，100=4个像素
    }
]

// 2. Controls for Grid
const controlsSwitch = [
    {
        label: 'Show Grid',
        path: 'parameters.showGrid',
        value: true
    },
    {
        label: 'Pixel Shape',
        path: 'parameters.pixelShape',
        value: 'square',
        options: [
            { label: 'Circle', value: 'circle' },
            { label: 'Square', value: 'square' }
        ]
    }
]

// 3. Controls for Colors
const controlsColor = [
    {
        label: 'Color 0',
        path: 'parameters.color0',
    },
    {
        label: 'Color 1',
        path: 'parameters.color1',
    },
    {
        label: 'Color 2',
        path: 'parameters.color2',
    }
]

// 2. Applied range slider controls to dom
const controlWrapper = document.getElementById('controls')

controlsNumber.forEach((control) => {

    const initialValue = _.get(bitmapFont, control.path)

    // Create the input element
    const input = document.createElement('input')
    input.type = "range"
    input.min = control.min
    input.max = control.max
    input.defaultValue = initialValue
    input.id = control.path

    // Add the input control
    input.oninput = (e) => {

        label.innerHTML = control.label + `[${_.get(bitmapFont, control.path)}]`

        // Set allows us to set valus inside an object
        // 1) your entire font
        // 2) adjust the value at the given path
        // 3) change tha value at the path!
        _.set(bitmapFont, control.path, parseFloat(e.currentTarget.value))

        // 如果改变的是字符缩放变化参数，需要清空之前保存的随机值
        if (control.path === 'parameters.charScaleVariation') {
            bitmapFont.parameters.charScaleRandomness = {}
        }

        // everytime a value is updated, we refresh the font rendering
        const typedCharacter = bitmapFont.preview.character

        // First remove previous Glyph
        emptyCanvas()

        // First we update the grid (we might have changed the columns!)
        renderGrid()

        // Render Text
        // const textGroup = 
        renderText(typedCharacter)

        // svgText.appendChild(textGroup)

    }

    const label = document.createElement('label')
    label.innerHTML = control.label + `[${_.get(bitmapFont, control.path)}]`
    label.htmlFor = control.path

    controlWrapper.appendChild(label)
    controlWrapper.appendChild(input)

})


controlsSwitch.forEach((control) => {

    // 1. Setting up the controls 
    const initialValue = _.get(bitmapFont, control.path)

    // 如果是 checkbox 控件（Show Grid）
    if (!control.options) {
        const input = document.createElement('input')
        input.type = "checkbox"
        input.defaultChecked = initialValue
        input.id = control.path
        input.name = control.label

        // Add the input control
        input.oninput = (e) => {
            const value = e.currentTarget.checked

            if (control.path === 'parameters.showGrid') {
                if (value) {
                    svgText.classList.add('showGrid')
                } else {
                    svgText.classList.remove('showGrid')
                }
            }
        }

        const label = document.createElement('label')
        label.innerHTML = control.label + `[${_.get(bitmapFont, control.path)}]`
        label.htmlFor = control.path

        controlWrapper.appendChild(label)
        controlWrapper.appendChild(input)
    } 
    // 如果是下拉菜单控件（Pixel Shape）
    else if (control.options) {
        const select = document.createElement('select')
        select.id = control.path

        control.options.forEach((option) => {
            const optionElement = document.createElement('option')
            optionElement.value = option.value
            optionElement.textContent = option.label
            if (option.value === initialValue) {
                optionElement.selected = true
            }
            select.appendChild(optionElement)
        })

        // Add the select control
        select.onchange = (e) => {
            const value = e.currentTarget.value
            
            // 更新参数
            _.set(bitmapFont, control.path, value)

            // 重新渲染
            emptyCanvas()
            renderGrid()
            renderText()
        }

        const label = document.createElement('label')
        label.innerHTML = control.label
        label.htmlFor = control.path

        controlWrapper.appendChild(label)
        controlWrapper.appendChild(select)
    }

})

// 处理颜色控制
controlsColor.forEach((control) => {
    const initialValue = _.get(bitmapFont, control.path)

    // 创建颜色输入元素
    const input = document.createElement('input')
    input.type = "color"
    input.id = control.path
    
    // 将 HSL 颜色转换为 HEX 格式用于颜色输入框
    // 初始化为 HEX 颜色值（如果初始值是 HSL，我们使用默认颜色）
    const hexColor = hslaToHex(initialValue)
    input.value = hexColor

    // 添加颜色输入控制
    input.oninput = (e) => {
        const hexColor = e.currentTarget.value
        
        // 将 HEX 转换回 HSL 格式
        const hslaColor = hexToHsla(hexColor)
        
        // 更新参数
        _.set(bitmapFont, control.path, hslaColor)

        // 重新渲染
        emptyCanvas()
        renderGrid()
        renderText()
    }

    const label = document.createElement('label')
    label.innerHTML = control.label
    label.htmlFor = control.path

    controlWrapper.appendChild(label)
    controlWrapper.appendChild(input)
})

// HSL 转 HEX 的辅助函数
function hslaToHex(hsla) {
    // 提取 HSL 值
    const match = hsla.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/)
    if (!match) return '#000000'
    
    const h = parseInt(match[1])
    const s = parseInt(match[2])
    const l = parseInt(match[3])
    
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l / 100 - c / 2
    
    let r = 0, g = 0, b = 0
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x
    }
    
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// HEX 转 HSL 的辅助函数
function hexToHsla(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    
    let h = 0, s = 0
    
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }
    
    h = Math.round(h * 360)
    s = Math.round(s * 100)
    const lValue = Math.round(l * 100)
    
    return `hsla(${h}, ${s}%, ${lValue}%, 1.00)`
}

// 添加背景颜色控制
const bgColorLabel = document.createElement('label')
bgColorLabel.innerHTML = 'Background Color'
bgColorLabel.style.display = 'block'
bgColorLabel.style.paddingTop = '20px'

const bgColorInput = document.createElement('input')
bgColorInput.type = "color"
bgColorInput.id = 'backgroundColor'
bgColorInput.value = bitmapFont.parameters.backgroundColor
bgColorInput.style.width = '100%'
bgColorInput.style.height = '40px'
bgColorInput.style.padding = '2px'
bgColorInput.style.marginTop = '8px'
bgColorInput.style.border = '1px solid #ccc'
bgColorInput.style.borderRadius = '4px'
bgColorInput.style.cursor = 'pointer'

bgColorInput.addEventListener('input', (e) => {
    const color = e.currentTarget.value
    bitmapFont.parameters.backgroundColor = color
    
    // 更新右侧内容区的背景颜色
    const mainElement = document.getElementById('main')
    mainElement.style.backgroundColor = color
})

controlWrapper.appendChild(bgColorLabel)
controlWrapper.appendChild(bgColorInput)

// 添加"随机"按钮
const randomButton = document.createElement('button')
randomButton.innerHTML = '🎲 随机'
randomButton.style.width = '100%'
randomButton.style.padding = '12px'
randomButton.style.marginTop = '20px'
randomButton.style.marginBottom = '10px'
randomButton.style.backgroundColor = '#4CAF50 !important'
randomButton.style.color = 'white !important'
randomButton.style.border = 'none !important'
randomButton.style.borderRadius = '4px'
randomButton.style.fontSize = '14px !important'
randomButton.style.fontWeight = 'bold'
randomButton.style.cursor = 'pointer'
randomButton.style.transition = 'background-color 0.3s'
randomButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
randomButton.style.fontFamily = 'Helvetica, Arial, sans-serif'

randomButton.addEventListener('mouseover', () => {
    randomButton.style.backgroundColor = '#45a049 !important'
    randomButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3) !important'
})

randomButton.addEventListener('mouseout', () => {
    randomButton.style.backgroundColor = '#4CAF50 !important'
    randomButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2) !important'
})

randomButton.addEventListener('click', () => {
    // 清空之前的随机形状数据
    bitmapFont.parameters.pixelShapes = {}
    
    // 启用随机形状
    bitmapFont.parameters.useRandomShape = true
    
    // 重新渲染
    emptyCanvas()
    renderGrid()
    renderText()
})

controlWrapper.appendChild(randomButton)
