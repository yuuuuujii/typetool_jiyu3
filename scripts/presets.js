// 预设配置管理器
const PRESETS = {
    preset1: {
        name: '预设 1',
        parameters: {
            spacing: 389,
            gradientAngleOffset: 56,
            width: 950,
            radius: 266,
            copies: {
                count: 1,
                offset: {
                    scale: -9,
                    x: 0,
                    y: 0,
                }
            },
            offet0: 14,
            offet1: 99,
            offet2: 97,
            characterScaleVariation: 0,
            showGrid: true,
            pixelShape: 'square',
            color0: 'hsla(55, 100%, 69%, 1.00)', // RGB(255, 234, 97) -> 黄色
            color1: 'hsla(314, 100%, 50%, 1.00)', // RGB(255, 0, 187) -> 紫色
            color2: 'hsla(0, 0%, 0%, 1.00)', // 黑色
            backgroundColor: '#000000' // 黑色背景
        }
    },
    preset2: {
        name: '预设 2',
        parameters: {
            spacing: 150,
            gradientAngleOffset: 0,
            width: 800,
            radius: 100,
            copies: {
                count: 1,
                offset: {
                    scale: 0,
                    x: 0,
                    y: 0,
                }
            },
            offet0: 20,
            offet1: 40,
            offet2: 60,
            pixelShape: 'circle',
            color0: 'hsla(0, 0%, 5%, 1.00)',
            color1: 'hsla(200, 70%, 50%, 1.00)',
            color2: 'hsla(0, 0%, 100%, 1.00)',
            backgroundColor: '#ffffff'
        }
    },
    preset3: {
        name: '预设 3',
        parameters: {
            spacing: 150,
            gradientAngleOffset: 27,
            width: 747,
            radius: 144,
            copies: {
                count: 16,
                offset: {
                    scale: 6,
                    x: -12,
                    y: 0,
                }
            },
            offet0: 14,
            offet1: 39,
            offet2: 46,
            charScaleVariation: 33,
            showGrid: true,
            pixelShape: 'circle',
            color0: 'hsla(0, 100%, 50%, 1.00)', // 红色
            color1: 'hsla(300, 100%, 75%, 1.00)', // 紫粉色
            color2: 'hsla(0, 0%, 100%, 1.00)', // 白色
            backgroundColor: '#ffffff' // 白色背景
        }
    }
};

// 应用预设
function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    // 更新所有参数
    const params = preset.parameters;
    
    // 更新基本参数
    bitmapFont.parameters.spacing = params.spacing;
    bitmapFont.parameters.gradientAngleOffset = params.gradientAngleOffset;
    bitmapFont.parameters.width = params.width;
    bitmapFont.parameters.radius = params.radius;
    bitmapFont.parameters.pixelSubdivision = params.pixelSubdivision || 0; // 新增像素分割参数
    bitmapFont.parameters.copies = JSON.parse(JSON.stringify(params.copies));
    bitmapFont.parameters.offet0 = params.offet0;
    bitmapFont.parameters.offet1 = params.offet1;
    bitmapFont.parameters.offet2 = params.offet2;
    bitmapFont.parameters.charScaleVariation = params.charScaleVariation || 0;
    bitmapFont.parameters.showGrid = params.showGrid !== undefined ? params.showGrid : true;
    bitmapFont.parameters.pixelShape = params.pixelShape;
    bitmapFont.parameters.color0 = params.color0;
    bitmapFont.parameters.color1 = params.color1;
    bitmapFont.parameters.color2 = params.color2;
    bitmapFont.parameters.backgroundColor = params.backgroundColor;

    // 更新 UI 控件
    updateControlsUI();

    // 重新渲染
    emptyCanvas();
    renderGrid();
    renderText();

    // 更新预设按钮状态
    updatePresetButtonStates(presetKey);

    // 重新初始化网格控制器（如果存在）
    if (typeof gridController !== 'undefined' && gridController) {
        gridController = new GridController();
    }
}

// 更新控制面板 UI
function updateControlsUI() {
    // 更新所有滑块
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const path = slider.id;
        const value = _.get(bitmapFont, path);
        slider.value = value;
        
        // 更新对应的标签
        const label = slider.previousElementSibling;
        if (label) {
            const labelText = label.textContent.split('[')[0].trim();
            label.innerHTML = labelText + `[${value}]`;
        }
    });

    // 更新颜色输入框
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        const path = input.id;
        const value = _.get(bitmapFont, path);
        if (value) {
            input.value = hslaToHex(value);
        }
    });

    // 更新下拉菜单
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const path = select.id;
        const value = _.get(bitmapFont, path);
        select.value = value;
    });

    // 更新背景颜色
    const bgColorInput = document.getElementById('backgroundColor');
    if (bgColorInput) {
        bgColorInput.value = bitmapFont.parameters.backgroundColor;
        const mainElement = document.getElementById('main');
        mainElement.style.backgroundColor = bitmapFont.parameters.backgroundColor;
    }
}

// 更新预设按钮状态
function updatePresetButtonStates(activePresetKey) {
    const buttons = document.querySelectorAll('.preset-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === activePresetKey) {
            btn.classList.add('active');
        }
    });
}

// 初始化预设面板
function initPresetPanel() {
    const presetButtonsContainer = document.getElementById('preset-buttons');
    
    Object.keys(PRESETS).forEach(presetKey => {
        const preset = PRESETS[presetKey];
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = preset.name;
        btn.dataset.preset = presetKey;
        
        btn.addEventListener('click', () => {
            applyPreset(presetKey);
        });
        
        presetButtonsContainer.appendChild(btn);
    });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresetPanel);
} else {
    initPresetPanel();
}
