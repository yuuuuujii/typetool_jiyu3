// 网格控制栏管理器
class GridController {
    constructor() {
        this.horizontalLinesContainer = document.getElementById('horizontal-lines');
        this.verticalLinesContainer = document.getElementById('vertical-lines');
        this.gridController = document.getElementById('grid-controller');
        this.svgText = document.getElementById('svg-text');
        this.typing = document.getElementById('typing');
        
        // 初始化行高度数组
        const rows = bitmapFont.parameters.rows;
        const baseHeight = bitmapFont.parameters.height;
        this.rowHeights = new Array(rows).fill(baseHeight / rows);
        bitmapFont.parameters.rowHeights = this.rowHeights;
        
        this.draggingIndex = null;
        this.dragStartY = null;
        
        this.init();
    }
    
    init() {
        this.createGridLines();
        this.attachEventListeners();
    }
    
    createGridLines() {
        const rows = bitmapFont.parameters.rows;
        const cols = bitmapFont.parameters.columns;
        
        this.horizontalLinesContainer.innerHTML = '';
        this.verticalLinesContainer.innerHTML = '';
        
        // 创建横线（行控制）
        for (let i = 1; i < rows; i++) {
            const line = document.createElement('div');
            line.className = 'grid-line horizontal';
            line.dataset.index = i;
            line.style.top = this.getRowPosition(i) + 'px';
            line.addEventListener('mousedown', (e) => this.startDrag(e, i, 'horizontal'));
            this.horizontalLinesContainer.appendChild(line);
        }
        
        // 创建竖线（列控制）
        const baseWidth = bitmapFont.parameters.width;
        const colUnitWidth = baseWidth / cols;
        
        for (let i = 1; i < cols; i++) {
            const line = document.createElement('div');
            line.className = 'grid-line vertical';
            line.dataset.index = i;
            line.style.left = (i * colUnitWidth) + 'px';
            // 竖线暂时不实现拖动功能，先保留结构
            this.verticalLinesContainer.appendChild(line);
        }
    }
    
    getRowPosition(rowIndex) {
        return this.rowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0);
    }
    
    startDrag(e, rowIndex, direction) {
        if (direction !== 'horizontal') return;
        
        e.preventDefault();
        this.draggingIndex = rowIndex;
        this.dragStartY = e.clientY;
        
        const line = e.target;
        line.classList.add('dragging');
        
        // 获取 SVG 容器的位置信息
        const svgContainer = this.typing;
        const rect = svgContainer.getBoundingClientRect();
        this.svgContainerTop = rect.top;
        this.svgContainerHeight = rect.height;
        this.svgViewBoxHeight = bitmapFont.parameters.height;
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }
    
    drag(e) {
        if (this.draggingIndex === null) return;
        
        e.preventDefault();
        
        const deltaY = e.clientY - this.dragStartY;
        const svgContainer = this.typing;
        const rect = svgContainer.getBoundingClientRect();
        
        // 计算 SVG 中的像素到屏幕像素的比例
        const scale = this.svgViewBoxHeight / this.svgContainerHeight;
        
        // 计算行的拉伸量
        const deltaInSvgUnits = deltaY * scale;
        
        const rowIndex = this.draggingIndex;
        const oldHeight = this.rowHeights[rowIndex];
        const newHeight = Math.max(10, oldHeight + deltaInSvgUnits); // 最小高度 10
        
        const heightDiff = newHeight - oldHeight;
        this.rowHeights[rowIndex] = newHeight;
        
        // 影响下面所有的行（下移）
        for (let i = rowIndex + 1; i < this.rowHeights.length; i++) {
            // 实际上我们不需要改变下面行的高度，只需要更新位置即可
        }
        
        // 更新网格线位置
        this.updateGridLinesPositions();
        
        // 重新渲染
        emptyCanvas();
        renderGrid();
        renderText();
        
        // 更新拖动线的起始位置（为了连续拖动）
        this.dragStartY = e.clientY;
    }
    
    endDrag() {
        if (this.draggingIndex === null) return;
        
        const lines = document.querySelectorAll('.grid-line.horizontal');
        lines.forEach(line => line.classList.remove('dragging'));
        
        this.draggingIndex = null;
        this.dragStartY = null;
        
        document.removeEventListener('mousemove', (e) => this.drag(e));
        document.removeEventListener('mouseup', () => this.endDrag());
    }
    
    updateGridLinesPositions() {
        const lines = document.querySelectorAll('.grid-line.horizontal');
        lines.forEach((line, index) => {
            const rowIndex = parseInt(line.dataset.index);
            line.style.top = this.getRowPosition(rowIndex) + 'px';
        });
    }
    
    // 重置网格为均匀分布
    reset() {
        const rows = bitmapFont.parameters.rows;
        const baseHeight = bitmapFont.parameters.height;
        this.rowHeights = new Array(rows).fill(baseHeight / rows);
        bitmapFont.parameters.rowHeights = this.rowHeights;
        
        this.updateGridLinesPositions();
        
        emptyCanvas();
        renderGrid();
        renderText();
    }
    
    attachEventListeners() {
        // 可以在这里添加其他事件监听
    }
}

// 初始化网格控制器
let gridController = null;

// 在 SVG 渲染完成后初始化网格控制器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        gridController = new GridController();
    }, 100);
});

// 或者在脚本加载后立即初始化（如果已经是 DOM 就绪）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gridController = new GridController();
    });
} else {
    gridController = new GridController();
}
